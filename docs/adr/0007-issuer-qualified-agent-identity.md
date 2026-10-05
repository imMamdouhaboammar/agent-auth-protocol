# ADR 0007: Issuer-Qualified Agent Identity

## Status

Accepted for AgentAuth v0.2 system design.

## Context

AgentAuth is global and federated. Independent Home Authorities can issue Agent Principals.

A plain identifier such as `agent_123` cannot be globally unique without a central registry.

In brokered trust, the access-token `iss` may identify a Provider Authority rather than the Home Authority that established the Agent Principal.

## Decision

The canonical external Agent Principal identity is:

```text
(agent_issuer, agent_id)
```

The canonical external Agent Instance identity is:

```text
(agent_issuer, instance_id)
```

The current access-token `iss` identifies the token issuer.

AgentAuth extension claims separately carry `agent_issuer` so brokered exchanges preserve identity provenance.

OAuth `client_id`, JWT `sub`, Agent Principal `agent_id`, and Agent Instance `instance_id` are distinct identifiers and MUST NOT be assumed equal.

## Consequences

Positive:

- no mandatory global AgentAuth registry
- issuer namespace collisions are safe
- brokered Provider Authority designs preserve provenance
- Provider-local account mapping has an unambiguous key

Costs:

- every implementation must carry issuer context with agent IDs
- logs and schemas using bare `agent_id` need clear issuer context
- federation mapping is explicit rather than implicit

## Rejected alternatives

### Globally unique bare Agent ID

Rejected because it requires a governance or allocation root that the protocol does not otherwise need.

### Use access-token `iss` as Agent issuer

Rejected because brokered exchange can legitimately change the access-token issuer.

### Set OAuth `client_id` equal to Agent Principal ID

Rejected because one Agent Principal can have multiple runtimes, clients, deployments, or authorization-server registrations.
