import { describe, expect, it } from "bun:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import claimsSchema from "../schemas/agent-auth-claims.schema.json";
import manifestSchema from "../schemas/agent-manifest.schema.json";
import auditSchema from "../schemas/audit-event.schema.json";
import grantSchema from "../schemas/delegation-grant.schema.json";
import constraintSchema from "../schemas/constraint.schema.json";
import capabilitySchema from "../schemas/capability.schema.json";
import tokenClaimsExample from "../examples/token-claims.json";
import parentGrant from "../examples/parent-delegation-grant.json";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(constraintSchema);
ajv.addSchema(capabilitySchema);

describe("AgentAuth JSON Schemas Validation", () => {
  it("compiles agent-auth-claims schema successfully", () => {
    expect(ajv.compile(claimsSchema)).toBeDefined();
  });

  it("compiles agent-manifest schema successfully", () => {
    expect(ajv.compile(manifestSchema)).toBeDefined();
  });

  it("compiles audit-event schema successfully", () => {
    expect(ajv.compile(auditSchema)).toBeDefined();
  });

  it("compiles delegation-grant schema successfully", () => {
    expect(ajv.compile(grantSchema)).toBeDefined();
  });

  it("validates token-claims.json extension claims against agent-auth-claims schema", () => {
    const validate = ajv.compile(claimsSchema);
    const extensionClaims = tokenClaimsExample["urn:agentauth:claims:v1"];
    expect(validate(extensionClaims)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("validates a complete Agent Manifest object", () => {
    const validate = ajv.compile(manifestSchema);
    const validManifest = {
      schema_version: "1.0",
      name: "Autonomous Research Agent",
      publisher: {
        subject: "urn:subject:org:deepmind",
        website: "https://deepmind.google/technologies/gemini/"
      },
      capabilities: ["web.search", "doc.read", "repo.inspect"],
      supported_integrations: ["api", "mcp", "native_browser"],
      metadata_uri: "https://example.com/agents/ara/metadata.json"
    };

    expect(validate(validManifest)).toBe(true);
  });

  it("rejects an invalid Agent Manifest with missing required publisher", () => {
    const validate = ajv.compile(manifestSchema);
    expect(
      validate({
        schema_version: "1.0",
        name: "Incomplete Agent",
        capabilities: ["test"]
      })
    ).toBe(false);
  });

  it("validates an issuer-qualified Delegation Grant object", () => {
    const validate = ajv.compile(grantSchema);
    expect(validate(parentGrant), JSON.stringify(validate.errors)).toBe(true);
  });

  it("validates an Audit Event object", () => {
    const validate = ajv.compile(auditSchema);
    const validAudit = {
      event_id: "evt_01J987654321",
      event_type: "grant.evaluated",
      occurred_at: "2026-10-05T14:30:00Z",
      tenant_id: "tenant_primary",
      trace_id: "trace_xyz_123",
      actor: {
        id: "urn:agentauth:agent:test-actor",
        instance_id: "inst_test_001"
      },
      decision: "allow",
      reason_codes: ["GRANT_VALID", "SCOPE_MATCHED"]
    };

    expect(validate(validAudit)).toBe(true);
  });
});
