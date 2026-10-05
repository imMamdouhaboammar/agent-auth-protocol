# ADR 0016: Agent Instance Proof Keys Are Independent from Authority Signing Keys

## Status

Accepted for AgentAuth v0.2 system design.

## Context

AgentAuth needs to prove both:

- which Authority issued a credential
- which Agent Instance is presenting it

Using the same key class for both roles would couple blast radius and lifecycle.

## Decision

Agent Instance Proof Keys and Authority Signing Keys are distinct security key classes with independent ownership, rotation, revocation, and recovery.

The same cryptographic algorithm may be used, but key identity and purpose remain separate.

## Consequences

Positive:

- one compromised Instance does not expose Authority signing power
- Authority key rotation does not require Agent Instance replacement
- proof-of-possession remains specific to the runtime
- audit and recovery semantics are clearer

Costs:

- deployments manage more key material
- key lifecycle documentation and tooling must distinguish key classes
