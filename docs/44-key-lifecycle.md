# AgentAuth v0.2 Key Lifecycle

## 1. Goal

AgentAuth uses several distinct key classes. They MUST NOT be conflated.

## 2. Key classes

### Instance Proof Key

Controlled by one Agent Instance.

Purpose:

- prove possession
- bind access credentials
- authenticate the running Instance

### Authority Signing Key

Controlled by an Authority.

Purpose:

- sign access credentials
- sign assertions
- sign metadata where required

### Federation Key or Bundle

Used to establish trust across Trust Domains.

Purpose:

- validate federation metadata or foreign identity material
- anchor peer trust

### Attestation Key

Controlled by an attestation mechanism or platform.

Purpose:

- protect Attestation Evidence

One physical key MUST NOT be assumed to serve all purposes.

## 3. Independence invariant

Compromise of an Authority Signing Key must not automatically reveal an Instance Proof Key.

Compromise of one Instance Proof Key must not automatically compromise Authority Signing Keys.

This separation reduces blast radius.

## 4. Key epochs

Every rotating security key SHOULD have a Key Epoch.

A Key Epoch records:

- key identifier
- purpose
- activation time
- retirement time
- revocation status
- predecessor/successor relationship where relevant

The durable Agent Principal identity does not change merely because a key epoch changes.

## 5. Planned rotation

Planned rotation SHOULD use bounded overlap:

```text
K1 active
K2 published
K1 + K2 accepted
K2 active
K1 retired
```

The overlap exists to prevent availability failures during propagation.

Overlap MUST NOT be indefinite.

## 6. Emergency revocation

Emergency key disable may skip normal overlap.

A compromised key MUST be removed from active validation according to risk policy.

Systems must define how emergency revocation propagates to:

- JWKS caches
- federation bundles
- active sessions
- token validation
- attestation validation
- Provider Authorities

## 7. `kid` handling

A key identifier is a lookup hint within an issuer or bundle namespace.

It is not globally unique.

Validation MUST include issuer or trust-bundle context.

A verifier MUST NOT choose a key from another issuer merely because `kid` matches.

## 8. JWKS refresh

For Authority Signing Keys:

- verifiers cache JWKS within bounded policy
- unknown `kid` MAY trigger an immediate refresh
- refresh failure MUST NOT cause arbitrary-key acceptance
- removed keys MUST stop validating new credentials after configured propagation bounds
- stale keys beyond accepted freshness fail closed for high-risk flows

## 9. Instance Proof Key rotation

Instance key rotation requires proof that the new key belongs to an authorized continuation or replacement of the current Instance.

Normal rotation SHOULD bind:

- current Instance identity
- old key possession
- new key possession
- rotation challenge
- new key epoch

If the old key is unavailable or compromised, recovery requires another trusted enrollment authority.

## 10. Authority Signing Key rotation

Authority signing-key rotation MUST preserve issuer identity while changing the signing key.

Consumers validate:

```text
issuer
+
signature
+
current trusted key set
```

They MUST NOT interpret a new signing key as a new Agent Principal namespace unless issuer identity changes.

## 11. Federation key rotation

Federation key changes require peer metadata refresh or bundle update.

A peer SHOULD publish enough overlap to permit deterministic transition.

A local operator MAY pin or require manual approval for major trust-anchor changes.

## 12. Attestation key lifecycle

Attestation keys follow the selected attestation profile.

AgentAuth records only the trust-relevant result and provenance needed by policy.

It does not assume device-manufacturer key lifecycle is identical to OAuth key lifecycle.

## 13. Algorithm agility

Metadata SHOULD declare supported algorithms.

A deployment MUST be able to:

- add a new algorithm
- deprecate an old algorithm
- enforce minimum policy
- reject unknown mandatory algorithms

No algorithm is considered permanent.

## 14. Recovery

Private-key recovery is not required.

Safer recovery often means:

```text
revoke lost key
authorize replacement
establish new key epoch
audit transition
```

The protocol MUST NOT imply possession of a key that is no longer available.

## 15. Audit

Key lifecycle events SHOULD capture:

- key class
- issuer or Instance
- key identifier
- old/new epoch
- reason
- actor authorizing the change
- timestamp
- emergency/planned mode

Private key material MUST never appear in audit logs.
