# ADR 0015: Runtime Attestation Does Not Grant Authority

## Status

Accepted for AgentAuth v0.2 system design.

## Context

A runtime may present strong evidence about hardware, workload identity, software measurements, or security configuration.

Those facts answer whether the runtime meets trust requirements.

They do not establish that the Agent Principal has permission to access a Resource or perform an Action.

## Decision

Runtime Attestation is a trust-policy input only.

Attestation may satisfy or fail an authorization prerequisite, but it cannot increase:

- Delegation Grant capability
- Direct Entitlement
- Subject Authority
- Provider Agent Account permissions

AgentAuth v0.2 does not define a universal numeric assurance ladder.

## Consequences

Positive:

- strong hardware evidence cannot become accidental privilege escalation
- Providers retain local assurance policy
- heterogeneous attestation technologies can coexist
- assurance semantics remain explicit

Costs:

- authorization engines need a separate trust-evaluation stage
- assurance mapping across federation requires local policy
