# ADR 0014: Federation Is Explicit, Directional, and Non-Transitive

## Status

Accepted for AgentAuth v0.2 system design.

## Context

If Trust Domain A automatically trusted every peer trusted by Domain B, the effective trust graph could expand without A's administrator approving it.

This is especially dangerous for Agent identity because foreign issuers may carry delegated human authority.

## Decision

Federation trust is:

- explicit
- directional
- purpose-bound
- revocable
- non-transitive by default

A trusted broker may issue a new local credential after validating foreign evidence, but this is a new local trust decision and not hidden transitive trust.

## Consequences

Positive:

- trust graph remains auditable
- one peer cannot silently import another peer
- Provider Authorities can centralize foreign trust safely
- peer removal has predictable scope

Costs:

- large federations require policy management
- brokered exchange may add latency
