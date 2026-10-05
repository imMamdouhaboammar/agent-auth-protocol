# Normative Requirements

## Identity

ID-001: Every Agent Principal MUST have a globally unique issuer-qualified identifier.

ID-002: Every Agent Instance MUST have an independent cryptographic key or a verifiable workload identity from which a proof key can be derived.

ID-003: Agent Instance credentials MUST be revocable independently of the parent Agent Principal.

ID-004: The platform MUST distinguish at minimum: human, organization, workload, and AI agent actor types.

ID-005: A Resource Server MUST NOT infer "AI agent" solely from a user-agent string.

ID-006: Agent identity metadata MUST be versioned.

## Delegation

DEL-001: A Delegation Grant MUST identify Subject, Actor, audience or resource constraints, allowed actions, expiry, and grant status.

DEL-002: A delegated credential MUST preserve the distinction between Subject and Actor.

DEL-003: Any child delegation MUST be an attenuation of its parent.

DEL-004: Delegation depth MUST be explicitly bounded.

DEL-005: Revoking a parent grant MUST invalidate future use of all descendants.

DEL-006: Grant evaluation MUST be independent of the model's free-form text.

DEL-007: High-risk grants SHOULD contain structured authorization details rather than broad scopes alone.

## Tokens

TOK-001: Access tokens MUST be audience restricted.

TOK-002: Access tokens SHOULD be sender-constrained using DPoP or mTLS where supported.

TOK-003: Access token lifetime SHOULD default to five minutes or less for agent-initiated privileged actions.

TOK-004: Refresh tokens MUST NOT be exposed to model context.

TOK-005: Refresh tokens, if issued, MUST be sender-constrained or rotation-protected.

TOK-006: Delegated JWT access tokens SHOULD use the standard `act` claim semantics from OAuth Token Exchange.

TOK-007: Custom AgentAuth claims MUST be collision resistant and versioned.

TOK-008: A Resource Server MUST reject tokens whose issuer, audience, signature, time bounds, proof binding, or grant status are invalid.

## Policy

POL-001: Default policy MUST be deny.

POL-002: Policy MUST evaluate Actor, Subject, Agent Instance, Resource, Action, grant constraints, and contextual risk.

POL-003: Authorization MUST support `allow`, `deny`, and `step_up`.

POL-004: A step-up approval for a sensitive transaction MUST be bound to an Action Digest.

POL-005: Policy evaluation MUST produce a machine-readable reason code.

POL-006: Policy changes MUST be versioned and recorded.

POL-007: Emergency kill controls MUST exist at tenant, Agent Principal, Agent Instance, and grant levels.

## Browser

BRW-001: Credentials MUST NOT be copied into model-visible DOM, logs, prompts, or screenshots unless explicitly required and policy allows it.

BRW-002: The managed browser MUST run in an isolated execution environment.

BRW-003: Native Agent Session integration MUST let the target application distinguish agent-operated sessions server-side.

BRW-004: Legacy browser mode MUST be labeled lower assurance.

BRW-005: The system MUST NOT claim that a non-integrated target knows a caller is an agent.

BRW-006: CAPTCHA or explicit anti-automation challenges MUST trigger human handoff or failure, not automated bypass.

BRW-007: Browser cookies MUST be scoped to one target profile and Agent Instance session.

BRW-008: Session export across tenants MUST be prohibited.

## MCP

MCP-001: MCP authorization MUST map to the same Agent Principal and Delegation Grant model used for ordinary APIs.

MCP-002: MCP server access MUST not create a second independent source of authorization truth.

MCP-003: Insufficient scope responses SHOULD support scope step-up without silently broadening the original grant.

MCP-004: MCP client credentials MUST be issuer-bound.

## Audit

AUD-001: Authentication, grant issuance, token exchange, policy decisions, approvals, revocations, browser session creation, and high-risk actions MUST emit audit events.

AUD-002: Audit events MUST include tenant, trace, Actor, Subject, Agent Instance, grant, resource, action, decision, policy version, and timestamp where applicable.

AUD-003: Tokens, passwords, private keys, and raw refresh tokens MUST NOT be logged.

AUD-004: Audit storage MUST support tamper evidence.

AUD-005: Security-relevant events SHOULD be exportable to external SIEM systems.

## Privacy

PRI-001: Raw user prompts MUST NOT be required for authorization.

PRI-002: Consent evidence SHOULD store structured authorization and a digest of relevant intent rather than full conversation content by default.

PRI-003: Tenant data residency MUST be configurable.

PRI-004: Cross-region replication MUST be explicit and policy controlled.

PRI-005: Audit retention MUST be configurable independently from operational telemetry retention.

## Deployment

DEP-001: The system MUST support single-region deployment without external global dependencies.

DEP-002: The system MUST support multiple Trust Domains.

DEP-003: Federation MUST be explicit and deny by default.

DEP-004: Private signing keys MUST be held by KMS, HSM, or equivalent protected key storage in production.

DEP-005: No shared signing key may be used across unrelated tenants.

DEP-006: A regional cell MUST remain capable of validating locally issued tokens during temporary loss of global management connectivity.

## Availability and performance targets

PERF-001: Local token validation at a Resource Server SHOULD not require a synchronous authorization-server call for every request.

PERF-002: Online policy checks required for high-risk actions SHOULD target p95 latency below 100 ms inside the same region.

PERF-003: Revocation propagation for high-risk grants SHOULD target less than 30 seconds inside a region.

PERF-004: Signing-key rotation MUST allow overlap so valid in-flight tokens remain verifiable.

## Administrative controls

ADM-001: Operators MUST be able to list all Agent Principals and Agent Instances for a tenant.

ADM-002: An administrator MUST be able to disable an Agent Principal without deleting audit history.

ADM-003: Owners MUST be able to inspect grants issued to agents acting for them.

ADM-004: Grant creation and approval MUST expose human-readable summaries of structured permissions.

ADM-005: The platform MUST provide a machine-readable integration metadata document.
