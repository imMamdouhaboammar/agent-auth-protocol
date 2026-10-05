import { describe, expect, it } from "bun:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { existsSync, statSync } from "node:fs";

import claimsSchema from "../schemas/agent-auth-claims.schema.json";
import contextSchema from "../schemas/agentauth-context.schema.json";
import errorSchema from "../schemas/agentauth-error.schema.json";
import authorityMetadataSchema from "../schemas/authority-metadata.schema.json";
import providerMetadataSchema from "../schemas/provider-metadata.schema.json";
import clientMetadataSchema from "../schemas/agent-client-metadata.schema.json";

import delegatedToken from "../examples/token-claims.json";
import delegatedContext from "../examples/agentauth-context-delegated.json";
import stepUpError from "../examples/agentauth-error-step-up.json";
import authorityMetadata from "../examples/authority-metadata.json";
import providerMetadata from "../examples/provider-metadata.json";
import clientMetadata from "../examples/agent-client-metadata.json";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

describe("AgentAuth v0.2 normative wire contracts", () => {
  it("keeps all normative protocol design documents and ADRs", () => {
    const files = [
      "docs/24-normative-protocol-core.md",
      "docs/25-http-wire-bindings.md",
      "docs/26-token-and-claims-profile.md",
      "docs/27-identifiers-and-namespaces.md",
      "docs/28-state-machines.md",
      "docs/29-error-registry.md",
      "docs/30-versioning-idempotency-replay.md",
      "docs/31-conformance-matrix.md",
      "docs/adr/0007-issuer-qualified-agent-identity.md",
      "docs/adr/0008-separate-management-api-from-wire-protocol.md"
    ];

    for (const file of files) {
      expect(existsSync(file)).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(500);
    }
  });

  it("validates the issuer-qualified delegated token extension", () => {
    const validate = ajv.compile(claimsSchema);
    const extension = delegatedToken["urn:agentauth:claims:v1"];

    expect(validate(extension)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("rejects delegated extension claims without a grant id", () => {
    const validate = ajv.compile(claimsSchema);
    const invalid = {
      protocol_version: "0.2",
      actor_type: "ai_agent",
      agent_issuer: "https://agents.example.com",
      agent_id: "agent_123",
      instance_id: "inst_456",
      authority_mode: "delegated"
    };

    expect(validate(invalid)).toBe(false);
  });

  it("rejects direct extension claims carrying a grant id", () => {
    const validate = ajv.compile(claimsSchema);
    const invalid = {
      protocol_version: "0.2",
      actor_type: "ai_agent",
      agent_issuer: "https://agents.example.com",
      agent_id: "agent_123",
      instance_id: "inst_456",
      authority_mode: "direct",
      grant_id: "grant_should_not_be_here"
    };

    expect(validate(invalid)).toBe(false);
  });

  it("validates canonical delegated AgentAuth Context", () => {
    const validate = ajv.compile(contextSchema);

    expect(validate(delegatedContext)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("rejects delegated AgentAuth Context without a grant", () => {
    const validate = ajv.compile(contextSchema);
    const invalid = structuredClone(delegatedContext);
    delete invalid.authority.grant_id;

    expect(validate(invalid)).toBe(false);
  });

  it("treats the same local agent id under different issuers as different principals", () => {
    const first = {
      issuer: "https://issuer-a.example",
      id: "agent_123"
    };
    const second = {
      issuer: "https://issuer-b.example",
      id: "agent_123"
    };

    expect(first.id).toBe(second.id);
    expect(first.issuer).not.toBe(second.issuer);
    expect(`${first.issuer}|${first.id}`).not.toBe(
      `${second.issuer}|${second.id}`
    );
  });

  it("validates the normative step-up error envelope", () => {
    const validate = ajv.compile(errorSchema);

    expect(validate(stepUpError)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("rejects unknown AgentAuth errors", () => {
    const validate = ajv.compile(errorSchema);
    const invalid = {
      protocol_version: "0.2",
      error: "agentauth_make_it_work_somehow",
      recoverable: true,
      interaction_required: false
    };

    expect(validate(invalid)).toBe(false);
  });

  it("validates Authority metadata extension and protocol version support", () => {
    const validate = ajv.compile(authorityMetadataSchema);
    const extension =
      authorityMetadata["urn:agentauth:authority-metadata:v1"];

    expect(validate(extension)).toBe(true);
    expect(extension.protocol_versions_supported).toContain("0.2");
  });

  it("requires protocol version support in Provider metadata", () => {
    const validate = ajv.compile(providerMetadataSchema);
    const extension =
      providerMetadata["urn:agentauth:resource-metadata:v1"];

    expect(validate(extension)).toBe(true);

    const invalid = structuredClone(extension);
    delete invalid.protocol_versions_supported;
    expect(validate(invalid)).toBe(false);
  });

  it("requires protocol version support in Agent Client metadata", () => {
    const validate = ajv.compile(clientMetadataSchema);
    const extension =
      clientMetadata["urn:agentauth:client-metadata:v1"];

    expect(validate(extension)).toBe(true);

    const invalid = structuredClone(extension);
    invalid.protocol_versions_supported = ["0.1"];
    expect(validate(invalid)).toBe(false);
  });
});
