# AgentAuth v0.2 Identifiers and Namespaces

## 1. Goal

AgentAuth must support independent issuers without a mandatory global registry.

Therefore local identifiers are opaque and global identity is issuer-qualified.

## 2. Canonical identity tuples

### Agent Principal

```text
AgentPrincipalKey = (agent_issuer, agent_id)
```

### Agent Instance

```text
AgentInstanceKey = (agent_issuer, instance_id)
```

### OAuth client

```text
OAuthClientKey = (authorization_server, client_id)
```

These are separate identities.

Implementations MUST NOT assume:

```text
client_id == agent_id
instance_id == agent_id
JWT sub == agent_id
```

## 3. Issuer identifiers

An `agent_issuer` MUST be an absolute HTTPS URI for public-network profiles.

Private deployments MAY use profile-defined URI schemes only where every federation peer explicitly supports them.

Issuer comparison MUST follow the exact identifier comparison rules of the applicable OAuth/OIDC metadata specification.

Implementations MUST NOT normalize issuer identifiers in a way that changes identity.

## 4. Local IDs

`agent_id`, `instance_id`, and `grant_id` are opaque strings.

Consumers:

- MUST treat them as case sensitive unless issuer documentation states otherwise
- MUST NOT parse authorization semantics from their textual format
- MUST NOT assume a UUID, ULID, URN, or database key format
- MUST enforce reasonable length limits

A deployment MAY choose human-readable prefixes such as `agent_`, `inst_`, or `grant_`, but such prefixes are not protocol semantics.

## 5. Display names

Display names are descriptive metadata.

They MUST NOT establish identity or authorization.

The following are non-authoritative:

- agent display name
- model name
- publisher brand name
- email-shaped label
- browser User-Agent
- self-declared capability list

## 6. Provider-local mapping

A Provider MAY create a local Agent Account.

The Provider SHOULD map the local account to:

```text
(agent_issuer, agent_id)
```

and MAY additionally bind accepted publisher or tenant metadata.

A Provider MUST NOT key the security relationship only by display name.

## 7. Instance mapping

An Agent Principal may have multiple active Agent Instances.

The Provider MAY:

- authorize all active Instances of a Principal
- restrict selected Instances
- require higher assurance for selected operations
- revoke a Provider-local session for one Instance without disabling the Agent Principal

Instance identity is never a substitute for Principal identity.

## 8. Grant identifiers

A `grant_id` is meaningful in the Authority namespace that issued or mapped the grant.

If a Provider Authority translates a foreign grant, it MAY issue a local grant reference.

Audit records SHOULD retain provenance sufficient to correlate the local grant with its upstream authorization without exposing upstream credentials.

## 9. Subject identifiers

A Subject identifier is interpreted under the issuer or identity domain that asserts it.

AgentAuth MUST NOT create a universal human identifier namespace.

Federation maps Subject identity explicitly.

## 10. URNs

AgentAuth examples may use URNs for readability.

URN use is not required by v0.2.

A future registered AgentAuth URN namespace would require separate standardization and MUST NOT be assumed by implementations today.

## 11. Equality

Two Agent Principals are equal only when both values match:

```text
agent_issuer A == agent_issuer B
AND
agent_id A == agent_id B
```

Matching `agent_id` values from different issuers identify different principals unless an explicit federation mapping says otherwise.

## 12. Reassignment

An issuer MUST NOT reassign an `agent_id` to an unrelated Agent Principal after revocation or deletion within the lifetime of audit or federation records.

The same rule applies to `instance_id` within its issuer namespace.
