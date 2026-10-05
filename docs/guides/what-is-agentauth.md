---
layout: default
title: "What is AgentAuth? AI Agent Identity and Authentication Protocol"
description: "AgentAuth is an open system design for AI agent identity, authentication, authorization, delegation, federation, attestation, and Login as Agent."
permalink: /guides/what-is-agentauth/
---

# What is AgentAuth?

**AgentAuth is an open protocol and system design for AI agent identity, authentication, authorization, delegation, federation, runtime attestation, and native Login as Agent.**

Its core goal is simple: a target system should be able to know that an AI agent is acting, know which agent and runtime are involved, know who or what the agent represents, and verify exactly what authority permits the action.

## Why ordinary authentication is not enough

Traditional authentication often identifies one of these:

- a human user
- an OAuth client
- a service account
- a workload
- a browser session

An AI agent can involve several identities at once.

For example, a personal assistant may be:

- running as Agent Principal `assistant-7`
- using Agent Instance `inst-42`
- acting for human Subject `user-123`
- operating under Delegation Grant `grant-88`
- presenting a DPoP-bound access token
- creating a Provider session that must stay marked as agent-operated

Collapsing all of those into one account removes information needed for revocation, consent, trust, and audit.

## Agent Principal vs Agent Instance

An **Agent Principal** is the durable security identity of the AI agent.

An **Agent Instance** is one currently running copy of that agent with its own proof key and runtime evidence.

The distinction means one compromised runtime can be revoked without deleting the entire Agent Principal.

Global Agent identity is issuer-qualified:

```text
(agent_issuer, agent_id)
```

A bare Agent ID is not globally unique.

## Acting as itself vs acting for someone

AgentAuth supports two authority modes.

### Direct authority

The Agent acts under permission assigned directly to the Agent Principal.

### Delegated authority

The Agent acts for another Subject such as a human or organization.

Delegated mode preserves both identities:

```text
Subject = represented principal
Actor   = AI Agent Principal
```

The target must not flatten the Agent out of the security context.

## Is AgentAuth a replacement for OAuth?

No.

AgentAuth uses OAuth-family standards for mechanisms such as authorization-server discovery, token issuance, Token Exchange, audience restriction, DPoP, mTLS, and structured authorization.

AgentAuth adds the AI-agent semantics those mechanisms do not automatically define.

## Is AgentAuth an MCP protocol?

No.

MCP is an important integration surface, but AgentAuth is intended to work across:

- APIs
- MCP servers
- native browser sessions
- Provider SDKs
- Agent-to-Agent delegation
- legacy browser compatibility

The same Agent identity model can therefore survive across different execution channels.

## What makes AgentAuth different from a service account?

A service account usually represents a non-human account owned by an application or organization.

AgentAuth additionally models:

- the AI Agent Principal
- the current Agent Instance
- represented Subject
- delegated authority
- capability attenuation
- progressive consent
- runtime assurance
- native Agent-aware Provider sessions

## Current status

AgentAuth v0.2 is a draft system design.

The project is freezing protocol semantics before building a production reference implementation.

Canonical repository:

https://github.com/imMamdouhaboammar/agent-auth-protocol

Original system design:

Mamdouh Aboammar

## Next reading

- [How Login as Agent works](login-as-agent/)
- [AgentAuth vs OAuth, MCP, SPIFFE, and service accounts](agentauth-vs-oauth-mcp-spiffe/)
- [AgentAuth FAQ](faq/)
- [Normative protocol core](../24-normative-protocol-core.md)
