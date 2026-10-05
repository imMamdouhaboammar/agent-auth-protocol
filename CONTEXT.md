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
