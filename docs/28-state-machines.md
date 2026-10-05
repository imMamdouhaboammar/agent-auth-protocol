# AgentAuth v0.2 Normative State Machines

## 1. Purpose

This document defines security-relevant lifecycle states.

Implementations MAY use additional internal states, but externally visible behavior MUST be compatible with these transitions.

## 2. Agent Principal

States:

```text
pending
  -> active
  -> suspended
  -> active

active
  -> revoked

suspended
  -> revoked
```

Rules:

- `revoked` is terminal
- a revoked Agent Principal MUST NOT receive new AgentAuth credentials
- suspending a Principal SHOULD prevent new credentials
- existing high-risk sessions MUST be invalidated according to revocation policy

## 3. Agent Instance

States:

```text
pending
  -> active

active
  -> suspended
  -> active

active
  -> revoked

suspended
  -> revoked
```

Rules:

- `revoked` is terminal
- an inactive Instance MUST NOT authenticate for new credentials
- revoking one Instance MUST NOT implicitly revoke sibling Instances
- rotating an Instance key SHOULD create a new key version or equivalent audit event

## 4. Delegation Grant

States:

```text
requested
  -> pending_approval
  -> active

requested
  -> denied

pending_approval
  -> denied

active
  -> suspended
  -> active

active
  -> revoked

active
  -> expired

suspended
  -> revoked

suspended
  -> expired
```

Rules:

- `denied`, `revoked`, and `expired` are terminal for the same grant version
- an expired grant cannot be reactivated; a new grant is required
- a child grant MUST become unusable when its parent becomes revoked or expired
- reactivation from `suspended` MUST NOT expand authority

## 5. Provider Agent Account

States:

```text
unregistered
  -> pending
  -> active

pending
  -> rejected

active
  -> suspended
  -> active

active
  -> closed

suspended
  -> closed
```

Rules:

- `rejected` and `closed` are terminal for the same account record
- Provider Account status is local Provider policy
- an active upstream Agent identity does not override a suspended local account

## 6. Native Agent Session

States:

```text
authorized
  -> bootstrap_issued
  -> active

bootstrap_issued
  -> expired

bootstrap_issued
  -> consumed_failed

active
  -> expired

active
  -> revoked

active
  -> logged_out
```

Rules:

- bootstrap redemption is atomic
- the bootstrap transitions out of `bootstrap_issued` after first accepted redemption attempt
- a successfully redeemed bootstrap MUST NOT be redeemed again
- `expired`, `revoked`, and `logged_out` are terminal for that session
- session state MUST preserve agent actor metadata while active

## 7. Step-up Approval

States:

```text
requested
  -> approved
  -> consumed

requested
  -> denied

requested
  -> expired

approved
  -> expired
```

Rules:

- an approval bound to an Action Digest can be consumed only for a matching Action Intent
- changing security-relevant parameters invalidates the match
- `consumed`, `denied`, and `expired` are terminal
- reusable class-level approvals require a separate policy profile and are not equivalent to transaction-bound approval

## 8. Federation peer

States:

```text
proposed
  -> active

active
  -> suspended
  -> active

active
  -> removed

suspended
  -> removed
```

Rules:

- `removed` is terminal for the federation relationship version
- new foreign credentials MUST fail after trust removal
- existing local sessions follow Provider revocation freshness policy

## 9. Illegal transitions

A server MUST reject illegal security-state transitions.

Examples:

- revoked Instance -> active
- expired Grant -> active
- consumed bootstrap -> active via replay
- closed Provider Account -> active
- removed federation peer -> active without a new trust relationship

## 10. Concurrency

State transitions that grant, reactivate, approve, or consume authority MUST be atomic from the protocol caller's perspective.

Concurrent requests MUST NOT:

- activate the same one-time bootstrap twice
- consume a transaction approval twice when single-use
- exceed grant counters through race conditions
- resurrect revoked objects

## 11. Audit

Every transition changing effective authority SHOULD emit an audit event containing:

- object identifier
- prior state
- new state
- actor
- timestamp
- reason code
- trace identifier
- policy or approval reference where relevant

Secrets MUST NOT be included.
