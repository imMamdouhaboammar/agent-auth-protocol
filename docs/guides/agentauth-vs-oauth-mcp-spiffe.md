---
layout: default
title: "AgentAuth vs OAuth, MCP, SPIFFE, Service Accounts and Browser Automation"
description: "A technical comparison of AgentAuth with OAuth, MCP authorization, SPIFFE workload identity, service accounts, and browser automation."
permalink: /guides/agentauth-vs-oauth-mcp-spiffe/
---

# AgentAuth vs OAuth, MCP, SPIFFE, service accounts, and browser automation

AgentAuth is designed to compose with existing identity systems, not replace them.

## AgentAuth vs OAuth

OAuth primarily provides authorization mechanisms for clients accessing protected resources.

AgentAuth reuses OAuth for:

- Authorization Server discovery
- Resource discovery
- Token Exchange
- Resource Indicators
- Rich Authorization Requests
- DPoP or mTLS proof binding

AgentAuth adds:

- durable AI Agent Principal identity
- running Agent Instance identity
- represented Subject vs Agent Actor
- Delegation Grant semantics
- Agent-to-Agent attenuation
- native Agent-aware Provider sessions
- federation and runtime-attestation semantics specific to Agent use

So AgentAuth can be thought of as an AI-agent identity and authorization profile built on OAuth-family foundations.

## AgentAuth vs MCP authorization

MCP authorization protects access to MCP servers and resources.

AgentAuth treats MCP as one integration profile among several.

The same Agent Principal may need to move across:

```text
MCP server
API
browser session
Agent-to-Agent delegation
Provider SDK
```

AgentAuth attempts to keep the identity and delegation model consistent across those channels.

## AgentAuth vs SPIFFE

SPIFFE solves workload identity.

A SPIFFE ID answers:

> Which workload is this?

AgentAuth additionally asks:

> Which AI Agent Principal does this workload run?
> Which Agent Instance is active?
> Who does the Agent represent?
> What delegated authority permits the Action?
> What does the Provider allow?

A SPIFFE workload therefore requires an explicit trusted mapping to an Agent Principal.

## AgentAuth vs service accounts

A service account is useful for application-owned non-human access.

AgentAuth is designed for richer cases where:

- one Agent has multiple runtime Instances
- an Agent may act for different Subjects
- authority must be narrower than a user's full account
- users can progressively consent
- child Agents receive attenuated authority
- Providers need Agent-specific sessions and audit

A service account may still be one implementation input for direct Agent authority.

## AgentAuth vs browser automation

Browser automation is an execution mechanism.

It can click, type, and navigate.

It does not by itself provide cryptographic Agent identity.

AgentAuth separates:

```text
execution channel
from
security identity
```

A native Agent-aware site can explicitly authenticate the Agent.

A legacy site cannot be made Agent-aware merely because automation is controlled safely on the Agent side.

## AgentAuth vs workload attestation

Attestation describes the runtime environment.

It may prove properties such as approved software measurements, workload identity, or hardware state.

AgentAuth treats attestation as a trust input.

It never converts strong attestation into extra authorization beyond the active grant and Provider policy.

## Summary

| System | Primary concern | AgentAuth relationship |
| --- | --- | --- |
| OAuth | API authorization framework | reused and profiled |
| OIDC | identity assertions | reused where appropriate |
| MCP | Agent/tool integration protocol | integration surface |
| SPIFFE | workload identity | workload-to-Agent mapping |
| Service account | non-human account | possible direct-authority mechanism |
| RATS/EAT | runtime attestation | trust input |
| Browser automation | UI execution | execution channel |
| AgentAuth | AI Agent identity + delegation + Provider awareness | coordinating security profile |
