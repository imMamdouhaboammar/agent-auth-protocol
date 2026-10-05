# AgentAuth v0.2 Capability Grammar

## 1. Purpose

A Capability is the portable positive-authorization unit used by AgentAuth grants and authorization proposals.

The core grammar is intentionally small so independent implementations can compare and attenuate authority deterministically.

## 2. Canonical Capability

A core Capability contains:

```json
{
  "type": "agent_action",
  "action": "invoice.read",
  "resources": [
    "urn:invoice:workspace-a:123"
  ],
  "arguments": {
    "format": {
      "constraint_type": "one_of",
      "values": ["json", "pdf"]
    }
  }
}
```

Fields:

- `type`: MUST be `agent_action` for the v0.2 core profile
- `action`: exact Action identifier
- `resources`: non-empty set of exact Resource identifiers
- `arguments`: optional Argument Constraint Map

## 3. Action identifiers

Action identifiers are opaque, case-sensitive strings.

Recommended convention:

```text
domain.object.verb
```

Examples:

- `crm.contact.read`
- `email.message.send`
- `payment.create`
- `repo.pull_request.create`

The string format is a naming convention, not a hierarchy.

A Provider MUST NOT infer that `repo.read` authorizes `repo.admin` because of a common prefix.

## 4. Resource identifiers

The core profile uses exact Resource identifiers only.

Examples:

- `urn:repo:github:org/repo`
- `https://api.example.com/accounts/123`
- `urn:mcp:server:finance/tool/payments.create`

Resource identifiers are compared exactly under the Resource profile that defines them.

Patterns, path containment, tags, classifications, and relationship selectors require extension semantics.

## 5. Positive authority only

A Capability states what may be allowed.

The portable grant grammar does not include `deny` entries.

Provider policy can deny any Action or Resource regardless of grant contents.

This keeps child-grant attenuation monotonic.

## 6. Argument Constraint Map

When `arguments` is absent:

```text
argument mode = open
```

The Capability does not constrain Action arguments.

When `arguments` is present:

```text
argument mode = closed
```

Rules:

1. every argument supplied by the Action Intent MUST appear in the map
2. every argument named in the map MUST be present in the Action Intent
3. every value MUST satisfy its Constraint Predicate

To permit any value for a named argument, use `wildcard`.

The core profile does not support optional constrained arguments.

## 7. Why closed-world argument mode

Consider:

```json
{
  "action": "payment.create",
  "arguments": {
    "amount": {
      "constraint_type": "range",
      "max": 500
    }
  }
}
```

If the runtime silently accepted an additional unlisted argument:

```json
{
  "amount": 100,
  "recipient": "attacker"
}
```

the issuer never evaluated the recipient.

Closed-world mode prevents this authority gap.

## 8. Rich Authorization Requests mapping

AgentAuth profiles the `authorization_details` mechanism from RFC 9396.

A request MAY contain multiple `agent_action` entries.

Example:

```json
{
  "authorization_details": [
    {
      "type": "agent_action",
      "action": "invoice.read",
      "resources": ["urn:invoice:workspace-a:*"]
    },
    {
      "type": "agent_action",
      "action": "payment.create",
      "resources": ["urn:account:123"],
      "arguments": {
        "amount": {
          "constraint_type": "range",
          "min": 0,
          "max": 500
        },
        "currency": {
          "constraint_type": "exact",
          "value": "USD"
        },
        "recipient": {
          "constraint_type": "one_of",
          "values": ["urn:payee:42", "urn:payee:77"]
        }
      }
    }
  ]
}
```

The wildcard-looking Resource in the first example is illustrative only if that Resource profile defines it. AgentAuth core itself does not interpret `*`.

## 9. Capability Set

A Capability Set is a list of Capabilities.

Within one Capability Set, independent entries are additive.

Attenuation is checked entry-by-entry against a parent Capability Set.

A child entry is valid only when at least one parent entry covers it completely.

## 10. Capability coverage

Child Capability C is covered by Parent Capability P only if:

1. `C.action == P.action`
2. every Resource in C is allowed by P
3. C Argument Constraint Map is an attenuation of P
4. any extension fields are known and proven non-expanding

If no parent Capability covers C, delegation fails.

## 11. Tool and MCP mapping

A Provider or MCP server may map local operations to AgentAuth Action identifiers.

Example:

```text
MCP tool invoices.list
  -> invoice.read

MCP tool payments.create
  -> payment.create
```

Tool metadata does not grant authority.

The AgentAuth Capability and Provider policy decide whether the mapped operation may execute.

## 12. Capability declarations versus grants

An Agent Manifest may declare:

```text
"I am able to call payment.create"
```

A Delegation Grant may state:

```text
"This Agent is authorized to call payment.create for Account 123 up to 500 USD"
```

These are different facts.

Self-declared capability MUST NOT become permission.

## 13. Purpose

Purpose is separate metadata.

Purpose MAY affect Provider policy.

Purpose MUST NOT broaden a Capability.

## 14. Extension rules

A capability extension that changes authority MUST define:

- field syntax
- runtime evaluation semantics
- attenuation rule
- deterministic comparison
- failure behavior
- computational limits

Unknown authority-bearing extensions MUST fail closed.
