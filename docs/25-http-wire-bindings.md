# AgentAuth v0.2 HTTP Wire Bindings

## 1. Scope

This document defines HTTP-level bindings for AgentAuth protocol interactions.

The existing `api/openapi.yaml` is a management and integration API. It is not the normative AgentAuth authentication wire protocol.

OAuth endpoints remain governed by their underlying specifications. AgentAuth profiles their use and adds versioned metadata and challenge semantics.

## 2. Transport requirements

Conforming public-network endpoints:

- MUST use HTTPS
- MUST follow current TLS best practice
- MUST reject cleartext HTTP except explicit loopback development profiles
- MUST validate authority and resource origins before credential transmission

AgentAuth credentials MUST NOT be placed in query parameters.

## 3. Provider discovery

The Agent Client SHOULD begin with OAuth Protected Resource Metadata.

Conceptual request:

```http
GET /.well-known/oauth-protected-resource HTTP/1.1
Host: crm.example.com
Accept: application/json
```

Conceptual response:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=300

{
  "resource": "https://crm.example.com",
  "authorization_servers": [
    "https://auth.example.com"
  ],
  "urn:agentauth:resource-metadata:v1": {
    "version": "0.2",
    "profiles_supported": [
      "AA-PROVIDER-API-1",
      "AA-DELEGATION-1"
    ],
    "proof_methods_supported": ["dpop"]
  }
}
```

The AgentAuth metadata extension MUST NOT redefine the meaning of standard RFC 9728 fields.

## 4. Authority metadata

The Agent Client retrieves standard OAuth Authorization Server Metadata.

Conceptual request:

```http
GET /.well-known/oauth-authorization-server HTTP/1.1
Host: auth.example.com
Accept: application/json
```

The Authority MAY advertise an AgentAuth extension containing:

- protocol versions
- conformance profiles
- supported proof methods
- Agent Principal enrollment endpoint
- Agent Instance enrollment endpoint
- grant-management endpoint
- federation capabilities

OAuth standard endpoint fields remain authoritative for OAuth operations.

## 5. Resource credential acquisition

### 5.1 Direct authority

A direct-authority resource credential MAY be issued through an OAuth grant appropriate to the deployment.

The resulting token MUST satisfy the AgentAuth token profile.

### 5.2 Delegated authority

When an existing credential is exchanged across trust or audience boundaries, OAuth Token Exchange SHOULD be used.

Conceptual form:

```http
POST /oauth/token HTTP/1.1
Host: auth.example.com
Content-Type: application/x-www-form-urlencoded
DPoP: <proof>

grant_type=urn:ietf:params:oauth:grant-type:token-exchange&
subject_token=<credential>&
subject_token_type=<type>&
actor_token=<agent-instance-credential>&
actor_token_type=<type>&
resource=https%3A%2F%2Fcrm.example.com
```

Token Exchange is not mandatory when the Authority already holds an approved Delegation Grant and can issue a resource token without exposing a reusable Subject credential to the Agent Client.

## 6. DPoP-bound Provider request

A Provider API request using the AA-PROVIDER-API-1 profile:

```http
POST /v1/contacts/123/notes HTTP/1.1
Host: crm.example.com
Authorization: DPoP <access-token>
DPoP: <proof>
Content-Type: application/json
AgentAuth-Version: 0.2
```

The `AgentAuth-Version` header is a protocol hint and MUST NOT replace token claim validation or negotiated metadata.

The Provider MUST validate the DPoP proof according to RFC 9449, including request method and URI binding.

## 7. Provider Agent signup

If Provider metadata advertises `agent_signup_endpoint`, a Provider MAY expose:

```http
POST /agentauth/signup HTTP/1.1
Host: crm.example.com
Authorization: DPoP <signup-scoped-token>
DPoP: <proof>
Content-Type: application/json
Idempotency-Key: <opaque-value>
AgentAuth-Version: 0.2
```

Example body:

```json
{
  "requested_profile": "standard-agent",
  "agent_metadata_uri": "https://publisher.example/agents/researcher.json"
}
```

Identity comes from the verified credential, not the request body.

The endpoint MUST ignore or reject any body field that attempts to override authenticated Agent Principal identity.

A successful retry with the same idempotency key and equivalent request MUST NOT create a second Provider Agent Account.

## 8. Native Agent Session bootstrap

If Provider metadata advertises `agent_session_endpoint`:

```http
POST /agentauth/session HTTP/1.1
Host: crm.example.com
Authorization: DPoP <access-token>
DPoP: <proof>
Content-Type: application/json
Idempotency-Key: <opaque-value>
AgentAuth-Version: 0.2
```

Example request:

```json
{
  "return_path": "/inbox"
}
```

Example response:

```http
HTTP/1.1 201 Created
Content-Type: application/json
Cache-Control: no-store

{
  "bootstrap_uri": "https://crm.example.com/agentauth/bootstrap/bst_123",
  "expires_in": 60
}
```

The bootstrap value MUST be:

- single-use
- origin-bound
- short-lived
- non-loggable where practical
- invalid after successful redemption

A replay MUST fail.

## 9. Structured AgentAuth challenge

A Provider that cannot authorize the current request MAY return:

```http
HTTP/1.1 403 Forbidden
Content-Type: application/agentauth+json
Cache-Control: no-store
```

Example:

```json
{
  "protocol_version": "0.2",
  "error": "agentauth_step_up_required",
  "recoverable": true,
  "interaction_required": true,
  "agentauth": {
    "required_profile": "AA-DELEGATION-1",
    "required_action": "human_approval"
  }
}
```

The error registry in `docs/29-error-registry.md` defines HTTP and retry semantics.

## 10. Authentication challenge header

A Provider MAY include a `WWW-Authenticate` challenge in addition to the structured response body.

Example:

```http
WWW-Authenticate: DPoP realm="agentauth", error="insufficient_scope"
```

Standard OAuth errors retain their standard meaning.

AgentAuth-specific errors MUST NOT override incompatible standard OAuth semantics.

## 11. Idempotency

The following operations SHOULD accept an `Idempotency-Key`:

- Provider Agent signup
- Delegation Grant creation
- Native Agent Session bootstrap creation
- transaction-bound Step-up initiation

The server MUST scope an idempotency key to the authenticated actor, endpoint, and tenant or Provider account context.

Reusing a key with a materially different request MUST fail.

## 12. Correlation

Requests SHOULD carry a trace identifier using deployment-standard tracing.

AgentAuth does not define a security identity from tracing headers.

Untrusted inbound trace headers MUST NOT become authorization claims.

## 13. Cache rules

Discovery metadata MAY use normal HTTP caching.

The following responses MUST use `Cache-Control: no-store`:

- one-time browser bootstrap responses
- step-up approval secrets
- token-bearing management responses
- any response containing a credential or redemption code

Emergency issuer-trust removal MUST override cached trust metadata.

## 14. Management API separation

Management operations such as:

- register Agent Principal
- revoke Agent Instance
- administer grants
- inspect audit events
- publish policy

are control-plane APIs.

They are not required for every AgentAuth protocol implementation and MUST NOT be confused with the portable wire protocol between independent Agent Client and Provider implementations.
