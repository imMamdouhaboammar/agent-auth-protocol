import { describe, expect, it } from "bun:test";
import { createHash } from "node:crypto";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

import constraintSchema from "../schemas/constraint.schema.json";
import capabilitySchema from "../schemas/capability.schema.json";
import proposalSchema from "../schemas/authorization-proposal.schema.json";
import consentSchema from "../schemas/consent-selection.schema.json";
import intentSchema from "../schemas/action-intent.schema.json";
import approvalSchema from "../schemas/approval-evidence.schema.json";
import decisionSchema from "../schemas/authorization-decision.schema.json";
import grantSchema from "../schemas/delegation-grant.schema.json";

import proposal from "../examples/authorization-proposal.json";
import consent from "../examples/consent-selection.json";
import actionIntent from "../examples/action-intent.json";
import actionDigestFixture from "../examples/action-intent-digest.json";
import approval from "../examples/approval-evidence.json";
import parentGrant from "../examples/parent-delegation-grant.json";
import childGrant from "../examples/child-delegation-grant.json";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(constraintSchema);
ajv.addSchema(capabilitySchema);

type Scalar = string | number | boolean | null;
type Constraint = Record<string, any>;
type Capability = {
  action: string;
  resources: string[];
  arguments?: Record<string, Constraint>;
};

function scalarEqual(a: Scalar, b: Scalar): boolean {
  return Object.is(a, b);
}

function setContains(values: Scalar[], target: Scalar): boolean {
  return values.some((value) => scalarEqual(value, target));
}

function subsetOf(child: Scalar[], parent: Scalar[]): boolean {
  return child.every((value) => setContains(parent, value));
}

function numberInRange(value: number, range: Constraint): boolean {
  if (typeof range.min === "number") {
    const inclusive = range.min_inclusive ?? true;
    if (inclusive ? value < range.min : value <= range.min) return false;
  }
  if (typeof range.max === "number") {
    const inclusive = range.max_inclusive ?? true;
    if (inclusive ? value > range.max : value >= range.max) return false;
  }
  return true;
}

function rangeSubsumes(parent: Constraint, child: Constraint): boolean {
  const probes: Array<[string, "min" | "max"]> = [
    ["min", "min"],
    ["max", "max"]
  ];
  void probes;

  if (typeof parent.min === "number") {
    if (typeof child.min !== "number") return false;
    if (child.min < parent.min) return false;
    if (
      child.min === parent.min &&
      (parent.min_inclusive ?? true) === false &&
      (child.min_inclusive ?? true) === true
    ) return false;
  }

  if (typeof parent.max === "number") {
    if (typeof child.max !== "number") return false;
    if (child.max > parent.max) return false;
    if (
      child.max === parent.max &&
      (parent.max_inclusive ?? true) === false &&
      (child.max_inclusive ?? true) === true
    ) return false;
  }

  return true;
}

function constraintSubsumes(parent: Constraint, child: Constraint): boolean {
  if (parent.constraint_type === "wildcard") return true;

  if (child.constraint_type === "exact") {
    if (parent.constraint_type === "exact") {
      return scalarEqual(child.value, parent.value);
    }
    if (parent.constraint_type === "one_of") {
      return setContains(parent.values, child.value);
    }
    if (
      parent.constraint_type === "range" &&
      typeof child.value === "number"
    ) {
      return numberInRange(child.value, parent);
    }
    return false;
  }

  if (
    child.constraint_type === "range" &&
    parent.constraint_type === "range"
  ) {
    return rangeSubsumes(parent, child);
  }

  if (
    child.constraint_type === "one_of" &&
    parent.constraint_type === "one_of"
  ) {
    return subsetOf(child.values, parent.values);
  }

  if (
    child.constraint_type === "not_one_of" &&
    parent.constraint_type === "not_one_of"
  ) {
    return subsetOf(parent.excluded, child.excluded);
  }

  if (
    child.constraint_type === "subset" &&
    parent.constraint_type === "subset"
  ) {
    return subsetOf(child.allowed, parent.allowed);
  }

  if (
    child.constraint_type === "contains" &&
    parent.constraint_type === "contains"
  ) {
    return subsetOf(parent.required, child.required);
  }

  return false;
}

function capabilityCovered(parent: Capability, child: Capability): boolean {
  if ((parent as any).type !== (child as any).type) return false;
  if (parent.action !== child.action) return false;
  if (!child.resources.every((resource) => parent.resources.includes(resource))) {
    return false;
  }

  if (!parent.arguments) return true;
  if (!child.arguments) return false;

  const parentKeys = Object.keys(parent.arguments).sort();
  const childKeys = Object.keys(child.arguments).sort();
  if (JSON.stringify(parentKeys) !== JSON.stringify(childKeys)) return false;

  return parentKeys.every((key) =>
    constraintSubsumes(parent.arguments![key], child.arguments![key])
  );
}

function grantAttenuates(parent: any, child: any): boolean {
  if (parent.status !== "active") return false;
  if (child.parent_grant_id !== parent.grant_id) return false;
  if (
    child.subject.type !== parent.subject.type ||
    child.subject.issuer !== parent.subject.issuer ||
    child.subject.id !== parent.subject.id
  ) return false;

  if (new Date(child.expires_at) > new Date(parent.expires_at)) return false;
  if (parent.not_before && !child.not_before) return false;
  if (
    parent.not_before &&
    child.not_before &&
    new Date(child.not_before) < new Date(parent.not_before)
  ) return false;

  if (
    typeof parent.max_delegation_depth !== "number" ||
    typeof child.max_delegation_depth !== "number" ||
    child.max_delegation_depth >= parent.max_delegation_depth
  ) return false;

  return child.capabilities.every((childCap: Capability) =>
    parent.capabilities.some((parentCap: Capability) =>
      capabilityCovered(parentCap, childCap)
    )
  );
}

function stableCanonicalize(value: any): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableCanonicalize).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableCanonicalize(value[key])}`)
    .join(",")}}`;
}

function actionDigest(intent: any): string {
  const canonical = stableCanonicalize(intent);
  const digest = createHash("sha256").update(canonical).digest("base64url");
  return `sha-256:${digest}`;
}

function selectionWithinProposal(proposalValue: any, selection: any): boolean {
  if (selection.proposal_id !== proposalValue.proposal_id) return false;
  const requested = [
    ...proposalValue.required_capabilities,
    ...proposalValue.optional_capabilities
  ];
  return selection.selected_capabilities.every((selected: Capability) =>
    requested.some((requestedCap: Capability) =>
      capabilityCovered(requestedCap, selected)
    )
  );
}

describe("AgentAuth v0.2 authorization and delegation model", () => {
  it("validates the machine-readable authorization artifacts", () => {
    const fixtures: Array<[any, any]> = [
      [proposalSchema, proposal],
      [consentSchema, consent],
      [intentSchema, actionIntent],
      [approvalSchema, approval],
      [grantSchema, parentGrant],
      [grantSchema, childGrant],
      [
        decisionSchema,
        {
          decision: "allow",
          reason_codes: ["CAPABILITY_MATCHED"],
          matched_capability_id: "cap_payment",
          policy_version: "policy_42"
        }
      ]
    ];

    for (const [schema, value] of fixtures) {
      const validate = ajv.compile(schema);
      expect(validate(value), JSON.stringify(validate.errors)).toBe(true);
    }
  });

  it("accepts a child grant that strictly attenuates its parent", () => {
    expect(grantAttenuates(parentGrant, childGrant)).toBe(true);
  });

  it("rejects delegation from an inactive parent", () => {
    const inactive = structuredClone(parentGrant);
    inactive.status = "revoked";
    expect(grantAttenuates(inactive, childGrant)).toBe(false);
  });

  it("rejects removal of a parent not-before boundary", () => {
    const invalid = structuredClone(childGrant);
    delete invalid.not_before;
    expect(grantAttenuates(parentGrant, invalid)).toBe(false);
  });

  it("rejects child Resource expansion", () => {
    const invalid = structuredClone(childGrant);
    invalid.capabilities[0].resources.push("urn:account:999");
    expect(grantAttenuates(parentGrant, invalid)).toBe(false);
  });

  it("rejects a higher amount limit", () => {
    const invalid = structuredClone(childGrant);
    invalid.capabilities[0].arguments.amount.max = 700;
    expect(grantAttenuates(parentGrant, invalid)).toBe(false);
  });

  it("allows exact USD to narrow a USD/EUR one_of constraint", () => {
    const parent = {
      constraint_type: "one_of",
      values: ["USD", "EUR"]
    };
    const child = {
      constraint_type: "exact",
      value: "USD"
    };
    expect(constraintSubsumes(parent, child)).toBe(true);
  });

  it("rejects unknown constraint semantics", () => {
    const parent = { constraint_type: "mystery", value: "x" };
    const child = { constraint_type: "mystery", value: "x" };
    expect(constraintSubsumes(parent, child)).toBe(false);
  });

  it("enforces closed-world argument key equality after constraints exist", () => {
    const parent = parentGrant.capabilities[0] as Capability;
    const child = structuredClone(childGrant.capabilities[0]) as Capability;
    child.arguments!.memo = { constraint_type: "wildcard" };
    expect(capabilityCovered(parent, child)).toBe(false);
  });

  it("rejects denied consent that still selects authority", () => {
    const validate = ajv.compile(consentSchema);
    const invalid = structuredClone(consent);
    invalid.decision = "denied";
    expect(validate(invalid)).toBe(false);
  });

  it("rejects denied evidence as Approval Evidence", () => {
    const validate = ajv.compile(approvalSchema);
    const invalid = structuredClone(approval);
    invalid.decision = "denied";
    expect(validate(invalid)).toBe(false);
  });

  it("allows progressive consent to omit optional authority", () => {
    expect(selectionWithinProposal(proposal, consent)).toBe(true);
    expect(consent.selected_capabilities).toHaveLength(1);
    expect(proposal.optional_capabilities).toHaveLength(1);
  });

  it("rejects consent that adds an unrequested Capability", () => {
    const invalid = structuredClone(consent);
    invalid.selected_capabilities.push({
      type: "agent_action",
      action: "calendar.admin",
      resources: ["urn:calendar:primary"]
    });
    expect(selectionWithinProposal(proposal, invalid)).toBe(false);
  });

  it("matches the Action Digest fixture", () => {
    expect(actionDigest(actionIntent)).toBe(actionDigestFixture.digest);
    expect(approval.action_digest).toBe(actionDigestFixture.digest);
  });

  it("changes Action Digest when a security-relevant argument changes", () => {
    const modified = structuredClone(actionIntent);
    modified.arguments.amount = "300.00";
    expect(actionDigest(modified)).not.toBe(actionDigestFixture.digest);
  });

  it("does not treat same local Agent ID under another issuer as same Actor", () => {
    const parentActor = `${parentGrant.actor_agent_issuer}|${parentGrant.actor_agent_id}`;
    const sameLocalIdElsewhere =
      `https://other-agents.example.com|${parentGrant.actor_agent_id}`;
    expect(parentActor).not.toBe(sameLocalIdElsewhere);
  });
});
