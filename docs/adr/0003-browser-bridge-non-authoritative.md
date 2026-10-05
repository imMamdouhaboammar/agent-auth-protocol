# ADR 0003: Browser automation is not authoritative identity

Status: Accepted for design v0.1

## Context

Many important applications remain browser-only.

A managed browser can protect credentials and produce an audit trail, but an unmodified target application still sees its own legacy session.

## Decision

Legacy Browser Bridge is a compatibility profile with lower assurance.

AgentAuth MUST NOT claim target-side agent awareness unless the target integrates through a gateway or native Agent Session flow.

## Consequences

- product messaging stays technically accurate
- native integrations have a clear benefit
- legacy systems remain usable
- policy must be more conservative in legacy browser mode
