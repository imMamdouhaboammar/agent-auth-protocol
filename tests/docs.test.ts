import { describe, expect, it } from "bun:test";
import { existsSync, statSync } from "node:fs";

describe("AgentAuth Specification Documents", () => {
  const numberedDocs = [
    "docs/00-product-vision.md",
    "docs/01-requirements.md",
    "docs/02-domain-model.md",
    "docs/03-system-architecture.md",
    "docs/04-protocol-design.md",
    "docs/05-native-login-as-agent.md",
    "docs/06-browser-bridge.md",
    "docs/07-mcp-api-integration.md",
    "docs/08-policy-consent-delegation.md",
    "docs/09-security-threat-model.md",
    "docs/10-data-model.md",
    "docs/11-deployment-federation.md",
    "docs/12-observability-audit.md",
    "docs/13-test-conformance.md",
    "docs/14-roadmap.md",
    "docs/15-operations-runbook.md",
    "docs/16-standards-mapping.md"
  ];

  const adrs = [
    "docs/adr/0001-oauth-core.md",
    "docs/adr/0002-agent-principal-separation.md",
    "docs/adr/0003-browser-bridge-non-authoritative.md",
    "docs/adr/0004-federated-regional-cells.md"
  ];

  const securityAndDeploy = [
    "security/abuse-cases.md",
    "security/privacy.md",
    "deploy/reference-topology.md",
    "goals/ZZZOPS_GOAL_DAG.md",
    "implementation/PLAN.md"
  ];

  it("ensures all 17 numbered spec documents exist and are substantial", () => {
    for (const doc of numberedDocs) {
      expect(existsSync(doc)).toBe(true);
      const stat = statSync(doc);
      expect(stat.size).toBeGreaterThan(500);
    }
  });

  it("ensures all 4 Architectural Decision Records exist", () => {
    for (const adr of adrs) {
      expect(existsSync(adr)).toBe(true);
      const stat = statSync(adr);
      expect(stat.size).toBeGreaterThan(300);
    }
  });

  it("ensures security, deploy, and implementation specs exist", () => {
    for (const file of securityAndDeploy) {
      expect(existsSync(file)).toBe(true);
      const stat = statSync(file);
      expect(stat.size).toBeGreaterThan(200);
    }
  });
});
