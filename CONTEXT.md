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


## Home Authority

The identity authority that establishes an Agent Principal or Agent Instance in its native Trust Domain. A Home Authority is not automatically trusted by every Provider.

## Provider Authority

An authorization authority trusted by a Provider. A Provider Authority may validate or exchange external Agent identity and issue Provider-local credentials. It may be the same deployment as the Home Authority.

## Provider Agent Account

A Provider-local account or relationship mapped to an issuer-qualified Agent Principal. It represents the Provider's local relationship with the Agent Principal and is not itself an Agent Identity credential.

## AgentAuth Context

The immutable trusted authorization context produced after Provider authentication. It preserves the represented Subject, Agent Principal, Agent Instance, authority mode, issuer provenance, grant reference when applicable, proof method, selected protocol version, and credential expiry.

## Protocol Version

A registered AgentAuth interoperability version selected through metadata negotiation. Protocol Version identifies wire semantics and is distinct from SDK package versions or product release versions.

## Issuer-Qualified Agent Identity

The pair of an Agent identity issuer and the issuer-local Agent identifier. Bare Agent identifiers are not globally unique.

## Idempotency Key

An opaque retry key associated with one authenticated caller, operation, and request digest so a side-effecting protocol operation can be safely retried without creating duplicate effects.


## Capability Set

A set of positive authorization capabilities. Each Capability names one Action, one or more Resources, and optional deterministic argument Constraints. Capability Sets express allowed authority only; Provider deny policy is applied separately.

## Authorization Proposal

A structured request for authority that an Agent Client presents for approval or policy evaluation. It contains required and optional requested Capabilities and never includes the user's raw natural-language prompt.

## Effective Authority

The final authority available for one operation after intersecting all applicable positive authority sources and subtracting Provider denials. In delegated mode this includes Subject authority, Delegation Grant authority, Agent-local authority, Provider policy, and runtime restrictions.

## Constraint Predicate

A deterministic predicate over one action argument. A presented argument satisfies a Constraint Predicate only when the predicate evaluates to true.

## Constraint Subsumption

A decidable, sound, and deterministic comparison that proves a child Constraint accepts no values outside the parent Constraint. Constraint Subsumption is the basis for verifiable attenuation.

## Constraint Registry

The set of portable Constraint types whose runtime check semantics and Subsumption rules are defined precisely enough for independent implementations to agree.

## Relationship Context

Provider-side authorization facts derived from relationships among Subjects, organizations, teams, projects, Resources, or other local entities. Relationship Context may be produced by ReBAC, RBAC, ABAC, ACLs, or another local policy model and is not itself a portable AgentAuth wire format.

## Consent Selection

The subset and optional narrowing of an Authorization Proposal that an authorized approver accepts. A Consent Selection can remove optional authority or tighten authority, but cannot add authority not present in the proposal.

## Approval Evidence

A signed, stored, or otherwise verifiable record showing that an authorized approver accepted a Consent Selection or approved a specific Action Digest under stated conditions.

## Authorization Decision

The Provider or Authority result for one normalized Action Intent. The result is allow, deny, or step_up, with reason codes, matched authority, and required obligations.

## Resource Selector

A portable description of Resources covered by a Capability. AgentAuth v0.2 core uses exact Resource identifiers. Pattern and relationship selectors require explicitly defined extension semantics.

## Argument Constraint Map

A map from Action argument names to deterministic Constraint Predicates. When present in the core profile, it uses closed-world semantics: unlisted arguments are forbidden and every listed argument is required.

## Direct Entitlement

Positive authority assigned directly to an Agent Principal by an Authority or Provider, independent of a represented human Subject.


## Trust Anchor

Cryptographic or administrative trust material used to decide whether identity or attestation evidence from a Trust Domain can be accepted. Trust Anchors establish validation roots, not application permission.

## Federation Peer

An external Trust Domain with which a local Trust Domain has an explicit, bounded trust relationship. A Federation Peer is never trusted transitively by default.

## Federation Policy

The local rules defining which identity, attestation, audiences, actor classes, publishers, assurance properties, and delegation semantics may be accepted from a Federation Peer.

## Attestation Evidence

Signed or otherwise integrity-protected claims about the environment, software, hardware, workload, or measured state of an Agent Instance runtime.

## Attestation Result

The verifier-produced conclusion derived from Attestation Evidence and appraisal policy. An Attestation Result is a trust input and is not itself authorization.

## Attestation Verifier

The trusted evaluator that validates Attestation Evidence against reference values, endorsements, freshness requirements, and appraisal policy.

## Runtime Assurance

A local assessment of confidence in the environment operating an Agent Instance. Runtime Assurance may be unknown, software-backed, workload-backed, hardware-backed, or another locally defined class. Assurance labels are not globally ordered unless federation policy defines a mapping.

## Enrollment Challenge

A fresh, single-use challenge used during Agent Instance enrollment to prove possession of the Instance Proof Key and bind optional runtime evidence to the enrollment transaction.

## Instance Proof Key

The cryptographic key controlled by one Agent Instance and used to prove possession in AgentAuth protocol interactions. It is independent from Authority token-signing keys.

## Authority Signing Key

A key controlled by an Authority and used to sign credentials, metadata, or assertions issued by that Authority. It does not identify a running Agent Instance.

## Key Epoch

A versioned period during which a specific cryptographic key is authoritative for one identity or signing purpose. Rotation creates a new Key Epoch without changing the durable Agent Principal identity.

## Trust Decision

A local decision about whether identity, issuer, runtime, federation path, proof, and freshness evidence are acceptable for further authorization evaluation. A positive Trust Decision does not imply permission to perform an Action.

## Federation Provenance

The auditable chain of issuers, exchanges, mappings, and trust decisions through which a foreign Agent identity becomes acceptable to a local Provider Authority.

## Reference Values

Expected measurements, identities, versions, or configuration properties used by an Attestation Verifier to appraise Attestation Evidence.

## Endorsement

Trusted information from a manufacturer, platform operator, workload authority, or another recognized source that helps an Attestation Verifier interpret or validate Attestation Evidence.
