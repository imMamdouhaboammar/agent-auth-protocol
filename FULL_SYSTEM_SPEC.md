# AgentAuth Full System Specification

Version 0.1, generated 2026-10-05.


---

<!-- Source: README.md -->

# AgentAuth Protocol & Platform
Status: Draft system design v0.1  
Date: 2026-10-05

## Purpose

AgentAuth is a deployable authentication, authorization, delegation, and audit system for AI agents.

The core problem is not browser automation. The core problem is identity:

- a service must be able to distinguish a human, a traditional workload, and an AI agent
- an AI agent must have its own cryptographic identity
- an agent acting for a human or organization must carry explicit delegated authority
- the delegated authority must be narrower than the delegator's authority
- every privileged action must be attributable to the human or organization, the agent, the running agent instance, and the grant that authorized the action
- browser, API, MCP, and agent-to-agent access must converge on the same identity and policy model
- the platform must be deployable globally, regionally, on-premises, or in sovereign environments without requiring one global central root

This package specifies the product, trust model, protocols, browser integration, MCP integration, policy model, threat model, data model, deployment model, testing strategy, and implementation work graph.

## Design position

AgentAuth is intentionally built on existing identity standards instead of inventing a parallel authentication stack.

Core standards used by the design:

- OAuth 2.0 and the OAuth 2.0 Security Best Current Practice
- OpenID Connect where identity assertions are required
- OAuth 2.0 Token Exchange for delegation
- DPoP or mTLS for sender-constrained tokens
- Rich Authorization Requests for structured authorization details
- JWT access token profiles where self-contained tokens are appropriate
- SPIFFE concepts for workload identity and federated trust domains
- MCP authorization as an integration profile, not as the core identity model

Emerging AI-agent identity drafts are treated as research inputs, not stable dependencies.

## The most important distinction

AgentAuth separates five entities that are commonly collapsed into "the agent":

1. Agent Definition: the registered software identity and declared capabilities.
2. Agent Principal: the durable security principal used in authorization.
3. Agent Instance: one running copy of an agent with its own key and runtime evidence.
4. Delegator or Subject: the human, organization, or workload on whose behalf the agent may act.
5. Execution Session: a short-lived, audience-bound authorization context derived from a grant.

This separation is the basis for revocation, audit, multi-agent delegation, runtime compromise recovery, and target-side disclosure.

## Access modes

AgentAuth supports four access modes.

### 1. Native Agent Auth

The target application directly verifies AgentAuth credentials and sees an explicit agent actor.

This is the highest-assurance path.

### 2. OAuth/OIDC or MCP delegation

The target accepts standards-based access tokens. AgentAuth uses token exchange and structured authorization to represent the human or organization as subject and the AI agent as actor.

### 3. Agent-aware browser session

The target application adds an agent session bootstrap endpoint or AgentAuth SDK. The agent exchanges a verified access token for a browser session whose server-side session record is marked as an AI agent session.

### 4. Legacy browser bridge

A managed browser interacts with a target that has no AgentAuth integration. AgentAuth can still protect credentials, bind the runtime, enforce coarse policy, and keep a complete audit trail. It cannot truthfully claim the target application itself knows the caller is an AI agent unless the target cooperates.

## Global deployment model

AgentAuth uses regional or organizational trust domains. A deployment may be:

- public multi-tenant SaaS
- dedicated single-tenant cloud
- regional cell
- sovereign cloud
- on-premises Kubernetes
- private data center

Federation is explicit. No mandatory global control plane is required.

## Package map

- `CONTEXT.md`: canonical domain language
- `docs/00-product-vision.md`: product scope and success criteria
- `docs/01-requirements.md`: normative requirements
- `docs/02-domain-model.md`: entities, invariants, and state machines
- `docs/03-system-architecture.md`: logical architecture and trust boundaries
- `docs/04-protocol-design.md`: token and protocol profiles
- `docs/05-native-login-as-agent.md`: native browser login flow
- `docs/06-browser-bridge.md`: legacy browser compatibility
- `docs/07-mcp-api-integration.md`: MCP and API integration
- `docs/08-policy-consent-delegation.md`: consent, authorization, and delegation
- `docs/09-security-threat-model.md`: threat model and security controls
- `docs/10-data-model.md`: persistence model
- `docs/11-deployment-federation.md`: global deployment and federation
- `docs/12-observability-audit.md`: audit and operational telemetry
- `docs/13-test-conformance.md`: conformance and verification suite
- `docs/14-roadmap.md`: staged product roadmap
- `docs/15-operations-runbook.md`: operational requirements
- `docs/16-standards-mapping.md`: standards status and design mapping
- `docs/adr/`: architectural decisions
- `api/openapi.yaml`: public management and integration API draft
- `schemas/`: JSON Schemas
- `examples/`: worked token and flow examples
- `security/`: abuse cases and privacy requirements
- `goals/ZZZOPS_GOAL_DAG.md`: implementation outcome DAG
- `implementation/PLAN.md`: implementation plan
- `deploy/reference-topology.md`: reference deployment topology

## Normative language

The terms MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are used as design requirements inside this package. This document is a product specification, not an Internet standard.

## Non-goals

The first implementation does not attempt to:

- bypass CAPTCHAs or anti-bot controls
- conceal that a caller is an agent from an integrated target
- make a non-integrated target magically aware of agent identity
- store passwords or refresh tokens inside model context
- create a global mandatory identity root
- replace enterprise IdPs
- grant an agent every permission the user has
- infer authorization directly from natural-language prompts
- treat a browser cookie as durable identity
- rely on a single model vendor or agent framework


---

<!-- Source: CONTEXT.md -->

# AgentAuth Domain Context

This file contains domain language only. It intentionally avoids implementation technologies.

## Agent Definition

A registered description of an AI agent product or software identity. It represents what the agent is, not a specific running process.

## Agent Principal

The durable security principal representing an Agent Definition in authorization decisions.

## Agent Instance

One running execution of an Agent Principal. An Agent Instance has an independent cryptographic key and lifecycle. Multiple Agent Instances may belong to one Agent Principal.

## Runtime Attestation

Evidence about the environment in which an Agent Instance is running. Attestation may be absent, software-backed, workload-backed, or hardware-backed.

## Subject

The principal whose resources or authority are being exercised. A Subject can be a human, organization, service account, or an Agent Principal.

## Delegator

The principal that intentionally grants authority to another principal. A Delegator may be the Subject or an administrator authorized to act for the Subject.

## Actor

The principal currently exercising authority. In the delegated AgentAuth case, the Actor is normally an Agent Principal.

## Delegation Grant

A revocable authorization object that states what an Actor may do for a Subject, against which Resources, under which Constraints, until which time, and whether further delegation is allowed.

## Capability

A structured permission to perform a named Action against a Resource class or Resource instance under explicit Constraints.

## Constraint

A machine-evaluable restriction on a Capability. Examples include amount limit, time window, destination allowlist, data classification, geographic condition, rate limit, or required approval level.

## Resource

A protected system, API, application, account, dataset, tool, or object that receives or is affected by an action.

## Resource Server

A system that accepts AgentAuth-compatible authorization and makes access-control decisions.

## Authorization Server

The issuer that validates identities and grants, applies authorization policy, and issues access credentials.

## Trust Domain

An administrative security namespace with its own issuing authority and trust anchors.

## Federation

An explicit trust relationship through which one Trust Domain accepts selected identity or authorization assertions from another Trust Domain.

## Agent Session

A short-lived authorization context for an Agent Instance. An Agent Session is derived from an Agent Principal, a Delegation Grant or direct entitlement, a specific audience, and runtime key proof.

## Browser Session

A target-application session used through a web browser. A Browser Session is not itself an Agent Identity.

## Native Agent Session

A Browser Session created by a target application after validating an AgentAuth credential and intentionally marking the server-side session as agent-operated.

## Legacy Browser Session

A Browser Session at a target that does not understand AgentAuth. AgentAuth may operate the browser safely, but the target has no guaranteed awareness of Agent Identity.

## Action

A normalized operation that can be authorized and audited. Examples: `invoice.read`, `email.send`, `payment.create`, `crm.contact.update`, `browser.form.submit`.

## Action Intent

A structured request describing a proposed Action before execution. It is distinct from the raw natural-language prompt.

## Action Digest

A cryptographic digest over the security-relevant normalized Action Intent used to bind approvals or audit evidence to the exact action.

## Policy Decision

An authorization result of `allow`, `deny`, or `step_up`, together with reasons, matched policy versions, and required obligations.

## Step-up Approval

Additional human or organizational approval required for a specific Action Intent or class of actions.

## Credential Vault

A security boundary that stores secrets and cryptographic material outside model context and releases them only to authorized runtime components.

## Agent-aware Target

A Resource Server or application that intentionally validates AgentAuth credentials or receives identity from a trusted AgentAuth gateway.

## Integration Profile

A defined method by which a target integrates with AgentAuth, such as API, MCP, native browser, reverse proxy, or federation.

## Attenuation

The rule that delegated authority can only stay equal or become narrower. A child grant can never expand the parent grant's resources, actions, constraints, lifetime, or delegation depth.

## Direct Agent Authority

Authority assigned directly to an Agent Principal without a human Subject. This is appropriate for organization-owned automation operating within its own assigned privileges.

## Delegated Agent Authority

Authority exercised by an Agent Principal on behalf of another Subject. The authorization evidence identifies both Subject and Actor.


---

<!-- Source: docs/00-product-vision.md -->

# Product Vision

## Problem

Personal AI assistants and autonomous agents increasingly need to perform real actions across APIs, MCP servers, SaaS products, internal applications, and browser-only systems.

Traditional authentication models have several weaknesses for this use case:

- service accounts identify software but usually do not express human delegation or intent
- user sessions identify the user but often hide the fact that software is acting
- OAuth clients identify an application but not necessarily a specific AI agent and its running instance
- browser automation frequently reuses human credentials without a target-visible agent identity
- API keys do not express subject, actor, purpose, or delegation chains
- multi-agent workflows can create unclear responsibility and accidental privilege amplification
- a compromised agent runtime can reuse bearer credentials unless tokens are sender-constrained
- existing audit logs often record only "user X did action Y" even when an autonomous agent actually performed it

## Product thesis

AgentAuth should make an AI agent a first-class security actor without breaking the existing identity ecosystem.

The platform should answer five questions for every privileged action:

1. Who owns or registered this agent?
2. Which exact agent is acting?
3. Which running instance is presenting the credential?
4. On whose behalf is it acting?
5. What grant and policy authorized this specific action?

## Primary users

### Application developers

They need a way to let AI agents sign in without pretending to be humans.

### Enterprise identity and security teams

They need agent inventory, policy, revocation, audit, federation, and integration with existing IdPs.

### Agent platform developers

They need a portable method to obtain narrowly scoped credentials for APIs, MCP servers, and browser applications.

### SaaS and API providers

They need a deterministic way to know whether a caller is a human, service workload, or AI agent.

## Success criteria

An initial production release is successful when:

- an Agent Principal can be registered and cryptographically bound to Agent Instances
- a human or organization can create a constrained Delegation Grant
- an Agent Instance can exchange that grant for a short-lived, audience-bound, sender-constrained token
- an integrated Resource Server can identify Subject and Agent Actor separately
- a target application can create a browser session explicitly marked as agent-operated
- an MCP server can enforce the same grant model
- a grant can be revoked and new access rejected within a defined revocation window
- high-risk actions can require transaction-bound step-up approval
- every decision can be reconstructed from immutable audit records without storing raw credentials
- the system can be deployed in more than one region or organization without a mandatory global database

## Product principles

### Explicit actor identity

A delegated token must not collapse an agent into the user identity.

### Least authority by construction

Child grants and issued tokens may only reduce authority.

### Short-lived credentials

Long-lived authority lives in revocable grants, not long-lived bearer tokens.

### Proof of possession

Access credentials should be bound to the Agent Instance key whenever the integration permits it.

### Policy outside the model

The model may request an action, but the model is not the final authorization authority.

### Browser is a compatibility layer

Browser automation is supported, but it must not become the canonical identity primitive.

### Regional autonomy

A deployment can keep identities, grants, credentials, and logs inside a chosen region or organization.

### Standards first

Stable Internet standards are preferred. Emerging agent-specific drafts inform extension points but do not become mandatory dependencies until mature.

## Non-goals for v1

- general-purpose secrets manager
- identity proofing of natural persons
- consumer social login provider
- CAPTCHA solving
- covert bot detection evasion
- fully semantic authorization for arbitrary legacy web pages
- mandatory blockchain or decentralized identity
- mandatory global directory of all agents


---

<!-- Source: docs/01-requirements.md -->

# Normative Requirements

## Identity

ID-001: Every Agent Principal MUST have a globally unique issuer-qualified identifier.

ID-002: Every Agent Instance MUST have an independent cryptographic key or a verifiable workload identity from which a proof key can be derived.

ID-003: Agent Instance credentials MUST be revocable independently of the parent Agent Principal.

ID-004: The platform MUST distinguish at minimum: human, organization, workload, and AI agent actor types.

ID-005: A Resource Server MUST NOT infer "AI agent" solely from a user-agent string.

ID-006: Agent identity metadata MUST be versioned.

## Delegation

DEL-001: A Delegation Grant MUST identify Subject, Actor, audience or resource constraints, allowed actions, expiry, and grant status.

DEL-002: A delegated credential MUST preserve the distinction between Subject and Actor.

DEL-003: Any child delegation MUST be an attenuation of its parent.

DEL-004: Delegation depth MUST be explicitly bounded.

DEL-005: Revoking a parent grant MUST invalidate future use of all descendants.

DEL-006: Grant evaluation MUST be independent of the model's free-form text.

DEL-007: High-risk grants SHOULD contain structured authorization details rather than broad scopes alone.

## Tokens

TOK-001: Access tokens MUST be audience restricted.

TOK-002: Access tokens SHOULD be sender-constrained using DPoP or mTLS where supported.

TOK-003: Access token lifetime SHOULD default to five minutes or less for agent-initiated privileged actions.

TOK-004: Refresh tokens MUST NOT be exposed to model context.

TOK-005: Refresh tokens, if issued, MUST be sender-constrained or rotation-protected.

TOK-006: Delegated JWT access tokens SHOULD use the standard `act` claim semantics from OAuth Token Exchange.

TOK-007: Custom AgentAuth claims MUST be collision resistant and versioned.

TOK-008: A Resource Server MUST reject tokens whose issuer, audience, signature, time bounds, proof binding, or grant status are invalid.

## Policy

POL-001: Default policy MUST be deny.

POL-002: Policy MUST evaluate Actor, Subject, Agent Instance, Resource, Action, grant constraints, and contextual risk.

POL-003: Authorization MUST support `allow`, `deny`, and `step_up`.

POL-004: A step-up approval for a sensitive transaction MUST be bound to an Action Digest.

POL-005: Policy evaluation MUST produce a machine-readable reason code.

POL-006: Policy changes MUST be versioned and recorded.

POL-007: Emergency kill controls MUST exist at tenant, Agent Principal, Agent Instance, and grant levels.

## Browser

BRW-001: Credentials MUST NOT be copied into model-visible DOM, logs, prompts, or screenshots unless explicitly required and policy allows it.

BRW-002: The managed browser MUST run in an isolated execution environment.

BRW-003: Native Agent Session integration MUST let the target application distinguish agent-operated sessions server-side.

BRW-004: Legacy browser mode MUST be labeled lower assurance.

BRW-005: The system MUST NOT claim that a non-integrated target knows a caller is an agent.

BRW-006: CAPTCHA or explicit anti-automation challenges MUST trigger human handoff or failure, not automated bypass.

BRW-007: Browser cookies MUST be scoped to one target profile and Agent Instance session.

BRW-008: Session export across tenants MUST be prohibited.

## MCP

MCP-001: MCP authorization MUST map to the same Agent Principal and Delegation Grant model used for ordinary APIs.

MCP-002: MCP server access MUST not create a second independent source of authorization truth.

MCP-003: Insufficient scope responses SHOULD support scope step-up without silently broadening the original grant.

MCP-004: MCP client credentials MUST be issuer-bound.

## Audit

AUD-001: Authentication, grant issuance, token exchange, policy decisions, approvals, revocations, browser session creation, and high-risk actions MUST emit audit events.

AUD-002: Audit events MUST include tenant, trace, Actor, Subject, Agent Instance, grant, resource, action, decision, policy version, and timestamp where applicable.

AUD-003: Tokens, passwords, private keys, and raw refresh tokens MUST NOT be logged.

AUD-004: Audit storage MUST support tamper evidence.

AUD-005: Security-relevant events SHOULD be exportable to external SIEM systems.

## Privacy

PRI-001: Raw user prompts MUST NOT be required for authorization.

PRI-002: Consent evidence SHOULD store structured authorization and a digest of relevant intent rather than full conversation content by default.

PRI-003: Tenant data residency MUST be configurable.

PRI-004: Cross-region replication MUST be explicit and policy controlled.

PRI-005: Audit retention MUST be configurable independently from operational telemetry retention.

## Deployment

DEP-001: The system MUST support single-region deployment without external global dependencies.

DEP-002: The system MUST support multiple Trust Domains.

DEP-003: Federation MUST be explicit and deny by default.

DEP-004: Private signing keys MUST be held by KMS, HSM, or equivalent protected key storage in production.

DEP-005: No shared signing key may be used across unrelated tenants.

DEP-006: A regional cell MUST remain capable of validating locally issued tokens during temporary loss of global management connectivity.

## Availability and performance targets

PERF-001: Local token validation at a Resource Server SHOULD not require a synchronous authorization-server call for every request.

PERF-002: Online policy checks required for high-risk actions SHOULD target p95 latency below 100 ms inside the same region.

PERF-003: Revocation propagation for high-risk grants SHOULD target less than 30 seconds inside a region.

PERF-004: Signing-key rotation MUST allow overlap so valid in-flight tokens remain verifiable.

## Administrative controls

ADM-001: Operators MUST be able to list all Agent Principals and Agent Instances for a tenant.

ADM-002: An administrator MUST be able to disable an Agent Principal without deleting audit history.

ADM-003: Owners MUST be able to inspect grants issued to agents acting for them.

ADM-004: Grant creation and approval MUST expose human-readable summaries of structured permissions.

ADM-005: The platform MUST provide a machine-readable integration metadata document.


---

<!-- Source: docs/02-domain-model.md -->

# Domain Model

## Entity graph

```mermaid
flowchart LR
  Owner[Owner or Publisher] --> AD[Agent Definition]
  AD --> AP[Agent Principal]
  AP --> AI1[Agent Instance A]
  AP --> AI2[Agent Instance B]
  Subject[Subject] --> Grant[Delegation Grant]
  AP --> Grant
  Grant --> Session[Agent Session]
  AI1 --> Session
  Session --> Token[Access Credential]
  Token --> RS[Resource Server]
  Grant --> Policy[Policy Evaluation]
  Policy --> RS
```

## Agent Definition

Fields:

- `agent_definition_id`
- publisher identity
- display name
- software version policy
- declared integration capabilities
- allowed runtime attestation classes
- metadata version
- status

The Agent Definition is descriptive and administrative. It is not a bearer of permissions.

## Agent Principal

Fields:

- `agent_id`
- issuer or Trust Domain
- parent Agent Definition
- owner tenant
- status
- trust metadata
- allowed delegation depth ceiling
- created and disabled timestamps

Security invariant:

Deleting or changing the display metadata of an Agent Definition MUST NOT silently change the security identity of the Agent Principal.

## Agent Instance

Fields:

- `instance_id`
- `agent_id`
- public proof key
- optional workload identity
- optional attestation evidence reference
- runtime class
- region
- first seen
- last seen
- status

Lifecycle:

```mermaid
stateDiagram-v2
  [*] --> Pending
  Pending --> Active: bootstrap verified
  Pending --> Rejected: verification failed
  Active --> Rotating: key rotation
  Rotating --> Active: new key confirmed
  Active --> Suspended: policy or incident
  Suspended --> Active: administrative recovery
  Active --> Revoked: compromise or retirement
  Suspended --> Revoked
  Revoked --> [*]
```

An Agent Instance is the unit of runtime compromise response.

## Delegation Grant

A grant is not an access token. It is durable, revocable authorization state from which short-lived credentials are derived.

Core fields:

- `grant_id`
- `issuer`
- `subject`
- `actor_agent_id`
- `parent_grant_id` if delegated by another agent
- `resource_selectors`
- `capabilities`
- `constraints`
- `not_before`
- `expires_at`
- `max_delegation_depth`
- `approval_mode`
- `status`
- `policy_snapshot_ref`
- `created_by`
- `approved_by`
- `revoked_at`
- `revocation_reason`

### Attenuation rule

For child grant `C` derived from parent `P`:

- `C.resources` MUST be a subset of `P.resources`
- `C.actions` MUST be a subset of `P.actions`
- `C.expiry` MUST be no later than `P.expiry`
- `C.constraints` MUST be equal or stricter
- `C.max_delegation_depth` MUST be lower
- `C.subject` MUST remain within the subject relationship allowed by `P`
- `C` MUST NOT remove a mandatory step-up condition inherited from `P`

The attenuation evaluator is a security-critical deep module and should be property-tested.

## Capability

A capability is represented as:

```json
{
  "action": "payment.create",
  "resources": ["urn:bank:account:123"],
  "constraints": {
    "max_amount": {"currency": "USD", "value": "500.00"},
    "recipient_allowlist": ["urn:payee:vendor-42"],
    "requires_approval_over": {"currency": "USD", "value": "100.00"}
  }
}
```

Capability semantics are resource-specific. AgentAuth defines the envelope and comparison rules, while each integration profile defines action vocabularies and constraint types.

## Action Intent

Action Intent is a normalized pre-execution object.

Example:

```json
{
  "action": "email.send",
  "resource": "urn:mailbox:user-7",
  "parameters": {
    "to": ["finance@example.test"],
    "attachment_classes": ["internal"]
  },
  "purpose": "invoice-follow-up",
  "requested_at": "2026-10-05T10:00:00Z"
}
```

The model can propose an Action Intent, but an enforcement point must validate it.

## Action Digest

The digest binds approval to the exact security-relevant representation:

1. Normalize using deterministic JSON canonicalization.
2. Exclude non-security metadata such as UI labels.
3. Hash with a modern cryptographic hash.
4. Store the digest in approval evidence and audit events.

Any change to recipient, amount, target resource, or action invalidates the approval.

## Trust tiers

The system may expose a tenant-defined trust tier, but trust tiers MUST NOT be treated as global facts.

Suggested local tiers:

- T0: registered Agent Principal, no runtime key assurance
- T1: instance key proven and sender-constrained
- T2: workload identity verified
- T3: hardware or confidential-compute attestation verified

A Resource Server can require a minimum tier for specific actions.

## Direct and delegated authority

### Direct Agent Authority

Use when an organization grants an agent its own privileges.

Security representation:

- token subject is the Agent Principal
- no human delegation is implied
- audit still records owner and Agent Instance

### Delegated Agent Authority

Use when an agent acts for a human or organization.

Security representation:

- token top-level subject identifies the represented Subject
- token actor identifies the Agent Principal
- AgentAuth extension claims identify Agent Instance and grant

This mirrors established OAuth delegation semantics and prevents loss of accountability.


---

<!-- Source: docs/03-system-architecture.md -->

# System Architecture

## Architecture goal

Keep identity, delegation, policy, and audit coherent while allowing API, MCP, browser, and agent-to-agent access to use different adapters.

The architecture is split into four planes.

## 1. Trust plane

Responsibilities:

- Trust Domain identity
- signing keys
- key rotation
- JWKS publication
- workload identity integration
- Agent Instance bootstrap
- optional runtime attestation
- federation metadata

Core modules:

- Trust Domain Manager
- Key Authority
- Instance Attestation Verifier
- Federation Trust Store

## 2. Control plane

Responsibilities:

- Agent Registry
- grant lifecycle
- human and organization consent
- authorization server
- token exchange
- policy decision
- revocation
- administrative controls
- audit metadata

Recommended initial deployment is a modular control-plane application with deep internal modules, not a microservice per noun.

Logical modules:

- `registry`
- `grants`
- `authorization`
- `policy`
- `revocation`
- `audit`
- `federation`

Each module has one narrow public interface. Internal persistence details stay private.

## 3. Runtime plane

Responsibilities:

- hold Agent Instance proof key
- request credentials
- sign DPoP proofs or use mTLS
- protect refresh credentials
- translate agent action requests into structured Action Intents
- enforce local policy obligations
- broker MCP and API credentials
- request browser sessions

Components:

- Runtime Identity Broker
- Credential Vault Adapter
- Action Guard
- Browser Controller
- MCP/Auth Adapter

The language model never receives private keys or raw refresh credentials.

## 4. Resource plane

Responsibilities:

- validate access token
- verify proof binding
- identify Subject and Actor
- evaluate local authorization
- optionally call central PDP for contextual checks
- create native browser sessions
- emit resource-side audit evidence

Integration forms:

- application SDK
- API gateway plugin
- reverse proxy
- MCP server middleware
- native browser session endpoint

## Context diagram

```mermaid
flowchart TB
  H[Human or Organization] --> CP[AgentAuth Control Plane]
  P[Agent Publisher] --> CP
  R[Agent Runtime] --> TB[Runtime Identity Broker]
  TB --> CP
  CP --> KMS[KMS or HSM]
  CP --> DB[(Regional State)]
  CP --> AUD[(Audit Store)]
  TB --> API[API Resource Server]
  TB --> MCP[MCP Server]
  TB --> B[Managed Browser]
  B --> WEB[Web Application]
  API --> CP
  MCP --> CP
  WEB --> CP
  CP <--> FED[Other Trust Domain]
```

## Trust boundaries

### TB-1: Human to control plane

Human authentication is delegated to an enterprise or consumer IdP where possible. AgentAuth should not become the primary password database.

### TB-2: Agent runtime to Runtime Identity Broker

The runtime proves possession of the Agent Instance key or local workload identity.

### TB-3: Runtime Identity Broker to authorization server

Mutually authenticated or sender-constrained credential exchange.

### TB-4: Resource Server to AgentAuth issuer

The Resource Server trusts selected issuer keys and metadata. Federation is explicit.

### TB-5: Model process to credential boundary

The model process is considered potentially influenced by untrusted content. Secrets stay across this boundary.

### TB-6: Managed browser to target

For native AgentAuth integration, the target verifies agent identity. For legacy mode, target awareness is not guaranteed.

## Reference module interfaces

### Registry

```text
register_agent(definition, owner) -> AgentPrincipal
register_instance(agent_id, proof_key, runtime_evidence) -> AgentInstance
rotate_instance_key(instance_id, new_proof_key, evidence) -> InstanceKeyVersion
disable_agent(agent_id, reason) -> Status
```

### Grants

```text
create_grant(subject, actor, authorization_details, constraints) -> PendingGrant
approve_grant(grant_id, approver, evidence) -> ActiveGrant
derive_grant(parent_grant_id, child_request) -> ActiveGrant
revoke_grant(grant_id, reason) -> RevocationResult
```

### Authorization

```text
exchange(subject_credential, actor_credential, audience, authorization_details, proof) -> AccessCredential
introspect(token_or_reference) -> ActiveAuthorization
```

### Policy

```text
decide(actor, subject, instance, grant, action_intent, context) -> PolicyDecision
```

### Session Broker

```text
create_native_browser_bootstrap(access_credential, target) -> OneTimeBootstrap
redeem_native_browser_bootstrap(code, proof) -> BrowserSession
```

## State ownership

Authoritative state:

- PostgreSQL or equivalent transactional relational store for registry, grants, policy metadata, revocation, and configuration
- KMS/HSM for issuer signing keys
- external object/WORM storage for signed audit batches
- cache may accelerate validation but MUST NOT become the only source of revocation truth

## Event propagation

Use a transactional outbox from authoritative state to publish:

- `agent.changed`
- `instance.revoked`
- `grant.approved`
- `grant.revoked`
- `policy.published`
- `key.rotated`

Consumers use idempotent event handlers.

## Failure strategy

### Control plane unavailable

Resource Servers MAY continue offline validation of unexpired low-risk access tokens according to tenant policy.

High-risk actions that require online policy or revocation freshness MUST fail closed.

### Revocation stream delayed

Tokens with short lifetimes limit exposure. High-risk integrations SHOULD use online introspection or a rapidly refreshed revocation feed.

### KMS unavailable

No new signed credentials are issued. Existing Resource Servers can validate already issued credentials using cached public keys.

### Regional connectivity loss

Each regional cell retains local validation and issuance capability for tenants assigned to that cell if its local key authority and database remain healthy.

## Why not microservices first

The core challenge is correctness of security invariants, not independent scaling of dozens of services.

A modular monolith with strict interfaces reduces:

- distributed transaction complexity
- policy and revocation races
- operational burden
- attack surface
- cross-service semantic drift

Service extraction should happen only when a real scaling or isolation boundary appears.


---

<!-- Source: docs/04-protocol-design.md -->

# Protocol Design

## Design rule

AgentAuth profiles established OAuth and OpenID mechanisms and adds a small set of collision-resistant claims and metadata.

It does not create a new bearer-token transport.

## Credential classes

### 1. Agent Instance Credential

Purpose: authenticate a running Agent Instance to AgentAuth.

Properties:

- bound to one Agent Instance
- short-lived
- proof-of-possession
- not sufficient on its own to access user resources

Possible representations:

- private_key_jwt client authentication
- mTLS client certificate
- SPIFFE X.509 or JWT workload identity exchanged for an AgentAuth credential
- platform attestation plus generated proof key during bootstrap

### 2. Delegation Grant

Purpose: durable, revocable authorization state.

It is not directly presented to Resource Servers unless the integration profile explicitly supports structured grant tokens.

### 3. Resource Access Token

Purpose: short-lived access to one audience.

For delegated authority, the token expresses:

- Subject at top level
- Agent Actor using OAuth `act`
- `client_id`
- scopes and/or authorization details
- proof-key confirmation
- AgentAuth extension claims

### 4. Native Browser Bootstrap Code

Purpose: one-time conversion of a verified agent credential into a target browser session.

Properties:

- one-time use
- target origin bound
- Agent Instance bound
- expires within 60 seconds by default
- contains no reusable credential in the URL after redemption

## Delegated token example

```json
{
  "iss": "https://auth.example.com",
  "sub": "urn:subject:user:123",
  "aud": "https://crm.example.com",
  "client_id": "agent-runtime-client",
  "scope": "contacts.read contacts.update",
  "iat": 1791194400,
  "exp": 1791194700,
  "jti": "tok_01...",
  "act": {
    "sub": "urn:agentauth:agent:agent_01..."
  },
  "cnf": {
    "jkt": "base64url-thumbprint"
  },
  "urn:agentauth:claims:v1": {
    "actor_type": "ai_agent",
    "agent_id": "agent_01...",
    "instance_id": "inst_01...",
    "grant_id": "grant_01...",
    "purpose": "crm-follow-up",
    "delegation_depth": 0,
    "trust_tier": "T2"
  }
}
```

The custom claim object is an AgentAuth profile and is not claimed to be an IETF-standard claim.

## Direct agent token example

When an agent acts under its own organizational entitlement:

```json
{
  "iss": "https://auth.example.com",
  "sub": "urn:agentauth:agent:agent_01...",
  "aud": "https://ops.example.com",
  "scope": "jobs.read jobs.run",
  "urn:agentauth:claims:v1": {
    "actor_type": "ai_agent",
    "agent_id": "agent_01...",
    "instance_id": "inst_01...",
    "authority_mode": "direct"
  }
}
```

## Token exchange profile

AgentAuth uses OAuth Token Exchange semantics for delegated authority.

Conceptual request:

```text
grant_type=urn:ietf:params:oauth:grant-type:token-exchange
subject_token=<credential representing subject authority>
subject_token_type=<type>
actor_token=<Agent Instance credential>
actor_token_type=<type>
resource=https://crm.example.com
authorization_details=[...]
```

Authorization server processing:

1. authenticate the Agent Instance
2. validate Subject credential
3. locate active Delegation Grant
4. verify requested audience
5. prove requested authorization is within grant bounds
6. apply policy
7. require step-up if necessary
8. bind token to proof key
9. issue short-lived resource access token
10. emit audit event

## Rich authorization details

For high-risk actions, scopes are often too broad.

AgentAuth defines an `authorization_details` type for proposed interoperability:

```json
{
  "type": "agent_action",
  "actions": ["payment.create"],
  "locations": ["urn:bank:account:123"],
  "constraints": {
    "max_amount": {
      "currency": "USD",
      "value": "500.00"
    },
    "recipient_allowlist": ["urn:payee:vendor-42"]
  },
  "purpose": "approved-invoice-payment"
}
```

This `agent_action` type is an AgentAuth extension profile, not an existing IANA-registered type.

## Sender-constrained tokens

Preferred order:

1. mTLS where enterprise infrastructure already supports certificates
2. DPoP for application-layer proof in browser-adjacent or portable clients
3. bearer access tokens only for integrations that cannot support proof of possession, with shorter lifetimes and additional risk controls

DPoP proof validation includes:

- signature
- public-key thumbprint matching token `cnf`
- method binding
- URI binding
- issued-at freshness
- unique `jti`
- nonce where configured

## Discovery metadata

AgentAuth publishes standard OAuth and OIDC metadata where applicable.

Additionally, an AgentAuth-aware deployment MAY expose:

`/.well-known/agentauth-configuration`

Example:

```json
{
  "issuer": "https://auth.example.com",
  "agent_registration_endpoint": "https://auth.example.com/v1/agents",
  "token_exchange_endpoint": "https://auth.example.com/oauth/token",
  "grant_endpoint": "https://auth.example.com/v1/grants",
  "federation_metadata_endpoint": "https://auth.example.com/v1/federation/metadata",
  "supported_actor_types": ["ai_agent"],
  "supported_proof_methods": ["dpop", "mtls"],
  "supported_integration_profiles": [
    "api",
    "mcp",
    "native_browser",
    "gateway"
  ]
}
```

The AgentAuth well-known document is a product extension and MUST NOT be described as an existing Internet standard.

## Token validation order

Resource Servers should validate in this order:

1. issuer allowed
2. signing algorithm allowed
3. signature valid
4. `exp`, `nbf`, and `iat` sane
5. audience exact match
6. proof-of-possession binding valid
7. Subject type valid
8. `act` chain structurally valid
9. AgentAuth claim version supported
10. grant or revocation freshness requirement satisfied
11. local policy permits resource action
12. obligations enforced

## Multi-agent delegation

A multi-agent chain uses nested actor semantics where interoperable.

A child agent MUST NOT receive a broader grant than the parent.

Example conceptual chain:

```json
{
  "sub": "urn:subject:user:123",
  "act": {
    "sub": "urn:agentauth:agent:worker",
    "act": {
      "sub": "urn:agentauth:agent:orchestrator"
    }
  }
}
```

Authorization uses the current actor and active grant relationship. Historical actors are audit context, not automatically authorization-bearing principals.


---

<!-- Source: docs/05-native-login-as-agent.md -->

# Native Login as Agent

## Goal

Allow a web application to create a browser session for an AI agent while the application explicitly knows that the session is agent-operated.

This is different from an agent typing a user's password.

## Target integration contract

An AgentAuth-aware web application adds:

- AgentAuth issuer trust configuration
- an agent-session bootstrap endpoint
- server-side session actor metadata
- authorization middleware that can distinguish `human` and `ai_agent`
- audit fields for Agent Principal, Agent Instance, Subject, and Grant
- optional UI indicator that a session is agent-operated

## Flow

```mermaid
sequenceDiagram
  participant U as Human or Organization
  participant A as Agent Runtime
  participant AS as AgentAuth Authorization Server
  participant W as Target Web App
  participant B as Managed Browser

  U->>AS: Approve Delegation Grant
  A->>AS: Token exchange with Agent Instance proof
  AS-->>A: Audience-bound DPoP access token
  A->>W: POST /agent/session with access token
  W->>W: Validate issuer, audience, act, proof, grant, policy
  W-->>A: One-time browser bootstrap URI/code
  A->>B: Open target bootstrap URI
  B->>W: Redeem one-time code
  W->>W: Create server-side session actor_type=ai_agent
  W-->>B: Secure session cookie
  B->>W: Normal web navigation
```

## Target endpoint

Conceptual interface:

```http
POST /agent/session
Authorization: DPoP <access-token>
DPoP: <proof>
Content-Type: application/json

{
  "return_path": "/dashboard",
  "requested_session_ttl_seconds": 900
}
```

Response:

```json
{
  "bootstrap_url": "https://app.example.com/agent/session/redeem?code=opaque-one-time-code",
  "expires_in": 60
}
```

## Server-side session record

Required fields:

- session id
- `actor_type = ai_agent`
- Agent Principal
- Agent Instance
- Subject, if delegated
- Grant identifier
- issuer
- trust tier
- authentication time
- expiry
- policy context version
- revocation check mode

The browser cookie should contain only an opaque session identifier where practical.

## Authorization behavior

The target application may choose different policy for agent sessions.

Examples:

- allow read-only access but block account recovery
- require step-up for money movement
- prevent changing the user's MFA settings
- prevent creating long-lived API keys
- prevent exporting highly sensitive datasets
- expose a dedicated agent-safe UI route
- require explicit purpose-bound grants

These restrictions are target policy, not global AgentAuth defaults.

## Session lifecycle

### Creation

A session is created only after validating an AgentAuth credential.

### Renewal

Renewal must revalidate agent and grant state. Long browser sessions should not outlive the underlying grant.

### Revocation

The target can consume revocation events or periodically introspect. High-risk sessions should be terminated quickly after:

- Agent Principal disablement
- Agent Instance revocation
- grant revocation
- policy emergency action

### Human handoff

A target may return `step_up_required`. The browser should pause at a safe point and direct approval to a human channel rather than exposing human credentials to the agent.

## Web application UX

Recommended visible indicators:

- "AI agent session" badge
- acting agent name
- represented user or organization
- granted purpose
- session expiry
- link to revoke grant

The user should be able to distinguish:

- actions they performed
- actions the agent performed for them
- actions another agent delegated to this agent

## Compatibility

An application does not need to replace its existing human login flow.

Human login and AgentAuth coexist:

```text
Human:
OIDC login -> human session

Agent:
AgentAuth token -> agent-session bootstrap -> agent session
```

Both may use the same application authorization engine, but actor metadata MUST remain distinct.


---

<!-- Source: docs/06-browser-bridge.md -->

# Legacy Browser Bridge

## Purpose

The Browser Bridge exists for applications that do not provide APIs, MCP, or native AgentAuth integration.

It is a compatibility system, not a claim that the target has native agent identity support.

## Assurance levels

### Browser B0: legacy opaque target

The target sees an ordinary browser session. AgentAuth provides:

- isolated browser runtime
- protected credential injection
- session containment
- domain allowlist
- coarse action controls
- screenshots and audit evidence according to policy
- kill switch
- human handoff

The target itself does not reliably know the caller is an AI agent.

### Browser B1: trusted reverse proxy

A target is behind a trusted AgentAuth gateway.

The gateway validates AgentAuth identity, strips spoofable incoming identity headers, and injects trusted actor context toward the application.

The application can distinguish agent sessions without implementing token validation itself.

### Browser B2: native session bootstrap

The target implements the native AgentAuth browser profile described in `05-native-login-as-agent.md`.

This is the preferred browser mode.

## Architecture

```mermaid
flowchart LR
  M[Model or Planner] --> AG[Action Guard]
  AG --> BC[Browser Controller]
  BC --> SB[Sandboxed Chromium]
  CV[Credential Vault] -->|one-way injection| SB
  SB --> WEB[Legacy Web Target]
  BC --> AUD[Audit Emitter]
  AG --> PDP[Policy Decision Point]
```

## Credential handling

Credentials are never returned to the language model.

Credential flow:

1. browser controller requests a credential handle
2. policy checks target origin and Agent Instance
3. vault returns secret material only to a trusted browser injection process
4. secret is entered into the target login field or supplied through platform credential APIs
5. browser controller redacts sensitive input from logs and screenshots
6. vault handle expires
7. session cookies are stored in an encrypted target-specific profile

## Browser isolation

Each high-assurance session SHOULD have:

- dedicated OS/container sandbox
- dedicated browser profile
- outbound network policy
- target-domain allowlist where possible
- filesystem restrictions
- no shared clipboard
- no host credential stores
- no unrestricted extension installation
- no cross-tenant profile reuse

## Action Guard

Generic browser pages do not expose a universal semantic authorization API.

Therefore the Action Guard must use layered controls:

### Layer 1: origin policy

Which domains and subdomains may be reached.

### Layer 2: navigation policy

Block or require approval for transitions to unapproved domains.

### Layer 3: known action adapters

For supported targets, map UI interactions to structured Action Intents such as:

- `email.send`
- `crm.contact.update`
- `invoice.approve`
- `payment.create`

### Layer 4: generic sensitive-action heuristics

When no adapter exists, detect high-risk patterns conservatively:

- password or MFA change
- new API key
- money movement
- destructive delete
- permission changes
- external sharing
- mass download
- submission of highly sensitive data

Heuristics may trigger step-up but MUST NOT be treated as perfect semantic understanding.

## Prompt injection control

Content rendered by a website is untrusted.

The Browser Bridge SHOULD:

- separate page content from policy instructions
- never let page text modify the active Delegation Grant
- require policy approval for tool calls derived from page content
- block page content from requesting credential export
- bind human approval to normalized Action Digest, not to a vague prompt
- preserve provenance of which page or element caused a proposed action

## Login behavior

Preferred order:

1. native AgentAuth session
2. target OAuth or enterprise SSO with delegated authorization
3. passwordless target login mediated by human
4. vault-injected legacy credentials as last resort

## CAPTCHA and anti-bot controls

The Browser Bridge MUST NOT automate CAPTCHA bypass or attempt to evade explicit anti-automation controls.

Behavior:

- pause
- emit `human_handoff_required`
- preserve current safe state
- allow authorized human intervention
- resume only after the challenge is legitimately completed

## Cookie handling

- cookies encrypted at rest
- one tenant boundary
- one target profile
- explicit expiry
- invalidated on grant or instance revocation where feasible
- never included in LLM prompts
- never logged
- export disabled by default

## Browser evidence

Policy may capture:

- URL
- page title
- selected DOM metadata
- redacted screenshot
- action adapter output
- approval evidence
- result confirmation

Sensitive fields must be redacted before persistence.

## Hard limitation

Without target cooperation, no browser technology can guarantee that the target records "AI agent" as the actor.

AgentAuth can guarantee its own runtime identity, policy, credential custody, and audit. Target-side agent awareness begins at B1 or B2.


---

<!-- Source: docs/07-mcp-api-integration.md -->

# MCP and API Integration

## Objective

Use one identity and delegation model across ordinary APIs and MCP servers.

MCP is treated as a resource integration protocol, not an identity root.

## API Resource Server profile

A Resource Server integrates in one of three ways:

### SDK mode

Application imports AgentAuth validation middleware.

### Gateway mode

A trusted gateway validates the credential and forwards verified actor context.

### Native OAuth mode

Application validates JWT or introspects opaque tokens using standard OAuth mechanisms and understands AgentAuth extension claims.

## Verified request context

After validation, the application receives a local context:

```json
{
  "actor": {
    "kind": "ai_agent",
    "agent_id": "agent_01...",
    "instance_id": "inst_01..."
  },
  "subject": {
    "kind": "human",
    "id": "user_123"
  },
  "grant_id": "grant_01...",
  "authority_mode": "delegated",
  "purpose": "crm-follow-up",
  "scopes": ["contacts.read", "contacts.update"],
  "trust_tier": "T2"
}
```

Incoming client-supplied `X-Agent-*` headers MUST be stripped before trusted headers are injected in gateway mode.

## MCP profile

MCP server authorization follows the current MCP authorization model and AgentAuth adds actor semantics.

### Discovery

The MCP server publishes protected resource and authorization metadata according to the MCP specification.

### Authorization

The Agent Runtime obtains a token whose audience is the MCP server.

The token contains:

- Subject
- Agent Actor
- Agent Instance
- active grant
- scopes
- proof binding

### Tool call authorization

Before each protected tool call:

1. validate token and proof
2. map MCP tool name to an AgentAuth Action
3. normalize security-sensitive arguments
4. evaluate grant constraints
5. evaluate local or central policy
6. execute only on `allow`
7. return step-up response when additional authorization is needed
8. audit the decision and result

## Tool mapping example

```yaml
server: urn:mcp:finance
tools:
  invoices.list:
    action: invoice.read
  payments.create:
    action: payment.create
    sensitive_arguments:
      - amount
      - currency
      - recipient
```

## Scope step-up

If the current token lacks authority, the server must not silently grant more scope.

Expected flow:

1. MCP server returns insufficient scope or an AgentAuth step-up hint
2. client asks AgentAuth for expanded authorization
3. AgentAuth checks whether expansion fits an existing grant
4. if not, human or organization approval is requested
5. a new token is issued
6. tool call is retried with explicit authority

## MCP Enterprise Managed Authorization

Where an organization uses enterprise-managed MCP authorization, AgentAuth should integrate with that IdP path rather than forcing independent per-server consent.

Agent identity still remains explicit at the Actor layer.

## API gateway enforcement

Recommended gateway order:

1. TLS
2. token parsing limits
3. issuer resolution
4. signature
5. audience
6. DPoP or mTLS
7. AgentAuth claims
8. revocation freshness
9. policy
10. rate limits
11. upstream forwarding

## Rate limiting

Rate limiting SHOULD include:

- tenant
- Agent Principal
- Agent Instance
- Subject
- resource
- action

This prevents one compromised Agent Instance from consuming the entire tenant allowance.

## Service-to-service calls

When a Resource Server calls another backend while preserving agent context, it SHOULD use token exchange to obtain a downstream audience token rather than forward the original token.

The downstream token preserves Subject and current Actor according to delegation semantics.


---

<!-- Source: docs/08-policy-consent-delegation.md -->

# Policy, Consent, and Delegation

## Separation of concerns

Consent answers: what authority did a human or organization intentionally grant?

Policy answers: may this action happen now under current security rules?

Both are required.

A valid grant does not force policy to allow an action.

## Grant structure

A grant contains:

- Subject
- Agent Actor
- resources
- capabilities
- constraints
- purpose
- validity window
- delegation depth
- approval requirements
- revocation state

## Consent UX requirements

Consent screens MUST show structured facts, not only technical scopes.

Example:

```text
Agent: Finance Assistant
Acting for: Acme Finance Team
Can:
- Read invoices in Workspace A
- Create payments from Account 123
Limits:
- Maximum 500 USD per payment
- Only approved vendor recipients
- Human approval required above 100 USD
Expires:
- 30 days
Can delegate:
- No
```

Avoid prompts such as "Allow full account access".

## Grant creation flow

```mermaid
sequenceDiagram
  participant A as Agent
  participant AS as AgentAuth
  participant P as Policy
  participant U as Human or Org Approver

  A->>AS: Request grant with structured authorization details
  AS->>P: Pre-evaluate requested authority
  P-->>AS: Allowed shape and required approver
  AS->>U: Consent request
  U-->>AS: Approve or deny exact grant
  AS->>AS: Persist active grant and audit evidence
  AS-->>A: Grant reference, not reusable user credential
```

## Policy inputs

Minimum:

- tenant
- Subject
- Actor
- Agent Instance
- runtime trust tier
- grant
- requested Action Intent
- Resource
- time
- risk signals
- source region
- policy version
- prior approval evidence

Optional:

- data classification
- anomaly score
- external fraud signal
- device posture
- business workflow state

## Policy outputs

```json
{
  "decision": "step_up",
  "reason_codes": [
    "AMOUNT_ABOVE_AUTONOMOUS_LIMIT"
  ],
  "obligations": [
    {
      "type": "human_approval",
      "bind_to_action_digest": true,
      "expires_in_seconds": 300
    }
  ],
  "policy_version": "pol_2026_10_05_7"
}
```

## Transaction-bound approval

For sensitive actions, approval is bound to:

- action
- target Resource
- relevant parameters
- Subject
- Actor
- grant
- expiry

Example:

```text
Approve Finance Assistant to pay Vendor 42 exactly 250 USD from Account 123.
```

If the amount or recipient changes, approval is invalid.

## Multi-agent delegation

A parent agent may delegate only if the active grant explicitly permits it.

Child grant creation must pass the attenuation checker.

### Attenuation lattice

Constraints are compared by type.

Examples:

- amount: lower maximum is stricter
- time: shorter interval is stricter
- allowlist: subset is stricter
- denylist: superset is stricter
- rate: lower rate is stricter
- data classes: subset is stricter
- delegation depth: smaller value is stricter

Unknown constraint types MUST fail closed unless a registered comparator exists.

## Purpose

Purpose is a policy input and audit attribute.

Purpose alone MUST NOT expand permissions.

A resource may require a purpose match, for example:

```text
customer_records.read allowed only when purpose in
["support-case", "account-review"]
```

## Emergency controls

Four kill switches:

1. tenant-wide
2. Agent Principal
3. Agent Instance
4. Delegation Grant

Emergency disablement must emit a high-severity audit event.

## Policy engine implementation boundary

The AgentAuth core defines:

- policy input contract
- decision contract
- obligations
- versioning
- fail-closed semantics

The first implementation may use a policy engine such as Cedar or OPA, but business policy language is an adapter choice rather than part of the AgentAuth protocol.


---

<!-- Source: docs/09-security-threat-model.md -->

# Security Threat Model

## Assets

- issuer signing keys
- Agent Instance private keys
- Delegation Grants
- refresh credentials
- browser cookies
- approval evidence
- policy configuration
- audit records
- federation trust metadata
- protected resource data

## Adversaries

- malicious external attacker
- compromised Agent Instance
- prompt-injection content
- malicious or buggy agent publisher
- malicious delegated child agent
- insider with tenant administration access
- compromised browser environment
- compromised Resource Server
- cross-tenant attacker
- stolen token holder
- malicious federation peer

## Security invariants

S-001: No child delegation can exceed parent authority.

S-002: An access token for Resource A cannot be accepted by Resource B unless explicitly audience-compatible.

S-003: Possession of a stolen sender-constrained token without the corresponding key is insufficient.

S-004: A prompt or web page cannot directly modify a Delegation Grant.

S-005: A Browser Session cannot outlive its authorization policy beyond configured tolerance.

S-006: Disabling an Agent Instance prevents issuance of new credentials for that instance.

S-007: A Resource Server can distinguish delegated Agent Actor from Subject.

S-008: Incoming untrusted headers cannot impersonate trusted gateway identity context.

S-009: Secrets are not exposed to model context.

S-010: Audit evidence is tamper-evident.

## Threats and controls

### T1 Token replay

Risk:
stolen token reused by another process.

Controls:

- DPoP or mTLS
- short access-token lifetime
- `jti` replay cache where required
- nonce support
- refresh-token rotation
- anomaly detection

### T2 Confused deputy

Risk:
agent obtains token for one purpose and uses it against another resource.

Controls:

- audience restriction
- resource indicators
- structured authorization details
- resource-side action checks
- purpose policy
- token exchange for downstream calls

### T3 Privilege amplification through delegation

Risk:
orchestrator grants worker more than it has.

Controls:

- formal attenuation checker
- bounded depth
- property-based tests
- unknown constraint types fail closed
- descendant revocation

### T4 Prompt injection causes unauthorized action

Risk:
untrusted content tells the model to change permissions, reveal secrets, or perform a harmful action.

Controls:

- policy authority outside model
- credential vault boundary
- Action Intent normalization
- transaction-bound approvals
- page/content provenance
- high-risk action adapters
- human step-up

### T5 Agent identity spoofing

Risk:
ordinary client claims to be a trusted agent.

Controls:

- cryptographic Agent Instance identity
- proof-of-possession
- issuer validation
- trusted gateway header stripping
- metadata signatures
- optional workload attestation

### T6 Runtime compromise

Risk:
attacker gains control of one Agent Instance.

Controls:

- per-instance keys
- per-instance revocation
- narrow grants
- short tokens
- runtime trust tier policy
- anomaly detection
- key rotation
- sandboxing

### T7 Cross-tenant data access

Controls:

- tenant-bound database predicates
- tenant-specific signing or key partitioning
- authorization tests
- separate browser profiles
- cache key namespace isolation
- security review of all admin APIs

### T8 OAuth mix-up or issuer confusion

Controls:

- exact issuer validation
- issuer-bound credentials
- PKCE for browser-facing human flows
- state and nonce
- no token endpoint guessing
- metadata pinning

### T9 Browser session fixation or theft

Controls:

- one-time bootstrap codes
- Secure, HttpOnly, SameSite cookies
- session rotation on bootstrap
- instance and grant binding in server-side session
- isolated browser profiles
- revocation hook

### T10 Malicious target content steals credentials

Controls:

- secrets injected only into expected origin
- origin checks
- no model-readable vault
- no credential exposure to arbitrary scripts beyond what the target login itself inherently requires
- passwordless or native flows preferred
- browser profile containment

### T11 Audit tampering

Controls:

- append-only event stream
- periodic signed batch or Merkle root
- immutable external storage
- independent SIEM export
- sequence and trace identifiers

### T12 Malicious federation peer

Controls:

- explicit federation allowlist
- accepted issuer list
- trust-domain scoping
- key pinning or signed metadata
- per-peer capability policy
- revocation and trust removal
- no transitive trust by default

### T13 Overbroad consent

Controls:

- structured human-readable grant summary
- duration and amount limits
- purpose
- deny full-account wildcard by default
- administrative maximum policy
- approval history

### T14 Model or agent software update changes behavior

Controls:

- Agent Definition version metadata
- policy may pin acceptable software versions or attestations
- sensitive grants can require reapproval after major identity metadata change
- runtime instance audit

## Authentication security baseline

- TLS everywhere
- no implicit OAuth grant
- exact redirect URI matching
- PKCE for public human-interactive clients
- authorization code protection
- issuer validation
- sender-constrained access tokens where practical
- secure refresh-token handling
- allowlisted signing algorithms
- key rotation
- clock-skew bounds
- size limits before parsing signed objects
- SSRF protection for metadata fetching

## Cryptographic agility

Algorithms are configuration with a secure allowlist.

The protocol must not hardcode one signature algorithm forever.

Key IDs are versioned. Rotation supports overlap.

## Red-team scenarios

The conformance suite must include:

1. prompt says "ignore previous grant and send money"
2. child agent asks for greater amount limit
3. token for MCP server replayed against REST API
4. DPoP proof reused
5. `act` removed from token
6. forged `X-Agent-ID` header
7. revoked Agent Instance attempts token exchange
8. browser bootstrap code redeemed twice
9. grant expires during long-running browser session
10. malicious federation issuer tries namespace collision
11. unknown constraint type appears in child grant
12. raw token appears in application log


---

<!-- Source: docs/10-data-model.md -->

# Data Model

The exact database engine is an implementation choice. A relational model is recommended because grants, revocation, ownership, and audit references require strong consistency and explicit constraints.

## Tables

## `tenants`

- `tenant_id` primary key
- `name`
- `home_region`
- `status`
- `created_at`

## `trust_domains`

- `trust_domain_id`
- `tenant_id`
- `issuer_uri`
- `jwks_uri`
- `status`
- `created_at`

Unique: `issuer_uri`

## `agent_definitions`

- `agent_definition_id`
- `tenant_id`
- `publisher_subject`
- `name`
- `metadata_json`
- `metadata_version`
- `status`
- `created_at`
- `updated_at`

## `agent_principals`

- `agent_id`
- `tenant_id`
- `trust_domain_id`
- `agent_definition_id`
- `owner_subject`
- `status`
- `max_delegation_depth`
- `created_at`
- `disabled_at`

## `agent_instances`

- `instance_id`
- `tenant_id`
- `agent_id`
- `proof_key_thumbprint`
- `workload_identity`
- `attestation_class`
- `region`
- `status`
- `first_seen_at`
- `last_seen_at`
- `revoked_at`

Unique inside tenant: `proof_key_thumbprint`

## `delegation_grants`

- `grant_id`
- `tenant_id`
- `issuer`
- `subject_json`
- `actor_agent_id`
- `parent_grant_id`
- `authorization_details_json`
- `constraints_json`
- `purpose`
- `not_before`
- `expires_at`
- `max_delegation_depth`
- `approval_mode`
- `status`
- `policy_version`
- `created_by`
- `approved_by`
- `created_at`
- `approved_at`
- `revoked_at`
- `revocation_reason`

Indexes:

- `(tenant_id, actor_agent_id, status)`
- `(tenant_id, parent_grant_id)`
- `(tenant_id, expires_at)`
- `(tenant_id, subject hash or canonical identifier)`

## `grant_descendants`

Closure table for efficient cascade revocation:

- `tenant_id`
- `ancestor_grant_id`
- `descendant_grant_id`
- `depth`

This table is updated transactionally when a child grant is created.

## `approvals`

- `approval_id`
- `tenant_id`
- `grant_id`
- `action_digest`
- `approver_subject`
- `approval_type`
- `evidence_ref`
- `expires_at`
- `used_at`
- `created_at`

## `policies`

- `policy_id`
- `tenant_id`
- `name`
- `version`
- `content_digest`
- `engine_type`
- `storage_ref`
- `status`
- `published_at`

## `revocations`

- `revocation_id`
- `tenant_id`
- `entity_type`
- `entity_id`
- `reason_code`
- `effective_at`
- `created_by`
- `created_at`

## `browser_sessions`

- `browser_session_id`
- `tenant_id`
- `target_origin`
- `actor_agent_id`
- `instance_id`
- `subject_json`
- `grant_id`
- `mode`
- `status`
- `created_at`
- `expires_at`
- `revoked_at`

Cookie values are not stored in this table.

## `federation_peers`

- `peer_id`
- `tenant_id`
- `issuer`
- `metadata_uri`
- `trust_policy_json`
- `status`
- `created_at`
- `updated_at`

## `audit_events`

Operational index only:

- `event_id`
- `tenant_id`
- `event_type`
- `occurred_at`
- `trace_id`
- `actor_agent_id`
- `instance_id`
- `subject_ref`
- `grant_id`
- `resource_ref`
- `action`
- `decision`
- `reason_codes`
- `policy_version`
- `action_digest`
- `payload_ref`
- `batch_id`

Full immutable event payloads may live in append-only storage.

## Consistency rules

- Agent Instance insert requires active Agent Principal
- active grant requires active Agent Principal
- child grant requires active parent
- child grant depth must be below parent allowance
- grant expiry cannot exceed parent expiry
- browser session expiry cannot exceed underlying grant expiry
- disabled tenant blocks issuance
- revoked instance blocks issuance
- audit event writes for security mutations use transactional outbox

## Sensitive data

Do not store:

- plaintext passwords
- private signing keys
- raw refresh tokens in ordinary relational columns
- raw model prompts by default
- browser cookie values in analytics tables

Secrets are referenced by opaque vault handles.


---

<!-- Source: docs/11-deployment-federation.md -->

# Deployment and Federation

## Deployment objective

AgentAuth must be deployable anywhere without changing its security model.

Saudi Arabia, the EU, the US, a private data center, or a customer-owned cloud are deployment locations, not separate product architectures.

## Deployment shapes

### Shape A: multi-tenant regional SaaS

Per-region cell:

- API edge
- control plane replicas
- regional database
- regional KMS/HSM
- event bus
- audit pipeline
- regional browser workers
- observability stack

Global layer contains only low-sensitivity routing and tenant-home metadata where permitted.

### Shape B: dedicated tenant cloud

One customer receives:

- dedicated issuer
- dedicated database
- dedicated KMS keys
- dedicated browser worker pool
- federation to customer's IdP and workload identity

### Shape C: sovereign or regulated region

Everything required for identity, issuance, policy, audit, and browser execution stays in-region.

External dependencies must be optional or replaceable.

### Shape D: on-premises

Kubernetes or equivalent orchestration.

Required local dependencies:

- relational database
- key-management or HSM interface
- object storage
- ingress
- audit export

## Regional cell

```mermaid
flowchart TB
  Edge[Regional Edge] --> CP[Control Plane]
  CP --> DB[(Regional DB)]
  CP --> KMS[KMS or HSM]
  CP --> Bus[Event Bus]
  Bus --> Audit[Audit Pipeline]
  CP --> Browser[Browser Worker Pool]
  CP --> SDK[Resource SDK and Gateway]
  Global[Optional Global Directory] -. tenant routing only .-> Edge
```

## Data residency classes

Tenant configuration can classify data:

- R0: globally replicable metadata
- R1: region-bound operational metadata
- R2: region-bound identity and grants
- R3: highly restricted secrets and credentials
- R4: immutable local audit evidence

Cross-region replication policy is explicit per class.

## No mandatory global root

Each Trust Domain has its own issuer and keys.

Federation uses explicit trust.

Benefits:

- sovereign deployment
- blast-radius reduction
- independent key rotation
- organizational autonomy
- easier customer-managed installations

## Federation model

A Resource Server trusts:

- local Trust Domain
- zero or more explicitly configured external Trust Domains

Federation metadata includes:

- issuer
- JWKS URI
- supported AgentAuth profile version
- accepted actor types
- proof methods
- optional trust marks
- administrative contact metadata
- validity period

Trust policy includes:

- accepted audiences
- accepted agent owners or publishers
- minimum runtime trust tier
- maximum delegation depth
- allowed actions
- whether external Subjects are accepted

No transitive federation by default.

## SPIFFE integration

In environments that already use SPIFFE:

1. workload obtains SPIFFE identity
2. Runtime Identity Broker validates workload identity
3. workload identity is mapped to an Agent Instance
4. broker obtains AgentAuth resource credential
5. downstream Resource Server sees AgentAuth Subject and Actor semantics

SPIFFE remains workload identity. AgentAuth adds agent registration, delegation, authorization, and application-facing actor semantics.

## Key management

Per Trust Domain:

- signing keys in KMS/HSM
- separate encryption keys for secrets
- short rotation interval appropriate to provider
- overlapping JWKS publication
- emergency key disable process
- no direct private-key export in normal operations

## Browser workers

Browser execution is isolated from the control plane.

Recommended:

- ephemeral worker for high-risk tasks
- no inbound public access
- outbound egress policy
- credential injection over authenticated internal channel
- encrypted ephemeral disk
- automatic destruction after session
- separate pool per residency region

## Disaster recovery

Each cell must define:

- database recovery point objective
- recovery time objective
- KMS/HSM recovery process
- issuer key backup or replacement policy
- audit-store recovery
- grant revocation recovery
- browser worker recreation

A disaster-recovery region must not receive restricted tenant data unless configured.

## Federation failure

If external issuer metadata is unavailable:

- cached metadata may be used until configured expiry
- new trust must not be established
- expired or untrusted keys fail closed
- emergency trust revocation must override cache


---

<!-- Source: docs/12-observability-audit.md -->

# Observability and Audit

## Two streams

Operational telemetry and security audit are separate.

Operational telemetry can be sampled and short-lived.

Security audit must preserve complete security-relevant evidence according to tenant retention policy.

## Audit event envelope

Required:

```json
{
  "event_id": "evt_01...",
  "event_type": "policy.decision",
  "occurred_at": "2026-10-05T10:00:00Z",
  "tenant_id": "tenant_01...",
  "trace_id": "trace_01...",
  "actor": {
    "type": "ai_agent",
    "agent_id": "agent_01...",
    "instance_id": "inst_01..."
  },
  "subject": {
    "type": "human",
    "id": "user_123"
  },
  "grant_id": "grant_01...",
  "resource": "urn:resource:crm",
  "action": "contacts.update",
  "decision": "allow",
  "reason_codes": ["GRANT_MATCH", "POLICY_MATCH"],
  "policy_version": "pol_17",
  "action_digest": "sha256:...",
  "result": "success"
}
```

## Required event types

Identity:

- `agent.registered`
- `agent.disabled`
- `instance.registered`
- `instance.key_rotated`
- `instance.revoked`
- `attestation.changed`

Grant:

- `grant.requested`
- `grant.approved`
- `grant.denied`
- `grant.derived`
- `grant.revoked`
- `grant.expired`

Credential:

- `token.exchange_succeeded`
- `token.exchange_failed`
- `token.introspection`
- `proof.replay_detected`

Policy:

- `policy.decision`
- `policy.published`
- `policy.rollback`

Browser:

- `browser.session_created`
- `browser.handoff_required`
- `browser.sensitive_action`
- `browser.session_revoked`
- `browser.session_closed`

Federation:

- `federation.peer_added`
- `federation.peer_disabled`
- `federation.validation_failed`

Administration:

- `admin.kill_switch`
- `admin.role_changed`

## Tamper evidence

Recommended scheme:

1. events are append-only
2. events are grouped into ordered batches
3. each batch contains hash of previous batch
4. batch root is signed by a dedicated audit signing key
5. signed batch manifests are copied to immutable storage
6. external SIEM export can provide independent evidence

This avoids requiring one global hash chain across every regional writer.

## Metrics

Identity:

- active Agent Principals
- active Agent Instances
- instance registration failures
- attestation failures

Authorization:

- token exchange rate
- denial rate
- step-up rate
- grant creation rate
- revocation propagation delay

Security:

- DPoP replay detections
- invalid issuer events
- invalid audience events
- forged gateway-header attempts
- multi-agent attenuation failures
- browser policy blocks

Reliability:

- token endpoint latency
- policy latency
- KMS latency
- database error rate
- event lag
- audit persistence lag

## Tracing

Use one trace identifier across:

- agent request
- token exchange
- policy evaluation
- Resource Server action
- browser or MCP execution
- audit result

Trace baggage MUST NOT include secrets or raw tokens.

## Log redaction

Automatic redaction rules must include:

- `Authorization` header
- DPoP proof body where it could expose sensitive metadata
- refresh tokens
- cookies
- passwords
- private keys
- authorization codes
- bootstrap codes
- vault handles if they grant access

## Security dashboards

Minimum dashboards:

- issuer health
- revocation freshness
- anomalous Agent Instance behavior
- cross-region federation failures
- browser worker isolation failures
- policy deny and step-up spikes
- key rotation status

## Alerts

Page-worthy:

- signing key misuse or KMS policy failure
- audit persistence stopped
- cross-tenant authorization anomaly
- revocation delay above hard threshold
- federation issuer mismatch
- evidence of DPoP replay at scale
- successful use of revoked Agent Instance


---

<!-- Source: docs/13-test-conformance.md -->

# Test and Conformance Specification

## Test philosophy

Security invariants are executable requirements.

The suite should prefer protocol-level, property-based, fuzz, integration, and adversarial tests over only unit-level happy paths.

## Conformance profiles

### C1 AgentAuth Issuer

Must support:

- metadata
- Agent Principal and Instance lifecycle
- grant lifecycle
- token exchange
- proof binding
- revocation
- audit

### C2 Resource Server

Must support:

- issuer validation
- audience validation
- Agent Actor extraction
- proof validation
- policy mapping
- trusted-context creation

### C3 Runtime Broker

Must support:

- instance proof key
- secret isolation
- token acquisition
- audience isolation
- refresh protection
- action request normalization

### C4 Native Browser Target

Must support:

- agent-session bootstrap
- one-time redemption
- server-side actor type
- revocation response
- human handoff

### C5 MCP Server

Must support:

- MCP authorization discovery
- audience-bound token
- tool-to-action mapping
- insufficient-scope step-up
- audit

### C6 Federation

Must support:

- explicit peer trust
- issuer metadata validation
- key rotation
- trust revocation
- namespace isolation

## Unit tests

Modules:

- identifier parsing
- claim validation
- grant state transitions
- constraint comparators
- policy obligations
- session expiry
- revocation

## Property-based tests

### Attenuation properties

For all valid parent and child grants:

- child resources never expand
- child actions never expand
- child expiry never exceeds parent
- child delegation depth decreases
- stricter constraints remain stricter after serialization round-trip

### Token properties

- changing audience invalidates validation
- changing proof key invalidates validation
- removing Actor from delegated token invalidates AgentAuth delegated profile
- unknown critical claim version fails closed

## Fuzz tests

Targets:

- JWT parser
- JWK parser
- DPoP proof parser
- OAuth metadata parser
- authorization-details parser
- grant JSON
- federation metadata
- browser bootstrap payload

Assertions:

- no panic
- bounded CPU and memory
- invalid input rejected
- no algorithm confusion
- no URL fetch outside SSRF allow rules

## Integration tests

### Flow F1 direct agent authority

Register Agent Principal -> register Agent Instance -> assign direct entitlement -> issue token -> call Resource Server -> verify audit.

### Flow F2 human delegation

Authenticate human -> approve grant -> agent token exchange -> API call -> verify Subject and Actor separate.

### Flow F3 step-up

Agent requests sensitive action -> PDP returns step_up -> human approves exact Action Digest -> new authorization -> execute.

### Flow F4 child agent

Orchestrator derives narrower child grant -> worker receives token -> valid action allowed -> broader action denied.

### Flow F5 revocation

Issue token -> revoke grant -> verify no new tokens -> verify high-risk Resource Server rejects within revocation SLA.

### Flow F6 native browser

Create agent token -> bootstrap browser session -> verify target session actor type -> revoke instance -> session terminated.

### Flow F7 legacy browser

Start isolated profile -> inject vault credential -> ensure model never receives secret -> perform allowed navigation -> blocked disallowed domain -> audit.

### Flow F8 MCP

Obtain MCP token -> call allowed tool -> call insufficient-scope tool -> step-up -> retry.

### Flow F9 federation

Trust external issuer -> accept permitted agent -> reject disallowed audience -> remove trust -> reject new credentials.

## Adversarial tests

- forged `act`
- nested `act` depth overflow
- signed token with unapproved algorithm
- duplicate JSON keys
- JWK key confusion
- stale DPoP
- DPoP wrong HTTP method
- DPoP wrong URI
- proof replay
- issuer mix-up
- redirect URI manipulation
- bootstrap-code replay
- target-origin mismatch
- grant child with unknown constraint comparator
- cross-tenant identifier collision
- audit event injection
- malicious MCP tool metadata
- prompt injection requesting credential reveal

## Browser tests

Use deterministic test sites under control of the test suite.

Do not run conformance tests against third-party production websites.

Verify:

- cookie isolation
- profile destruction
- credential redaction
- domain egress policy
- human handoff
- screenshot redaction
- download restrictions
- file upload policy
- browser crash recovery

## Performance tests

Measure:

- p50/p95/p99 token issue latency
- p50/p95/p99 policy decision latency
- JWKS cache refresh
- revocation propagation
- 10k concurrent low-risk validations
- burst token exchange
- audit event throughput
- browser worker start and teardown

## Chaos tests

- database failover
- event bus delay
- KMS latency
- KMS outage
- partial region network loss
- JWKS endpoint failure
- federation metadata unavailable
- audit object-store slow
- browser worker crash mid-action

## Release gate

A release is blocked if any of the following fail:

- security invariants
- attenuation property tests
- token replay tests
- cross-tenant isolation
- revocation tests
- audit secret scanning
- native browser actor distinction
- federation trust removal


---

<!-- Source: docs/14-roadmap.md -->

# Product Roadmap

The roadmap is arranged by verifiable capability, not feature count.

## Milestone 0: protocol kernel

Outcome:
prove the identity and delegation model without browser automation.

Deliver:

- Agent Principal registry
- Agent Instance registration with proof key
- Delegation Grant model
- attenuation checker
- OAuth token exchange profile
- DPoP
- JWT access-token profile
- Resource Server SDK
- audit events
- revocation
- CLI test client
- conformance tests

Exit criteria:

- delegated API request preserves Subject and Agent Actor
- stolen DPoP-bound token cannot be replayed by a different key
- child grant cannot expand authority
- revoked grant blocks new issuance
- no secret appears in logs

## Milestone 1: policy and consent

Deliver:

- human approval flow
- organization administrator approval
- structured authorization details
- policy decision interface
- step-up obligations
- Action Digest
- transaction-bound approval
- emergency kill controls

Exit criteria:

- sensitive action can require exact approval
- modifying amount or destination invalidates approval
- policy decisions are fully auditable

## Milestone 2: native Login as Agent

Deliver:

- target SDK
- agent-session bootstrap
- browser session actor metadata
- session revocation
- visible agent-session sample UI
- human handoff

Exit criteria:

- target application can show "AI agent session"
- server logs Subject, Agent, Agent Instance, and Grant separately
- session stops after revocation within target SLA

## Milestone 3: MCP profile

Deliver:

- MCP authorization integration
- tool-to-action mapping
- scope step-up
- enterprise-managed auth integration adapter
- conformance fixtures

Exit criteria:

- same grant authorizes both REST and MCP resource access
- MCP cannot silently broaden grant

## Milestone 4: legacy Browser Bridge

Deliver:

- isolated Chromium workers
- credential vault injection
- domain policy
- browser session profiles
- sensitive action guard
- screenshot and log redaction
- human handoff
- target adapters framework

Exit criteria:

- model never receives test credential
- disallowed origin blocked
- profile destroyed cleanly
- target-awareness limitation clearly reported

## Milestone 5: federation and sovereign deployment

Deliver:

- Trust Domain federation
- external issuer policy
- on-prem deployment
- regional cells
- residency controls
- SPIFFE bridge
- KMS/HSM adapters
- disaster recovery

Exit criteria:

- two independent Trust Domains can selectively trust one another
- loss of global management does not stop local validation
- one Trust Domain can revoke federation without affecting unrelated domains

## Milestone 6: ecosystem

Potential:

- agent publisher verification
- agent trust metadata
- richer runtime attestation
- SDKs for major languages
- SaaS marketplace integrations
- policy packs
- SIEM packages
- security certification
- standards participation

These are not dependencies for the core security model.


---

<!-- Source: docs/15-operations-runbook.md -->

# Operations Runbook Requirements

## Signing key compromise

Trigger:

- KMS alert
- unexpected signing event
- private key exposure
- issuer key misuse

Actions:

1. mark key compromised
2. stop issuance with affected key
3. publish updated JWKS without relying only on cache expiry
4. activate replacement key
5. invalidate affected active tokens according to risk policy
6. notify Resource Servers through emergency channel
7. inspect audit events signed during exposure window
8. preserve evidence
9. issue incident report

## Agent Instance compromise

1. revoke instance
2. block new token exchange
3. terminate native browser sessions
4. invalidate or quarantine refresh credentials
5. propagate revocation event
6. inspect grants used by instance
7. rotate credentials if compromise scope is uncertain
8. create replacement Agent Instance, not reuse compromised key

## Grant abuse

1. revoke grant
2. cascade to descendants
3. block new issuance
4. trigger high-risk online checks
5. identify active browser sessions
6. notify owner if policy requires
7. preserve exact action and approval evidence

## Federation incident

1. disable peer
2. reject new tokens from peer
3. invalidate cached trust metadata
4. evaluate currently active tokens by configured emergency policy
5. notify affected tenants
6. require explicit re-enable after review

## Revocation pipeline delay

If delay exceeds warning threshold:

- alert
- reduce token TTL if supported dynamically
- switch high-risk resources to online introspection
- pause sensitive new grants if consistency is uncertain

If delay exceeds hard threshold:

- fail closed for high-risk actions
- disable affected regional issuance if revocation correctness cannot be guaranteed

## Audit pipeline failure

Security mutations must not silently proceed without audit.

Policy choices:

- high-risk operations fail closed
- low-risk operations may queue locally with durable buffer if approved by tenant policy

Never discard audit events because the external SIEM is unavailable.

## Browser worker compromise

1. terminate worker
2. revoke Agent Instance or worker credential
3. delete ephemeral storage
4. invalidate browser sessions created by worker if needed
5. rotate vault handles
6. preserve redacted forensic metadata
7. rebuild worker from trusted image

## Backup verification

Regularly restore:

- grants
- Agent Registry
- policies
- revocations
- federation trust
- audit manifests

Key restoration follows KMS/HSM provider controls and must be tested separately.

## Clock drift

Because tokens and proofs are time-sensitive:

- all nodes use trusted time synchronization
- drift threshold alert
- large drift causes issuance or validation fail-safe behavior


---

<!-- Source: docs/16-standards-mapping.md -->

# Standards Mapping

Status checked: 2026-10-05.

This document separates stable standards from emerging work.

## Stable standards used as foundations

### OAuth 2.0 Security Best Current Practice, RFC 9700

Use:

- modern OAuth security baseline
- sender-constrained token recommendation
- redirect and authorization-flow hardening

Reference:
https://www.rfc-editor.org/rfc/rfc9700.html

### OAuth 2.0 Token Exchange, RFC 8693

Use:

- Subject and Actor delegation semantics
- `act` claim
- `may_act` where appropriate
- token exchange pattern

Reference:
https://www.rfc-editor.org/rfc/rfc8693.html

### OAuth DPoP, RFC 9449

Use:

- proof-of-possession for application-layer token binding
- replay resistance

Reference:
https://www.rfc-editor.org/rfc/rfc9449.html

### OAuth mTLS, RFC 8705

Use:

- certificate-bound tokens for enterprise and workload deployments

Reference:
https://www.rfc-editor.org/rfc/rfc8705.html

### JWT Profile for OAuth 2.0 Access Tokens, RFC 9068

Use:

- interoperable JWT access-token baseline

Reference:
https://www.rfc-editor.org/rfc/rfc9068.html

### OAuth Authorization Server Issuer Identification, RFC 9207

Use:

- issuer validation and mix-up protection

Reference:
https://www.rfc-editor.org/rfc/rfc9207.html

### OAuth Rich Authorization Requests, RFC 9396

Use:

- structured authorization details beyond flat scopes

Reference:
https://www.rfc-editor.org/rfc/rfc9396.html

### OAuth Resource Indicators, RFC 8707

Use:

- target resource and audience narrowing

Reference:
https://www.rfc-editor.org/rfc/rfc8707.html

### OpenID Connect

Use:

- human identity and identity assertion where needed
- integration with existing IdPs

Reference:
https://openid.net/specs/openid-connect-core-1_0.html

### SPIFFE

Use:

- workload identity
- Trust Domain concepts
- portable runtime identity integration

Reference:
https://spiffe.io/docs/latest/spiffe-specs/

## MCP

AgentAuth should conform to the active MCP authorization specification and treat MCP as an integration profile.

As of 2026-07-28, MCP includes authorization hardening such as issuer validation and movement toward client metadata documents.

References:

https://blog.modelcontextprotocol.io/posts/2026-07-28/
https://modelcontextprotocol.io/

## NIST direction

NIST NCCoE published a 2026 concept paper focused specifically on software and AI agent identity and authorization. It identifies OAuth/OIDC, MCP, identity, authorization, and provenance as relevant building blocks.

Reference:
https://www.nccoe.nist.gov/sites/default/files/2026-02/accelerating-the-adoption-of-software-and-ai-agent-identity-and-authorization-concept-paper.pdf

## Emerging IETF work

These drafts show active standards exploration but are not stable dependencies.

### OpenID Connect Agent Identity Claims

Agent-specific claims for autonomous AI agents.

Reference:
https://datatracker.ietf.org/doc/draft-sharif-openid-agent-identity/

### AI Agent Authorization Integration Framework

Combines OAuth extensions for cross-domain agent authorization.

Reference:
https://www.ietf.org/archive/id/draft-liu-ai-agent-authorization-integration-00.html

### Credential Delegation for AI Agents

Profiles token exchange, proof of possession, structured authorization, and user authorization for AI agents.

Reference:
https://datatracker.ietf.org/doc/html/draft-sweeney-wimse-credential-delegation-00

### Attenuating Authorization Tokens for Agentic Delegation Chains

Explores tool-level attenuated delegation.

Reference:
https://datatracker.ietf.org/doc/html/draft-niyikiza-oauth-attenuating-agent-tokens-01

### Agent Operation Authorization

Explores structured, verifiable authorization of agent operations.

Reference:
https://datatracker.ietf.org/doc/html/draft-liu-agent-operation-authorization-02

### Attenuated Delegation Profile for Automated Agents

Explores request-signature-based delegation chains.

Reference:
https://datatracker.ietf.org/doc/draft-hamr-oauth-agent-delegation/02/

## Design policy for emerging standards

- do not copy draft-specific mandatory wire formats into the stable core
- reserve extension points
- maintain adapters or experimental profiles
- track draft maturity
- prefer convergence with IETF/OpenID work over proprietary divergence
- document migration path if a draft becomes a standard

## What AgentAuth proposes

The following are product-specific proposals, not existing standards:

- `urn:agentauth:claims:v1`
- AgentAuth Agent Definition and Agent Instance data model
- `/.well-known/agentauth-configuration`
- `agent_action` authorization details profile
- native browser Agent Session bootstrap
- AgentAuth conformance profile names

These proposals should be designed so they can later align with a mature standard.


---

<!-- Source: implementation/PLAN.md -->

# AgentAuth Implementation Plan

Goal: Build the minimum standards-based kernel first, then add browser and federation adapters without weakening the identity model.

Architecture: Start as a modular control-plane application plus Runtime Identity Broker and Resource Server SDK. Keep browser execution in a separate trust zone. Use short-lived proof-bound tokens and durable grants. Add service extraction only after observed scaling or isolation pressure.

## Global constraints

- standards first
- default deny
- no raw credentials in model context
- Agent Principal separate from Agent Instance
- Subject separate from Actor
- child delegation only attenuates
- browser legacy mode is explicitly lower assurance
- no CAPTCHA bypass
- no mandatory global control plane
- all security mutations produce audit events

## Work Card 1: Domain and identifier kernel

Owns:

- Agent Definition
- Agent Principal
- Agent Instance
- Trust Domain identifiers
- status lifecycle

Acceptance:

- tests prove independent instance revocation
- malformed or cross-tenant identifiers rejected
- public interfaces contain no storage-specific types

## Work Card 2: Grant and attenuation engine

Depends on: Card 1

Owns:

- Delegation Grant state machine
- capability representation
- constraint comparator registry
- parent-child attenuation
- cascade revocation model

Acceptance:

- property tests prove no child can expand resources, actions, expiry, or delegation depth
- unknown constraint comparator fails closed

## Work Card 3: Authorization server profile

Depends on: Cards 1 and 2

Owns:

- OAuth metadata
- token exchange
- JWT access token
- Actor claim
- AgentAuth extension claims
- DPoP
- audience restriction
- JWKS

Acceptance:

- delegated token contains Subject and Actor
- DPoP mismatch fails
- wrong audience fails
- disabled instance cannot exchange

## Work Card 4: Resource Server SDK

Depends on: Card 3

Owns:

- token validation
- DPoP validation
- trusted request context
- gateway header sanitation
- offline JWKS cache

Acceptance:

- forged identity headers ignored
- token validation conformance fixtures pass

## Work Card 5: Policy and approval

Depends on: Cards 2 and 4

Owns:

- Action Intent
- Action Digest
- decision API
- obligations
- human step-up approval

Acceptance:

- changing protected action field invalidates approval
- policy engine outage fails according to risk class

## Work Card 6: Native browser Agent Session

Depends on: Cards 4 and 5

Owns:

- target SDK bootstrap
- one-time code
- server-side agent session metadata
- revocation integration

Acceptance:

- bootstrap replay fails
- target distinguishes agent and human sessions
- grant revocation ends high-risk session within SLA

## Work Card 7: MCP profile

Depends on: Cards 4 and 5

Owns:

- MCP discovery integration
- tool-to-action mapping
- insufficient-scope path
- audit

Acceptance:

- protected tool uses same AgentAuth grant
- scope cannot silently expand

## Work Card 8: Browser Bridge

Depends on: Cards 5 and 6

Owns:

- sandboxed browser
- vault injection
- target profile isolation
- domain policy
- human handoff
- adapter API

Acceptance:

- secret never appears in model-visible output
- profile cannot cross tenant
- disallowed origin blocked
- CAPTCHA triggers handoff

## Work Card 9: Federation and regional deployment

Depends on: Cards 1 and 3

Owns:

- Trust Domain metadata
- peer trust policy
- key lifecycle
- regional tenancy
- SPIFFE bridge

Acceptance:

- explicit peer trust required
- peer disable blocks new foreign credentials
- local cell validates local tokens during management-plane outage

## Work Card 10: Audit and conformance

Cross-cutting, staged alongside all cards.

Owns:

- canonical audit schema
- tamper-evident batches
- test fixtures
- fuzz harness
- red-team suite
- release gate

Acceptance:

- required event coverage
- no secret leakage
- security invariant suite blocks release

## Suggested first repository milestone

Do not begin with browser automation.

Begin with Cards 1 to 4.

That milestone is independently useful and proves the hard identity claim:

"An API can distinguish the represented Subject from the AI Agent Actor and verify the exact Agent Instance presenting the request."


---

<!-- Source: goals/ZZZOPS_GOAL_DAG.md -->

# ZzzOps Product Goal DAG

## Canonical top-level outcome

G0: Deliver a production-capable Agent Authentication and Delegation platform in which AI agents are first-class cryptographic actors, can receive attenuated authority from humans or organizations, can access APIs, MCP servers, and browser applications, and remain explicitly auditable and revocable.

## DAG

```mermaid
flowchart TB
  G0 --> G1[Trust and domain kernel]
  G0 --> G2[Delegation and token exchange]
  G2 --> G3[Resource Server SDK]
  G2 --> G4[Policy and consent]
  G3 --> G5[Native Login as Agent]
  G4 --> G5
  G3 --> G6[MCP profile]
  G4 --> G6
  G5 --> G7[Legacy Browser Bridge]
  G4 --> G7
  G1 --> G8[Federation and regional cells]
  G2 --> G8
  G3 --> G9[Conformance and security certification]
  G4 --> G9
  G5 --> G9
  G6 --> G9
  G7 --> G9
  G8 --> G9
```

## G1 Trust and domain kernel

Deliver:

- Trust Domain
- Agent Definition
- Agent Principal
- Agent Instance
- key lifecycle
- metadata and identifiers
- audit envelope

Acceptance:

- independent Agent Instance revocation
- issuer-key rotation
- stable Actor identity

## G2 Delegation and token exchange

Depends on: G1

Deliver:

- grants
- attenuation
- token exchange
- DPoP/mTLS binding
- revocation

Acceptance:

- Subject and Actor remain separate
- child grant cannot widen authority
- audience-bound credentials

## G3 Resource Server SDK

Depends on: G2

Deliver:

- validation middleware
- local request context
- gateway header protection
- audit integration

Acceptance:

- integrated API can reliably identify AI Agent Actor

## G4 Policy and consent

Depends on: G2

Deliver:

- structured consent
- policy decision API
- step-up
- Action Digest

Acceptance:

- exact transaction approval
- fail-closed high-risk policy

## G5 Native Login as Agent

Depends on: G3, G4

Deliver:

- session bootstrap
- server-side agent session
- revocation
- UI sample

Acceptance:

- target can distinguish agent browser session from human session

## G6 MCP profile

Depends on: G3, G4

Deliver:

- MCP auth integration
- tool action mapping
- scope step-up

Acceptance:

- MCP shares same grant source of truth

## G7 Legacy Browser Bridge

Depends on: G5, G4

Deliver:

- isolated browser
- secret injection
- Action Guard
- human handoff
- adapters

Acceptance:

- no secret exposure to model
- no false claim of target-side awareness

## G8 Federation and regional cells

Depends on: G1, G2

Deliver:

- regional deployment
- Trust Domain federation
- SPIFFE bridge
- sovereign profile

Acceptance:

- no mandatory global root
- explicit cross-domain trust

## G9 Conformance and security certification

Depends on all user-facing execution paths.

Deliver:

- protocol conformance
- property tests
- fuzzing
- red-team suite
- operational release gates

Acceptance:

- all security invariants executable and green
