# Privacy Specification

## Data minimization

AgentAuth authorization does not require full conversation history.

Prefer:

- structured Action Intent
- structured grant
- Subject identifier
- Agent identifier
- purpose
- approval digest
- policy result

Avoid by default:

- raw prompt transcript
- full web page contents
- unredacted screenshots
- plaintext credentials
- unnecessary identity attributes

## Consent evidence

Store enough evidence to answer:

- who approved
- what exact authority
- for which agent
- for which subject
- duration
- purpose
- whether subdelegation was allowed
- policy version

Do not store full conversational context unless tenant policy explicitly requires it.

## Regional control

Each tenant has:

- home region
- allowed processing regions
- audit residency rule
- browser execution region
- backup regions
- external federation policy

## Subject data deletion

Administrative identity metadata may be deleted or pseudonymized according to applicable policy.

Security audit records may have separate legal retention requirements.

If audit must be retained, minimize direct personal data and use stable pseudonymous references where feasible.

## Model-provider boundary

No private key, password, refresh token, cookie, or raw vault secret should be sent to an external model provider.

Structured action metadata sent to a model should be limited to what reasoning requires.

## Screenshot handling

Screenshots can contain personal or secret data.

Default:

- off for low-value events
- redact credential fields
- short retention
- per-tenant control
- separate access permission from ordinary logs
