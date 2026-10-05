# AgentAuth v0.2 Effective Authorization Model

## Status

Normative system design for AgentAuth v0.2.

This document defines how AgentAuth combines identity, delegation, Provider permissions, local policy, relationship context, and runtime restrictions into one authorization decision.

## 1. Principle

Authentication evidence never implies complete authorization.

AgentAuth treats authority as an intersection of independently established limits.

A system MUST NOT compute effective authority by taking the union of privileges found across the Subject, Agent, grant, or Provider account.

## 2. Authority as a set

For one normalized Action Intent, define each positive authority source as a set of permitted invocations.

For delegated authority:

```text
EffectiveAllow =
    RequestedAuthority
    INTERSECT SubjectAuthority
    INTERSECT DelegationGrantAuthority
    INTERSECT AgentLocalAuthority
    INTERSECT ProviderPolicyAllow
    INTERSECT RuntimeAuthority
```

Then:

```text
EffectiveAuthority =
    EffectiveAllow
    MINUS ProviderPolicyDeny
```

For direct Agent authority:

```text
EffectiveAllow =
    RequestedAuthority
    INTERSECT DirectEntitlement
    INTERSECT AgentLocalAuthority
    INTERSECT ProviderPolicyAllow
    INTERSECT RuntimeAuthority
```

Any empty intersection produces denial.

## 3. Requested Authority

Requested Authority is the normalized authority needed by the current operation.

It is derived from an Action Intent, not from the raw model prompt.

Example:

```json
{
  "action": "payment.create",
  "resource": "urn:account:123",
  "arguments": {
    "amount": 250,
    "currency": "USD",
    "recipient": "urn:payee:42"
  }
}
```

Requested Authority is always narrower than or equal to a broad grant that authorizes it.

## 4. Subject Authority

Subject Authority represents what the represented Subject could authorize for the target Resource.

Examples:

- a user can read documents they own
- an organization administrator can manage project members
- a finance employee can initiate payments from one cost center
- a patient can authorize access to their own medical record

Subject Authority MAY be resolved by:

- RBAC
- ReBAC
- ABAC
- ACLs
- entitlement services
- Provider business rules

The mechanism is Provider-local.

The Agent MUST NOT self-assert Subject Authority.

## 5. Delegation Grant Authority

A Delegation Grant is a positive authorization boundary.

It states the maximum authority intentionally delegated from the Subject or an authorized Delegator to the Agent Actor.

The grant does not bypass Provider policy.

A grant that says `invoice.read` means only:

> this delegation permits invoice.read within the stated Resources and Constraints.

It does not mean:

> the Provider must allow invoice.read.

## 6. Agent Local Authority

A Provider MAY maintain local Agent permissions independently of the Subject.

Examples:

- Provider Agent Account roles
- approved publisher relationship
- tenant-specific Agent allowlist
- allowed tool categories
- application-local Agent status

Agent Local Authority can only narrow effective access.

If a Provider does not maintain a local Agent account, this term is the universal set for the permitted protocol profile, subject to Provider policy.

## 7. Provider Policy

Provider Policy remains authoritative for the protected Resource.

It may use:

- risk score
- data classification
- relationship graph
- business workflow state
- geographic restrictions
- transaction limits
- account status
- tenant policy
- emergency deny rules

Provider Policy may narrow upstream authority at any time.

An upstream issuer cannot force the Provider to accept an action.

## 8. Runtime Authority

Runtime Authority captures restrictions attached to the current Agent Instance or session.

Examples:

- attestation assurance
- Agent Instance status
- sender-constrained key
- permitted network zone
- session risk level
- rate limit
- maximum delegation depth

A stronger Agent Principal entitlement does not override a weaker current Runtime Authority.

## 9. Deny precedence

Provider deny policy has final precedence.

AgentAuth grants contain positive capabilities rather than portable deny statements.

This distinction prevents ambiguous combinations such as:

```text
parent grant: allow read/*
child grant: deny secret/*
```

where proving monotonicity would require interpreting policy semantics.

Provider-local deny rules are evaluated after positive-authority intersection.

## 10. Relationship Context

Relationship-based authorization can produce Subject Authority and Provider Policy inputs.

Example local graph:

```text
user:alice
  member_of -> team:engineering

team:engineering
  contributor_to -> project:auth-service

project:auth-service
  contains -> repo:auth-service

agent:reviewer
  approved_for -> tool:github

tool:github
  exposes -> operation:repo.read
```

The Provider may infer that Alice can read the repository and that the approved Agent can invoke the relevant tool.

The relationship graph is not transmitted as AgentAuth authorization truth.

## 11. Permission intersection example

Subject:

```text
repo.read
repo.write
repo.delete
```

Delegation Grant:

```text
repo.read
repo.write
```

Provider Agent Account:

```text
repo.read
repo.write
```

Runtime restriction:

```text
repo.read
```

Effective Authority:

```text
repo.read
```

No layer can recover `repo.write` after Runtime Authority removes it.

## 12. Constraint intersection

If multiple authority sources constrain the same Action argument, the effective constraint is the intersection of those accepted-value sets.

Example:

```text
Subject policy: amount <= 1000
Grant:          amount <= 500
Provider:       amount <= 300

Effective:      amount <= 300
```

Implementations do not need to materialize a merged constraint when they can safely evaluate every applicable constraint independently.

## 13. Evaluation result

The authorization evaluator returns one of:

- `allow`
- `deny`
- `step_up`

An `allow` means the exact normalized Action Intent is inside Effective Authority at evaluation time.

It does not create broader reusable authority.

## 14. Step-up

Step-up is not a temporary bypass of policy.

A Step-up Approval supplies missing approval evidence or satisfies an obligation, then the full authorization evaluation runs again.

Example:

```text
Requested action
  -> grant allows
  -> Provider requires human approval above 100 USD
  -> step_up
  -> approval bound to exact Action Digest
  -> reevaluate
  -> allow
```

## 15. Failure behavior

The evaluator MUST deny when:

- a required authority source cannot be established
- a constraint type is unknown
- the Actor or Subject identity is ambiguous
- Resource mapping is ambiguous
- a grant is inactive
- a child grant cannot be proven to attenuate its parent
- approval evidence does not match the Action Digest
- local Provider policy evaluation fails closed

## 16. Non-goal

AgentAuth does not standardize one universal policy engine.

The protocol standardizes enough semantics for independent implementations to agree about identity, capabilities, delegation, constraints, and approval binding.
