import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { parse } from "yaml";

describe("AgentAuth OpenAPI 3.1 Specification", () => {
  const openapiContent = readFileSync("api/openapi.yaml", "utf-8");
  const spec = parse(openapiContent);

  it("parses valid OpenAPI 3.1.0 document", () => {
    expect(spec).toBeDefined();
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.info.title).toBe("AgentAuth Management and Integration API");
    expect(spec.info.version).toBe("0.1.0");
  });

  it("defines critical agent principal and instance endpoints", () => {
    expect(spec.paths["/v1/agents"]).toBeDefined();
    expect(spec.paths["/v1/agents"].post).toBeDefined();
    expect(spec.paths["/v1/agents/{agent_id}/instances"]).toBeDefined();
    expect(spec.paths["/v1/instances/{instance_id}/revoke"]).toBeDefined();
  });

  it("defines delegation grant endpoints", () => {
    expect(spec.paths["/v1/grants"]).toBeDefined();
    expect(spec.paths["/v1/grants/{grant_id}/approve"]).toBeDefined();
    expect(spec.paths["/v1/grants/{grant_id}/revoke"]).toBeDefined();
  });

  it("defines agent session bootstrap and policy endpoints", () => {
    expect(spec.paths["/v1/agent-sessions"]).toBeDefined();
    expect(spec.paths["/v1/agent-sessions"].post).toBeDefined();
    expect(spec.paths["/v1/policy/decide"]).toBeDefined();
  });

  it("defines audit log querying endpoint", () => {
    expect(spec.paths["/v1/audit/events"]).toBeDefined();
    expect(spec.paths["/v1/audit/events"].get).toBeDefined();
  });

  it("contains core component schemas", () => {
    const schemas = spec.components?.schemas;
    expect(schemas).toBeDefined();
    expect(schemas.AgentPrincipal).toBeDefined();
    expect(schemas.AgentInstance).toBeDefined();
    expect(schemas.GrantRequest).toBeDefined();
    expect(schemas.Grant).toBeDefined();
    expect(schemas.RevocationRequest).toBeDefined();
    expect(schemas.PolicyDecisionRequest).toBeDefined();
    expect(schemas.PolicyDecision).toBeDefined();
  });
});
