# AgentAuth v0.2 Error Registry

## 1. Goal

AgentAuth errors must be machine actionable without leaking credentials or collapsing OAuth errors into ambiguous free text.

## 2. Error envelope

AgentAuth-specific JSON errors SHOULD use:

```json
{
  "protocol_version": "0.2",
  "error": "agentauth_grant_required",
  "error_description": "A delegated grant is required.",
  "recoverable": true,
  "interaction_required": true,
  "agentauth": {}
}
```

`error_description` is diagnostic text and MUST NOT contain secrets.

## 3. Registry

| Error | HTTP | Recoverable | Interaction | Meaning |
|---|---:|---:|---:|---|
| `agentauth_not_supported` | 400/404 | no | no | target does not expose selected AgentAuth profile |
| `agentauth_version_unsupported` | 400 | yes | no | no compatible protocol version |
| `agentauth_profile_mismatch` | 400 | yes | no | required conformance profile is unsupported |
| `agentauth_authority_not_trusted` | 403 | maybe | maybe | issuer or federation path not trusted |
| `agentauth_agent_invalid` | 401 | maybe | no | Agent Principal identity invalid |
| `agentauth_instance_invalid` | 401 | maybe | no | Agent Instance invalid |
| `agentauth_instance_suspended` | 403 | maybe | maybe | Agent Instance suspended |
| `agentauth_instance_revoked` | 403 | no | maybe | Agent Instance revoked |
| `agentauth_proof_required` | 401 | yes | no | proof-of-possession missing |
| `agentauth_proof_invalid` | 401 | yes | no | proof verification failed |
| `agentauth_proof_replayed` | 401 | yes | no | replayed proof detected |
| `agentauth_audience_mismatch` | 401 | yes | no | credential not issued for this resource |
| `agentauth_grant_required` | 403 | yes | yes | delegated authority requires a grant |
| `agentauth_grant_denied` | 403 | no | maybe | requested grant denied |
| `agentauth_grant_suspended` | 403 | maybe | maybe | grant temporarily suspended |
| `agentauth_grant_revoked` | 403 | no | yes | grant revoked |
| `agentauth_grant_expired` | 403 | yes | yes | grant expired and new authorization is required |
| `agentauth_insufficient_authority` | 403 | maybe | maybe | current authority does not cover action |
| `agentauth_step_up_required` | 403 | yes | yes | additional approval or proof required |
| `agentauth_provider_account_required` | 403 | yes | yes | Provider requires local Agent Account |
| `agentauth_provider_account_suspended` | 403 | maybe | yes | local Provider Agent Account suspended |
| `agentauth_session_expired` | 401 | yes | maybe | Provider Agent Session expired |
| `agentauth_session_revoked` | 401 | yes | yes | Provider Agent Session revoked |
| `agentauth_bootstrap_invalid` | 400 | yes | no | browser bootstrap invalid |
| `agentauth_bootstrap_replayed` | 409 | yes | no | one-time bootstrap already consumed |
| `agentauth_idempotency_conflict` | 409 | yes | no | same key used with different request |
| `agentauth_policy_denied` | 403 | no | maybe | Provider local policy denied action |
| `agentauth_federation_not_trusted` | 403 | maybe | maybe | no accepted federation path exists |
| `agentauth_federation_disabled` | 403 | maybe | maybe | configured Federation Peer is suspended or removed |
| `agentauth_attestation_required` | 403 | yes | maybe | selected trust policy requires Runtime Attestation |
| `agentauth_attestation_rejected` | 403 | maybe | maybe | Attestation Result failed appraisal |
| `agentauth_attestation_indeterminate` | 403 | maybe | maybe | required attestation could not be established |
| `agentauth_key_epoch_invalid` | 401 | yes | maybe | signing, federation, or Instance key epoch is retired or invalid |

The two-status entry for `agentauth_not_supported` reflects whether the failure occurs during a known protocol endpoint request or discovery of a non-existent optional endpoint.

## 4. OAuth errors

When an OAuth specification already defines the failure, the standard OAuth error remains authoritative.

AgentAuth MAY add structured context, but MUST NOT redefine standard error meaning.

Examples:

- `invalid_token`
- `invalid_client`
- `invalid_grant`
- `insufficient_scope`
- `invalid_target`

## 5. Retry behavior

A client MUST NOT retry indefinitely.

The following generally permit a corrected retry:

- version mismatch after new negotiation
- proof required or invalid
- expired token
- grant expired after new consent
- step-up required after successful approval
- idempotency conflict with a new valid key and deliberate new request

The following SHOULD NOT be automatically retried without state change:

- revoked Instance
- revoked Grant
- untrusted Authority
- Provider policy denial
- denied consent
- removed Federation Peer
- rejected mandatory attestation

## 6. Interaction required

When `interaction_required=true`, the Agent SDK MUST surface the requirement to the orchestrator or authorized human flow.

The model MUST NOT fabricate an approval result.

## 7. Logging

Servers SHOULD log:

- error code
- trace identifier
- issuer
- Agent Principal key
- Agent Instance key
- Provider resource
- policy reason code

Servers MUST NOT log:

- access token
- DPoP proof
- refresh token
- private key
- browser cookie
- bootstrap secret
- approval secret
