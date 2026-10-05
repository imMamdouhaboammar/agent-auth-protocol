# AgentAuth Design Provenance

## Purpose

This file records where the AgentAuth Protocol design came from, which parts are
AgentAuth-specific design work, which parts intentionally reuse public
standards, and which external projects informed design exploration.

It is a provenance record, not a claim that AgentAuth owns pre-existing
standards, general authentication ideas, or every concept related to AI-agent
identity.

## Original project authorship

AgentAuth was initiated as an integrated system-design project by **Mamdouh
Aboammar**.

Canonical repository:

https://github.com/imMamdouhaboammar/agent-auth-protocol

The original AgentAuth-specific contribution is the integrated protocol and
system-design composition that treats AI Agent Principal, Agent Instance,
represented Subject, Delegation Grant, Provider awareness, native Login as
Agent, trust/federation, runtime attestation, authorization attenuation, and
auditable execution as one coherent security model.

## Design chronology

### PR #1: Three-party protocol architecture

Merged as commit:

```text
6762a3e737fd7ea3570e4eed7253a0e9415fe870
```

Established:

- Agent Client / Agent SDK
- AgentAuth Authority
- Provider / Provider SDK
- native Agent signup and login ceremonies
- standards-first discovery
- direct versus brokered Provider trust

### PR #2: Normative wire protocol

Merged as commit:

```text
dab765025550f9e7c213b52258b116d97a9c35ef
```

Established:

- normative wire protocol
- issuer-qualified Agent identity
- canonical AgentAuth Context
- token and claims profile
- state machines
- error registry
- version negotiation
- replay and idempotency semantics

### PR #3: Authorization, consent, and delegation

Merged as commit:

```text
b414bb0439e3f79dcb6fc9bb8a7238969d965f8d
```

Established:

- effective authority as intersection
- portable Capability grammar
- deterministic Constraint Subsumption
- child-grant attenuation
- progressive consent
- Action Intent and Action Digest
- Provider-local relationship-policy boundary

### PR #4: Trust, federation, attestation, and key lifecycle

Merged as commit:

```text
2f8506d9a5e645da7dbb43e64c5337f470e9cdf1
```

Established:

- independent Trust Domains
- explicit non-transitive federation
- Agent Instance enrollment
- Runtime Attestation
- key-class separation and key epochs
- federated token exchange
- SPIFFE workload-to-Agent mapping
- trust evaluation separated from authorization

## Standards-derived foundations

AgentAuth deliberately reuses established standards rather than claiming them as
original inventions.

Important examples include:

- OAuth 2.0 and OAuth security best current practice
- OAuth Token Exchange
- DPoP
- mTLS
- Rich Authorization Requests
- OAuth Resource Indicators
- OAuth Protected Resource Metadata
- OAuth Authorization Server Metadata
- OpenID Connect
- RATS architecture
- Entity Attestation Token
- SPIFFE workload identity and federation concepts

The standards mapping is maintained in
[docs/16-standards-mapping.md](docs/16-standards-mapping.md).

## External research inspiration

The repository records external inspiration where it materially influenced a
design decision.

Examples include:

- `Siddhant-K-code/agentic-authz` for relationship-aware authorization
  exploration
- `mandarwagh9/MachineAuth` for machine/Agent lifecycle and OAuth separation
- `scalekit-inc/scalekit-sdk-python` for progressive consent, connected
  credentials, and permission intersection patterns
- emerging IETF AI-agent, workload-identity, and attenuated-delegation drafts

Research notes are stored under [docs/research/](docs/research/).

## Source classification

When evaluating provenance, use these categories:

### AgentAuth-specific design

A design decision, composition, terminology choice, schema, conformance profile,
or protocol behavior developed in this repository.

### Standards-derived

A mechanism intentionally inherited from an RFC, OpenID specification, SPIFFE
specification, or another public standard.

### Research-inspired

A pattern observed in another public project or draft that informed an
AgentAuth design choice.

### Contributor revision

A later change proposed through Git history or pull requests.

## Why this matters

Clear provenance helps:

- avoid claiming ownership of prior standards work
- preserve credit for original AgentAuth system-design work
- make research and implementation citations reproducible
- distinguish standards compliance from AgentAuth-specific semantics
- help future implementers identify the canonical source
