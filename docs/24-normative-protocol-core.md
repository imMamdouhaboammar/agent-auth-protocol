# AgentAuth v0.2 Normative Protocol Core

## Status

Protocol design draft for AgentAuth v0.2.

This document defines normative behavior for interoperable implementations. The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, NOT RECOMMENDED, MAY, and OPTIONAL are to be interpreted as described by BCP 14 when, and only when, they appear in all capitals.

AgentAuth is a profile over existing OAuth, JOSE, HTTP, and workload-identity mechanisms. It does not define a new cryptographic primitive.

## 1. Protocol roles

A conforming deployment contains one or more of these roles:

- **Agent Client**: protocol client operating for an Agent Instance
- **Home Authority**: issuer that establishes the Agent Principal or Agent Instance identity in its native Trust Domain
- **Provider Authority**: authorization server trusted by the Provider and optionally used to broker external agent identity
- **Provider**: protected resource, SaaS application, API, MCP server, gateway, or web application accepting agent-aware access
- **Subject**: principal whose resources or authority are being exercised
- **Approver**: principal authorized to approve a Delegation Grant or Step-up Approval

One deployment MAY combine Home Authority and Provider Authority.

## 2. Protocol invariants

Every conforming implementation MUST preserve these invariants:

1. An AI Agent Actor is distinguishable from a human session.
2. Agent Principal and Agent Instance are distinct security identities.
3. Agent identity is issuer-qualified.
4. Delegated requests preserve Subject and Actor separately.
5. Provider policy can narrow, but never expand, authority asserted by an upstream Authority.
6. Access credentials are audience restricted.
7. Sender-constrained credentials are REQUIRED for AA-CLIENT-1, AA-AUTHORITY-1, and AA-PROVIDER-API-1 unless a future profile explicitly defines a weaker compatibility mode.
8. A child delegation MUST NOT expand its parent.
9. Human credentials MUST NOT be exposed to model context to satisfy AgentAuth.
10. Native browser sessions MUST remain server-side distinguishable from human sessions.
11. Unknown mandatory security semantics MUST fail closed.
12. No implementation requires a universal AgentAuth root of trust.

## 3. Protocol lifecycle

A complete interaction proceeds through these logical phases:

```text
Discovery
  -> Trust Resolution
  -> Agent Instance Authentication
  -> Authority Resolution
  -> Grant Resolution
  -> Resource Credential Issuance
  -> Provider Authentication
  -> Provider Authorization
  -> Resource Access or Native Agent Session
  -> Optional Step-up
  -> Renewal
  -> Logout or Revocation
```

Not every request repeats every phase. Cached metadata, active grants, and locally valid short-lived tokens MAY skip network interactions subject to freshness policy.

## 4. Discovery

An Agent Client beginning from a Provider resource URI:

1. MUST normalize the resource identifier.
2. SHOULD retrieve OAuth Protected Resource Metadata as defined by RFC 9728.
3. MUST identify the Provider's accepted Authorization Server identifiers.
4. MUST parse the AgentAuth metadata extension only if present.
5. MUST validate selected Authorization Server metadata.
6. MUST apply local trust policy before sending identity evidence.
7. MUST negotiate one mutually supported AgentAuth profile and proof method.
8. MUST fail if required metadata is contradictory.

The Agent Client MUST NOT infer AgentAuth support from HTML content, logos, a login button, a User-Agent response, or JavaScript heuristics.

## 5. Trust resolution

The Agent Client computes an acceptable trust path from:

- Provider-advertised authorities
- Agent-owner or enterprise trust policy
- Home Authority federation capabilities
- Provider Authority federation capabilities

Two topologies are conforming:

### 5.1 Direct issuer trust

The Provider directly validates a credential from the Home Authority.

### 5.2 Brokered Provider trust

The Provider trusts a Provider Authority which validates or exchanges external Agent identity and issues a Provider-local credential.

In brokered trust, the Provider Authority MUST preserve agent identity provenance.

## 6. Agent Instance authentication

The Agent Instance MUST demonstrate possession of a key or workload credential associated with the instance.

A conforming proof method MUST:

- bind proof to the current request or exchange
- prevent use of the credential by a party lacking the proof key
- support independent Agent Instance revocation
- avoid returning the private key through the Agent SDK public interface

AA-CLIENT-1 and AA-PROVIDER-API-1 MUST support DPoP. Implementations MAY also support mTLS.

## 7. Authority modes

AgentAuth defines exactly two authority modes in v0.2.

### 7.1 Direct

The Agent Principal acts under authority assigned directly to the Agent Principal.

```text
Subject = Agent Principal
Actor   = Agent Principal
Mode    = direct
```

### 7.2 Delegated

The Agent Principal acts for another Subject.

```text
Subject = represented principal
Actor   = Agent Principal
Mode    = delegated
```

A delegated credential MUST identify an active grant or another profile-defined authorization reference sufficient to reconstruct the delegated authority.

An implementation MUST NOT reinterpret an invalid delegated credential as direct authority.

## 8. Credential issuance

A Resource Access Token issued under AgentAuth:

- MUST have a single intended Provider resource or equivalent audience restriction
- MUST have bounded lifetime
- MUST be sender constrained
- MUST identify the issuing Authorization Server
- MUST carry the AgentAuth extension claims required by the selected profile
- MUST permit the Provider to distinguish direct from delegated authority
- MUST support correlation without exposing private credentials

For JWT access tokens, the profile in `docs/26-token-and-claims-profile.md` applies.

## 9. Provider authentication

The Provider MUST perform validation in this order or an equivalent fail-closed order:

1. establish trusted issuer
2. validate permitted JOSE algorithm
3. validate signature or introspection result
4. validate token temporal claims
5. validate exact audience/resource binding
6. validate proof-of-possession binding
7. validate AgentAuth protocol version
8. validate authority mode
9. validate Agent Actor identity
10. validate Agent Instance identity
11. validate delegated Subject and grant semantics when applicable
12. apply revocation freshness policy
13. create immutable AgentAuth Context
14. apply local Provider authorization

The Provider MUST NOT grant access merely because an Agent Manifest declares a capability.

## 10. Provider authorization

Authentication answers who is acting.

Authorization answers whether the specific operation is allowed now.

Provider authorization MUST consider, at minimum:

- Agent Principal
- Agent Instance
- Subject
- authority mode
- resource
- action
- upstream grant or direct entitlement
- local Provider policy

The Provider MAY apply stricter constraints than the Authority.

## 11. Step-up

A Provider MAY return a structured AgentAuth challenge requiring:

- human approval
- stronger instance proof
- reauthentication
- a narrower or new grant
- Provider Agent Account registration

A Step-up Approval for a concrete sensitive operation SHOULD bind to an Action Digest.

Changing a security-relevant action parameter MUST invalidate an approval bound to the previous digest.

## 12. Native Login as Agent

A native Agent Session is created only after Provider authentication and authorization.

A Provider implementing AA-PROVIDER-WEB-1:

- MUST use a one-time bootstrap or equivalent one-time transition
- MUST bind the transition to the target Provider origin
- MUST expire the transition rapidly
- MUST mark the server-side session as agent-operated
- MUST preserve Agent Principal, Agent Instance, Subject, and authority mode
- MUST NOT convert the bootstrap into a human-authenticated session
- MUST support session invalidation

Browser cookies are Provider session state, not Agent identity credentials.

## 13. Revocation

The following revocation scopes are distinct:

- Agent Principal
- Agent Instance
- Delegation Grant
- Provider Agent Account
- Provider Agent Session
- issuer or federation trust

A Provider-local denial MUST take precedence over upstream validity.

High-risk profiles MUST define a maximum revocation freshness interval.

## 14. Downgrade protection

If a Provider advertises AgentAuth support and the selected native profile fails, the Agent Client MUST NOT silently switch to human credential automation.

A compatibility fallback is allowed only when:

- explicit local policy permits it
- the resulting access is labeled as legacy mode
- the target is not represented as AgentAuth-aware

## 15. Privacy boundary

Raw natural-language prompts are not required protocol inputs.

The protocol SHOULD operate on:

- structured Action Intent
- capability or authorization details
- Delegation Grant
- Action Digest
- Provider policy context

Secrets, refresh tokens, private keys, raw browser cookies, and credential-vault contents MUST NOT appear in model-visible AgentAuth Context objects.

## 16. Extensibility

AgentAuth extensions MUST be versioned.

An extension that changes authorization semantics MUST define whether it is:

- optional and safely ignorable
- required for the selected profile

Unknown required extensions MUST cause the affected operation to fail closed.

## 17. Conformance boundary

The normative wire protocol ends at stable interfaces between:

- Agent Client and Authority
- Agent Client and Provider
- Provider and Provider Authority
- Provider application and immutable AgentAuth Context

Internal database schemas, service topology, programming language, framework, and deployment model are outside the wire protocol.
