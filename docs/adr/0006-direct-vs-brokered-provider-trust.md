# ADR 0006: Direct vs Brokered Provider Trust

## Status

Accepted for the v0.2 design branch.

## Context

A global protocol cannot require every Provider Resource Server to validate credentials from every Agent Home Authority.

At the same time, forcing one global AgentAuth issuer would create governance, availability, and sovereignty problems.

## Decision

AgentAuth supports two Provider trust topologies:

1. direct issuer trust, where the Provider validates an accepted Home Authority credential
2. Provider-Authority brokered trust, where a Provider Authorization Server validates or exchanges the external agent credential and issues a Provider-local credential

OAuth Token Exchange is a preferred mechanism for the second topology when an existing credential is being exchanged across trust or audience boundaries.

Token Exchange is not mandatory for every delegated access request. An Authority that already owns an approved Delegation Grant may issue resource authorization without exposing a reusable Subject token to the Agent Client.

Subject and Agent Actor semantics must survive any brokered exchange.

## Consequences

- public Providers can centralize foreign issuer trust
- Resource Servers can trust one Provider Authority
- no mandatory global AgentAuth root is introduced
- implementations need explicit provenance and claim mapping rules
- federation and revocation freshness become conformance concerns
