# ADR 0005: Three-Party Protocol and SDK Boundaries

## Status

Accepted for the v0.2 design branch.

## Context

The v0.1 design correctly separated Agent Principal, Agent Instance, Subject, and Delegation Grant, but the system description was primarily centered on the AgentAuth platform.

A usable Login as Agent ecosystem requires two independent developer integration surfaces:

- an agent-side protocol client
- a Provider-side protocol verifier/session adapter

Treating those two SDKs as a private bilateral mechanism would create vendor coupling and would blur the role of the Authorization Server.

## Decision

AgentAuth uses a three-party protocol architecture:

1. Agent Client
2. AgentAuth Authority
3. Provider

The Agent SDK and Provider SDK are reference integration surfaces implementing the same open protocol profile.

The Authority may be operated independently, by the Provider, or by the agent owner's organization.

The protocol reuses OAuth/WIMSE/OIDC-family trust and authorization mechanisms and adds versioned agent-specific metadata, claims, ceremonies, and conformance profiles only where existing standards do not express the required semantics.

Provider discovery should prefer OAuth Protected Resource Metadata and Authority discovery should prefer OAuth Authorization Server Metadata.

## Consequences

Positive:

- SDK implementations can be independently replaced
- Providers can choose which issuers they trust
- Agent identity is not tied to browser automation
- SaaS, sovereign, enterprise, and on-prem deployments share one model
- the design can converge with emerging IETF/WIMSE work

Costs:

- profile negotiation and discovery become explicit protocol concerns
- conformance testing must cover at least client, Authority, and Provider implementations
- federation policy remains an operator responsibility
- early AgentAuth extensions may later require migration if standards define equivalent fields

## Rejected alternatives

### Two-SDK private tunnel

Rejected because it couples one Agent SDK implementation to one Provider SDK implementation and bypasses standard issuer/federation architecture.

### Mandatory global AgentAuth service

Rejected because it creates an unnecessary availability, sovereignty, and governance dependency.

### Browser-first identity

Rejected because browser state is a session adapter, not a durable agent identity.
