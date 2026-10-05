# Product Vision

## Problem

Personal AI assistants and autonomous agents increasingly need to perform real actions across APIs, MCP servers, SaaS products, internal applications, and browser-only systems.

Traditional authentication models have several weaknesses for this use case:

- service accounts identify software but usually do not express human delegation or intent
- user sessions identify the user but often hide the fact that software is acting
- OAuth clients identify an application but not necessarily a specific AI agent and its running instance
- browser automation frequently reuses human credentials without a target-visible agent identity
- API keys do not express subject, actor, purpose, or delegation chains
- multi-agent workflows can create unclear responsibility and accidental privilege amplification
- a compromised agent runtime can reuse bearer credentials unless tokens are sender-constrained
- existing audit logs often record only "user X did action Y" even when an autonomous agent actually performed it

## Product thesis

AgentAuth should make an AI agent a first-class security actor without breaking the existing identity ecosystem.

The platform should answer five questions for every privileged action:

1. Who owns or registered this agent?
2. Which exact agent is acting?
3. Which running instance is presenting the credential?
4. On whose behalf is it acting?
5. What grant and policy authorized this specific action?

## Primary users

### Application developers

They need a way to let AI agents sign in without pretending to be humans.

### Enterprise identity and security teams

They need agent inventory, policy, revocation, audit, federation, and integration with existing IdPs.

### Agent platform developers

They need a portable method to obtain narrowly scoped credentials for APIs, MCP servers, and browser applications.

### SaaS and API providers

They need a deterministic way to know whether a caller is a human, service workload, or AI agent.

## Success criteria

An initial production release is successful when:

- an Agent Principal can be registered and cryptographically bound to Agent Instances
- a human or organization can create a constrained Delegation Grant
- an Agent Instance can exchange that grant for a short-lived, audience-bound, sender-constrained token
- an integrated Resource Server can identify Subject and Agent Actor separately
- a target application can create a browser session explicitly marked as agent-operated
- an MCP server can enforce the same grant model
- a grant can be revoked and new access rejected within a defined revocation window
- high-risk actions can require transaction-bound step-up approval
- every decision can be reconstructed from immutable audit records without storing raw credentials
- the system can be deployed in more than one region or organization without a mandatory global database

## Product principles

### Explicit actor identity

A delegated token must not collapse an agent into the user identity.

### Least authority by construction

Child grants and issued tokens may only reduce authority.

### Short-lived credentials

Long-lived authority lives in revocable grants, not long-lived bearer tokens.

### Proof of possession

Access credentials should be bound to the Agent Instance key whenever the integration permits it.

### Policy outside the model

The model may request an action, but the model is not the final authorization authority.

### Browser is a compatibility layer

Browser automation is supported, but it must not become the canonical identity primitive.

### Regional autonomy

A deployment can keep identities, grants, credentials, and logs inside a chosen region or organization.

### Standards first

Stable Internet standards are preferred. Emerging agent-specific drafts inform extension points but do not become mandatory dependencies until mature.

## Non-goals for v1

- general-purpose secrets manager
- identity proofing of natural persons
- consumer social login provider
- CAPTCHA solving
- covert bot detection evasion
- fully semantic authorization for arbitrary legacy web pages
- mandatory blockchain or decentralized identity
- mandatory global directory of all agents
