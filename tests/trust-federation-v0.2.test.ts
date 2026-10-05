import { describe, expect, it } from "bun:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

import publicJwkSchema from "../schemas/public-jwk.schema.json";
import trustDomainSchema from "../schemas/trust-domain.schema.json";
import federationPeerSchema from "../schemas/federation-peer.schema.json";
import enrollmentSchema from "../schemas/instance-enrollment.schema.json";
import attestationSchema from "../schemas/agent-instance-attestation.schema.json";
import trustPolicySchema from "../schemas/trust-policy.schema.json";
import trustDecisionSchema from "../schemas/trust-decision.schema.json";
import keyEventSchema from "../schemas/key-lifecycle-event.schema.json";
import claimsSchema from "../schemas/agent-auth-claims.schema.json";

import trustDomain from "../examples/trust-domain.json";
import federationPeer from "../examples/federation-peer.json";
import enrollment from "../examples/instance-enrollment.json";
import attestation from "../examples/agent-instance-attestation.json";
import trustPolicy from "../examples/trust-policy.json";
import trustDecision from "../examples/trust-decision.json";
import keyEvent from "../examples/key-lifecycle-event.json";
import federatedToken from "../examples/federated-token-claims.json";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(publicJwkSchema);

function acceptsForeignCredential(
  peer: any,
  peerTrustDomain: string,
  issuer: string
): boolean {
  return (
    peer.status === "active" &&
    peer.direction === "inbound" &&
    peer.peer_trust_domain === peerTrustDomain &&
    peer.accepted_issuers.includes(issuer)
  );
}

function attestationFresh(result: any, now: string): boolean {
  const nowMs = new Date(now).getTime();
  return (
    result.status === "accepted" &&
    new Date(result.issued_at).getTime() <= nowMs &&
    nowMs < new Date(result.expires_at).getTime()
  );
}

describe("AgentAuth v0.2 trust, federation, attestation, and key lifecycle", () => {
  it("validates all trust-model fixtures", () => {
    const fixtures: Array<[any, any]> = [
      [trustDomainSchema, trustDomain],
      [federationPeerSchema, federationPeer],
      [enrollmentSchema, enrollment],
      [attestationSchema, attestation],
      [trustPolicySchema, trustPolicy],
      [trustDecisionSchema, trustDecision],
      [keyEventSchema, keyEvent]
    ];

    for (const [schema, value] of fixtures) {
      const validate = ajv.compile(schema);
      expect(validate(value), JSON.stringify(validate.errors)).toBe(true);
    }
  });

  it("rejects private JWK material during Instance enrollment", () => {
    const validate = ajv.compile(enrollmentSchema);
    const invalid = structuredClone(enrollment);
    invalid.proof_key.d = "private-key-material";

    expect(validate(invalid)).toBe(false);
  });

  it("rejects symmetric keys as Instance proof keys", () => {
    const validate = ajv.compile(enrollmentSchema);
    const invalid = structuredClone(enrollment);
    invalid.proof_key = {
      kty: "oct",
      k: "secret"
    };

    expect(validate(invalid)).toBe(false);
  });

  it("requires complete attestation policy when attestation is mandatory", () => {
    const validate = ajv.compile(trustPolicySchema);
    const invalid = structuredClone(trustPolicy);
    delete invalid.accepted_attestation_verifiers;

    expect(validate(invalid)).toBe(false);
  });

  it("requires accepted assurance classes on attestation-required Federation Peers", () => {
    const validate = ajv.compile(federationPeerSchema);
    const invalid = structuredClone(federationPeer);
    invalid.accepted_assurance_classes = [];

    expect(validate(invalid)).toBe(false);
  });

  it("does not infer transitive federation", () => {
    expect(
      acceptsForeignCredential(
        federationPeer,
        "https://agents.example.com",
        "https://auth.agents.example.com"
      )
    ).toBe(true);

    expect(
      acceptsForeignCredential(
        federationPeer,
        "https://third-party.example.com",
        "https://auth.third-party.example.com"
      )
    ).toBe(false);
  });

  it("blocks new foreign credentials from a removed peer", () => {
    const removed = structuredClone(federationPeer);
    removed.status = "removed";

    expect(
      acceptsForeignCredential(
        removed,
        removed.peer_trust_domain,
        removed.accepted_issuers[0]
      )
    ).toBe(false);
  });

  it("treats Attestation Results as freshness-bound trust evidence", () => {
    expect(attestationFresh(attestation, "2026-10-05T12:05:00Z")).toBe(true);
    expect(attestationFresh(attestation, "2026-10-05T12:11:00Z")).toBe(false);
  });

  it("does not allow Trust Decision to carry authorization capabilities", () => {
    const validate = ajv.compile(trustDecisionSchema);
    const invalid = {
      ...structuredClone(trustDecision),
      capabilities: ["payment.create"]
    };

    expect(validate(invalid)).toBe(false);
  });

  it("preserves foreign Agent provenance after brokered exchange", () => {
    const validate = ajv.compile(claimsSchema);
    const extension = federatedToken["urn:agentauth:claims:v1"];

    expect(validate(extension), JSON.stringify(validate.errors)).toBe(true);
    expect(federatedToken.iss).toBe("https://auth.provider.example.com");
    expect(extension.agent_issuer).toBe("https://agents.example.com");
    expect(federatedToken.iss).not.toBe(extension.agent_issuer);
  });

  it("keeps key classes explicit in lifecycle events", () => {
    const validate = ajv.compile(keyEventSchema);
    expect(validate(keyEvent)).toBe(true);

    const invalid = {
      ...structuredClone(keyEvent),
      key_class: "everything-key"
    };
    expect(validate(invalid)).toBe(false);
  });

  it("requires fail-closed handling for unknown mandatory semantics", () => {
    const validate = ajv.compile(trustPolicySchema);
    const invalid = {
      ...structuredClone(trustPolicy),
      unknown_mandatory_semantics: "ignore"
    };

    expect(validate(invalid)).toBe(false);
  });
});
