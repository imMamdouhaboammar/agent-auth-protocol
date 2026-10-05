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
