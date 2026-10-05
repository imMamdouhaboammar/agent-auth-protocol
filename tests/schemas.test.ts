import { describe, expect, it } from "bun:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import claimsSchema from "../schemas/agent-auth-claims.schema.json";
import manifestSchema from "../schemas/agent-manifest.schema.json";
import auditSchema from "../schemas/audit-event.schema.json";
import grantSchema from "../schemas/delegation-grant.schema.json";
import tokenClaimsExample from "../examples/token-claims.json";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

describe("AgentAuth JSON Schemas Validation", () => {
  it("compiles agent-auth-claims schema successfully", () => {
    const validate = ajv.compile(claimsSchema);
    expect(validate).toBeDefined();
  });

  it("compiles agent-manifest schema successfully", () => {
    const validate = ajv.compile(manifestSchema);
    expect(validate).toBeDefined();
  });

  it("compiles audit-event schema successfully", () => {
    const validate = ajv.compile(auditSchema);
    expect(validate).toBeDefined();
  });

  it("compiles delegation-grant schema successfully", () => {
    const validate = ajv.compile(grantSchema);
    expect(validate).toBeDefined();
  });

  it("validates token-claims.json extension claims against agent-auth-claims schema", () => {
    const validate = ajv.compile(claimsSchema);
    const extensionClaims = tokenClaimsExample["urn:agentauth:claims:v1"];
    const valid = validate(extensionClaims);
    expect(valid).toBe(true);
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
      capabilities: [
        "web.search",
        "doc.read",
        "repo.inspect"
      ],
      supported_integrations: [
        "api",
        "mcp",
        "native_browser"
      ],
      metadata_uri: "https://example.com/agents/ara/metadata.json"
    };

    const valid = validate(validManifest);
    expect(valid).toBe(true);
  });

  it("rejects an invalid Agent Manifest with missing required publisher", () => {
    const validate = ajv.compile(manifestSchema);
    const invalidManifest = {
      schema_version: "1.0",
      name: "Incomplete Agent",
      capabilities: ["test"]
    };

    const valid = validate(invalidManifest);
    expect(valid).toBe(false);
  });

  it("validates a Delegation Grant object", () => {
    const validate = ajv.compile(grantSchema);
    const validGrant = {
      grant_id: "grant_01JABCDEF1234567890",
      issuer: "https://auth.example.com",
      subject: {
        type: "human",
        id: "urn:subject:user:mamdouh"
      },
      actor_agent_id: "urn:agentauth:agent:gemini-cli-agent",
      purpose: "Automated repository setup and configuration",
      capabilities: [
        {
          action: "repo.push",
          resources: [
            "urn:repo:github:imMamdouhaboammar/agent-auth-protocol"
          ],
          constraints: {
            branches: ["main"],
            max_commits: 10
          }
        }
      ],
      expires_at: "2026-10-06T12:00:00Z",
      max_delegation_depth: 1,
      status: "active"
    };

    const valid = validate(validGrant);
    expect(valid).toBe(true);
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

    const valid = validate(validAudit);
    expect(valid).toBe(true);
  });
});
