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
    "docs/16-standards-mapping.md",
    "docs/17-three-party-protocol-architecture.md",
    "docs/18-agent-sdk-contract.md",
    "docs/19-provider-sdk-contract.md",
    "docs/20-protocol-ceremonies.md",
    "docs/21-discovery-and-metadata.md",
    "docs/22-standards-delta-v0.2.md",
    "docs/23-provider-authority-trust-model.md",
    "docs/24-normative-protocol-core.md",
    "docs/25-http-wire-bindings.md",
    "docs/26-token-and-claims-profile.md",
    "docs/27-identifiers-and-namespaces.md",
    "docs/28-state-machines.md",
    "docs/29-error-registry.md",
    "docs/30-versioning-idempotency-replay.md",
    "docs/31-conformance-matrix.md",
    "docs/32-effective-authorization-model.md",
    "docs/33-capability-grammar.md",
    "docs/34-constraint-algebra.md",
    "docs/35-delegation-attenuation.md",
    "docs/36-action-intent-and-approval.md",
    "docs/37-progressive-consent.md",
    "docs/38-provider-policy-and-relationships.md",
    "docs/39-authorization-evaluation-algorithm.md",
    "docs/40-trust-domain-model.md",
    "docs/41-federation-protocol.md",
    "docs/42-agent-instance-enrollment.md",
    "docs/43-runtime-attestation.md",
    "docs/44-key-lifecycle.md",
    "docs/45-federated-token-exchange.md",
    "docs/46-trust-decision-algorithm.md",
    "docs/47-spiffe-workload-bridge.md"
  ];

  const adrs = [
    "docs/adr/0001-oauth-core.md",
    "docs/adr/0002-agent-principal-separation.md",
    "docs/adr/0003-browser-bridge-non-authoritative.md",
    "docs/adr/0004-federated-regional-cells.md",
    "docs/adr/0005-three-party-protocol-and-sdk-boundaries.md",
    "docs/adr/0006-direct-vs-brokered-provider-trust.md",
    "docs/adr/0007-issuer-qualified-agent-identity.md",
    "docs/adr/0008-separate-management-api-from-wire-protocol.md",
    "docs/adr/0009-effective-authority-is-intersection.md",
    "docs/adr/0010-portable-constraints-require-subsumption.md",
    "docs/adr/0011-relationship-policy-remains-provider-local.md",
    "docs/adr/0012-core-child-delegation-is-authority-mediated.md",
    "docs/adr/0013-no-global-root-of-trust.md",
    "docs/adr/0014-federation-is-explicit-and-non-transitive.md",
    "docs/adr/0015-attestation-does-not-grant-authority.md",
    "docs/adr/0016-instance-proof-keys-are-independent.md"
  ];

  const securityAndDeploy = [
    "security/abuse-cases.md",
    "security/privacy.md",
    "deploy/reference-topology.md",
    "goals/ZZZOPS_GOAL_DAG.md",
    "implementation/PLAN.md",
    "implementation/PROTOCOL_V0_2_PLAN.md",
    "docs/research/pr3-authorization-inspiration.md",
    "docs/research/pr4-trust-attestation-standards.md"
  ];

  it("ensures all numbered specification documents exist and are substantial", () => {
    for (const doc of numberedDocs) {
      expect(existsSync(doc)).toBe(true);
      expect(statSync(doc).size).toBeGreaterThan(500);
    }
  });

  it("ensures all Architectural Decision Records exist", () => {
    for (const adr of adrs) {
      expect(existsSync(adr)).toBe(true);
      expect(statSync(adr).size).toBeGreaterThan(300);
    }
  });

  it("ensures security, deploy, implementation, and research specs exist", () => {
    for (const file of securityAndDeploy) {
      expect(existsSync(file)).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(200);
    }
  });
});
