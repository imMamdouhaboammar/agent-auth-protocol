# ADR 0013: No Mandatory Global Root of Trust

## Status

Accepted for AgentAuth v0.2 system design.

## Context

AgentAuth is intended for public SaaS, private enterprise, sovereign cloud, and on-prem deployment.

A mandatory global trust root would create governance, sovereignty, availability, and blast-radius dependencies.

## Decision

AgentAuth Trust Domains are independently administered.

Each domain chooses its own Trust Anchors and Federation Peers.

Global directories or registries may exist as optional discovery aids, but they are not protocol roots of trust.

## Consequences

Positive:

- sovereign and disconnected deployment remains possible
- organizations can maintain independent trust policy
- compromise of one Trust Domain does not automatically compromise all domains
- federation can be revoked selectively

Costs:

- cross-domain trust requires explicit configuration or brokered exchange
- public ecosystems need discovery and governance mechanisms outside the protocol core
