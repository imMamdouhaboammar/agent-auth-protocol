# Discovery and Metadata Profile

## Design goal

An Agent Client should be able to start with a target URL and safely determine:

- whether the target intentionally supports AgentAuth
- which Authorization Servers or Trust Domains it accepts
- which AgentAuth conformance profiles it implements
- which proof methods it requires
- whether agent signup is supported
- whether native browser Login as Agent is supported

The discovery design reuses OAuth metadata before adding AgentAuth-specific fields.

## Standards-first discovery

Preferred building blocks:

1. OAuth Protected Resource Metadata for Provider/resource discovery
2. OAuth Authorization Server Metadata for Authority discovery
3. OpenID Provider metadata where OIDC is used
4. Dynamic Client Registration only where the Authority explicitly allows it

AgentAuth-specific fields are extensions to these metadata documents where practical.

## Provider Protected Resource Metadata

A Provider SHOULD publish OAuth Protected Resource Metadata.

Example:

```json
{
  "resource": "https://crm.example.com",
  "authorization_servers": [
    "https://auth.example.com"
  ],
  "bearer_methods_supported": ["header"],
  "resource_signing_alg_values_supported": ["ES256"],
  "urn:agentauth:resource-metadata:v1": {
    "version": "0.2",
    "protocol_versions_supported": ["0.2"],
    "actor_types_supported": ["ai_agent"],
    "profiles_supported": [
      "AA-PROVIDER-API-1",
      "AA-PROVIDER-WEB-1",
      "AA-DELEGATION-1"
    ],
    "proof_methods_supported": ["dpop"],
    "authorization_details_types_supported": ["agent_action"],
    "agent_signup_endpoint": "https://crm.example.com/agentauth/signup",
    "agent_session_endpoint": "https://crm.example.com/agentauth/session",
    "agent_account_management_endpoint": "https://crm.example.com/settings/agents"
  }
}
```

The exact retrieval location follows the Protected Resource Metadata specification.

## Authority metadata

The Authority SHOULD publish standard OAuth Authorization Server Metadata.

AgentAuth extensions may be added as metadata members.

Example conceptual extension:

```json
{
  "issuer": "https://auth.example.com",
  "token_endpoint": "https://auth.example.com/oauth/token",
  "jwks_uri": "https://auth.example.com/.well-known/jwks.json",
  "grant_types_supported": [
    "authorization_code",
    "urn:ietf:params:oauth:grant-type:token-exchange"
  ],
  "dpop_signing_alg_values_supported": ["ES256"],
  "urn:agentauth:authority-metadata:v1": {
    "version": "0.2",
    "protocol_versions_supported": ["0.2"],
    "profiles_supported": [
      "AA-AUTHORITY-1",
      "AA-DELEGATION-1"
    ],
    "agent_registration_endpoint": "https://auth.example.com/v1/agents",
    "agent_instance_endpoint": "https://auth.example.com/v1/instances",
    "grant_endpoint": "https://auth.example.com/v1/grants",
    "proof_methods_supported": ["dpop", "mtls"],
    "actor_types_supported": ["ai_agent"]
  }
}
```

The existing AgentAuth-specific `/.well-known/agentauth-configuration` MAY remain as an aggregation endpoint for early implementations, but conforming v0.2 clients SHOULD prefer standards-based metadata plus extensions.

## Cross-check requirement

When both sides enumerate trust:

- Provider metadata lists accepted Authorization Servers
- Authority metadata lists protected resources where supported

The Agent Client SHOULD cross-check the relationship.

Contradictory metadata MUST NOT be resolved by guessing.

## Agent metadata

Agent descriptive metadata is separate from authentication evidence.

A publisher MAY host an Agent Metadata document.

Example:

```json
{
  "schema_version": "0.2",
  "agent_id": "urn:agentauth:agent:researcher",
  "display_name": "Research Agent",
  "publisher": {
    "id": "urn:subject:org:example",
    "website": "https://publisher.example"
  },
  "capabilities_declared": [
    "web.search",
    "documents.read"
  ],
  "supported_profiles": [
    "AA-CLIENT-1"
  ],
  "metadata_updated_at": "2026-10-05T12:00:00Z"
}
```

This document is descriptive.

The Provider MUST NOT convert `capabilities_declared` into permissions without separate authorization.

## Agent Client registration metadata

Where dynamic client registration is used, AgentAuth metadata may accompany ordinary OAuth client metadata.

Example conceptual registration:

```json
{
  "client_name": "Research Agent Runtime",
  "token_endpoint_auth_method": "private_key_jwt",
  "grant_types": [
    "urn:ietf:params:oauth:grant-type:token-exchange"
  ],
  "jwks_uri": "https://runtime.example/jwks.json",
  "urn:agentauth:client-metadata:v1": {
    "agent_id": "agent_researcher",
    "agent_metadata_uri": "https://publisher.example/agents/researcher.json",
    "protocol_versions_supported": ["0.2"],
    "profiles_supported": ["AA-CLIENT-1"],
    "proof_methods_supported": ["dpop"]
  }
}
```

Dynamic registration is not mandatory.

Open registration SHOULD NOT be enabled merely for convenience. Authorities may require software statements, administrator approval, workload identity, or other anti-abuse controls.

## Discovery algorithm

The Agent Client:

1. derives the Provider resource origin from the requested target
2. fetches Protected Resource Metadata
3. validates HTTPS origin and metadata syntax
4. reads accepted Authority identifiers
5. reads AgentAuth resource extension
6. fetches selected Authority metadata
7. validates issuer equality and endpoint origins
8. selects the strongest mutually supported proof method
9. selects a mutually supported AgentAuth profile
10. caches metadata only within declared cache policy

## Metadata security

Threats:

- malicious target advertises attacker-controlled Authority
- DNS or origin confusion
- stale metadata after trust removal
- issuer mix-up
- resource mix-up
- downgrade to bearer tokens
- metadata field injection
- open dynamic registration abuse

Controls:

- HTTPS required
- issuer identifier exact match
- resource identifier exact match
- explicit enterprise trust policy can override discovery
- cross-check enumerated Provider/Authority relation
- profile negotiation fails closed
- proof requirements cannot silently weaken
- emergency trust revocation bypasses ordinary cache lifetime

## Metadata cache

Clients MAY cache discovery metadata.

Recommended behavior:

- normal TTL from HTTP caching
- cap security metadata cache according to local policy
- immediately invalidate on explicit trust revocation
- retain last-known-good metadata only for low-risk offline operation if policy permits

High-risk actions SHOULD fail closed when required current trust metadata cannot be established.

## No central registry requirement

AgentAuth does not require a global registry mapping every Agent Principal or Provider.

Trust can be established through:

- enterprise configuration
- OAuth metadata
- federation
- Provider-owned Authority
- publisher relationships
- private Trust Domains

Public registries may exist as optional ecosystems, not as protocol roots.

## Version negotiation

Every AgentAuth metadata extension carries its schema version and SHOULD advertise `protocol_versions_supported`.

The selected AgentAuth protocol version is the highest mutually supported version permitted by local minimum-version policy.

A client encountering a newer unknown version:

- MAY continue if all required semantics are explicitly backward compatible
- MUST fail if the Provider marks the extension or capability mandatory and unsupported

Unknown security-critical fields are never ignored when marked required.
