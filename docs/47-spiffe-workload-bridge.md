# AgentAuth v0.2 SPIFFE and Workload Identity Bridge

## 1. Goal

SPIFFE solves workload identity.

AgentAuth adds AI Agent Principal, Agent Instance, delegation, authorization, and Provider-facing actor semantics.

The systems complement each other.

## 2. Identity distinction

A SPIFFE ID identifies a workload in a SPIFFE Trust Domain.

An Agent Principal identifies an AI Agent security principal in an AgentAuth identity domain.

They are not automatically equal.

Example:

```text
SPIFFE:
  spiffe://prod.example/workload/assistant-runtime

AgentAuth:
  (https://agents.example.com, finance-assistant)
```

A trusted mapping is required.

## 3. Bridge sequence

```text
workload
  -> obtain SPIFFE SVID
  -> AgentAuth enrollment / identity broker validates SVID
  -> trusted mapping selects Agent Principal
  -> runtime proves Instance Proof Key
  -> Agent Instance established
  -> AgentAuth resource credential issued
```

## 4. Mapping policy

A mapping MUST be configured or derived from trusted administrative policy.

Example conceptual rule:

```text
spiffe://prod.example/ns/finance/sa/assistant
  may enroll
Agent Principal finance-assistant
```

The workload MUST NOT choose an arbitrary Agent Principal identifier.

## 5. SPIFFE Trust Domain

SPIFFE Trust Domain and AgentAuth Trust Domain are separate domain concepts.

A deployment MAY align them one-to-one.

It MAY also map:

- one SPIFFE Trust Domain to multiple AgentAuth Trust Domains
- multiple workload domains to one AgentAuth administrative domain

The mapping must be explicit.

## 6. SPIFFE federation

SPIFFE federation distributes trust bundles across SPIFFE Trust Domains.

AgentAuth Federation Policy remains separate.

Trusting a foreign SPIFFE bundle does not automatically mean:

- accepting its Agent publishers
- accepting delegated human Subjects
- accepting all AgentAuth capabilities
- accepting its runtime assurance for every Action

## 7. SVID types

The bridge may validate supported SPIFFE verifiable identity documents according to deployment policy.

AgentAuth does not redefine:

- X.509-SVID
- JWT-SVID
- WIT-SVID

The bridge consumes authenticated workload identity and maps it to AgentAuth semantics.

## 8. Instance Proof Key

The Agent Instance Proof Key may be distinct from the SVID key.

This is the default conceptual model.

Benefits:

- Agent Instance lifecycle can differ from workload credential rotation
- DPoP binding can be specific to AgentAuth
- workload identity compromise and AgentAuth key compromise remain separable

A future profile may define stronger direct binding.

## 9. Runtime assurance

A SPIFFE identity proves workload identity under SPIFFE trust.

It does not by itself prove hardware state or software measurements.

Provider policy may treat a verified SPIFFE mapping as workload-backed assurance while separately requiring EAT or another attestation mechanism for stronger properties.

## 10. Rotation

SPIFFE SVID rotation does not necessarily rotate the Agent Instance Proof Key.

The bridge SHOULD tolerate normal SVID rotation while preserving the trusted workload-to-Agent mapping.

Agent Instance Proof Key rotation follows AgentAuth key lifecycle.

## 11. Revocation and removal

If the workload mapping is removed:

- new enrollment through that mapping fails
- new reauthorization relying on that workload mapping fails
- existing Agent Instances follow Home Authority policy

A Provider may require fresh workload identity for every high-risk token issuance.

## 12. Security invariant

```text
valid SPIFFE workload
does not imply
valid Agent Principal mapping

valid Agent Principal mapping
does not imply
Provider permission
```

## 13. Standards alignment

AgentAuth relies on the SPIFFE specifications for:

- SPIFFE IDs
- Trust Domains
- SVID validation
- bundle distribution
- SPIFFE federation
- Workload API behavior

AgentAuth defines only the mapping into Agent Principal and Agent Instance semantics.
