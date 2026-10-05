# AgentAuth v0.2 Constraint Algebra

## 1. Goal

Delegation is safe only when a verifier can prove that child authority is no broader than parent authority.

AgentAuth defines a minimal core Constraint Registry with deterministic runtime checks and deterministic Subsumption rules.

## 2. Formal rule

For Parent Constraint P and Child Constraint C:

```text
C <= P
```

means:

```text
for every value v:
    if C.check(v) == true
    then P.check(v) == true
```

The child's accepted-value set is a subset of the parent's accepted-value set.

A Subsumption implementation MAY be conservative.

It MUST NOT return true for a pair that can expand authority.

## 3. Required properties

Every portable Constraint type MUST define a Subsumption algorithm that is:

- decidable
- sound
- deterministic
- bounded in resource use

Unknown Constraint types fail closed.

## 4. Core Constraint types

AgentAuth v0.2 core defines:

- `wildcard`
- `exact`
- `range`
- `one_of`
- `not_one_of`
- `subset`
- `contains`

The core does not include arbitrary policy expressions.

## 5. wildcard

Shape:

```json
{
  "constraint_type": "wildcard"
}
```

Check:

```text
accept any JSON value
```

Subsumption:

- any recognized Child Constraint subsumes Parent `wildcard`
- Child `wildcard` subsumes only Parent `wildcard`

## 6. exact

Shape:

```json
{
  "constraint_type": "exact",
  "value": "USD"
}
```

Check:

```text
argument equals value using JSON scalar equality
```

Core `exact` values are limited to JSON scalar values.

Subsumption:

- exact -> exact: values identical
- exact -> one_of: exact value belongs to Parent set
- exact -> range: exact numeric value falls inside Parent range
- exact -> wildcard: always valid
- otherwise: invalid unless an extension explicitly defines the cross-type rule

## 7. range

Shape:

```json
{
  "constraint_type": "range",
  "min": 0,
  "max": 500,
  "min_inclusive": true,
  "max_inclusive": true
}
```

At least one of `min` or `max` MUST be present.

Check:

- argument MUST be a JSON number
- argument MUST satisfy the configured bounds

Subsumption:

Child range must be equal or narrower.

Examples:

```text
Parent: 0 <= x <= 500
Child:  0 <= x <= 300
VALID

Parent: 0 <= x <= 500
Child:  0 <= x <= 700
INVALID
```

Inclusive versus exclusive boundaries are part of the comparison.

For financial decimal values that cannot safely use JSON binary-number semantics, a domain extension SHOULD use canonical decimal strings with its own comparator.

## 8. one_of

Shape:

```json
{
  "constraint_type": "one_of",
  "values": ["USD", "EUR"]
}
```

Check:

```text
argument is exactly one member of values
```

Subsumption:

```text
Child.values subset_of Parent.values
```

## 9. not_one_of

Shape:

```json
{
  "constraint_type": "not_one_of",
  "excluded": ["blocked", "suspended"]
}
```

Check:

```text
argument is not a member of excluded
```

Subsumption:

```text
Child.excluded superset_of Parent.excluded
```

Adding exclusions narrows authority.

## 10. subset

Shape:

```json
{
  "constraint_type": "subset",
  "allowed": ["read", "comment", "label"]
}
```

The Action argument MUST be an array.

Check:

```text
every argument element belongs to allowed
```

Subsumption:

```text
Child.allowed subset_of Parent.allowed
```

## 11. contains

Shape:

```json
{
  "constraint_type": "contains",
  "required": ["security-review"]
}
```

The Action argument MUST be an array.

Check:

```text
argument contains every required element
```

Subsumption:

```text
Child.required superset_of Parent.required
```

Requiring more elements narrows accepted values.

## 12. Cross-type rules

The core permits only these cross-type Subsumption relations:

| Child | Parent | Condition |
|---|---|---|
| any known type | wildcard | always |
| exact | exact | equal |
| exact | one_of | member |
| exact | range | numeric value inside range |
| range | range | child bounds narrower |
| one_of | one_of | child set subset |
| not_one_of | not_one_of | child excluded superset |
| subset | subset | child allowed subset |
| contains | contains | child required superset |

All unspecified cross-type pairs are invalid.

## 13. Argument-map attenuation

### Parent open-world

If Parent Capability has no `arguments`, the Child MAY:

- remain open-world
- introduce a closed Argument Constraint Map

Introducing constraints narrows authority.

### Parent closed-world

If Parent has an Argument Constraint Map:

- Child MUST also be closed-world
- Child MUST contain exactly the same argument keys
- every Child Constraint MUST subsume its Parent Constraint

Adding a new key could authorize an argument Parent forbade.

Removing a key could permit an invocation shape Parent did not authorize.

Both fail.

## 14. Resource attenuation

Core Resources are exact identifiers.

Child Resource set MUST be a subset of Parent Resource set.

Pattern containment is not a core operation.

## 15. Time and delegation limits

Grant attenuation also requires:

```text
child.not_before >= parent.not_before
child.expires_at <= parent.expires_at
child.max_delegation_depth < parent.remaining_delegation_depth
```

A child cannot outlive or out-delegate its parent.

## 16. Extensions

A Constraint extension MUST publish:

1. JSON shape
2. `check(value)` semantics
3. `subsumes(parent, child)` semantics
4. allowed cross-type comparisons
5. canonicalization rules
6. computational complexity
7. maximum input sizes
8. fail-closed behavior

A policy language is not automatically a valid Constraint type.

## 17. Why no arbitrary policy strings in core

General policy languages are useful inside Providers, but portable attenuation requires two independent implementations to reach the same containment result.

Arbitrary Rego, Cedar, SQL, JavaScript, or natural-language conditions can make semantic containment difficult or impossible to prove reliably.

Such policy belongs in Provider Policy unless a constrained interoperable extension defines a sound Subsumption procedure.
