# AgentAuth v0.2 Agent Instance Enrollment

## 1. Goal

Enrollment creates a trusted association between:

- one Agent Principal
- one Agent Instance identifier
- one Instance Proof Key
- optional Runtime Attestation
- one Home Authority

Enrollment does not grant Provider permissions.

## 2. Preconditions

The Home Authority MUST establish who is authorized to create an Instance for the Agent Principal.

Valid enrollment authorities may include:

- Agent Principal owner
- organization administrator
- trusted workload identity
- previously authorized provisioning system
- existing Instance using a rotation profile

An untrusted runtime cannot self-assign itself to an arbitrary Agent Principal.

## 3. Proof-key generation

The Instance Proof Key SHOULD be generated in the runtime or security boundary that will use it.

The private key MUST NOT be transmitted to the Authority.

Where supported, the private key SHOULD be non-exportable.

## 4. Enrollment challenge

Enrollment uses a fresh challenge.

Conceptual sequence:

```text
Agent Client -> Home Authority:
  request enrollment challenge

Home Authority -> Agent Client:
  challenge_id
  nonce
  expires_at
  accepted proof algorithms
  optional attestation requirements

Agent Client:
  generate/load Instance Proof Key
  sign challenge
  collect optional attestation evidence

Agent Client -> Home Authority:
  Agent Principal reference
  public proof key
  challenge signature
  optional Attestation Evidence

Home Authority:
  verify authorization to enroll
  verify challenge freshness
  verify proof-key possession
  verify attestation if required
  create Agent Instance

Home Authority -> Agent Client:
  instance_id
  status
  key epoch
  attestation result summary
```

## 5. Challenge properties

An Enrollment Challenge MUST be:

- unpredictable
- single-use
- short-lived
- bound to the target Home Authority
- bound to the intended Agent Principal or enrollment transaction

A replayed or expired challenge MUST fail.

## 6. Instance identity

The durable Instance identity is:

```text
(agent_issuer, instance_id)
```

Changing proof keys does not automatically change Agent Principal identity.

Whether rotation preserves the same Instance identifier or creates a replacement Instance is an Authority policy choice, but the key epoch MUST change.

## 7. Enrollment with Runtime Attestation

When attestation is required:

- evidence MUST be fresh enough for enrollment policy
- evidence SHOULD bind to the Instance Proof Key or enrollment challenge
- the Attestation Verifier evaluates evidence
- the Home Authority records the Attestation Result
- authorization policy decides whether the result is sufficient

The Home Authority MUST NOT treat the mere presence of an attestation object as successful attestation.

## 8. Enrollment with workload identity

An existing workload identity may authorize or bootstrap enrollment.

Example:

```text
workload identity
  -> verified mapping
  -> Agent Principal
  -> Instance Proof Key challenge
  -> Agent Instance
```

The workload identity itself is not the Agent Principal.

## 9. Re-enrollment

If a runtime loses its private key, it cannot prove possession of that old key.

Recovery MUST use:

- administrator-authorized replacement
- workload-authorized replacement
- another explicitly defined recovery method

The protocol MUST NOT fabricate continuity with the lost key.

## 10. Rotation

A valid Instance MAY rotate its Proof Key.

Preferred rotation ceremony:

1. authenticate current Instance with old key
2. request rotation challenge
3. present new public key
4. prove possession of new key
5. bind old and new epochs in one authorized transaction
6. activate new key epoch
7. retain bounded overlap if policy requires
8. retire old key

A compromised old key may require out-of-band recovery instead.

## 11. Revocation

Instance revocation:

- blocks new credentials
- blocks new sessions
- invalidates the Instance Proof Key for future authentication
- SHOULD terminate high-risk sessions within Provider SLA
- MUST NOT implicitly revoke sibling Instances

## 12. Enrollment is not authorization

Successful enrollment proves:

```text
this runtime instance belongs to this Agent Principal
```

It does not prove:

```text
this Agent may access Provider X
```

Provider authorization still requires direct entitlement or delegated authority and local policy.
