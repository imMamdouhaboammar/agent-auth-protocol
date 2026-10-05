# AgentAuth Protocol v0.2 Implementation Plan

## Goal

Build a minimal interoperable reference implementation proving that an independent Agent Client and independent Provider can discover each other, authenticate an Agent Instance, preserve Subject/Actor semantics, and establish an agent-aware API or browser session through a compatible Authority.

## Architecture

The reference system has three implementation surfaces:

- Agent Client SDK
- AgentAuth Authority
- Provider SDK

The first milestone proves API authentication and Provider discovery before browser automation.

## Work Card 1: Metadata and discovery package

Owns:

- Provider resource metadata parser
- Authority metadata parser
- AgentAuth extension validation
- profile negotiation
- proof-method negotiation
- metadata cache rules

Must not:

- silently trust discovered issuers
- infer AgentAuth from HTML

Acceptance:

- valid Provider metadata selects a mutually supported profile
- contradictory Provider/Authority relationship fails
- unknown mandatory profile fails
- insecure metadata endpoint fails
- explicit enterprise issuer policy overrides untrusted discovery

## Work Card 2: Agent Instance identity kernel

Owns:

- Agent Principal identifier type
- Agent Instance key generation/import
- proof-key thumbprint
- Instance lifecycle
- revocation status
- model/credential boundary

Acceptance:

- private key is never returned by public SDK interfaces
- two Instances of one Agent Principal have different proof keys
- one Instance can be revoked independently
- proof verification succeeds only for the matching key

## Work Card 3: Authority issuance profile

Owns:

- Instance authentication
- direct Agent authority
- Delegation Grant lookup
- OAuth Token Exchange profile
- audience narrowing
- DPoP-bound token issuance
- Subject/Actor claims

Acceptance:

- direct token identifies Agent Principal as Subject
- delegated token identifies represented Subject and Agent Actor separately
- wrong audience rejected
- wrong proof key rejected
- revoked grant blocks new issuance

Depends on:

- Card 2

## Work Card 4: Provider SDK API profile

Owns:

- request authentication middleware
- issuer allowlist/federation hook
- token validation
- DPoP validation
- immutable AgentAuth Context
- local authorization hook
- structured AgentAuth challenge

Acceptance:

- Provider sees Agent Principal and Agent Instance
- delegated request preserves Subject
- Provider can narrow permissions
- malformed delegated credential never becomes direct authority
- arbitrary issuer is rejected

Depends on:

- Cards 1 and 3

## Work Card 5: Provider Agent Account signup

Owns:

- agent signup endpoint
- Provider-local Agent Account mapping
- local approval hook
- account status
- local role mapping

Acceptance:

- account is keyed to Agent Principal + trusted issuer
- display name cannot establish identity
- self-declared capabilities do not become permissions
- Provider may deny open signup

Depends on:

- Card 4

## Work Card 6: Agent Client SDK

Owns:

- discovery
- Authority selection
- direct authorization
- delegated authorization
- signup
- structured errors
- no-silent-downgrade rule

Acceptance:

- `discover(target)` returns negotiated profile
- `authorize(...)` returns explicit direct/delegated context
- unsupported AgentAuth returns structured error
- native failure does not silently invoke password automation
- secrets are absent from model-facing result objects

Depends on:

- Cards 1 through 4

## Work Card 7: Native Login as Agent

Owns:

- Provider agent-session endpoint
- one-time bootstrap
- browser redemption
- server-side `actor_type=ai_agent`
- session revocation
- human handoff

Acceptance:

- bootstrap expires and is one-time
- bootstrap cannot create a human session
- Provider session preserves Subject, Agent, Instance, Grant
- Agent Instance or Grant revocation terminates high-risk sessions within configured SLA

Depends on:

- Cards 4 and 6

## Work Card 8: Step-up and Action Digest

Owns:

- Action Intent normalization
- Action Digest
- structured step-up challenge
- approval binding
- retry validation

Acceptance:

- changing protected action parameters invalidates approval
- model cannot self-approve human-required step-up
- challenge does not disclose secrets

Depends on:

- Cards 3, 4, and 6

## Work Card 9: Conformance harness

Owns:

- AA-CLIENT-1 tests
- AA-AUTHORITY-1 tests
- AA-PROVIDER-API-1 tests
- AA-PROVIDER-WEB-1 tests
- AA-DELEGATION-1 tests
- negative/replay tests
- interoperability fixtures

Acceptance:

- an Agent Client and Provider built from separate packages pass the same fixtures
- replayed proof fails
- unknown issuer fails
- audience mismatch fails
- Subject/Actor collapse test fails
- child delegation expansion fails

## Recommended first executable milestone

Implement Cards 1 through 4.

The milestone is successful when:

> An Agent Client starts with only a Provider URL, discovers supported AgentAuth capabilities, selects a trusted Authority, obtains a proof-bound access credential, and calls the Provider while the Provider can separately verify Agent Principal, Agent Instance, represented Subject, and authorization context.

Do not begin with the browser bridge.
