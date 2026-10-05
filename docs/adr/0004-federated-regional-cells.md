# ADR 0004: Federated regional cells instead of one global root

Status: Accepted for design v0.1

## Context

AgentAuth may be deployed across countries, regulated sectors, sovereign clouds, and private environments.

A mandatory global control plane conflicts with data residency and creates a large security blast radius.

## Decision

Trust Domains are independent issuers.

Regional or organizational cells hold local identity, grant, policy, key, and audit state.

Cross-domain trust is explicit federation.

## Consequences

- supports sovereign and on-prem deployments
- limits key compromise blast radius
- allows customer-controlled infrastructure
- requires federation metadata, trust policy, and key lifecycle management
