# AgentAuth v0.2 Runtime Attestation

## 1. Goal

Runtime Attestation supplies evidence about the environment operating an Agent Instance.

Attestation is a trust input.

It is not an authorization grant.

## 2. Architecture

AgentAuth aligns conceptually with the RATS architecture:

- **Attester** produces evidence
- **Verifier** validates evidence and appraises it
- **Relying Party** consumes an Attestation Result

In AgentAuth:

```text
Agent Runtime
  -> Attestation Evidence
  -> Attestation Verifier
  -> Attestation Result
  -> Home Authority / Provider Policy
```

## 3. Stable standards

AgentAuth may carry or reference attestation evidence using established formats, including:

- Entity Attestation Token (EAT), RFC 9711
- EAT media types, RFC 9782
- measured-component semantics, RFC 10013 where applicable

AgentAuth does not redefine those formats.

## 4. Attestation categories

AgentAuth recognizes descriptive categories, not globally ranked trust scores.

### unknown

No acceptable attestation is available.

### software-backed

Evidence is generated and protected primarily by software controls.

### workload-backed

Evidence is tied to a trusted workload-identity or orchestration environment.

### hardware-backed

Evidence is rooted in hardware or a hardware-protected attestation mechanism.

Deployments MAY define additional categories.

## 5. No global numeric trust ladder

AgentAuth v0.2 does not define:

```text
T4 > T3 > T2 > T1
```

as a universal truth.

A Provider can map evidence to local assurance classes, but another Provider may use different policy.

A hardware-backed result does not automatically authorize more actions.

## 6. Attestation Evidence

Evidence may describe:

- hardware identity
- boot state
- firmware
- operating system
- software measurements
- container or workload identity
- security configuration
- runtime version
- loaded components
- debugging state
- key protection
- nonce or freshness binding

Evidence MUST be interpreted only under a profile that defines the meaning of its claims.

## 7. Attestation Result

An Attestation Result SHOULD identify:

- verifier
- evidence profile
- appraisal-policy version
- subject/runtime reference
- proof-key binding
- freshness
- assurance properties
- accepted/rejected/indeterminate status
- reason codes
- expiration

The result SHOULD avoid unnecessarily copying raw evidence into downstream tokens.

## 8. Proof-key binding

For Agent Instance assurance, the verifier SHOULD establish that attested runtime evidence corresponds to the same Instance Proof Key used by AgentAuth.

Without key binding, valid evidence from one runtime could be replayed to support another runtime.

## 9. Freshness

Attestation freshness is context dependent.

Enrollment may tolerate one freshness interval.

A high-risk transaction may require a newer result.

The Provider or Authority SHOULD specify maximum acceptable age.

Expired attestation MUST NOT be silently treated as current.

## 10. Reference Values and Endorsements

A verifier may use:

- known software measurements
- approved versions
- platform endorsements
- workload-policy metadata
- manufacturer roots
- organization-maintained reference values

The Authority or Provider should consume the Verifier result rather than implementing platform-specific evidence appraisal in every application.

## 11. Privacy

Attestation can reveal sensitive platform details.

Implementations SHOULD minimize:

- device serials
- precise hardware identifiers
- unnecessary software inventory
- infrastructure topology
- raw measurement logs

Provider policy should request only evidence needed for its risk decision.

## 12. Failure states

Attestation evaluation can produce:

- accepted
- rejected
- indeterminate
- unavailable

`unavailable` does not equal `rejected`.

Local policy decides whether an unattested runtime may continue for lower-risk Actions.

## 13. Authorization relationship

Example:

```text
Grant allows payment.create <= 500 USD

Provider policy:
  <= 100 USD:
    no attestation required

  100-500 USD:
    accepted workload-backed or hardware-backed result required
```

Attestation narrows when the Provider requires it.

It never increases the grant from 500 USD to a larger amount.

## 14. Emerging OAuth work

OAuth Attestation-Based Client Authentication is relevant to proving client-instance authenticity to an Authorization Server or Resource Server.

As of the v0.2 design checkpoint it remains an Internet-Draft and is therefore an interoperability research input, not a stable AgentAuth dependency.

## 15. Conformance

AA-ATTESTATION-1 requires:

- evidence integrity validation
- verifier identity validation
- freshness evaluation
- proof-key or runtime binding where the profile requires it
- explicit accepted/rejected/indeterminate state
- policy version
- no automatic permission grant
- fail-closed behavior for unknown mandatory attestation semantics
