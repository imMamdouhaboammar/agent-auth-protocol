# ADR 0008: Separate Management API from AgentAuth Wire Protocol

## Status

Accepted for AgentAuth v0.2 system design.

## Context

The repository contains `api/openapi.yaml` for Agent Principal lifecycle, grants, policy decisions, browser bootstrap, and audit.

Many of those operations are deployment control-plane functions.

If that OpenAPI document is treated as the protocol itself, independent implementations would be forced to expose identical administrative endpoints even when they use different internal identity stores or governance models.

## Decision

AgentAuth distinguishes:

1. **Normative wire protocol**, defining interoperable interactions between Agent Client, Authority, and Provider
2. **Management and integration API**, defining one reference control-plane surface

OAuth endpoints retain their standards-defined wire formats.

AgentAuth adds only the minimum versioned metadata, claims, errors, and Provider interaction contracts needed for interoperability.

The management API MAY evolve independently while preserving wire-protocol semantics.

## Consequences

Positive:

- independent Authorities can use different administration models
- Provider and Agent SDK interoperability does not depend on one hosted platform
- control-plane changes do not automatically break the protocol
- standards-defined OAuth endpoints remain standards-defined

Costs:

- documentation must clearly label management versus wire surfaces
- conformance tests must target the wire protocol rather than one OpenAPI deployment
- some features require both protocol tests and separate management API tests
