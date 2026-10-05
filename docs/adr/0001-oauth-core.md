# ADR 0001: Use OAuth and OpenID as the protocol core

Status: Accepted for design v0.1

## Context

AI agents need delegated authorization, resource-bound access, revocation, human identity integration, and compatibility with existing applications.

Creating a fully independent token system would duplicate solved security problems and create adoption friction.

## Decision

AgentAuth uses OAuth and OpenID mechanisms as its protocol foundation.

Agent-specific behavior is expressed through:

- Actor and Subject separation
- structured authorization
- proof-bound credentials
- registered Agent Principal and Instance metadata
- policy and audit extensions

## Consequences

Positive:

- existing IdP and Resource Server compatibility
- mature security guidance
- known token-validation patterns
- easier MCP integration

Negative:

- OAuth complexity remains
- some legacy systems need gateways
- standards do not yet fully define AI-agent identity semantics

## Rejected alternatives

- proprietary bearer-token protocol
- browser cookie as primary agent identity
- mandatory decentralized identifier system
