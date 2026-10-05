# AgentAuth v0.2 Federation Protocol

## 1. Goal

Federation lets one Trust Domain accept selected identity or authorization evidence originating in another Trust Domain.

Federation is explicit, directional, bounded, revocable, and non-transitive by default.

## 2. Parties

- **Home Trust Domain**: native domain of the Agent Principal
- **Home Authority**: authenticates the Agent identity
- **Provider Trust Domain**: local domain of the target Provider
- **Provider Authority**: Authority trusted by the Provider
- **Federation Peer**: external Trust Domain accepted under local Federation Policy

One deployment may operate multiple roles.

## 3. Federation modes

### 3.1 Direct validation

The Provider or Provider Authority validates the foreign Home Authority credential directly.

Use when:

- the foreign issuer set is small
- the Provider is prepared to validate foreign profiles
- direct provenance is desirable

### 3.2 Brokered exchange

The Provider Authority validates foreign evidence and issues a local Provider credential.

Use when:

- Resource Servers should trust only local issuers
- claim normalization is needed
- local consent, risk, or account mapping is required
- foreign issuer policy should be centralized

## 4. Federation establishment

A Federation Peer becomes active only after local policy accepts:

1. peer Trust Domain identifier
2. peer issuer identifiers
3. metadata authenticity
4. key material or key-discovery method
5. supported AgentAuth versions
6. supported proof methods
7. accepted actor types
8. accepted identity namespaces
9. accepted attestation semantics, if required
10. audience and authorization limits
11. revocation and refresh policy

A peer advertisement alone MUST NOT activate trust.

## 5. Federation Policy

Federation Policy may constrain:

- accepted Agent publishers
- accepted Agent Principal namespaces
- accepted Subjects
- accepted audiences
- maximum delegation depth
- maximum credential lifetime
- accepted runtime-assurance properties
- accepted attestation verifiers
- allowed actions
- allowed Resources
- whether direct or delegated authority is accepted
- whether brokered exchange is required

Local policy can only narrow foreign authority.

## 6. Metadata freshness

Federation metadata MUST carry or imply bounded validity.

A relying system MUST track:

- last successful refresh
- current key material
- next refresh deadline
- peer status
- emergency disable state

Failure to refresh MAY permit continued low-risk validation only within configured stale tolerance.

High-risk new authorization SHOULD fail closed when freshness requirements are not met.

## 7. Key rotation

Federation MUST permit overlapping key epochs.

During planned rotation:

```text
old key accepted
new key published
new key accepted
old key retired
```

The overlap window must be bounded.

A verifier MUST NOT trust a newly observed key merely because it appears under the same display name.

## 8. Trust removal

When a Federation Peer is removed:

- new credentials from that peer MUST fail
- new brokered exchanges MUST fail
- cached trust entries MUST be invalidated
- active local sessions follow local revocation policy
- descendant or mapped grants are reevaluated according to provenance rules

Trust removal does not require disabling unrelated peers.

## 9. Provenance preservation

Brokered exchange MUST preserve enough provenance to answer:

- which Home Authority established the Agent identity
- which Agent Principal was accepted
- which Agent Instance presented proof
- which Provider Authority performed the exchange
- which Federation Policy version allowed the mapping
- which upstream grant or entitlement was used

The raw upstream credential need not be retained.

## 10. Identity collision

Two foreign Agents with the same local identifier remain different:

```text
(issuer-A, agent_123)
!=
(issuer-B, agent_123)
```

Federation mapping MUST preserve this distinction.

## 11. Claim normalization

A Provider Authority MAY normalize foreign claims into local AgentAuth semantics when:

- source semantics are understood
- mapping is deterministic
- mapping does not expand authority
- provenance is retained
- unknown mandatory semantics fail closed

Normalization may reduce trust or authority.

It MUST NOT increase either.

## 12. Delegated Subject preservation

If the foreign credential represents:

```text
Subject = user_789
Actor   = agent_123
```

the local credential MUST preserve both roles.

A federation bridge MUST NOT collapse this to a human-only Subject.

## 13. No hidden transitive trust

If Home Authority A presents evidence signed by B, and B is trusted, the Provider does not automatically trust A unless the selected profile explicitly treats B as an authorized broker whose output is a new local trust decision.

The distinction is:

```text
trusting B as issuer
!=
trusting everyone B trusts
```

## 14. Conformance

AA-FEDERATION-1 requires tests proving:

- trust is explicit
- trust is directional
- peer removal blocks new authorization
- identical local IDs from different issuers do not collide
- key rotation overlap is deterministic
- expired peer metadata follows configured failure rules
- unknown mandatory semantics fail closed
- brokered exchange preserves Subject and Actor
- foreign authority never expands during normalization
