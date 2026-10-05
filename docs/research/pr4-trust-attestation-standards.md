# PR4 Trust, Federation, and Attestation Standards Research

## Status

Non-normative research checkpoint: 2026-10-05.

## 1. RATS Architecture

Reference:

https://www.rfc-editor.org/rfc/rfc9334.html

RFC 9334 defines the RATS architecture and terminology around Attester, Verifier, Relying Party, Evidence, Endorsements, Reference Values, and Attestation Results.

AgentAuth design takeaway:

Use the RATS separation instead of making every Provider understand platform-specific evidence.

## 2. Entity Attestation Token

Reference:

https://www.rfc-editor.org/rfc/rfc9711.html

RFC 9711 is a Standards Track specification for Entity Attestation Token (EAT).

AgentAuth design takeaway:

Do not invent a proprietary generic attestation token. Accept profile-defined EAT evidence or results where appropriate.

## 3. EAT Media Types

Reference:

https://www.rfc-editor.org/rfc/rfc9782.html

AgentAuth design takeaway:

Reuse standard media types when EAT payloads are transported.

## 4. EAT Measured Component

Reference:

https://www.rfc-editor.org/rfc/rfc10013.html

RFC 10013, published July 2026, defines information and data models for measured components usable with EAT.

AgentAuth design takeaway:

Measured software/component evidence belongs in attestation profiles rather than new AgentAuth measurement fields.

## 5. SPIFFE Trust Domain and Federation

References:

https://spiffe.io/docs/latest/spiffe-specs/spiffe_trust_domain_and_bundle/
https://spiffe.io/docs/latest/spiffe-specs/spiffe_federation/
https://spiffe.io/docs/latest/spiffe-specs/spiffe_workload_api/

Observed stable concepts:

- independent Trust Domains
- issuer-qualified workload identity
- rotating trust bundles
- explicit federation
- runtime retrieval of workload identity

AgentAuth design takeaway:

Reuse the workload identity and federation concepts but keep Agent Principal identity distinct from SPIFFE workload identity.

## 6. OAuth Attestation-Based Client Authentication

Reference:

https://datatracker.ietf.org/doc/draft-ietf-oauth-attestation-based-client-auth/

At the 2026-10-05 checkpoint this remains an Internet-Draft.

AgentAuth design takeaway:

Track it as a likely future interoperability point for client-instance proof and attestation, but do not make v0.2 depend on draft-specific wire fields.

## 7. WIMSE

Reference:

https://datatracker.ietf.org/wg/wimse/about/

WIMSE continues work on workload identity credentials and AI Agent identity topics.

AgentAuth design takeaway:

Prefer alignment with WIMSE as stable outputs emerge. Keep AgentAuth extensions versioned and replaceable.

## 8. Design decisions resulting from research

PR4 adopts:

- no global root
- non-transitive federation by default
- explicit trust paths
- RATS-style Attester / Verifier / Relying Party separation
- EAT as a supported standards foundation
- local, non-global assurance classes
- explicit workload-to-Agent mapping for SPIFFE
- proof-key binding for attestation where the profile requires it
- key-class separation
- brokered federation that preserves canonical Agent provenance

PR4 does not standardize:

- one universal hardware attestation profile
- one global assurance score
- one mandatory SPIFFE deployment
- draft OAuth attestation fields
- a global Agent publisher registry
