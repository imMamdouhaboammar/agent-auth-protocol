# Contributing to AgentAuth Protocol

Thank you for your interest in contributing to the AgentAuth Protocol and Platform specification!

## Principles

1. **Standards-First**: We build on proven identity and authorization standards (OAuth 2.0 BCP, OIDC, RFC 8693 Token Exchange, DPoP, RAR, SPIFFE) rather than inventing unproven primitives.
2. **Explicit Separation of Concerns**: Maintain the strict architectural separation between Agent Definition, Agent Principal, Agent Instance, Delegator/Subject, and Execution Session.
3. **No Slop & Cryptographic Rigor**: Specifications must be normative, deterministic, and verifiable. All schemas must remain compliant with JSON Schema Draft 2020-12.

## How to Propose Changes

### 1. Specification RFC Process
- For major architectural or protocol changes, submit an issue using the **Specification RFC** template or open an Architectural Decision Record (ADR) in `docs/adr/`.
- Discuss the motivation, alternative considered, threat model implications, and backwards compatibility.

### 2. Schema and API Updates
- When modifying or adding JSON schemas under `schemas/`:
  - Ensure compatibility with Draft 2020-12.
  - Update any corresponding examples under `examples/`.
  - Add or update automated test assertions under `tests/`.

### 3. Local Verification with Bun

We use **[Bun](https://bun.sh)** for local dependency management and test execution:

```bash
# Install dependencies
bun install

# Run automated test suite (schemas, OpenAPI, integrity, docs)
bun test

# Verify cryptographic checksums
bun run validate:checksums
```

All CI checks must pass before pull requests can be merged.

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `spec: <description>` for changes to specification documents
- `schema: <description>` for modifications to JSON schemas
- `api: <description>` for updates to `openapi.yaml`
- `test: <description>` for test suite additions
- `docs: <description>` for README or documentation updates
- `ci: <description>` for GitHub Actions workflows
