# AgentAuth Protocol: Identity, Authentication, Authorization & Delegation for AI Agents

[![CI](https://github.com/imMamdouhaboammar/agent-auth-protocol/actions/workflows/ci.yml/badge.svg)](https://github.com/imMamdouhaboammar/agent-auth-protocol/actions)
[![License](https://img.shields.io/badge/Code-Apache_2.0-blue.svg)](LICENSE)
[![Docs License](https://img.shields.io/badge/Docs-CC_BY_4.0-lightgrey.svg)](LICENSE-DOCS.md)
[![Spec](https://img.shields.io/badge/AgentAuth-v0.2_Draft-orange.svg)](docs/24-normative-protocol-core.md)
[![Citation](https://img.shields.io/badge/Cite-CITATION.cff-green.svg)](CITATION.cff)

**AgentAuth is an open system design and protocol profile for AI agent identity, authentication, authorization, delegation, federation, runtime attestation, and native "Login as Agent".**

In practical terms, AgentAuth defines **AI agent authentication** and authorization semantics that preserve who the Agent is, which runtime is acting, and whose authority it is using.

It defines how a service can know that the caller is an AI agent, identify the durable Agent Principal and the current Agent Instance, preserve the human or organization represented by the agent, verify delegated authority, apply Provider-local policy, and keep the resulting action attributable and auditable.

**Canonical source:** https://github.com/imMamdouhaboammar/agent-auth-protocol  
**Original system design:** Mamdouh Aboammar  
**Current design status:** AgentAuth v0.2 draft, System Design phase  
**Last design checkpoint:** 2026-10-05

> AgentAuth does not replace OAuth, OpenID Connect, SPIFFE, MCP, DPoP, mTLS, RATS, or EAT. It profiles and composes existing identity standards with explicit AI-agent semantics.

## What problem does AgentAuth solve?

Most existing identity systems can authenticate a human, an OAuth client, a service account, or a workload. They do not automatically answer all of these questions at the same time:

- Is the caller an AI agent?
- Which durable Agent Principal is acting?
- Which running Agent Instance is presenting the request?
- Is the agent acting as itself or on behalf of a human, organization, or workload?
- Which explicit Delegation Grant permits the requested action?
- Has authority been narrowed correctly across an agent-to-agent delegation chain?
- Does the target service trust the Agent's Home Authority or runtime?
- Is the current runtime sufficiently attested for the requested action?
- Can the Provider keep the server-side session visibly marked as agent-operated?
- Can the action be audited back to Subject, Agent, Instance, grant, proof, approval, and policy decision?

AgentAuth treats these as separate security questions instead of collapsing them into one "agent account" or browser session.

## What is "Login as Agent"?

**Login as Agent** is a native authentication flow in which the target application intentionally accepts an AI Agent Actor and keeps that actor visible in its authorization and session model.

A native AgentAuth session is not:

- a bot typing a human password
- a special User-Agent string
- an `X-Agent: true` header
- a browser cookie pretending to be durable identity
- an MCP connection by itself
- an ordinary OAuth client ID by itself

A Provider that supports native Login as Agent can identify:

```text
Subject        = the represented human, organization, workload, or Agent
Agent Actor    = the durable AI Agent Principal
Agent Instance = the current runtime with its own proof key
Grant          = the authority permitting this action
Proof          = current sender-constrained proof
Session        = Provider-local session marked as agent-operated
```

See [Native Login as Agent](docs/05-native-login-as-agent.md) and [Protocol Ceremonies](docs/20-protocol-ceremonies.md).

## Three-party architecture

AgentAuth separates three protocol roles:

```text
Agent Runtime
    |
    v
Agent Client / Agent SDK
    |
    | AgentAuth profile
    v
AgentAuth Authority
    |
    | signed identity, delegation, proof-bound credentials
    v
Provider / Provider SDK
    |
    v
Target application, API, MCP server, or native web session
```

The Authority can be operated by the Provider, the Agent owner, an enterprise identity team, a cloud platform, or an independent identity provider.

There is **no mandatory global AgentAuth root**.

Read the [Three-Party Protocol Architecture](docs/17-three-party-protocol-architecture.md).

## Core identity model

AgentAuth deliberately separates identities that are often conflated:

1. **Agent Definition**: descriptive software metadata and declared capabilities.
2. **Agent Principal**: durable security principal representing the AI agent.
3. **Agent Instance**: one running instance with its own proof key and runtime evidence.
4. **Subject**: human, organization, workload, or Agent represented by the Actor.
5. **Delegation Grant**: explicit, scoped, time-bounded delegated authority.
6. **AgentAuth Context**: immutable Provider-side security context derived after validation.
7. **Provider Agent Session**: short-lived target-side session that remains marked as AI-agent operated.

Global Agent identity is issuer-qualified:

```text
Agent Principal = (agent_issuer, agent_id)
Agent Instance  = (agent_issuer, instance_id)
```

A bare `agent_id` is not globally unique.

## Authorization model

AgentAuth uses **intersection, not union**, when computing delegated authority.

```text
Requested Authority
INTERSECT Subject Authority
INTERSECT Delegation Grant
INTERSECT Agent Local Authority
INTERSECT Provider Policy Allow
INTERSECT Runtime Authority
MINUS Provider Policy Deny
```

This prevents a broad permission in one layer from restoring authority that another layer intentionally removed.

Portable AgentAuth grants use positive Capabilities with deterministic constraints. Provider-local RBAC, ReBAC, ABAC, ACLs, Cedar, OPA, OpenFGA, or custom business rules remain local policy inputs.

Read:

- [Effective Authorization Model](docs/32-effective-authorization-model.md)
- [Capability Grammar](docs/33-capability-grammar.md)
- [Constraint Algebra](docs/34-constraint-algebra.md)
- [Delegation and Attenuation](docs/35-delegation-attenuation.md)
- [Progressive Consent](docs/37-progressive-consent.md)

## Trust, federation, and runtime attestation

AgentAuth distinguishes cryptographic validity, local trust, runtime assurance, and authorization.

```text
Valid signature
    !=
Trusted issuer

Trusted issuer
    !=
Trusted Agent Instance

Trusted Agent Instance
    !=
Attested runtime

Attested runtime
    !=
Authorized action
```

Federation is explicit, directional, bounded, revocable, and non-transitive by default.

Runtime attestation is a trust input. It cannot expand a Delegation Grant or Provider permission.

Read:

- [Trust Domain Model](docs/40-trust-domain-model.md)
- [Federation Protocol](docs/41-federation-protocol.md)
- [Agent Instance Enrollment](docs/42-agent-instance-enrollment.md)
- [Runtime Attestation](docs/43-runtime-attestation.md)
- [Key Lifecycle](docs/44-key-lifecycle.md)
- [Federated Token Exchange](docs/45-federated-token-exchange.md)
- [SPIFFE and Workload Identity Bridge](docs/47-spiffe-workload-bridge.md)

## Standards-first design

AgentAuth reuses existing standards wherever they already solve the underlying security problem.

Stable foundations include:

- OAuth 2.0
- OAuth 2.0 Security Best Current Practice
- OAuth Token Exchange, RFC 8693
- OAuth Mutual-TLS Client Authentication, RFC 8705
- DPoP, RFC 9449
- JWT Profile for OAuth Access Tokens, RFC 9068
- OAuth Resource Indicators, RFC 8707
- OAuth Authorization Server Metadata, RFC 8414
- OAuth Protected Resource Metadata, RFC 9728
- Rich Authorization Requests, RFC 9396
- OpenID Connect
- RATS Architecture, RFC 9334
- Entity Attestation Token, RFC 9711
- EAT Media Types, RFC 9782
- EAT Measured Component, RFC 10013
- SPIFFE workload identity and federation concepts

Emerging AI-agent and workload-identity drafts are tracked as research inputs, not silently treated as stable dependencies.

See [Standards Mapping](docs/16-standards-mapping.md).

## AgentAuth vs OAuth, MCP, SPIFFE, and service accounts

| Technology | What it primarily solves | What AgentAuth adds |
| --- | --- | --- |
| OAuth 2.0 | delegated API authorization | explicit AI Agent Actor, Instance, grant, proof, and Provider session semantics |
| OpenID Connect | identity assertions | Agent Principal and represented Subject separation |
| MCP Authorization | authorization around MCP interactions | cross-API, browser, Provider, delegation, and Agent identity model |
| SPIFFE | workload identity | mapping from workload to Agent Principal/Instance plus delegation and Provider semantics |
| Service accounts | non-human account access | explicit Agent identity, represented Subject, runtime proof, progressive consent, and agent-aware sessions |
| Browser automation | UI execution | security identity and authorization independent from automation |

More detail: [AgentAuth compared with OAuth, MCP, SPIFFE, and service accounts](docs/guides/agentauth-vs-oauth-mcp-spiffe.md).

## Primary use cases

AgentAuth is designed for scenarios such as:

- personal AI assistants acting for a user
- enterprise agents acting for an organization
- AI agents using SaaS APIs
- AI agents authenticating to MCP servers
- browser agents using native agent-aware sessions
- agent-to-agent delegation
- high-risk actions requiring human step-up approval
- public SaaS Providers accepting agents from external Trust Domains
- sovereign or on-prem deployments with no global identity root
- workload-backed or hardware-attested Agent Instances

## System design map

The repository is a design specification first. The current design is organized as follows.

| Area | Canonical documents |
| --- | --- |
| Product and requirements | [00](docs/00-product-vision.md), [01](docs/01-requirements.md) |
| Domain model | [02](docs/02-domain-model.md), [CONTEXT](CONTEXT.md) |
| Architecture | [03](docs/03-system-architecture.md), [17](docs/17-three-party-protocol-architecture.md) |
| Wire protocol | [24](docs/24-normative-protocol-core.md), [25](docs/25-http-wire-bindings.md), [26](docs/26-token-and-claims-profile.md) |
| Discovery and metadata | [21](docs/21-discovery-and-metadata.md) |
| Login as Agent | [05](docs/05-native-login-as-agent.md), [20](docs/20-protocol-ceremonies.md) |
| Agent SDK contract | [18](docs/18-agent-sdk-contract.md) |
| Provider SDK contract | [19](docs/19-provider-sdk-contract.md) |
| Authorization and delegation | [32-39](docs/32-effective-authorization-model.md) |
| Trust and federation | [40-47](docs/40-trust-domain-model.md) |
| Threat model | [09](docs/09-security-threat-model.md) |
| Conformance | [13](docs/13-test-conformance.md), [31](docs/31-conformance-matrix.md) |
| Schemas | [schemas/](schemas/) |
| ADRs | [docs/adr/](docs/adr/) |
| Research provenance | [docs/research/](docs/research/) |

For a search-oriented entry point, see [AgentAuth Documentation](docs/index.html).

## Common questions

### How can an AI agent authenticate to a website?

If the website supports AgentAuth natively, the Agent Client discovers the Provider, obtains a proof-bound credential from an accepted Authority, and establishes an Agent-aware session. The Provider keeps `actor_type=ai_agent` in its server-side context instead of hiding the Agent behind a human browser session.

### Can AgentAuth work with OAuth?

Yes. AgentAuth is intentionally built on OAuth-family mechanisms rather than replacing them. OAuth handles token issuance and delegated authorization primitives; AgentAuth adds AI Agent Principal, Agent Instance, represented Subject, grant, proof, trust, and native session semantics.

### Is AgentAuth the same as MCP authentication?

No. MCP is one integration surface. AgentAuth is intended to cover APIs, MCP, native browser sessions, legacy browser bridges, and agent-to-agent delegation using the same identity model.

### Does attestation give an Agent more permission?

No. Runtime Attestation can satisfy a Provider trust requirement, but it cannot expand the Agent's grant or the represented Subject's authority.

### Can an Agent delegate to another Agent?

Yes, but child authority must attenuate. Resources, actions, constraints, lifetime, and delegation depth can only stay equal or become narrower under the defined profile.

## Machine-readable discovery

The repository includes:

- [llms.txt](llms.txt) for concise AI-readable navigation
- [llms-full.txt](llms-full.txt) for an expanded protocol summary
- [CITATION.cff](CITATION.cff) for machine-readable citation
- [ATTRIBUTION.md](ATTRIBUTION.md) for reuse and attribution guidance
- [DESIGN_PROVENANCE.md](DESIGN_PROVENANCE.md) for design chronology and source classification

The project does not claim that `llms.txt` is a search-ranking factor.

## Citation and attribution

If you discuss, quote, adapt, or build directly from the AgentAuth specification, cite the canonical repository:

> **AgentAuth Protocol**, original system design by **Mamdouh Aboammar**  
> https://github.com/imMamdouhaboammar/agent-auth-protocol

GitHub can render formal citation formats from [CITATION.cff](CITATION.cff).

See [How to Cite AgentAuth](HOW_TO_CITE.md) and [Attribution Policy](ATTRIBUTION.md).

## Licensing

This repository intentionally separates software licensing from documentation licensing.

- **Software, tests, schemas, and reference implementation material:** Apache License 2.0 unless a file says otherwise.
- **Original documentation prose and diagrams:** Creative Commons Attribution 4.0 International, CC BY 4.0, unless a file says otherwise.

CC BY 4.0 permits sharing and adaptation, including commercial use, subject to its attribution requirements.

See:

- [LICENSE](LICENSE)
- [LICENSE-DOCS.md](LICENSE-DOCS.md)
- [NOTICE](NOTICE)
- [ATTRIBUTION.md](ATTRIBUTION.md)

The licensing files distinguish reuse of copyrighted specification material from independent implementation of general ideas or standards concepts.

## Verification

The repository uses Bun for schema, conformance, integrity, and documentation checks.

```bash
bun install
bun test
bun run validate:checksums
```

## Project status

AgentAuth is currently a **draft system design**, not an Internet standard and not yet a production-ready reference implementation.

The design is being frozen in stages before implementation.

## Contributing

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Architectural Decision Records](docs/adr/)

When proposing changes to identity, authorization, trust, or wire semantics, include evidence, threat implications, interoperability impact, and conformance tests.
