---
layout: default
title: "Login as Agent: How AI Agents Authenticate to Websites and APIs"
description: "Login as Agent is a native AgentAuth flow where the Provider knows an AI agent is acting and preserves the Agent Actor in authorization and session state."
permalink: /guides/login-as-agent/
---

# Login as Agent

**Login as Agent is a native authentication flow in which a target service intentionally recognizes an AI agent as the Actor instead of hiding it behind a human session.**

The Provider can distinguish the represented Subject from the Agent Actor and the currently running Agent Instance.

## What a Provider should know

A native AgentAuth Provider can retain:

```text
Subject
Agent Principal
Agent Instance
Delegation Grant
Credential issuer
Proof method
Protocol version
Provider-local Agent account
Session expiry
```

For delegated access, the Subject and Actor remain separate.

## What Login as Agent is not

It is not:

- browser automation typing a human password
- copying human cookies into an agent runtime
- a User-Agent string
- a boolean `is_agent` request header
- an ordinary OAuth client ID by itself
- an MCP connection by itself

Those mechanisms may exist around an Agent, but they do not establish the complete AgentAuth security context.

## Native flow

A simplified native flow is:

```text
1. Agent Client discovers Provider AgentAuth metadata
2. Agent Client selects an accepted Authority
3. Agent Instance proves possession of its key
4. Direct or delegated authority is resolved
5. Authority issues a Provider-audience proof-bound credential
6. Provider validates Agent, Instance, Subject, grant, audience, and proof
7. Provider applies local authorization policy
8. Provider optionally creates a one-time browser bootstrap
9. Browser redeems bootstrap
10. Provider creates a server-side Agent Session
```

The resulting session stays marked as agent-operated.

## Browser session security

The browser cookie is Provider session state.

It is not the durable Agent identity.

A native Agent session should be:

- short-lived
- revocable
- bound to validated Agent identity
- distinguishable from human sessions
- unable to silently upgrade itself into a human session

A one-time bootstrap prevents long-lived Agent credentials from being placed directly into browser URLs or cookies.

## Direct Agent login

An organization-owned Agent may have direct Provider entitlement.

In that case the Agent Principal is the authority-bearing Subject.

## Delegated Agent login

A personal assistant may act for a user.

In that case:

```text
Subject = user
Actor   = Agent Principal
Instance = current runtime
Grant   = explicit delegated authority
```

The Provider evaluates both Subject authority and Agent authority.

## Why this matters

Without native Agent awareness, the target may only see a human account.

That makes it difficult to:

- revoke one Agent without revoking the human
- apply Agent-specific risk policy
- audit which Agent performed the action
- require stronger runtime assurance for Agents
- separate human and Agent sessions
- enforce delegated authority narrower than the human's full account

## Legacy browser compatibility

AgentAuth can protect credentials and audit a browser automation workflow for a legacy site.

But if the target does not integrate AgentAuth or a trusted enforcing gateway, the target itself cannot honestly be said to know that an AI agent is acting.

That mode has lower assurance than native Login as Agent.

## Canonical design documents

- [Native Login as Agent](https://github.com/imMamdouhaboammar/agent-auth-protocol/blob/main/docs/05-native-login-as-agent.md)
- [Protocol Ceremonies](https://github.com/imMamdouhaboammar/agent-auth-protocol/blob/main/docs/20-protocol-ceremonies.md)
- [Agent SDK Contract](https://github.com/imMamdouhaboammar/agent-auth-protocol/blob/main/docs/18-agent-sdk-contract.md)
- [Provider SDK Contract](https://github.com/imMamdouhaboammar/agent-auth-protocol/blob/main/docs/19-provider-sdk-contract.md)
