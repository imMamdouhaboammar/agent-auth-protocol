# Agent-Side SDK Contract

## Purpose

The Agent SDK is the protocol client used by agent runtimes.

It SHOULD hide OAuth ceremony mechanics from the model while keeping authorization decisions explicit to the runtime.

The SDK is not the agent identity itself. It is a client for using an Agent Principal and Agent Instance safely.

## Security boundary

The SDK MUST separate model-visible data from secret-bearing state.

Model-visible:

- Provider capabilities
- requested Action Intent
- authorization result
- human-readable step-up instructions
- sanitized error details

Model-invisible:

- private keys
- refresh tokens
- client secrets
- browser cookies
- raw vault credentials
- one-time bootstrap secrets before use

## Local state model

```text
UNINITIALIZED
  -> INSTANCE_READY
  -> PROVIDER_DISCOVERED
  -> AUTHORITY_SELECTED
  -> AUTHENTICATED
  -> AUTHORIZED
  -> SESSION_ACTIVE
```

Failures may return the SDK to a narrower state without destroying the Agent Principal.

## Language-neutral interface

An SDK SHOULD expose an interface conceptually similar to:

```text
initialize(runtime_evidence?) -> AgentInstanceContext

discover(target_uri) -> ProviderCapabilities

authenticate(
  target,
  authority?,
  requested_profile?,
  proof_method?
) -> AgentAuthentication

request_grant(
  subject,
  target,
  authorization_details,
  purpose?,
  constraints?
) -> GrantRequestResult

authorize(
  target,
  action_intent,
  grant?,
  resource?
) -> AccessContext

signup(
  target,
  requested_account_profile?
) -> ProviderAccountResult

login(
  target,
  mode = "auto"
) -> LoginResult

fetch(
  request,
  access_context
) -> ResourceResponse

handle_step_up(challenge) -> StepUpResult

logout(session) -> LogoutResult
```

Exact language APIs may differ. The behavioral contract is normative.

## Instance initialization

On first use, the SDK creates or retrieves an Agent Instance key.

The key MUST be:

- non-exportable where platform support permits
- isolated from model context
- independently rotatable
- independently revocable
- bound to one Agent Instance identifier

The SDK MAY derive the Agent Instance from a trusted workload identity rather than creating a new local root credential.

## Provider discovery algorithm

Given a target URL, the SDK:

1. normalizes the target origin
2. retrieves standards-based Protected Resource Metadata where available
3. reads AgentAuth extension metadata if advertised
4. identifies accepted Authorization Servers or Trust Domains
5. cross-checks Authority metadata and resource identifiers
6. chooses a compatible AgentAuth profile
7. chooses a proof method
8. refuses unsupported or contradictory metadata

The SDK MUST NOT infer native AgentAuth support from HTML branding or a login button alone.

## Authority selection

Order of preference:

1. enterprise or owner policy
2. Provider-declared accepted Authority
3. existing federated Agent Principal issuer
4. user-approved Authority choice

The SDK MUST NOT silently send identity material to an untrusted Authority discovered through unvalidated content.

## Authentication

Authentication proves control of the Agent Instance.

A successful result contains at minimum:

```json
{
  "agent_id": "urn:agentauth:agent:123",
  "instance_id": "inst_456",
  "issuer": "https://authority.example",
  "proof_method": "dpop",
  "authenticated_at": "2026-10-05T12:00:00Z"
}
```

Authentication alone grants no Provider resource access.

## Direct authorization

When the agent has direct Provider entitlement:

```text
Agent SDK -> Authority: request audience-bound access
Authority -> Agent SDK: sender-constrained access token
Agent SDK -> Provider: token + proof
Provider -> Agent SDK: resource response
```

The SDK MUST expose that the authority mode is direct.

## Delegated authorization

When acting for a Subject:

1. construct structured requested authorization
2. locate an existing active Delegation Grant or request one
3. complete Subject or administrator approval when required
4. exchange Subject and Actor authority according to the selected profile
5. obtain an audience-bound sender-constrained access credential
6. return an Access Context containing Subject, Actor, Instance, Grant, audience, and expiry

The SDK MUST NOT represent a delegated token as if it were direct agent authority.

## Provider signup

`signup(target)` means:

- authenticate the agent to a Provider that supports agent accounts
- provide the Agent Principal identity and allowed metadata
- accept Provider terms or route them to an authorized human/organization where required
- receive a Provider-local account identifier

It does not mean generating a fake human identity.

Provider signup MAY be disabled by policy.

## Login as Agent

`login(target)` negotiates the strongest supported mode:

1. native agent API/session
2. gateway-aware agent session
3. standards-based API authorization
4. explicit legacy browser mode only if caller policy allows it

The SDK MUST NOT downgrade from an agent-aware mode to legacy credential impersonation without an explicit policy decision.

## Native browser login

For a Provider supporting AA-PROVIDER-WEB-1:

1. authorize for the Provider audience
2. call the Provider's agent session endpoint
3. present DPoP or negotiated proof
4. receive a short-lived one-time bootstrap
5. open the bootstrap in the managed browser
6. confirm the resulting server session is marked as agent-operated where confirmation is exposed
7. destroy bootstrap material

A returned browser cookie is application session state, not the Agent Identity credential.

## Action authorization

The model SHOULD submit a normalized Action Intent to the SDK before high-risk execution.

Example:

```json
{
  "action": "payment.create",
  "resource": "urn:bank:account:123",
  "parameters": {
    "currency": "USD",
    "amount": "250.00",
    "recipient": "urn:payee:42"
  }
}
```

The SDK can then request policy evaluation or step-up tied to an Action Digest.

## Step-up

A Provider or Authority may return structured step-up requirements.

The SDK MUST:

- pause the protected action
- preserve the exact action parameters
- route approval to an authorized approver
- bind approval to the Action Digest where required
- retry only after fresh authorization evidence exists

The model cannot self-approve a human-required step-up.

## Structured errors

SDK errors SHOULD include:

```json
{
  "code": "agentauth_grant_required",
  "recoverable": true,
  "interaction_required": true,
  "authority": "https://authority.example",
  "details": {}
}
```

Core error classes:

- `agentauth_not_supported`
- `authority_not_trusted`
- `agent_identity_invalid`
- `instance_proof_failed`
- `grant_required`
- `grant_denied`
- `insufficient_authority`
- `step_up_required`
- `proof_replay_detected`
- `provider_policy_denied`
- `session_bootstrap_failed`
- `legacy_mode_forbidden`

Errors MUST NOT include secrets.

## Caching

The SDK MAY cache:

- Provider metadata
- Authority metadata
- public keys
- low-risk authorization state

It MUST honor cache lifetimes and emergency revocation requirements.

It MUST NOT treat cached grant state as authoritative beyond the profile's revocation freshness guarantee.

## Conformance

AA-CLIENT-1 requires tests proving:

- Provider metadata discovery
- issuer cross-checking
- proof-of-possession
- no model exposure of private key
- direct vs delegated distinction
- no silent downgrade
- step-up pause behavior
- replay rejection
- target audience narrowing
- safe metadata cache invalidation
