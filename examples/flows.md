# Worked Flows

## Example A: Personal assistant reads calendar API

1. User signs in to AgentAuth through existing IdP.
2. User approves grant:
   - agent: Personal Assistant
   - resource: calendar
   - actions: event.read
   - duration: 7 days
3. Agent Instance proves its key.
4. Runtime exchanges authority for calendar audience token.
5. Calendar Resource Server validates:
   - issuer
   - audience
   - DPoP
   - Subject
   - `act` Agent Actor
   - grant
6. Calendar returns events.
7. Audit records Agent, Instance, Subject, grant, action.

## Example B: Personal assistant sends email with step-up

Grant permits draft creation automatically but sending external email requires approval.

1. Agent prepares Action Intent.
2. Policy returns `step_up`.
3. User sees recipients and subject summary.
4. User approves Action Digest.
5. Agent obtains authorization bound to digest.
6. Resource Server verifies digest before send.
7. Changing recipient requires new approval.

## Example C: Agent opens web dashboard natively

1. Agent obtains token for target web app.
2. Agent calls `/agent/session`.
3. Target returns one-time bootstrap.
4. Browser redeems.
5. Target session record is `actor_type=ai_agent`.
6. Dashboard displays "Operated by Personal Assistant".
7. Audit distinguishes agent actions from human actions.

## Example D: Legacy browser application

1. No API and no AgentAuth integration exists.
2. AgentAuth Browser Bridge starts isolated Chromium.
3. Vault injects credential.
4. Agent navigates target.
5. Action Guard blocks unapproved external domain.
6. Agent completes permitted task.
7. AgentAuth audit records action.
8. Target itself may still record only the underlying legacy account identity.

## Example E: Orchestrator delegates to specialist

1. User grants Orchestrator:
   - invoice.read
   - payment.create max 500 USD
   - delegation depth 1
2. Orchestrator creates child grant for Payment Specialist:
   - payment.create max 100 USD
   - vendor allowlist
   - delegation depth 0
3. Attenuation passes.
4. Specialist acts with nested Actor context.
5. Request for 150 USD is denied.
