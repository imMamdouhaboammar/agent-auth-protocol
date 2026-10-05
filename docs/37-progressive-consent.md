# AgentAuth v0.2 Progressive Consent

## 1. Goal

Agents SHOULD request the minimum authority required for the current task.

Consent should support narrowing and optional selection rather than presenting one all-or-nothing permission bundle.

## 2. Authorization Proposal

An Authorization Proposal separates:

- required Capabilities
- optional Capabilities
- requested lifetime
- purpose
- delegation request
- Provider resource

Example:

```json
{
  "proposal_id": "prop_123",
  "subject": {
    "type": "human",
    "issuer": "https://id.example.com",
    "id": "user_123"
  },
  "actor": {
    "issuer": "https://agents.example.com",
    "id": "assistant_7"
  },
  "required_capabilities": [
    {
      "type": "agent_action",
      "action": "calendar.event.read",
      "resources": ["urn:calendar:primary"]
    }
  ],
  "optional_capabilities": [
    {
      "type": "agent_action",
      "action": "calendar.event.create",
      "resources": ["urn:calendar:primary"]
    }
  ],
  "requested_expires_at": "2026-10-06T12:00:00Z"
}
```

## 3. Consent Selection

The approver can:

- accept required Capabilities
- omit optional Capabilities
- narrow Resources
- tighten Constraints
- shorten lifetime
- reduce delegation depth
- deny the proposal

The approver cannot add new authority.

## 4. Required Capability narrowing

If an approver narrows a required Capability, the system MAY activate the narrower grant.

The Agent Client MUST be told that granted authority differs from requested authority.

The Agent decides whether the task can continue.

It MUST NOT silently request broader authority again.

## 5. Optional capabilities

Optional Capabilities enable progressive consent.

Example:

```text
Required:
- read calendar

Optional:
- create calendar events
- invite external attendees
```

The user may grant only `read calendar`.

The resulting grant contains only selected Capabilities.

## 6. Scope intersection

When a Provider also has local user permissions:

```text
Granted Capability
INTERSECT
User Permission
INTERSECT
Provider Policy
```

is evaluated.

A grant cannot elevate the Subject above the Subject's own Provider authority.

## 7. Progressive expansion

If an Agent later needs a Capability not in the active grant:

1. Agent creates a new Authorization Proposal for the delta
2. Authority displays only new or changed authority plus relevant current context
3. approver selects or denies
4. a new grant version or additional grant is created
5. audit links the new consent to the prior authorization state

The Agent MUST NOT silently broaden an existing grant.

## 8. Progressive reduction

Authority can be narrowed without requiring a broader consent ceremony.

Examples:

- shorten expiry
- remove optional Capability
- lower amount maximum
- remove Resource
- reduce delegation depth

The narrowing event SHOULD be audited.

## 9. Consent revocation

The Subject or authorized administrator can revoke consent.

Revocation:

- prevents new credentials based on that grant
- invalidates descendants
- triggers Provider-session handling according to revocation freshness policy
- revokes refresh authority tied to the grant

Already-issued short-lived access tokens follow the Provider's configured revocation strategy.

High-risk Providers SHOULD support faster invalidation than waiting for natural expiry.

## 10. Per-resource consent

Consent SHOULD identify concrete Resources where practical.

Prefer:

```text
read Repository A
```

over:

```text
read all repositories
```

This also improves human comprehension.

## 11. Per-tool consent

For tool-oriented systems, the consent UI can map Actions to recognizable tools.

Example:

```text
GitHub
- Read repository files
- Create pull requests

Payments
- Create payment up to 500 USD
```

Tool branding is presentation.

The underlying grant remains structured AgentAuth Capabilities.

## 12. Consent is not authentication

An authenticated Subject may deny consent.

A valid Agent identity does not imply Subject consent.

A valid historical consent does not override current Provider policy.

## 13. Consent evidence

Consent evidence SHOULD record:

- proposal identifier
- selected Capability Set
- rejected optional Capabilities
- Subject
- Agent Actor
- approver
- timestamp
- expiry
- purpose
- policy version
- delegation depth
- source Provider or Authority

Raw prompt text is not required.
