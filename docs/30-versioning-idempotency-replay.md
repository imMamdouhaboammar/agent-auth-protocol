# AgentAuth v0.2 Versioning, Idempotency, and Replay Semantics

## 1. Protocol version

The current protocol design version is `0.2`.

Version negotiation occurs through metadata, not by guessing from endpoint shape.

Provider metadata SHOULD advertise:

```json
{
  "protocol_versions_supported": ["0.2"]
}
```

Authority metadata SHOULD advertise the same field.

## 2. Version selection

The Agent Client:

1. computes the intersection of supported versions
2. applies local minimum-version policy
3. selects the highest mutually supported compatible version
4. records the selected version in AgentAuth Context
5. rejects an operation when a required security extension is unsupported

Version strings are protocol labels, not floating-point numbers.

Clients MUST compare them as registered version identifiers.

## 3. Backward compatibility

A minor design revision may add optional fields without changing the protocol version only when old implementations can safely ignore them.

A new protocol version is required when:

- authorization semantics change
- required claims change incompatibly
- proof requirements change incompatibly
- state transitions change incompatibly
- an error changes security meaning

## 4. Unknown extensions

Every extension must be classed as:

- optional
- required by selected profile

Unknown optional extensions MAY be ignored.

Unknown required extensions MUST fail closed.

## 5. Idempotency keys

Side-effecting protocol operations SHOULD support an opaque `Idempotency-Key`.

The key:

- MUST be unpredictable enough to avoid accidental collision
- MUST be scoped to authenticated caller and operation
- MUST have bounded retention
- MUST map to a request digest

If the same key is replayed with the same request digest, the server SHOULD return the original semantic result.

If the same key is replayed with a different request digest, the server MUST return `agentauth_idempotency_conflict`.

## 6. Operations requiring idempotency semantics

### Provider Agent signup

A retried signup MUST NOT create duplicate Agent Accounts.

### Grant creation

A retried grant request MUST NOT create multiple materially equivalent grants when the same idempotency key is used.

### Browser bootstrap creation

A repeated creation request may return the same still-valid bootstrap only if doing so does not weaken one-time semantics. Otherwise it SHOULD return the same session reference with a newly issued bootstrap under explicit server rules.

### Step-up initiation

A retried transaction-bound approval request MUST map to the same Action Digest.

## 7. One-time artifacts

These are one-time by default:

- Native Agent Session bootstrap
- transaction-bound Step-up Approval when configured single-use
- authorization code
- profile-defined enrollment challenge

One-time consumption MUST be atomic.

## 8. DPoP replay

The Provider or Authority MUST detect proof replay within the freshness window required by RFC 9449 and local risk policy.

Replay detection state SHOULD bind:

- proof `jti`
- proof key
- request method
- target URI
- freshness interval

The exact storage implementation is not protocol-defined.

## 9. Token replay

A sender-constrained access token presented without valid current proof MUST fail.

A copied token plus copied historical proof MUST fail when the proof is stale or replayed.

## 10. Browser bootstrap replay

A successfully redeemed bootstrap:

- MUST be permanently marked consumed
- MUST return a replay failure on later use
- MUST NOT create another Browser Session

A bootstrap that expires before redemption MUST NOT be reactivated.

## 11. Approval replay

An approval bound to Action Digest D1 MUST NOT authorize Action Digest D2.

Where approval is single-use, a second execution attempt MUST require a new approval unless the first execution is proven not to have occurred under an idempotent transaction model.

## 12. Retry safety

Automatic retries are allowed only when the operation is known idempotent or protected by an idempotency key.

Agents MUST NOT blindly retry security-sensitive side effects after an ambiguous network failure.

The Agent SDK SHOULD surface an indeterminate outcome state when the server result is unknown.

## 13. Clock skew

Implementations MAY allow bounded clock skew for token and proof validation.

The accepted skew MUST be small and documented.

Clock skew MUST NOT extend Delegation Grant authority beyond its actual configured expiration by more than the accepted validation tolerance.

## 14. Cache invalidation

Version and trust metadata can be cached, but emergency events override ordinary TTL:

- issuer trust removal
- key compromise
- profile deprecation
- minimum-version increase
- critical security advisory

High-risk actions SHOULD fail closed when freshness requirements cannot be met.
