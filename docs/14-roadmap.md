# Product Roadmap

The roadmap is arranged by verifiable capability, not feature count.

## Milestone 0: protocol kernel

Outcome:
prove the identity and delegation model without browser automation.

Deliver:

- Agent Principal registry
- Agent Instance registration with proof key
- Delegation Grant model
- attenuation checker
- OAuth token exchange profile
- DPoP
- JWT access-token profile
- Resource Server SDK
- audit events
- revocation
- CLI test client
- conformance tests

Exit criteria:

- delegated API request preserves Subject and Agent Actor
- stolen DPoP-bound token cannot be replayed by a different key
- child grant cannot expand authority
- revoked grant blocks new issuance
- no secret appears in logs

## Milestone 1: policy and consent

Deliver:

- human approval flow
- organization administrator approval
- structured authorization details
- policy decision interface
- step-up obligations
- Action Digest
- transaction-bound approval
- emergency kill controls

Exit criteria:

- sensitive action can require exact approval
- modifying amount or destination invalidates approval
- policy decisions are fully auditable

## Milestone 2: native Login as Agent

Deliver:

- target SDK
- agent-session bootstrap
- browser session actor metadata
- session revocation
- visible agent-session sample UI
- human handoff

Exit criteria:

- target application can show "AI agent session"
- server logs Subject, Agent, Agent Instance, and Grant separately
- session stops after revocation within target SLA

## Milestone 3: MCP profile

Deliver:

- MCP authorization integration
- tool-to-action mapping
- scope step-up
- enterprise-managed auth integration adapter
- conformance fixtures

Exit criteria:

- same grant authorizes both REST and MCP resource access
- MCP cannot silently broaden grant

## Milestone 4: legacy Browser Bridge

Deliver:

- isolated Chromium workers
- credential vault injection
- domain policy
- browser session profiles
- sensitive action guard
- screenshot and log redaction
- human handoff
- target adapters framework

Exit criteria:

- model never receives test credential
- disallowed origin blocked
- profile destroyed cleanly
- target-awareness limitation clearly reported

## Milestone 5: federation and sovereign deployment

Deliver:

- Trust Domain federation
- external issuer policy
- on-prem deployment
- regional cells
- residency controls
- SPIFFE bridge
- KMS/HSM adapters
- disaster recovery

Exit criteria:

- two independent Trust Domains can selectively trust one another
- loss of global management does not stop local validation
- one Trust Domain can revoke federation without affecting unrelated domains

## Milestone 6: ecosystem

Potential:

- agent publisher verification
- agent trust metadata
- richer runtime attestation
- SDKs for major languages
- SaaS marketplace integrations
- policy packs
- SIEM packages
- security certification
- standards participation

These are not dependencies for the core security model.
