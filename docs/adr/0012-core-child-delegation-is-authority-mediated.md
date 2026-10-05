# ADR 0012: Core Child Delegation Is Authority-Mediated

## Status

Accepted for AgentAuth v0.2 system design.

## Context

Offline attenuated delegation can reduce latency and Authority dependence, but it complicates revocation, audit, chain proof, replay handling, and cross-domain policy.

AgentAuth v0.2 is still defining its interoperable security model.

## Decision

AA-DELEGATION-1 requires Authority-mediated child-grant creation.

The Authority validates parent state and attenuation, then creates a new child grant with its own identifier and lifecycle.

Offline derivation MAY be defined later as an optional profile.

## Consequences

Positive:

- clear revocation semantics
- central audit evidence
- policy is evaluated at delegation time
- simpler initial interoperability

Cost:

- child delegation requires Authority availability
- higher latency than offline derivation
- future offline profile will need additional chain-verification semantics
