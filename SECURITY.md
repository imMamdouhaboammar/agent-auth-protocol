# Security Policy

## Supported Versions

The AgentAuth protocol is currently in active draft / v0.1 specification. Security vulnerability reports are actively received and addressed.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Security Philosophy

AgentAuth is built upon cryptographic identity, scoped authority delegation, and verifiable audit trails. We treat protocol design flaws, token exchange vulnerabilities, replay attacks, impersonation vectors, and privilege escalation vulnerabilities with the highest priority.

## Reporting a Vulnerability

If you discover a potential security vulnerability in the AgentAuth specification, reference schemas, or reference implementations:

1. **Do not open a public issue or discussion.**
2. Send an email with full reproduction steps to:
   - **Email**: `mamdouhfces1997@gmail.com`
   - Subject line: `[SECURITY] Vulnerability Report: AgentAuth`
3. Include the following details:
   - Description of the vulnerability and attack vector
   - Affected specification document, schema, or API path
   - Proof-of-concept (PoC) or reproduction steps
   - Potential impact on confidential agent credentials or user authority
   - Suggested mitigations or remediation if known

## Response Timeline

- **Initial Acknowledgement**: Within 24 to 48 hours.
- **Triage & Assessment**: Within 5 business days.
- **Remediation & Disclosure**: We follow coordinated vulnerability disclosure (CVD). A patch or specification errata will be published alongside an advisory crediting the reporter.
