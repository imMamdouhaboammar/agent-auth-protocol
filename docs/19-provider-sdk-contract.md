# Provider-Side SDK Contract

## Purpose

The Provider SDK makes an application AgentAuth-aware without forcing the application to implement OAuth token parsing, actor semantics, session labeling, and revocation logic independently.

The Provider SDK is a protocol adapter. The Provider remains responsible for local business authorization.

## Integration surfaces

A Provider implementation MAY expose the SDK as:

- application middleware
- framework package
- API gateway plugin
- reverse-proxy module
- MCP server middleware
- sidecar

The highest-assurance profile keeps authenticated actor context on a protected server-side channel.

## Minimum Provider contract

A Provider claiming AgentAuth support MUST:

1. publish machine-readable AgentAuth capability metadata
2. list accepted Authorities or federation rules
3. validate access credential and proof
4. preserve Subject and Agent Actor separately
5. preserve Agent Instance identity
6. apply local policy
7. emit audit evidence
8. keep agent-operated sessions distinguishable from human sessions

## Language-neutral middleware interface

Conceptually:

```text
configure(trust, profiles, policy_hooks) -> ProviderAgentAuth

authenticate(request) -> AgentAuthContext

authorize(
  context,
  resource,
  action_intent
) -> ProviderDecision

signup(context, requested_profile?) -> AgentAccount

create_browser_session(context, options) -> OneTimeBootstrap

revoke_agent_sessions(selector) -> RevocationResult

logout(session_id) -> LogoutResult
```

## AgentAuth Context

A successful authentication creates immutable request context similar to:

```json
{
  "protocol_version": "0.2",
  "actor": {
    "type": "ai_agent",
    "issuer": "https://agents.example.com",
    "id": "agent_123"
  },
  "instance": {
    "issuer": "https://agents.example.com",
    "id": "inst_456"
  },
  "subject": {
    "type": "human",
    "issuer": "https://authority.example",
    "id": "user_789"
  },
  "authority": {
    "mode": "delegated",
    "grant_id": "grant_abc"
  },
  "token": {
    "issuer": "https://authority.example",
    "audience": "https://provider.example",
    "expires_at": "2026-10-05T12:05:00Z"
  },
  "proof": {
    "method": "dpop",
    "key_thumbprint": "..."
  }
}
```

Application code SHOULD consume this context rather than re-parsing raw token claims.

The normative shape is `schemas/agentauth-context.schema.json`.

## Provider metadata

The SDK SHOULD generate or validate a resource metadata document that declares:

- canonical resource identifier
- accepted Authorization Servers
- AgentAuth support flag
- conformance profiles
- proof methods
- agent signup availability
- native browser session availability
- supported actor types
- supported authorization details types
- policy interaction endpoints when externally exposed

Detailed metadata is defined in `docs/21-discovery-and-metadata.md`.

## Trust configuration

A Provider MUST explicitly configure issuer trust.

Allowed models:

- static issuer allowlist
- organization-managed Trust Domain policy
- federation metadata with constraints
- dedicated tenant issuer
- Provider-owned Authority

The SDK MUST NOT accept any syntactically valid AgentAuth token from an arbitrary issuer.

## Token validation

Minimum validation:

1. HTTPS trust and metadata origin rules
2. issuer is trusted
3. allowed signing algorithm
4. signature
5. token time bounds
6. exact Provider audience/resource
7. DPoP or mTLS binding where required
8. actor claim structure
9. AgentAuth claim version
10. Agent Instance status according to freshness policy
11. grant status according to freshness policy
12. local Provider policy

Unknown mandatory extension versions fail closed.

## Agent signup

A Provider MAY allow an Agent Principal to create a Provider-local Agent Account.

The account SHOULD contain:

- Provider account id
- Agent Principal issuer
- Agent Principal id
- owner or publisher references where policy permits
- local role assignments
- status
- created timestamp
- local terms acceptance evidence
- local risk classification

The account MUST NOT be keyed only by display name, model vendor, email address, or user-agent string.

### Signup policy examples

A Provider may require:

- verified publisher
- enterprise administrator approval
- specific issuer
- minimum runtime trust tier
- paid tenant ownership
- manual review

Open signup is optional.

## Login

A Provider MAY support agent login with or without a persistent Provider-local Agent Account.

Two forms:

### Account login

Authenticate Agent Principal and map it to an existing Agent Account.

### Delegated subject login

Authenticate Agent Principal plus Delegation Grant for a human or organization Subject.

The resulting Provider session MUST retain both identities.

## Permission model

The Provider maps AgentAuth capabilities into local permissions.

Example:

```text
AgentAuth capability          Provider permission
crm.contact.read       ->     contacts:read
crm.contact.update     ->     contacts:update
payment.create         ->     payments:create
```

Mapping can only preserve or narrow authority.

A Provider MUST NOT expand permission merely because the agent declares a capability in its manifest.

## Native Agent Session

The Provider SDK may expose:

```http
POST /agentauth/session
Authorization: DPoP <access-token>
DPoP: <proof>
Content-Type: application/json
```

The response returns a one-time bootstrap, never a reusable bearer credential embedded in a long-lived URL.

The redeemed server-side session contains `actor_type=ai_agent`.

## Human and agent sessions

A Provider SHOULD use the same business authorization engine where practical, but distinct actor context.

```text
Human session:
  subject = user
  actor_type = human

Agent delegated session:
  subject = user
  actor = agent
  actor_type = ai_agent
  instance = instance
  grant = grant
```

An agent session MUST NOT be upgraded into a human session by changing a cookie flag.

## Step-up and obligations

The SDK should provide hooks for:

- human approval
- stronger Instance attestation
- re-authentication
- transaction-bound consent
- additional Provider workflow state

Provider code receives a structured decision:

```json
{
  "decision": "step_up",
  "reason_codes": ["HUMAN_APPROVAL_REQUIRED"],
  "obligations": [
    {
      "type": "human_approval",
      "bind_to_action_digest": true
    }
  ]
}
```

## Revocation

The Provider SDK MUST support at least one timely revocation strategy appropriate to risk:

- short token lifetime
- token introspection
- revocation event feed
- grant status endpoint
- session termination API

For native browser sessions, the Provider owns final session invalidation.

## Audit

Provider-side audit SHOULD capture:

- local account id
- Subject
- Agent Principal
- Agent Instance
- grant
- issuer
- action
- resource
- Provider decision
- policy version
- trace id
- outcome

Raw credentials MUST NOT be logged.

## Failure behavior

Security-sensitive failures default to deny.

The SDK MUST NOT:

- fall back to anonymous access for a protected route
- accept expired proof because the Authority is unavailable
- convert a malformed delegated token into direct authority
- hide agent identity from application authorization code
- trust agent self-declared capabilities as permissions

## Conformance

AA-PROVIDER-API-1 requires:

- resource and issuer discovery
- strict audience validation
- Subject/Actor preservation
- proof validation
- replay defense
- local policy narrowing
- structured denial

AA-PROVIDER-WEB-1 additionally requires:

- one-time browser bootstrap
- server-side agent session marker
- agent session revocation
- no human-session identity collapse
