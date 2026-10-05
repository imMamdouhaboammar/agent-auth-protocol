# Operations Runbook Requirements

## Signing key compromise

Trigger:

- KMS alert
- unexpected signing event
- private key exposure
- issuer key misuse

Actions:

1. mark key compromised
2. stop issuance with affected key
3. publish updated JWKS without relying only on cache expiry
4. activate replacement key
5. invalidate affected active tokens according to risk policy
6. notify Resource Servers through emergency channel
7. inspect audit events signed during exposure window
8. preserve evidence
9. issue incident report

## Agent Instance compromise

1. revoke instance
2. block new token exchange
3. terminate native browser sessions
4. invalidate or quarantine refresh credentials
5. propagate revocation event
6. inspect grants used by instance
7. rotate credentials if compromise scope is uncertain
8. create replacement Agent Instance, not reuse compromised key

## Grant abuse

1. revoke grant
2. cascade to descendants
3. block new issuance
4. trigger high-risk online checks
5. identify active browser sessions
6. notify owner if policy requires
7. preserve exact action and approval evidence

## Federation incident

1. disable peer
2. reject new tokens from peer
3. invalidate cached trust metadata
4. evaluate currently active tokens by configured emergency policy
5. notify affected tenants
6. require explicit re-enable after review

## Revocation pipeline delay

If delay exceeds warning threshold:

- alert
- reduce token TTL if supported dynamically
- switch high-risk resources to online introspection
- pause sensitive new grants if consistency is uncertain

If delay exceeds hard threshold:

- fail closed for high-risk actions
- disable affected regional issuance if revocation correctness cannot be guaranteed

## Audit pipeline failure

Security mutations must not silently proceed without audit.

Policy choices:

- high-risk operations fail closed
- low-risk operations may queue locally with durable buffer if approved by tenant policy

Never discard audit events because the external SIEM is unavailable.

## Browser worker compromise

1. terminate worker
2. revoke Agent Instance or worker credential
3. delete ephemeral storage
4. invalidate browser sessions created by worker if needed
5. rotate vault handles
6. preserve redacted forensic metadata
7. rebuild worker from trusted image

## Backup verification

Regularly restore:

- grants
- Agent Registry
- policies
- revocations
- federation trust
- audit manifests

Key restoration follows KMS/HSM provider controls and must be tested separately.

## Clock drift

Because tokens and proofs are time-sensitive:

- all nodes use trusted time synchronization
- drift threshold alert
- large drift causes issuance or validation fail-safe behavior
