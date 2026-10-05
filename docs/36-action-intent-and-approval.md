# AgentAuth v0.2 Action Intent and Approval Binding

## 1. Goal

A human approval must authorize the exact security-relevant operation that the Agent will execute.

Raw natural-language prompts are not stable authorization artifacts.

AgentAuth therefore normalizes an operation into an Action Intent and binds approval to an Action Digest.

## 2. Action Intent

Canonical fields:

```json
{
  "intent_version": "0.2",
  "provider": "https://payments.example.com",
  "subject": {
    "type": "human",
    "issuer": "https://id.example.com",
    "id": "user_123"
  },
  "actor": {
    "issuer": "https://agents.example.com",
    "id": "finance-agent"
  },
  "instance_id": "inst_456",
  "grant_id": "grant_789",
  "action": "payment.create",
  "resource": "urn:account:123",
  "arguments": {
    "amount": "250.00",
    "currency": "USD",
    "recipient": "urn:payee:42"
  },
  "expires_at": "2026-10-05T13:00:00Z",
  "nonce": "opaque-random-value"
}
```

The raw prompt is intentionally absent.

## 3. Normalization

Before hashing:

1. validate against the Action Intent schema
2. resolve the Provider's canonical Action identifier
3. resolve the canonical Resource identifier
4. include all security-relevant Action arguments
5. remove presentation-only fields
6. serialize using JSON Canonicalization Scheme, RFC 8785

Providers MUST NOT normalize security-relevant strings in an undocumented way.

## 4. Action Digest

The v0.2 digest profile is:

```text
digest_bytes = SHA-256(JCS(ActionIntent))
digest = "sha-256:" + BASE64URL(digest_bytes)
```

No padding is used in the base64url representation.

Example conceptual value:

```text
sha-256:QmFzZTY0dXJsRXhhbXBsZQ
```

## 5. Approval Evidence

Approval Evidence binds:

- approver identity
- decision
- Action Digest
- approval time
- expiration
- single-use or reusable policy
- optional reason
- approval-policy version

Example:

```json
{
  "approval_id": "apr_123",
  "action_digest": "sha-256:...",
  "decision": "approved",
  "approver": {
    "type": "human",
    "issuer": "https://id.example.com",
    "id": "manager_7"
  },
  "approved_at": "2026-10-05T12:45:00Z",
  "expires_at": "2026-10-05T12:50:00Z",
  "single_use": true,
  "policy_version": "payments-v17"
}
```

## 6. Mutation invalidation

Changing any digest-bound field produces a different Action Digest.

Examples that require a new approval:

- amount 250 -> 300
- recipient A -> B
- Resource account 123 -> 456
- represented Subject changes
- Agent Actor changes
- Agent Instance changes when Instance is bound
- grant changes
- Provider changes

## 7. Presentation

The human approval UI SHOULD render the normalized semantics, not opaque scopes.

Example:

```text
Finance Assistant wants to:
Create one payment
From: Account 123
To: Vendor 42
Amount: 250.00 USD
Acting for: Acme Finance
Approval expires in 5 minutes
```

## 8. Single-use approval

For irreversible actions, single-use SHOULD be the default.

Consumption must be atomic.

A replayed consumed Approval Evidence MUST fail.

## 9. Ambiguous outcome

If the Agent sends the approved Action and the network fails before it learns the result, it MUST NOT blindly repeat the side effect.

The Provider should combine:

- Action Digest
- Idempotency Key
- transaction identifier

to make retry behavior explicit.

## 10. Class-level approval

Longer-lived approvals such as:

```text
"allow invoice.read for Workspace A for 24 hours"
```

are grants or policy changes, not transaction-bound Approval Evidence.

Do not model them as a reused single Action Digest.

## 11. Step-up flow

```text
Action Intent
  -> Provider evaluation
  -> step_up_required
  -> Approval request containing Action Digest
  -> approver verifies normalized action
  -> Approval Evidence issued
  -> Agent retries exact Action Intent
  -> Provider recomputes digest
  -> digest match
  -> full authorization reevaluation
```

## 12. Approval does not expand grant

Approval Evidence satisfies an obligation.

It does not create authority outside the active Capability Set.

If the grant limit is 500 USD, human approval for 700 USD does not make the action valid unless a new or updated grant authorizes 700 USD.
