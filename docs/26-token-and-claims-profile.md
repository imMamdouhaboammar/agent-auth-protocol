# AgentAuth v0.2 Token and Claims Profile

## 1. Purpose

This document defines the minimum claims semantics for JWT access tokens used by AgentAuth v0.2.

Where JWT access tokens are used, implementations SHOULD follow RFC 9068 and current OAuth security best practice.

## 2. Identity rule

Agent identity is issuer-qualified.

The durable external Agent Principal identity is:

```text
(agent_issuer, agent_id)
```

The Agent Instance identity is:

```text
(agent_issuer, instance_id)
```

The access-token `iss` claim identifies the issuer of the current access token. It does not necessarily identify the Home Authority of the agent.

Therefore AgentAuth extension claims carry `agent_issuer`.

## 3. Required JWT claims

An AgentAuth JWT Resource Access Token MUST contain:

| Claim | Requirement | Meaning |
|---|---|---|
| `iss` | MUST | issuer of current access token |
| `sub` | MUST | subject under current issuer semantics |
| `aud` | MUST | intended Provider resource |
| `exp` | MUST | expiration |
| `iat` | MUST | issuance time |
| `jti` | MUST | token identifier |
| `cnf` | MUST for DPoP/mTLS profile | proof-key confirmation |
| `act` | MUST for delegated mode | current actor representation |
| `urn:agentauth:claims:v1` | MUST | AgentAuth extension object |

A Provider MUST reject an AgentAuth JWT missing a claim required by the selected conformance profile.

## 4. AgentAuth extension object

Minimum fields:

```json
{
  "protocol_version": "0.2",
  "actor_type": "ai_agent",
  "agent_issuer": "https://agents.example.com",
  "agent_id": "agent_123",
  "instance_id": "inst_456",
  "authority_mode": "delegated",
  "grant_id": "grant_789"
}
```

Semantics:

- `protocol_version`: AgentAuth protocol version
- `actor_type`: always `ai_agent` in v0.2
- `agent_issuer`: Home Authority or canonical identity issuer for Agent Principal
- `agent_id`: identifier scoped to `agent_issuer`
- `instance_id`: Agent Instance identifier scoped to `agent_issuer`
- `authority_mode`: `direct` or `delegated`
- `grant_id`: required in delegated mode
- `purpose`: optional human-readable or policy-relevant purpose
- `delegation_depth`: optional remaining or current delegation depth according to the grant profile
- `trust_tier`: optional local assurance label and not globally comparable unless federation policy defines a mapping

## 5. Direct token

Example:

```json
{
  "iss": "https://auth.provider.example",
  "sub": "agent-local-17",
  "aud": "https://api.provider.example",
  "iat": 1791194400,
  "exp": 1791194700,
  "jti": "tok_direct_01",
  "cnf": {
    "jkt": "base64url-thumbprint"
  },
  "urn:agentauth:claims:v1": {
    "protocol_version": "0.2",
    "actor_type": "ai_agent",
    "agent_issuer": "https://agents.example.com",
    "agent_id": "agent_123",
    "instance_id": "inst_456",
    "authority_mode": "direct"
  }
}
```

For direct mode:

- `grant_id` MUST be absent or null
- `act` SHOULD be absent unless another standards profile requires actor-chain context
- Provider-local `sub` MAY differ from the Home Authority's local `agent_id`

## 6. Delegated token

Example:

```json
{
  "iss": "https://auth.provider.example",
  "sub": "user_789",
  "aud": "https://api.provider.example",
  "iat": 1791194400,
  "exp": 1791194700,
  "jti": "tok_delegated_01",
  "act": {
    "sub": "agent-local-17"
  },
  "cnf": {
    "jkt": "base64url-thumbprint"
  },
  "urn:agentauth:claims:v1": {
    "protocol_version": "0.2",
    "actor_type": "ai_agent",
    "agent_issuer": "https://agents.example.com",
    "agent_id": "agent_123",
    "instance_id": "inst_456",
    "authority_mode": "delegated",
    "grant_id": "grant_789"
  }
}
```

For delegated mode:

- `act` MUST be present
- `grant_id` MUST be present and non-empty
- Provider authorization MUST preserve both represented Subject and Agent Actor
- failure to validate delegated semantics MUST NOT fall back to direct mode

## 7. Brokered token exchange

In a brokered topology, the input token issuer may be the Home Authority while the output token issuer is the Provider Authority.

The output token:

- MUST use the Provider Authority as `iss`
- MUST keep canonical agent provenance in `agent_issuer` and `agent_id`
- MUST keep the current Agent Instance identity
- MUST preserve delegated Subject/Actor distinction
- MUST narrow or preserve authority
- MUST NOT silently increase trust tier
- SHOULD retain auditable provenance linking the exchange to its input credential without embedding the input token

## 8. Proof confirmation

For DPoP, `cnf.jkt` identifies the public key thumbprint to which the access token is bound.

A Provider MUST reject a request if:

- the DPoP public key does not match `cnf.jkt`
- method or URI binding fails
- proof freshness fails
- the proof `jti` is replayed inside the replay-detection window
- a required nonce is missing or invalid

## 9. Lifetime

Privileged AgentAuth access tokens SHOULD be short lived.

The default design target is five minutes or less for high-risk delegated access unless the deployment's risk model justifies another limit.

Long-lived bearer access tokens are not conforming to AA-PROVIDER-API-1.

## 10. Claim collision

AgentAuth-specific claims MUST remain within a collision-resistant namespace until standardized equivalents exist.

Implementations MUST NOT reuse an unrelated standardized claim with incompatible AgentAuth semantics.

## 11. Unknown claim versions

The Provider MAY ignore unknown optional extension members.

The Provider MUST reject:

- unknown required extension versions
- malformed authority-mode semantics
- missing required identity provenance
- conflicting claims that cause ambiguity about Actor or Subject

## 12. Subject semantics

The JWT `sub` claim is interpreted under the current token issuer.

AgentAuth does not assume `sub` alone is a globally unique human or agent identifier.

Cross-domain identity uses issuer-qualified identifiers and explicit federation mapping.
