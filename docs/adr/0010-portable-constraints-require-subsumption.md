# ADR 0010: Portable Constraints Require Deterministic Subsumption

## Status

Accepted for AgentAuth v0.2 system design.

## Context

Agent-to-agent delegation requires proving that child authority does not expand parent authority.

General policy languages can express complex rules but do not necessarily provide a decidable, sound, deterministic containment algorithm across implementations.

## Decision

A Constraint type may be used in portable AgentAuth Capability attenuation only when it defines:

- deterministic runtime check
- decidable Subsumption
- sound Subsumption
- deterministic Subsumption
- bounded resource use
- explicit cross-type rules

Unknown portable Constraint types fail closed.

General ReBAC, RBAC, Cedar, Rego, SQL, JavaScript, and natural-language policy remain Provider Policy inputs unless an interoperable extension defines valid Subsumption semantics.

## Consequences

Positive:

- independent implementations can verify attenuation
- unknown restrictions cannot be silently dropped
- delegation chains remain mechanically testable

Cost:

- core Constraint language is intentionally less expressive than general policy engines
- domain-specific patterns need extension profiles
- some semantically valid narrowing may be conservatively rejected
