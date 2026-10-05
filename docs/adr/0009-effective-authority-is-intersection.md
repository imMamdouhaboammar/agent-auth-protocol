# ADR 0009: Effective Authority Is an Intersection

## Status

Accepted for AgentAuth v0.2 system design.

## Context

A delegated Agent may simultaneously have:

- an upstream grant
- Provider Agent Account permissions
- Subject permissions
- runtime restrictions
- local relationship-derived permissions
- Provider risk policy

Combining those sources by union would allow one authority source to restore permission intentionally removed by another.

## Decision

AgentAuth models positive authority as intersection.

For delegated mode:

```text
Requested
INTERSECT SubjectAuthority
INTERSECT DelegationGrant
INTERSECT AgentLocalAuthority
INTERSECT ProviderPolicyAllow
INTERSECT RuntimeAuthority
MINUS ProviderPolicyDeny
```

Provider deny rules have final precedence.

## Consequences

Positive:

- delegated Agents cannot exceed the represented Subject
- broad Agent permissions cannot bypass a narrow grant
- Provider policy remains authoritative
- relationship-derived permissions compose cleanly

Cost:

- authorization requires more than token validation
- some deployments need fresh Provider policy data
- debugging needs reason codes showing which authority layer denied access

## Rejected alternative

### Union of independent privileges

Rejected because it permits privilege resurrection and breaks least authority.
