# AgentAuth Implementation Plan

Goal: Build the minimum standards-based kernel first, then add browser and federation adapters without weakening the identity model.

Architecture: Start as a modular control-plane application plus Runtime Identity Broker and Resource Server SDK. Keep browser execution in a separate trust zone. Use short-lived proof-bound tokens and durable grants. Add service extraction only after observed scaling or isolation pressure.

## Global constraints

- standards first
- default deny
- no raw credentials in model context
- Agent Principal separate from Agent Instance
- Subject separate from Actor
- child delegation only attenuates
- browser legacy mode is explicitly lower assurance
- no CAPTCHA bypass
- no mandatory global control plane
- all security mutations produce audit events

## Work Card 1: Domain and identifier kernel

Owns:

- Agent Definition
- Agent Principal
- Agent Instance
- Trust Domain identifiers
- status lifecycle

Acceptance:

- tests prove independent instance revocation
- malformed or cross-tenant identifiers rejected
- public interfaces contain no storage-specific types

## Work Card 2: Grant and attenuation engine

Depends on: Card 1

Owns:

- Delegation Grant state machine
- capability representation
- constraint comparator registry
- parent-child attenuation
- cascade revocation model

Acceptance:

- property tests prove no child can expand resources, actions, expiry, or delegation depth
- unknown constraint comparator fails closed

## Work Card 3: Authorization server profile

Depends on: Cards 1 and 2

Owns:

- OAuth metadata
- token exchange
- JWT access token
- Actor claim
- AgentAuth extension claims
- DPoP
- audience restriction
- JWKS

Acceptance:

- delegated token contains Subject and Actor
- DPoP mismatch fails
- wrong audience fails
- disabled instance cannot exchange

## Work Card 4: Resource Server SDK

Depends on: Card 3

Owns:

- token validation
- DPoP validation
- trusted request context
- gateway header sanitation
- offline JWKS cache

Acceptance:

- forged identity headers ignored
- token validation conformance fixtures pass

## Work Card 5: Policy and approval

Depends on: Cards 2 and 4

Owns:

- Action Intent
- Action Digest
- decision API
- obligations
- human step-up approval

Acceptance:

- changing protected action field invalidates approval
- policy engine outage fails according to risk class

## Work Card 6: Native browser Agent Session

Depends on: Cards 4 and 5

Owns:

- target SDK bootstrap
- one-time code
- server-side agent session metadata
- revocation integration

Acceptance:

- bootstrap replay fails
- target distinguishes agent and human sessions
- grant revocation ends high-risk session within SLA

## Work Card 7: MCP profile

Depends on: Cards 4 and 5

Owns:

- MCP discovery integration
- tool-to-action mapping
- insufficient-scope path
- audit

Acceptance:

- protected tool uses same AgentAuth grant
- scope cannot silently expand

## Work Card 8: Browser Bridge

Depends on: Cards 5 and 6

Owns:

- sandboxed browser
- vault injection
- target profile isolation
- domain policy
- human handoff
- adapter API

Acceptance:

- secret never appears in model-visible output
- profile cannot cross tenant
- disallowed origin blocked
- CAPTCHA triggers handoff

## Work Card 9: Federation and regional deployment

Depends on: Cards 1 and 3

Owns:

- Trust Domain metadata
- peer trust policy
- key lifecycle
- regional tenancy
- SPIFFE bridge

Acceptance:

- explicit peer trust required
- peer disable blocks new foreign credentials
- local cell validates local tokens during management-plane outage

## Work Card 10: Audit and conformance

Cross-cutting, staged alongside all cards.

Owns:

- canonical audit schema
- tamper-evident batches
- test fixtures
- fuzz harness
- red-team suite
- release gate

Acceptance:

- required event coverage
- no secret leakage
- security invariant suite blocks release

## Suggested first repository milestone

Do not begin with browser automation.

Begin with Cards 1 to 4.

That milestone is independently useful and proves the hard identity claim:

"An API can distinguish the represented Subject from the AI Agent Actor and verify the exact Agent Instance presenting the request."
