# AgentAuth v0.2 Provider Policy and Relationship Context

## 1. Purpose

Many real authorization decisions depend on relationships rather than flat scopes.

AgentAuth supports relationship-aware Providers without standardizing one relationship database or policy language.

## 2. Relationship examples

A Provider may model:

```text
user -> organization
user -> team
team -> project
project -> resource
agent -> approved tool
agent -> Provider Agent Account
resource -> sensitivity class
```

These relationships can determine Subject Authority or local Agent Authority.

## 3. ReBAC example

Provider-local policy may establish:

```text
user:alice member team:engineering
team:engineering contributor project:auth-service
project:auth-service contains repo:auth-service

agent:reviewer approved_for tool:github
tool:github supports repo.read
```

The Provider may conclude that a delegated `repo.read` request is locally eligible.

That relationship inference stays inside Provider Policy.

## 4. Why relationship tuples are not portable AgentAuth grants

Relationship semantics differ significantly between Providers.

For example:

```text
member
owner
editor
contributor
manager
approver
```

have no universal meaning.

Transmitting a relationship tuple as if it were portable authority would require the receiving system to share the same graph schema and semantics.

AgentAuth instead transmits the resulting bounded Capability and identity context.

## 5. Provider policy adapters

A Provider SDK may adapt to:

- OpenFGA
- Zanzibar-style systems
- Cedar
- OPA
- native RBAC
- database ACLs
- custom business rules

The adapter returns local authorization facts to the Provider authorization evaluator.

The protocol does not require one adapter.

## 6. Tool authorization

Tool access should be separated into at least:

1. Agent allowed to use tool
2. Agent allowed to perform operation
3. represented Subject allowed to access target Resource
4. Capability Grant covers operation and Resource
5. arguments satisfy Constraints
6. Provider local policy permits current context

A broad `tool:github` permission MUST NOT automatically authorize every GitHub operation.

## 7. Resource relationship boundary

A Provider can use relationships to resolve Resource scope.

Example:

```text
Subject can read:
repo:A
repo:B

Grant allows:
repo:A
repo:C

Effective Resource set:
repo:A
```

The Agent cannot gain `repo:C` simply because the grant names it.

## 8. Organization and tenant context

Provider tenant membership is local policy input.

An Agent's `org_id` claim or descriptive metadata MUST NOT be trusted as Provider membership unless the Provider has an authenticated mapping for it.

Issuer-qualified identity prevents same-name Agent collisions across organizations.

## 9. Explicit deny

A Provider may maintain explicit deny relationships or rules.

Examples:

- Agent prohibited from payroll data
- user suspended
- Resource under legal hold
- tool operation disabled tenant-wide

Local deny wins after positive-authority intersection.

## 10. Dynamic context

Some local authorization facts are time-sensitive:

- incident mode
- account freeze
- fraud signal
- patient emergency status
- deployment window
- transaction state

A cached grant does not freeze those facts.

High-risk requests SHOULD re-evaluate dynamic Provider Policy close to execution.

## 11. Trusted context

Relationship Context supplied by the Agent Client is advisory unless independently authenticated.

The Provider SHOULD derive security-critical relationships from its own source of truth or a trusted policy service.

## 12. Audit

Provider audit SHOULD capture enough information to explain:

- which Subject relationship allowed access
- which Agent local permission applied
- which grant Capability matched
- which Provider policy version ran
- which deny rule, if any, blocked the operation

The Provider does not need to expose its full relationship graph to the Agent.
