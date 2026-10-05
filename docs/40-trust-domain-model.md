# AgentAuth v0.2 Trust Domain Model

## Status

Normative system design for AgentAuth v0.2.

This document defines the trust-domain model used by Authorities, Providers, Agent Clients, and federation peers.

## 1. Principle

AgentAuth has no mandatory global root of trust.

Each Trust Domain is an independent administrative and cryptographic namespace.

A Trust Domain decides which external domains it trusts, for which purposes, under which constraints, and for how long.

## 2. Trust Domain identity

A Trust Domain has one canonical identifier.

For public-network profiles, the identifier SHOULD be an HTTPS URI controlled by the Trust Domain operator.

Example:

```text
https://identity.example.com
```

A Trust Domain identifier is not the same as:

- one signing key
- one Authorization Server endpoint
- one organization display name
- one SPIFFE Trust Domain
- one deployment region

Those objects may map to a Trust Domain, but they are not interchangeable by default.

## 3. Trust Domain contents

A Trust Domain may define:

- one or more Authorities
- issuer identifiers
- token-signing keys
- federation keys or bundles
- Agent Principal namespace
- Agent Instance namespace
- accepted attestation verifiers
- local runtime-assurance policy
- federation peers
- revocation policy
- key-rotation policy
- administrative contacts

## 4. Trust Anchors

Trust Anchors are local.

Examples include:

- issuer metadata pinned by configuration
- JWK or certificate roots
- SPIFFE bundles
- attestation-verifier roots
- federation metadata signed by an already trusted authority
- administrator-approved peer configuration

A Trust Anchor proves or anchors validation.

It does not grant application permission.

## 5. Trust independence

The following implication is invalid:

```text
Domain A trusts Domain B
Domain B trusts Domain C
therefore
Domain A trusts Domain C
```

AgentAuth v0.2 does not permit transitive federation by default.

Domain A must explicitly configure trust in Domain C or use a federation profile that produces a locally acceptable credential through a trusted broker.

## 6. Identity namespaces

An Agent Principal remains issuer-qualified:

```text
(agent_issuer, agent_id)
```

Federation does not rewrite the canonical foreign identity merely because a local Provider Account is created.

A Provider MAY maintain a local mapping:

```text
local_account_17
  -> (https://agents.example.com, agent_123)
```

The local mapping is not a replacement global identity.

## 7. Trust is directional

Federation relationships are directional.

```text
A accepts B
```

does not imply:

```text
B accepts A
```

Two-way federation requires two explicit policy decisions or one configuration object that clearly represents both directions.

## 8. Trust is purpose-bound

A peer may be trusted for one purpose and rejected for another.

Examples:

- identity accepted, but delegated authority rejected
- Agent Principals accepted, but human Subjects rejected
- low-risk read actions accepted, high-risk payment actions rejected
- software-backed runtime accepted for search, hardware-backed runtime required for signing

Trust configuration SHOULD name the accepted purpose instead of using a single global boolean.

## 9. Trust is time-bound

A Federation Peer relationship SHOULD have:

- activation time
- optional expiration
- metadata refresh interval
- emergency disable path

Expired or disabled federation MUST block new foreign authorization.

Existing Provider-local sessions follow local revocation freshness policy.

## 10. Trust-domain metadata

A Trust Domain metadata object may advertise:

- domain identifier
- authorities
- federation metadata endpoint
- key-set locations
- protocol versions
- supported actor types
- supported proof methods
- supported attestation formats
- administrative contact
- metadata validity

Advertisement is not acceptance.

A client or Provider MUST still apply local trust policy.

## 11. Sovereignty

A Trust Domain can be hosted:

- as public SaaS
- in a dedicated cloud
- in a sovereign region
- on premises
- in an isolated network

Location does not change the identity semantics.

## 12. Failure behavior

If trust cannot be established:

- no new federation relationship is inferred
- unknown issuer credentials fail
- expired peer metadata fails according to freshness policy
- unknown trust semantics fail closed
- cached trust may be used only within configured validity

## 13. Security invariant

```text
Cryptographically valid
does not imply
locally trusted

Locally trusted identity
does not imply
runtime accepted

Runtime accepted
does not imply
authorized

Authorized principal
does not imply
current action allowed
```
