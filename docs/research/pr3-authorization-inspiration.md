# PR3 Authorization Design Research

## Status

Non-normative research notes captured on 2026-10-05.

These sources informed design questions. AgentAuth does not copy their implementation or claim compatibility with them.

## 1. agentic-authz

Repository:

https://github.com/Siddhant-K-code/agentic-authz

Observed patterns:

- relationship-based authorization using OpenFGA
- separate user, organization, team, project, tool, tool operation, Resource, Agent, and task concepts
- operation-level access rather than only broad tool access
- task context that links Agent, initiating user, project, and Resources
- explicit deny/restriction concepts at the Provider policy layer
- use cases that emphasize project context, data sensitivity, and approval workflows

AgentAuth design takeaway:

Relationship systems are strong Provider policy engines, but their tuple schema should not become the portable AgentAuth delegation format.

Instead:

```text
relationship graph
  -> Provider Subject Authority / Agent Local Authority
  -> intersect with portable AgentAuth Capability
```

## 2. MachineAuth

Repository:

https://github.com/mandarwagh9/MachineAuth

Observed patterns:

- Agents have managed lifecycle separate from access tokens
- OAuth client credentials and short-lived JWTs are used for machine access
- per-Agent scopes
- organization and team isolation
- credential rotation
- audit and usage tracking
- roadmap separation between Agent identity, framework adapters, DPoP/mTLS, workload identity federation, and Agent-to-Agent delegation

AgentAuth design takeaway:

Keep Agent Principal, OAuth client registration, Resource credential, and framework adapter as separate layers.

Do not overload the Agent identity object with token or Provider policy semantics.

## 3. Scalekit Python SDK and generated API models

Repository:

https://github.com/scalekit-inc/scalekit-sdk-python

Observed patterns relevant to AgentAuth design:

- Agents described as first-class actors with human and organization context
- ephemeral task-oriented credentials
- token vault and per-tool connections
- human-in-the-loop step-up
- user consent lifecycle and consent revocation
- resource-specific OAuth configuration
- optional user scope selection
- configuration to intersect requested scopes with user permissions
- tool execution behind connected-account credentials

AgentAuth design takeaway:

The effective permission for a delegated Agent should be an intersection, not a grant-only decision.

Progressive consent should let a human remove optional permissions.

Connected credentials should remain a runtime/vault concern, not become the Agent's durable identity.

## 4. RFC 9396 Rich Authorization Requests

Reference:

https://www.rfc-editor.org/rfc/rfc9396.html

Design takeaway:

Use structured `authorization_details` for fine-grained authority instead of relying only on flat OAuth scope strings.

AgentAuth `agent_action` is a product profile until standardized.

## 5. RFC 8785 JSON Canonicalization Scheme

Reference:

https://www.rfc-editor.org/rfc/rfc8785.html

Design takeaway:

Use deterministic JSON canonicalization before computing Action Digests so independent implementations hash the same Action Intent identically.

## 6. RFC 9126 Pushed Authorization Requests

Reference:

https://www.rfc-editor.org/rfc/rfc9126.html

Design takeaway:

High-value consent flows may use PAR/JAR to protect structured authorization requests from tampering. AgentAuth does not redefine those mechanisms.

## 7. Emerging attenuated delegation work

Reference:

https://datatracker.ietf.org/doc/draft-niyikiza-oauth-attenuating-agent-tokens/

Observed direction:

- task-scoped tool capabilities
- argument Constraints
- deterministic Subsumption
- child authority can only narrow
- fail closed on unknown Constraint types
- delegation depth and lifetime bounds

AgentAuth design takeaway:

Adopt the underlying security invariant while keeping emerging draft formats non-normative.

AgentAuth v0.2 uses Authority-mediated child grants rather than requiring offline derivation.

## 8. Emerging Agent Operation Authorization work

Reference:

https://datatracker.ietf.org/doc/draft-liu-agent-operation-authorization/

Observed direction:

- structured operation proposal
- avoid placing raw user prompt into authorization artifact
- confirm operation authorization separately from proposal
- delegation represented explicitly

AgentAuth design takeaway:

Keep Action Intent structured and prompt-independent.

AgentAuth uses a canonical JSON Action Digest rather than standardizing a general policy language inside the operation proposal.

## 9. Design differences

AgentAuth intentionally chooses:

- positive portable Capability Sets
- Provider-local deny policy
- deterministic core Constraints
- exact core Resource identifiers
- issuer-qualified Agent identity
- Authority-mediated child Grant lifecycle
- Provider relationship policy as an adapter boundary
- Action Digest using JCS + SHA-256
- progressive required/optional consent

These choices prioritize interoperability and auditability before implementation convenience.
