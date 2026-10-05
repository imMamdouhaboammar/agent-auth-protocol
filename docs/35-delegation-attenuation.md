# AgentAuth v0.2 Delegation and Attenuation

## 1. Goal

Agent-to-agent delegation is valid only when every child receives equal or narrower authority than its parent.

The original represented Subject remains visible throughout the chain.

## 2. Delegation chain

Example:

```text
Human Subject
  -> Grant G0 -> Orchestrator Agent
       -> Grant G1 -> Research Agent
            -> Grant G2 -> Retrieval Agent
```

Each grant has:

- Subject
- current Agent Actor
- parent grant reference, except root
- Capability Set
- validity window
- delegation depth
- status

## 3. Subject preservation

In a delegated chain, child delegation does not replace the original represented Subject merely because the Actor changes.

Example:

```text
G0:
Subject = user:mamdouh
Actor   = orchestrator

G1:
Subject = user:mamdouh
Actor   = researcher
Parent  = G0
```

A change of represented Subject requires a new authorization basis.

## 4. Child-grant validity

Child Grant C is a valid attenuation of Parent Grant P only if all conditions hold:

1. C references P
2. P is active
3. P permits further delegation
4. C Subject matches P Subject
5. C expiry is no later than P expiry
6. C start time is no earlier than P start time
7. C remaining delegation depth is lower
8. every C Capability is covered by at least one P Capability
9. every Child Constraint subsumes its Parent Constraint
10. Provider or Authority policy permits the delegation

If any check is unknown, deny.

## 5. Capability-set attenuation

Let:

```text
Capabilities(C) <= Capabilities(P)
```

when each child Capability is completely covered by one parent Capability.

The child MAY drop parent Capabilities.

The child MUST NOT combine pieces from multiple parents in a way that creates a new broader Capability.

## 6. Example

Parent:

```json
{
  "action": "payment.create",
  "resources": ["urn:account:123", "urn:account:456"],
  "arguments": {
    "amount": {
      "constraint_type": "range",
      "max": 500
    },
    "currency": {
      "constraint_type": "one_of",
      "values": ["USD", "EUR"]
    }
  }
}
```

Valid child:

```json
{
  "action": "payment.create",
  "resources": ["urn:account:123"],
  "arguments": {
    "amount": {
      "constraint_type": "range",
      "max": 200
    },
    "currency": {
      "constraint_type": "exact",
      "value": "USD"
    }
  }
}
```

Invalid child:

```text
resources adds urn:account:999
amount max increases to 1000
currency adds GBP
```

Any one of those changes invalidates attenuation.

## 7. Delegation depth

A root grant MAY set:

```json
{
  "max_delegation_depth": 2
}
```

The first child can have at most 1.

The second child can have at most 0.

An Actor with depth 0 MUST NOT derive another child grant.

## 8. Revocation

Revoking a parent invalidates future use of every descendant.

The system SHOULD maintain a descendant index or equivalent mechanism for timely revocation.

A descendant is not re-parented automatically.

## 9. Suspension

Suspending a parent makes descendants unusable while the suspension is effective.

Reactivating a parent does not reactivate a descendant that was independently revoked.

## 10. Authority-mediated child grants

AgentAuth v0.2 core uses Authority-mediated child-grant creation.

The deriving Agent proves its active parent authority to the Authority.

The Authority:

1. authenticates the current Agent Instance
2. loads parent grant
3. validates requested child attenuation
4. applies policy
5. creates a distinct child grant
6. emits audit evidence

This design prioritizes revocation, policy, and audit consistency.

## 11. Offline attenuation

Emerging designs explore offline derivation of signed attenuated credentials.

AgentAuth treats offline derivation as a future optional profile.

It is not required by AA-DELEGATION-1 in v0.2.

An offline profile would need to define:

- derivation signatures
- root trust anchors
- chain-size limits
- replay handling
- revocation strategy
- exact Constraint Subsumption
- proof-of-possession at each leaf

## 12. Token representation

A Resource Access Token MAY represent only the current Actor plus sufficient grant reference.

Historical delegation actors are audit provenance.

A Provider MAY require the full chain for high-risk or cross-domain verification.

The representation choice MUST NOT change attenuation semantics.

## 13. Multi-parent authority

The v0.2 core does not allow a child grant to union authority from multiple parent grants.

If an operation requires authority from multiple independent grants, the Provider evaluates those grants as separate authorization inputs.

No new combined grant is implied.

## 14. Purpose

A child MAY narrow purpose.

A child MUST NOT use a changed purpose to broaden capabilities.

Purpose strings are policy inputs, not proof of authority.

## 15. Conformance properties

A delegation conformance suite MUST test:

- resource-set subset
- action equality
- constraint narrowing
- exact-to-range narrowing
- exact-to-one_of narrowing
- expiry narrowing
- delegation-depth decrease
- parent revocation
- unknown constraint denial
- same local Agent ID under different issuers
- no multi-parent union
