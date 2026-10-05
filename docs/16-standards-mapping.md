# Standards Mapping

Status checked: 2026-10-05.

This document separates stable standards from emerging work.

## Stable standards used as foundations

### OAuth 2.0 Security Best Current Practice, RFC 9700

Use:

- modern OAuth security baseline
- sender-constrained token recommendation
- redirect and authorization-flow hardening

Reference:
https://www.rfc-editor.org/rfc/rfc9700.html

### OAuth 2.0 Token Exchange, RFC 8693

Use:

- Subject and Actor delegation semantics
- `act` claim
- `may_act` where appropriate
- token exchange pattern

Reference:
https://www.rfc-editor.org/rfc/rfc8693.html

### OAuth DPoP, RFC 9449

Use:

- proof-of-possession for application-layer token binding
- replay resistance

Reference:
https://www.rfc-editor.org/rfc/rfc9449.html

### OAuth mTLS, RFC 8705

Use:

- certificate-bound tokens for enterprise and workload deployments

Reference:
https://www.rfc-editor.org/rfc/rfc8705.html

### JWT Profile for OAuth 2.0 Access Tokens, RFC 9068

Use:

- interoperable JWT access-token baseline

Reference:
https://www.rfc-editor.org/rfc/rfc9068.html

### OAuth Authorization Server Issuer Identification, RFC 9207

Use:

- issuer validation and mix-up protection

Reference:
https://www.rfc-editor.org/rfc/rfc9207.html

### OAuth Rich Authorization Requests, RFC 9396

Use:

- structured authorization details beyond flat scopes

Reference:
https://www.rfc-editor.org/rfc/rfc9396.html

### OAuth Resource Indicators, RFC 8707

Use:

- target resource and audience narrowing

Reference:
https://www.rfc-editor.org/rfc/rfc8707.html

### OpenID Connect

Use:

- human identity and identity assertion where needed
- integration with existing IdPs

Reference:
https://openid.net/specs/openid-connect-core-1_0.html

### SPIFFE

Use:

- workload identity
- Trust Domain concepts
- portable runtime identity integration

Reference:
https://spiffe.io/docs/latest/spiffe-specs/

## MCP

AgentAuth should conform to the active MCP authorization specification and treat MCP as an integration profile.

As of 2026-07-28, MCP includes authorization hardening such as issuer validation and movement toward client metadata documents.

References:

https://blog.modelcontextprotocol.io/posts/2026-07-28/
https://modelcontextprotocol.io/

## NIST direction

NIST NCCoE published a 2026 concept paper focused specifically on software and AI agent identity and authorization. It identifies OAuth/OIDC, MCP, identity, authorization, and provenance as relevant building blocks.

Reference:
https://www.nccoe.nist.gov/sites/default/files/2026-02/accelerating-the-adoption-of-software-and-ai-agent-identity-and-authorization-concept-paper.pdf

## Emerging IETF work

These drafts show active standards exploration but are not stable dependencies.

### OpenID Connect Agent Identity Claims

Agent-specific claims for autonomous AI agents.

Reference:
https://datatracker.ietf.org/doc/draft-sharif-openid-agent-identity/

### AI Agent Authorization Integration Framework

Combines OAuth extensions for cross-domain agent authorization.

Reference:
https://www.ietf.org/archive/id/draft-liu-ai-agent-authorization-integration-00.html

### Credential Delegation for AI Agents

Profiles token exchange, proof of possession, structured authorization, and user authorization for AI agents.

Reference:
https://datatracker.ietf.org/doc/html/draft-sweeney-wimse-credential-delegation-00

### Attenuating Authorization Tokens for Agentic Delegation Chains

Explores tool-level attenuated delegation.

Reference:
https://datatracker.ietf.org/doc/html/draft-niyikiza-oauth-attenuating-agent-tokens-01

### Agent Operation Authorization

Explores structured, verifiable authorization of agent operations.

Reference:
https://datatracker.ietf.org/doc/html/draft-liu-agent-operation-authorization-02

### Attenuated Delegation Profile for Automated Agents

Explores request-signature-based delegation chains.

Reference:
https://datatracker.ietf.org/doc/draft-hamr-oauth-agent-delegation/02/

## Design policy for emerging standards

- do not copy draft-specific mandatory wire formats into the stable core
- reserve extension points
- maintain adapters or experimental profiles
- track draft maturity
- prefer convergence with IETF/OpenID work over proprietary divergence
- document migration path if a draft becomes a standard

## What AgentAuth proposes

The following are product-specific proposals, not existing standards:

- `urn:agentauth:claims:v1`
- AgentAuth Agent Definition and Agent Instance data model
- `/.well-known/agentauth-configuration`
- `agent_action` authorization details profile
- native browser Agent Session bootstrap
- AgentAuth conformance profile names

These proposals should be designed so they can later align with a mature standard.
