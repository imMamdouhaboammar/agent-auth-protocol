# AgentAuth v0.2 Trust Decision Algorithm

## 1. Purpose

Trust evaluation and authorization evaluation are different stages.

Trust asks:

> May this identity and runtime evidence be accepted as authentic enough to enter authorization evaluation?

Authorization asks:

> May this exact Action execute?

A positive Trust Decision never implies an authorization allow.

## 2. Inputs

A Trust Decision may consume:

- credential issuer
- Trust Domain
- Federation Peer status
- token signature result
- metadata freshness
- Agent Principal provenance
- Agent Instance identity
- Instance Proof Key result
- Runtime Attestation Result
- selected protocol version
- proof method
- key epoch status
- local trust policy
- current time

## 3. Decision outcomes

Trust evaluation returns:

- `accept`
- `reject`
- `indeterminate`

`indeterminate` means evidence could not be established to the level required by the selected policy.

It does not mean accept.

## 4. Evaluation sequence

Conceptual algorithm:

```text
evaluate_trust(input):

  verify protocol version supported
  identify credential issuer
  resolve local or federated trust path

  if no trusted path:
      reject

  validate issuer metadata freshness
  validate credential signature
  validate key epoch
  validate Agent Principal provenance

  validate Agent Instance identity
  validate current proof-of-possession

  if policy requires attestation:
      validate verifier trust
      validate Attestation Result freshness
      validate proof-key/runtime binding
      evaluate required assurance properties

  if mandatory evidence unavailable:
      indeterminate or reject according to policy

  return accept with normalized trust facts
```

## 5. Normalized trust facts

A successful Trust Decision SHOULD produce facts such as:

```json
{
  "decision": "accept",
  "agent_issuer": "https://agents.example.com",
  "agent_id": "agent_123",
  "instance_id": "inst_456",
  "credential_issuer": "https://auth.provider.example",
  "federation_path": [
    "https://agents.example.com",
    "https://auth.provider.example"
  ],
  "proof_method": "dpop",
  "runtime_assurance": {
    "status": "accepted",
    "class": "workload-backed"
  },
  "policy_version": "trust-v9"
}
```

These facts become inputs to AgentAuth Context and authorization policy.

## 6. Non-equivalences

All of these are false:

```text
valid signature == trusted issuer
trusted issuer == trusted Agent
trusted Agent == trusted Instance
trusted Instance == attested runtime
attested runtime == authorized Actor
authorized Actor == authorized Action
```

Every transition requires its own policy.

## 7. Assurance policy

A Provider may require:

```text
read.public:
  attestation optional

customer.export:
  workload-backed required

payment.sign:
  hardware-backed profile required
```

Assurance requirements narrow available Actions.

They do not enlarge a grant.

## 8. Federation trust

When the credential is foreign:

- peer must be active
- accepted issuer must match
- federation policy must cover the use
- provenance mapping must be valid
- mandatory foreign semantics must be understood

A trusted Provider Authority can terminate the foreign trust path by issuing a local credential after brokered exchange.

## 9. Key freshness

Trust evaluation checks:

- signing key still active
- Instance Proof Key still active
- federation key still accepted
- attestation result within freshness

A stale but cryptographically valid artifact may still be rejected.

## 10. Failure categories

Examples:

- `UNTRUSTED_ISSUER`
- `FEDERATION_DISABLED`
- `STALE_METADATA`
- `INVALID_SIGNATURE`
- `INSTANCE_REVOKED`
- `INSTANCE_PROOF_FAILED`
- `ATTESTATION_REQUIRED`
- `ATTESTATION_REJECTED`
- `ATTESTATION_INDETERMINATE`
- `ASSURANCE_TOO_LOW`
- `KEY_EPOCH_RETIRED`
- `UNKNOWN_MANDATORY_SEMANTICS`

External errors should map to the AgentAuth error registry without leaking sensitive trust-policy details.

## 11. Authorization handoff

Only after trust is accepted does the Provider evaluate:

- Subject Authority
- Delegation Grant
- Agent Local Authority
- Runtime Authority
- Provider Policy
- requested Capability

Trust facts are inputs.

They are not permissions.

## 12. Audit

Every high-risk Trust Decision SHOULD record:

- decision
- peer/issuer
- Agent Principal
- Agent Instance
- proof method
- attestation result reference
- key epoch
- trust-policy version
- reason codes
- timestamp

Raw private material and unnecessary attestation evidence are excluded.
