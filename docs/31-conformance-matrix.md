# AgentAuth v0.2 Conformance Matrix

## 1. Profiles

AgentAuth v0.2 defines:

- `AA-CLIENT-1`
- `AA-AUTHORITY-1`
- `AA-PROVIDER-API-1`
- `AA-PROVIDER-WEB-1`
- `AA-DELEGATION-1`
- `AA-FEDERATION-1`

A product MUST NOT claim a profile unless it satisfies every MUST in that profile.

## 2. Core matrix

| Requirement | CLIENT | AUTHORITY | PROVIDER API | PROVIDER WEB | DELEGATION | FEDERATION |
|---|---:|---:|---:|---:|---:|---:|
| RFC 9728 resource discovery | MUST consume | MAY publish | MUST publish | MUST publish | | |
| RFC 8414 AS metadata | MUST consume | MUST publish | SHOULD consume | SHOULD consume | | MUST consume |
| protocol-version negotiation | MUST | MUST | MUST | MUST | MUST | MUST |
| issuer trust enforcement | MUST | MUST | MUST | MUST | | MUST |
| issuer-qualified Agent identity | MUST | MUST | MUST | MUST | MUST | MUST |
| Agent Principal / Instance separation | MUST | MUST | MUST | MUST | MUST | MUST |
| DPoP support | MUST | MUST | MUST | MUST | MUST for agent token | SHOULD |
| strict audience validation | | MUST issue | MUST validate | MUST validate | MUST preserve | MUST preserve |
| immutable AgentAuth Context | SHOULD create | | MUST create | MUST create | | |
| direct authority mode | MUST | MUST | MUST | MUST | | |
| delegated authority mode | MUST | MUST | MUST | MUST | MUST | MUST preserve |
| Subject / Actor separation | MUST | MUST | MUST | MUST | MUST | MUST preserve |
| grant attenuation | | MUST enforce | MUST not expand | MUST not expand | MUST | MUST not expand |
| structured AgentAuth errors | MUST consume | SHOULD emit | MUST emit | MUST emit | MUST consume | SHOULD emit |
| one-time browser bootstrap | MAY consume | | | MUST | | |
| server-side ai_agent session marker | | | | MUST | | |
| no silent legacy downgrade | MUST | | | SHOULD enforce | | |
| explicit federation trust | | SHOULD | SHOULD | SHOULD | | MUST |
| revocation freshness policy | MUST honor | MUST expose | MUST enforce | MUST enforce | MUST | MUST |
| audit actor provenance | SHOULD | MUST | MUST | MUST | MUST | MUST |

Blank cells mean the requirement is outside that profile, not forbidden.

## 3. AA-CLIENT-1 minimum tests

A conforming Agent Client test suite MUST prove:

- discovers Provider resource metadata
- rejects contradictory Authority metadata
- applies explicit issuer trust policy
- negotiates protocol version
- negotiates proof method
- produces DPoP proof
- keeps proof key out of model-visible result
- distinguishes direct and delegated authority
- preserves issuer-qualified agent identity
- rejects silent downgrade
- handles structured step-up
- rejects unsafe automatic retry after ambiguous side effect

## 4. AA-AUTHORITY-1 minimum tests

A conforming Authority MUST prove:

- publishes valid OAuth metadata
- authenticates Agent Instance proof
- keeps Principal and Instance lifecycle separate
- issues audience-restricted credentials
- issues sender-constrained credentials
- emits required AgentAuth claims
- prevents revoked Instance issuance
- prevents revoked Grant issuance
- preserves delegated Subject and Actor
- performs brokered translation without authority expansion

## 5. AA-PROVIDER-API-1 minimum tests

A conforming Provider API MUST prove:

- publishes resource metadata
- trusts only configured issuers or federation paths
- validates audience
- validates proof
- detects proof replay
- validates protocol version
- creates immutable AgentAuth Context
- distinguishes direct and delegated mode
- enforces local policy narrowing
- rejects self-declared manifest capability as permission
- rejects malformed delegated credential rather than converting to direct authority

## 6. AA-PROVIDER-WEB-1 minimum tests

In addition to applicable API requirements:

- creates one-time bootstrap
- binds bootstrap to Provider origin
- expires bootstrap
- rejects bootstrap replay
- creates server-side `actor_type=ai_agent` session
- preserves Subject, Agent Principal, and Agent Instance
- revokes Agent Session
- never upgrades bootstrap to human-authenticated session

## 7. AA-DELEGATION-1 minimum tests

A conforming delegation implementation MUST prove:

- grant explicitly identifies Subject and Actor
- child resource set is subset of parent
- child action set is subset of parent
- child expiry is no later than parent
- child delegation depth decreases
- unknown constraint comparator fails closed
- parent revocation disables descendants
- transaction-bound approval fails after Action Digest changes

## 8. AA-FEDERATION-1 minimum tests

A conforming federation implementation MUST prove:

- foreign issuer trust is explicit
- namespaces do not collide
- identical local agent IDs from different issuers remain distinct
- Provider Authority preserves `agent_issuer`
- claim mapping does not increase authority
- foreign trust removal blocks new authorization
- key rotation overlap behaves deterministically
- unknown mandatory semantics fail closed

## 9. Interoperability criterion

The protocol design is sufficiently frozen for reference implementation when:

> An independently built Agent Client can start from a Provider URL, discover a compatible profile, authenticate an Agent Instance through an accepted Authority, obtain a sender-constrained credential, call an independently built Provider, and cause that Provider to create the same canonical AgentAuth Context from the wire evidence.

This criterion is stronger than successful operation of one vertically integrated implementation.

## 10. Non-conformance

An implementation is not AgentAuth-native merely because it:

- automates a human login form
- sets an `X-Agent` header
- uses a special User-Agent string
- calls an MCP server
- has an OAuth client ID
- has a service account

Conformance requires the selected AgentAuth profile semantics.


## 11. Authorization-model conformance additions

AA-DELEGATION-1 and AA-PROVIDER-API-1 additionally require:

- effective authority is computed by narrowing, never union
- delegated authority cannot exceed Subject Authority
- portable Capability Actions and core Resources use exact matching
- unknown authority-bearing Constraint types fail closed
- child Constraint Subsumption is deterministic and non-expanding
- closed-world argument maps reject unlisted arguments
- parent grant revocation invalidates descendants
- progressive consent cannot add authority beyond the Authorization Proposal
- Action Digest uses the defined canonicalization and hash profile
- changed digest-bound parameters invalidate transaction approval
- Provider relationship context is locally derived or independently trusted
