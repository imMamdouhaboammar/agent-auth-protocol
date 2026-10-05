# AGENTS.md

## Purpose

This file is the operating contract for AI coding agents, research agents, review agents, and autonomous maintainers working in the AgentAuth repository.

AgentAuth is a security-sensitive protocol design. Small wording changes can alter identity, delegation, trust, or authorization semantics. Treat documentation, schemas, examples, tests, and ADRs as one system.

Do not optimize for speed at the cost of semantic consistency.

## Current project phase

AgentAuth v0.2 is in the **System Design** phase.

The current repository defines:

- protocol architecture
- identity model
- wire semantics
- authorization and delegation model
- trust and federation model
- runtime attestation model
- schemas
- conformance requirements
- publication and citation artifacts

Unless the current issue or task explicitly authorizes implementation work, do not introduce:

- production SDKs
- production Authority services
- Provider middleware
- databases
- browser automation
- deployment infrastructure
- compatibility shims presented as normative protocol

Implementation plans may exist in the repository. They are not permission to start implementation automatically.

## Source-of-truth order

When sources disagree, use this order:

1. the current explicit task, issue, or pull request requirement
2. this `AGENTS.md`
3. accepted ADRs in `docs/adr/`
4. normative protocol documents
5. machine-readable schemas and conformance tests
6. `CONTEXT.md`
7. architecture and explanatory design documents
8. README, guides, `llms.txt`, and other publication material
9. research notes and external inspiration

Publication copy is never allowed to silently redefine protocol semantics.

Research notes are evidence inputs, not normative requirements.

## Normative document map

### Architecture and protocol

- `docs/17-three-party-protocol-architecture.md`
- `docs/20-protocol-ceremonies.md`
- `docs/21-discovery-and-metadata.md`
- `docs/23-provider-authority-trust-model.md`
- `docs/24-normative-protocol-core.md`
- `docs/25-http-wire-bindings.md`
- `docs/26-token-and-claims-profile.md`
- `docs/27-identifiers-and-namespaces.md`
- `docs/28-state-machines.md`
- `docs/29-error-registry.md`
- `docs/30-versioning-idempotency-replay.md`
- `docs/31-conformance-matrix.md`

### Authorization and delegation

- `docs/32-effective-authorization-model.md`
- `docs/33-capability-grammar.md`
- `docs/34-constraint-algebra.md`
- `docs/35-delegation-attenuation.md`
- `docs/36-action-intent-and-approval.md`
- `docs/37-progressive-consent.md`
- `docs/38-provider-policy-and-relationships.md`
- `docs/39-authorization-evaluation-algorithm.md`

### Trust, federation, and attestation

- `docs/40-trust-domain-model.md`
- `docs/41-federation-protocol.md`
- `docs/42-agent-instance-enrollment.md`
- `docs/43-runtime-attestation.md`
- `docs/44-key-lifecycle.md`
- `docs/45-federated-token-exchange.md`
- `docs/46-trust-decision-algorithm.md`
- `docs/47-spiffe-workload-bridge.md`

## Hard protocol invariants

The following rules are architectural invariants. Do not change one incidentally.

### Identity

1. An Agent Principal and an OAuth client are different concepts.
2. An Agent Principal and an Agent Instance are different concepts.
3. A represented Subject and an Agent Actor are different concepts.
4. Global Agent identity is issuer-qualified.
5. A bare `agent_id` is not globally unique.
6. Browser state, cookies, User-Agent strings, and automation fingerprints are not durable Agent identity.

Canonical identity:

```text
Agent Principal = (agent_issuer, agent_id)
Agent Instance  = (agent_issuer, instance_id)
```

### Delegated authority

For delegated access, preserve both:

```text
Subject = represented principal
Actor   = AI Agent Principal
```

Do not collapse the Actor into the Subject.

A valid user credential does not erase the Agent Actor.

### Authorization

Effective authority narrows. It does not accumulate by union.

```text
Requested Authority
INTERSECT Subject Authority
INTERSECT Delegation Grant
INTERSECT Agent Local Authority
INTERSECT Provider Policy Allow
INTERSECT Runtime Authority
MINUS Provider Policy Deny
```

Provider deny policy has final precedence.

A valid upstream token never forces a Provider to allow an action.

### Delegation attenuation

A child grant may stay equal or become narrower.

It must not:

- add an Action
- add a Resource
- relax a Constraint
- outlive the parent
- increase remaining delegation depth
- recover authority removed by another layer
- union independent parent grants into a broader grant

Unknown authority-bearing Constraint semantics fail closed.

### Trust

These statements are not equivalent:

```text
valid signature
trusted issuer
trusted Agent Principal
trusted Agent Instance
accepted runtime attestation
authorized action
```

Every transition requires policy.

### Federation

AgentAuth has no mandatory global root of trust.

Federation is:

- explicit
- directional
- purpose-bound
- revocable
- non-transitive by default

Do not infer:

```text
A trusts B
B trusts C
therefore A trusts C
```

A broker may terminate a foreign trust path by making a new local trust decision. That is not hidden transitive trust.

### Runtime attestation

Runtime Attestation is a trust input.

It does not grant permission.

Strong attestation must not increase:

- Subject Authority
- Delegation Grant authority
- Direct Entitlement
- Agent Local Authority
- Provider permission

### Keys

Agent Instance Proof Keys and Authority Signing Keys are different key classes.

Do not reuse one conceptual key role for both.

Enrollment requests must never contain private key material.

Secrets, private keys, refresh tokens, session cookies, and reusable credentials must not be placed in model-visible context, logs, examples, tests, or documentation.

### Downgrade protection

Do not silently downgrade:

- from native AgentAuth to legacy browser mode
- from proof-bound credentials to bearer credentials
- from delegated authority to direct authority
- from required attestation to no attestation
- from a required conformance profile to a weaker profile

If the requested security property cannot be satisfied, return an explicit failure or challenge.

## Standards policy

AgentAuth is standards-first.

Prefer stable standards over AgentAuth-specific mechanisms when the standard already solves the problem.

Current stable foundations include OAuth, OpenID Connect, Token Exchange, DPoP, mTLS, OAuth metadata, Rich Authorization Requests, RATS, EAT, and SPIFFE concepts.

### Stable standard

A published RFC or stable specification can be a normative dependency when the design explicitly adopts it.

### Internet-Draft or emerging proposal

Treat as research input unless the repository explicitly says otherwise.

Do not write:

> AgentAuth requires draft X

when the source is still an Internet-Draft.

Prefer:

> AgentAuth tracks draft X as an interoperability input.

### External projects

Projects under `docs/research/` may inspire design questions.

Never copy their architecture blindly.

Record:

- what was observed
- what AgentAuth adopted
- what AgentAuth rejected
- where the semantics differ

Do not claim another project's work as original AgentAuth design.

## Research requirements

When a task depends on a current RFC, Internet-Draft, product behavior, protocol version, library, or external repository:

1. fetch current source material
2. prefer primary sources
3. record material design influence in `docs/research/` when appropriate
4. distinguish stable standards from drafts
5. avoid claims stronger than the evidence

For security-sensitive claims, do not rely on memory when current verification is available.

## Change contract

Before editing protocol semantics, identify all affected layers.

A semantic change may require synchronized updates to:

- normative prose
- ADR
- JSON Schema
- example fixture
- error registry
- conformance matrix
- tests
- `CONTEXT.md`
- README or guide copy
- `llms.txt` or `llms-full.txt`
- checksums
- design provenance

Do not update one layer and leave contradictory semantics elsewhere.

## When to write an ADR

Create or update an ADR when the change makes a durable architectural choice involving:

- identity boundaries
- trust boundaries
- token semantics
- delegation semantics
- security downgrade behavior
- federation behavior
- key ownership or lifecycle
- portable versus Provider-local policy
- normative standards dependency

An ADR should state:

- context
- decision
- consequences
- rejected alternative when materially useful

Do not use ADRs as changelogs.

## Schema rules

JSON Schemas are security contracts.

When changing a schema:

1. validate positive fixtures
2. add at least one negative test for the dangerous invalid case
3. keep `additionalProperties` deliberate
4. do not make security-critical fields optional for convenience
5. preserve issuer qualification where identity is cross-domain
6. reject private key material
7. reject unknown mandatory semantics where the profile requires fail-closed behavior

A schema passing AJV does not prove the protocol semantics are safe. Pair schema tests with semantic conformance tests.

## Test expectations

Use the repository's Bun test suite.

Baseline:

```bash
bun install
bun test
bun run validate:checksums
```

Before claiming a change is complete:

- all tests must pass on the exact final head
- SHA-256 integrity must pass
- new semantic rules need regression coverage
- security-sensitive fixes need negative tests
- review findings must be resolved or explicitly rejected with evidence

Do not describe a PR as clean based on stale checks from an earlier commit.

## Integrity manifest

`SHA256SUMS.txt` protects selected design and publication artifacts.

If you modify a tracked file, update its checksum.

If a new artifact should be protected as part of the published protocol surface, add it to the manifest.

Do not weaken the integrity test to make a checksum failure disappear.

## Security review checklist

For protocol or schema changes, ask:

- Can Agent and Subject become confused?
- Can a bare identifier collide across issuers?
- Can authority broaden?
- Can a child grant escape its parent?
- Can a Provider be forced to trust an issuer?
- Can trust become transitive accidentally?
- Can attestation become permission?
- Can a replay create a second side effect?
- Can proof be detached from the Agent Instance?
- Can a private key or reusable secret reach logs or model context?
- Can a failure silently downgrade security?
- Can browser compatibility mode be mistaken for native Agent identity?

If any answer is uncertain, stop the semantic change and investigate.

## Error semantics

Use the normative error registry.

Do not invent ad hoc error strings in one example or SDK contract.

Errors should distinguish actionable categories without exposing sensitive Provider policy.

Unknown mandatory protocol semantics should fail closed.

## Browser and automation rules

Browser automation is an execution channel, not identity.

Native Login as Agent requires the target or an enforcing trusted gateway to preserve the Agent security context.

Legacy browser compatibility must not be described as equivalent assurance.

Do not add:

- CAPTCHA bypass
- credential theft
- cookie extraction intended to impersonate humans
- anti-bot evasion
- hidden human-account takeover techniques

Use human handoff when interactive verification is required.

## Publication rules

The README is a landing page, not the full specification.

Keep it:

- concise
- technically accurate
- answer-first
- easy to scan
- linked to canonical normative documents

Do not turn the README into a second copy of every spec document.

### Search and AI discovery

Use real topic language naturally:

- AI agent authentication
- AI agent identity
- agent authorization
- Login as Agent
- agent delegation
- non-human identity
- AI agent federation
- runtime attestation
- MCP authorization

Do not create near-duplicate pages for keyword variations.

Do not claim `llms.txt` is a ranking factor.

Do not claim search engines or LLMs will recommend AgentAuth because metadata exists.

### Citation and authorship

Preserve:

- `CITATION.cff`
- `NOTICE`
- `AUTHORS.md`
- `DESIGN_PROVENANCE.md`
- `ATTRIBUTION.md`
- `LICENSE-DOCS.md`

Do not remove attribution required by the applicable license.

Do not convert provenance language into unsupported claims of ownership over pre-existing standards or abstract ideas.

## README design rules

The README should explain the idea before listing the machinery.

The first screen should answer:

1. What is AgentAuth?
2. Why is it different from ordinary user/client access?
3. What should I read next?

Prefer one strong diagram over several decorative diagrams.

Do not add badges that do not help a reader make a decision.

Do not use generic claims such as:

- enterprise-grade
- revolutionary
- next-generation
- seamless
- robust
- cutting-edge
- game-changing

unless the repository contains evidence that makes the wording specific and necessary.

## Agent behavior by task type

### Research agent

Output evidence and design implications.

Do not mutate normative files unless the task authorizes it.

### System-design agent

May update normative docs, ADRs, schemas, examples, and conformance tests.

Must check cross-document consistency.

### Implementation agent

Do not start implementation merely because `implementation/` contains plans.

Require an implementation task or issue.

Follow TDD for runtime behavior changes.

### Review agent

Review the actual head SHA.

Prioritize:

1. security boundary violations
2. semantic inconsistency
3. standards errors
4. conformance gaps
5. broken examples or schemas
6. publication quality

Do not block on subjective formatting if semantics and repository conventions are correct.

### Documentation agent

May improve explanation and navigation.

Must not redefine normative semantics.

If explanatory text conflicts with normative text, fix the explanatory text unless the task explicitly changes the protocol.

## Git and pull request workflow

Unless the task explicitly says otherwise:

1. start from current `main`
2. create a focused branch
3. keep the PR scoped to one design objective
4. use descriptive commit messages
5. run verification on the final head
6. inspect review threads
7. merge only when the current task explicitly authorizes merge

Do not push speculative protocol design directly to `main`.

Do not merge a head different from the one that passed final verification.

When merge tooling supports it, use an expected-head SHA guard.

## Definition of done

A change is done only when:

- the requested outcome exists in the repository
- semantics are consistent across affected files
- tests pass on the final head
- integrity checks pass
- no unresolved actionable review findings remain
- security implications were considered
- current standards claims are sourced when relevant
- publication artifacts remain accurate if public terminology changed
- the PR description explains the decision, not only the files changed

For security-sensitive protocol work, "the document reads well" is not enough.

The repository must remain internally coherent.
