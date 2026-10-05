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
