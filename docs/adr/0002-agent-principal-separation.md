# ADR 0002: Separate Agent Principal from Agent Instance

Status: Accepted for design v0.1

## Context

One agent product may run on many devices, workers, regions, or customer environments.

Treating all copies as one credential creates excessive blast radius.

## Decision

Use a durable Agent Principal and independent Agent Instances.

Each Agent Instance has its own proof identity and revocation lifecycle.

## Consequences

- one compromised worker can be revoked without disabling the whole agent
- runtime attestation can differ per instance
- audit can identify exact execution source
- token binding becomes practical
- instance management adds operational state
