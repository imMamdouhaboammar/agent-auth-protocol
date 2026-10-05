# Standards Delta for Protocol v0.2

## Status

Research checkpoint: 2026-10-05.

This document records standards developments that materially affect the v0.2 three-party AgentAuth design. It is additive to `docs/16-standards-mapping.md`.

## WIMSE AIMS

The IETF WIMSE working group published:

- `draft-ietf-wimse-aims-00`
- title: AI Identity Management System
- published: 2026-09-15
- intended status: Informational

Reference:

https://datatracker.ietf.org/doc/draft-ietf-wimse-aims/

The draft recommends applying existing workload identity and OAuth-family standards to AI agent authentication and authorization rather than creating an entirely separate protocol stack.

### AgentAuth design implication

AgentAuth v0.2 SHOULD position itself as:

- an interoperability profile
- a concrete implementation model
- discovery and metadata extensions
- Agent and Provider SDK contracts
- conformance profiles
- native browser Agent Session semantics

It SHOULD NOT compete by redefining cryptographic primitives already provided by OAuth, JOSE, WIMSE, mTLS, or DPoP.

## OAuth Protected Resource Metadata

RFC 9728 defines metadata by which a Protected Resource can publish information including Authorization Servers associated with that resource.

Reference:

https://www.rfc-editor.org/rfc/rfc9728.html

### AgentAuth design implication

Provider discovery SHOULD begin with Protected Resource Metadata.

The custom AgentAuth resource object is an extension to this standards-based discovery path.

This reduces the need for a standalone proprietary Provider discovery endpoint.

## OAuth Authorization Server Metadata

RFC 8414 defines Authorization Server discovery.

Reference:

https://www.rfc-editor.org/rfc/rfc8414.html

### AgentAuth design implication

Authority capabilities SHOULD be represented as RFC 8414 metadata plus versioned AgentAuth extensions where possible.

The early `/.well-known/agentauth-configuration` document MAY remain an aggregation endpoint, but SHOULD NOT be the only discovery mechanism.

## OAuth Dynamic Client Registration

RFC 7591 defines dynamic registration of OAuth clients.

Reference:

https://www.rfc-editor.org/rfc/rfc7591.html

### AgentAuth design implication

Agent Clients MAY use dynamic registration when an Authority supports it.

AgentAuth does not require open dynamic registration.

Authorities SHOULD be able to require:

- initial access authorization
- software statements
- organization policy
- workload identity
- manual approval
- publisher verification

Agent identity enrollment remains logically distinct from ordinary OAuth client registration.

## AI Agent Authentication and Authorization draft lineage

The individual draft `draft-klrc-aiagent-auth` described agent authentication and authorization using existing standards. In September 2026, the work moved into the WIMSE working-group AIMS draft.

References:

https://datatracker.ietf.org/doc/draft-klrc-aiagent-auth/
https://datatracker.ietf.org/doc/draft-ietf-wimse-aims/

### AgentAuth design implication

AIMS is now the primary research reference for the "use existing standards" design direction.

AgentAuth-specific wire fields MUST remain versioned and migration-friendly.

## NIST direction

NIST NCCoE published its software and AI agent identity and authorization concept paper in February 2026 and released a summary of public comments in September 2026.

References:

https://csrc.nist.gov/pubs/other/2026/02/05/accelerating-the-adoption-of-software-and-ai-agent/ipd
https://www.nist.gov/news-events/news/2026/09/comments-software-and-agentic-ai-identity-concept-paper

The NIST work emphasizes identification, authentication, authorization, auditing, non-repudiation, and risks such as prompt injection.

### AgentAuth design implication

The v0.2 architecture keeps credentials and proof keys outside model context and treats the model process as an untrusted-input execution environment.

## Current design posture

Stable foundation:

- OAuth security best current practice
- OAuth Token Exchange
- DPoP
- mTLS
- Rich Authorization Requests
- Resource Indicators
- JWT access-token profiles
- Authorization Server Metadata
- Protected Resource Metadata
- OIDC
- SPIFFE/WIMSE concepts

Emerging input:

- WIMSE AIMS
- agent-specific OAuth profiles
- agent operation authorization drafts
- attenuated multi-agent delegation drafts

AgentAuth SHOULD track emerging work and converge where semantics become standardized.
