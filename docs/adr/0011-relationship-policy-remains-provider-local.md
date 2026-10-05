# ADR 0011: Relationship Policy Remains Provider-Local

## Status

Accepted for AgentAuth v0.2 system design.

## Context

Real Providers use different concepts such as organization, team, project, folder, account, repository, ownership, membership, and data classification.

Relationship-based systems can model these effectively, but the same relation name can mean different things across Providers.

## Decision

AgentAuth does not define a portable relationship tuple language for v0.2.

ReBAC, RBAC, ABAC, ACL, and Provider business rules resolve:

- Subject Authority
- Agent Local Authority
- Provider allow policy
- Provider deny policy

The portable AgentAuth layer carries bounded Capabilities, Agent identity, Subject identity, grants, and Action Intent.

## Consequences

Positive:

- Providers keep their existing authorization systems
- no universal relationship ontology is required
- AgentAuth remains interoperable across different policy engines
- local dynamic policy can evolve independently

Cost:

- the same AgentAuth Capability can produce different decisions at different Providers
- Provider adapters must map local operations to canonical Action and Resource identifiers
