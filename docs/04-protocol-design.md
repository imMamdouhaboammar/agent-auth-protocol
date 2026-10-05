# Protocol Design

## Design rule

AgentAuth profiles established OAuth and OpenID mechanisms and adds a small set of collision-resistant claims and metadata.

It does not create a new bearer-token transport.

## Credential classes

### 1. Agent Instance Credential

Purpose: authenticate a running Agent Instance to AgentAuth.

Properties:

- bound to one Agent Instance
- short-lived
- proof-of-possession
- not sufficient on its own to access user resources

Possible representations:

- private_key_jwt client authentication
- mTLS client certificate
- SPIFFE X.509 or JWT workload identity exchanged for an AgentAuth credential
- platform attestation plus generated proof key during bootstrap

### 2. Delegation Grant

Purpose: durable, revocable authorization state.

It is not directly presented to Resource Servers unless the integration profile explicitly supports structured grant tokens.

### 3. Resource Access Token

Purpose: short-lived access to one audience.

For delegated authority, the token expresses:

- Subject at top level
- Agent Actor using OAuth `act`
- `client_id`
- scopes and/or authorization details
- proof-key confirmation
- AgentAuth extension claims

### 4. Native Browser Bootstrap Code

Purpose: one-time conversion of a verified agent credential into a target browser session.

Properties:

- one-time use
- target origin bound
- Agent Instance bound
- expires within 60 seconds by default
- contains no reusable credential in the URL after redemption

## Delegated token example

```json
{
  "iss": "https://auth.example.com",
  "sub": "urn:subject:user:123",
  "aud": "https://crm.example.com",
  "client_id": "agent-runtime-client",
  "scope": "contacts.read contacts.update",
  "iat": 1791194400,
  "exp": 1791194700,
  "jti": "tok_01...",
  "act": {
    "sub": "urn:agentauth:agent:agent_01..."
  },
  "cnf": {
    "jkt": "base64url-thumbprint"
  },
  "urn:agentauth:claims:v1": {
    "actor_type": "ai_agent",
    "agent_id": "agent_01...",
    "instance_id": "inst_01...",
    "grant_id": "grant_01...",
    "purpose": "crm-follow-up",
    "delegation_depth": 0,
    "trust_tier": "T2"
  }
}
```

The custom claim object is an AgentAuth profile and is not claimed to be an IETF-standard claim.

## Direct agent token example

When an agent acts under its own organizational entitlement:

```json
{
  "iss": "https://auth.example.com",
  "sub": "urn:agentauth:agent:agent_01...",
  "aud": "https://ops.example.com",
  "scope": "jobs.read jobs.run",
  "urn:agentauth:claims:v1": {
    "actor_type": "ai_agent",
    "agent_id": "agent_01...",
    "instance_id": "inst_01...",
    "authority_mode": "direct"
  }
}
```

## Token exchange profile

AgentAuth uses OAuth Token Exchange semantics for delegated authority.

Conceptual request:

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
subject_token=<credential representing subject authority>
subject_token_type=<type>
actor_token=<Agent Instance credential>
actor_token_type=<type>
resource=https://crm.example.com
authorization_details=[...]
```

Authorization server processing:

1. authenticate the Agent Instance
2. validate Subject credential
3. locate active Delegation Grant
4. verify requested audience
5. prove requested authorization is within grant bounds
6. apply policy
7. require step-up if necessary
8. bind token to proof key
9. issue short-lived resource access token
10. emit audit event

## Rich authorization details

For high-risk actions, scopes are often too broad.

AgentAuth defines an `authorization_details` type for proposed interoperability:

```json
{
  "type": "agent_action",
  "actions": ["payment.create"],
  "locations": ["urn:bank:account:123"],
  "constraints": {
    "max_amount": {
      "currency": "USD",
      "value": "500.00"
    },
    "recipient_allowlist": ["urn:payee:vendor-42"]
  },
  "purpose": "approved-invoice-payment"
}
```

This `agent_action` type is an AgentAuth extension profile, not an existing IANA-registered type.

## Sender-constrained tokens

Preferred order:

1. mTLS where enterprise infrastructure already supports certificates
2. DPoP for application-layer proof in browser-adjacent or portable clients
3. bearer access tokens only for integrations that cannot support proof of possession, with shorter lifetimes and additional risk controls

DPoP proof validation includes:

- signature
- public-key thumbprint matching token `cnf`
- method binding
- URI binding
- issued-at freshness
- unique `jti`
- nonce where configured

## Discovery metadata

AgentAuth publishes standard OAuth and OIDC metadata where applicable.

Additionally, an AgentAuth-aware deployment MAY expose:

`/.well-known/agentauth-configuration`

Example:

```json
{
  "issuer": "https://auth.example.com",
  "agent_registration_endpoint": "https://auth.example.com/v1/agents",
  "token_exchange_endpoint": "https://auth.example.com/oauth/token",
  "grant_endpoint": "https://auth.example.com/v1/grants",
  "federation_metadata_endpoint": "https://auth.example.com/v1/federation/metadata",
  "supported_actor_types": ["ai_agent"],
  "supported_proof_methods": ["dpop", "mtls"],
  "supported_integration_profiles": [
    "api",
    "mcp",
    "native_browser",
    "gateway"
  ]
}
```

The AgentAuth well-known document is a product extension and MUST NOT be described as an existing Internet standard.

## Token validation order

Resource Servers should validate in this order:

1. issuer allowed
2. signing algorithm allowed
3. signature valid
4. `exp`, `nbf`, and `iat` sane
5. audience exact match
6. proof-of-possession binding valid
7. Subject type valid
8. `act` chain structurally valid
9. AgentAuth claim version supported
10. grant or revocation freshness requirement satisfied
11. local policy permits resource action
12. obligations enforced

## Multi-agent delegation

A multi-agent chain uses nested actor semantics where interoperable.

A child agent MUST NOT receive a broader grant than the parent.

Example conceptual chain:

```json
{
  "sub": "urn:subject:user:123",
  "act": {
    "sub": "urn:agentauth:agent:worker",
    "act": {
      "sub": "urn:agentauth:agent:orchestrator"
    }
  }
}
```

Authorization uses the current actor and active grant relationship. Historical actors are audit context, not automatically authorization-bearing principals.
