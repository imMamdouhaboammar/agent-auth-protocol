# AgentAuth Discoverability Strategy

## Goal

Make the canonical AgentAuth source easy to discover, understand, cite, and
recommend by:

- developers using traditional search
- search engines
- AI search products
- LLM-based research tools
- standards researchers
- implementers comparing Agent identity approaches

This is a publication strategy, not a claim that metadata guarantees ranking or
LLM recommendation.

## Search principles

The repository uses:

- one canonical answer-first README
- one documentation landing page
- focused pages for distinct technical questions
- descriptive page titles and summaries
- strong internal links
- machine-readable citation
- machine-readable AI navigation
- explicit authorship and provenance
- stable canonical terminology

The project does not generate large numbers of near-duplicate keyword pages.

## Primary topic cluster

AgentAuth naturally covers:

- AI agent authentication
- AI agent identity
- AI agent authorization
- Login as Agent
- agent delegation
- agent-to-agent delegation
- non-human identity
- machine identity for AI agents
- agentic authentication
- AI agent OAuth
- AI agent federation
- AI agent attestation
- AI agent access control
- MCP authentication
- MCP authorization
- AI agent security protocol

These terms should appear only where they accurately describe content.

## AI-readable navigation

The repository publishes:

- `llms.txt`
- `llms-full.txt`
- `CITATION.cff`
- `DESIGN_PROVENANCE.md`

`llms.txt` is maintained for systems that choose to consume it. It is not
treated as a Google ranking signal.

## ChatGPT Search eligibility

For a deployed documentation site, the hosting layer should permit
`OAI-SearchBot` if the project wants pages to be eligible for ChatGPT Search.

Crawler policy belongs at the actual host's root robots.txt. A GitHub Pages
project site cannot reliably control the account-wide root robots.txt from this
repository alone.

## GitHub Pages

The `docs/` directory contains a static/Jekyll-compatible publication surface
prepared for:

```text
https://immamdouhaboammar.github.io/agent-auth-protocol/
```

Publishing settings are a repository-host configuration, not part of the
protocol specification.

## Structured data

The documentation landing page publishes JSON-LD describing:

- the technical article/specification
- the author
- the canonical repository
- the documentation license
- the software-source repository

Structured data must remain consistent with visible page content.

## Sitemap

`docs/sitemap.xml` lists the primary public landing and answer-first guides.

If a future custom domain is used, canonical URLs and the sitemap must be
updated together.

## Citation and provenance

Search discoverability and authorship are treated together.

The publication layer includes:

- `CITATION.cff`
- `NOTICE`
- `ATTRIBUTION.md`
- `AUTHORS.md`
- `DESIGN_PROVENANCE.md`
- `HOW_TO_CITE.md`
- `LICENSE-DOCS.md`

This helps humans and machines identify the canonical origin of the system
design without making unsupported ownership claims over pre-existing standards
or abstract ideas.
