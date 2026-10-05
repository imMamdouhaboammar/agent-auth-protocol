# Test and Conformance Specification

## Test philosophy

Security invariants are executable requirements.

The suite should prefer protocol-level, property-based, fuzz, integration, and adversarial tests over only unit-level happy paths.

## Conformance profiles

### C1 AgentAuth Issuer

Must support:

- metadata
- Agent Principal and Instance lifecycle
- grant lifecycle
- token exchange
- proof binding
- revocation
- audit

### C2 Resource Server

Must support:

- issuer validation
- audience validation
- Agent Actor extraction
- proof validation
- policy mapping
- trusted-context creation

### C3 Runtime Broker

Must support:

- instance proof key
- secret isolation
- token acquisition
- audience isolation
- refresh protection
- action request normalization

### C4 Native Browser Target

Must support:

- agent-session bootstrap
- one-time redemption
- server-side actor type
- revocation response
- human handoff

### C5 MCP Server

Must support:

- MCP authorization discovery
- audience-bound token
- tool-to-action mapping
- insufficient-scope step-up
- audit

### C6 Federation

Must support:

- explicit peer trust
- issuer metadata validation
- key rotation
- trust revocation
- namespace isolation

## Unit tests

Modules:

- identifier parsing
- claim validation
- grant state transitions
- constraint comparators
- policy obligations
- session expiry
- revocation

## Property-based tests

### Attenuation properties

For all valid parent and child grants:

- child resources never expand
- child actions never expand
- child expiry never exceeds parent
- child delegation depth decreases
- stricter constraints remain stricter after serialization round-trip

### Token properties

- changing audience invalidates validation
- changing proof key invalidates validation
- removing Actor from delegated token invalidates AgentAuth delegated profile
- unknown critical claim version fails closed

## Fuzz tests

Targets:

- JWT parser
- JWK parser
- DPoP proof parser
- OAuth metadata parser
- authorization-details parser
- grant JSON
- federation metadata
- browser bootstrap payload

Assertions:

- no panic
- bounded CPU and memory
- invalid input rejected
- no algorithm confusion
- no URL fetch outside SSRF allow rules

## Integration tests

### Flow F1 direct agent authority

Register Agent Principal -> register Agent Instance -> assign direct entitlement -> issue token -> call Resource Server -> verify audit.

### Flow F2 human delegation

Authenticate human -> approve grant -> agent token exchange -> API call -> verify Subject and Actor separate.

### Flow F3 step-up

Agent requests sensitive action -> PDP returns step_up -> human approves exact Action Digest -> new authorization -> execute.

### Flow F4 child agent

Orchestrator derives narrower child grant -> worker receives token -> valid action allowed -> broader action denied.

### Flow F5 revocation

Issue token -> revoke grant -> verify no new tokens -> verify high-risk Resource Server rejects within revocation SLA.

### Flow F6 native browser

Create agent token -> bootstrap browser session -> verify target session actor type -> revoke instance -> session terminated.

### Flow F7 legacy browser

Start isolated profile -> inject vault credential -> ensure model never receives secret -> perform allowed navigation -> blocked disallowed domain -> audit.

### Flow F8 MCP

Obtain MCP token -> call allowed tool -> call insufficient-scope tool -> step-up -> retry.

### Flow F9 federation

Trust external issuer -> accept permitted agent -> reject disallowed audience -> remove trust -> reject new credentials.

## Adversarial tests

- forged `act`
- nested `act` depth overflow
- signed token with unapproved algorithm
- duplicate JSON keys
- JWK key confusion
- stale DPoP
- DPoP wrong HTTP method
- DPoP wrong URI
- proof replay
- issuer mix-up
- redirect URI manipulation
- bootstrap-code replay
- target-origin mismatch
- grant child with unknown constraint comparator
- cross-tenant identifier collision
- audit event injection
- malicious MCP tool metadata
- prompt injection requesting credential reveal

## Browser tests

Use deterministic test sites under control of the test suite.

Do not run conformance tests against third-party production websites.

Verify:

- cookie isolation
- profile destruction
- credential redaction
- domain egress policy
- human handoff
- screenshot redaction
- download restrictions
- file upload policy
- browser crash recovery

## Performance tests

Measure:

- p50/p95/p99 token issue latency
- p50/p95/p99 policy decision latency
- JWKS cache refresh
- revocation propagation
- 10k concurrent low-risk validations
- burst token exchange
- audit event throughput
- browser worker start and teardown

## Chaos tests

- database failover
- event bus delay
- KMS latency
- KMS outage
- partial region network loss
- JWKS endpoint failure
- federation metadata unavailable
- audit object-store slow
- browser worker crash mid-action

## Release gate

A release is blocked if any of the following fail:

- security invariants
- attenuation property tests
- token replay tests
- cross-tenant isolation
- revocation tests
- audit secret scanning
- native browser actor distinction
- federation trust removal
