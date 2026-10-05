# PR5 Discoverability, Citation, and Publication Research

## Status

Non-normative research checkpoint: 2026-10-05.

This note records the official guidance used when designing the AgentAuth
publication and discoverability layer.

## Google Search and AI features

Google Search documentation continues to treat AI-feature visibility as part of
normal search discoverability rather than a separate guaranteed "GEO" ranking
system.

Google's June 2026 documentation update explicitly clarified that `llms.txt`
is not needed for Google Search and does not positively or negatively affect
Google visibility or rankings.

References:

https://developers.google.com/search/updates
https://developers.google.com/search/docs/appearance/

Design consequence:

- AgentAuth maintains `llms.txt` for systems that choose to consume it
- the repository does not claim `llms.txt` is a Google ranking signal
- canonical content, crawlability, descriptive titles, internal links, and
  useful answer-first pages remain the primary publication strategy

## Structured data

Google documents structured data as a way to help its systems understand page
content, subject to content and technical guidelines.

Reference:

https://developers.google.com/search/docs/appearance/structured-data/article

Design consequence:

The AgentAuth documentation landing page includes JSON-LD that matches visible
content and identifies the technical work, author, repository, and licenses.

The project does not claim structured data guarantees a rich result or ranking.

## ChatGPT Search and OpenAI crawlers

OpenAI documents `OAI-SearchBot` as the crawler used to surface websites in
ChatGPT search features. It is distinct from `GPTBot`.

Reference:

https://developers.openai.com/api/docs/bots

Design consequence:

The publication notes recommend allowing `OAI-SearchBot` at the actual
documentation host when ChatGPT Search eligibility is desired.

A project-site repository cannot reliably control the account-wide root
`robots.txt` of a `username.github.io` host, so the repository does not
publish a misleading project-level robots policy and claim it applies globally.

## GitHub citation support

GitHub recognizes `CITATION.cff` and exposes a "Cite this repository" surface
when the file exists on the default branch.

Reference:

https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-citation-files

Design consequence:

AgentAuth publishes a CFF 1.2 citation record and a preferred technical-report
citation for the system design.

## Documentation licensing

Creative Commons Attribution 4.0 permits sharing and adaptation, including
commercial use, subject to attribution and other license conditions.

References:

https://creativecommons.org/licenses/by/4.0/
https://creativecommons.org/licenses/by/4.0/legalcode

Design consequence:

Original AgentAuth documentation prose and diagrams are published under CC BY
4.0 unless otherwise stated, while software-oriented repository material
remains Apache-2.0.

The repository explicitly distinguishes licensed expression from abstract ideas
and independently written implementations.

## GitHub Pages

GitHub recommends GitHub Actions for automated Pages deployment and supports
Jekyll-based sites.

References:

https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

Design consequence:

AgentAuth includes a Pages workflow that deploys the `docs/` site only when
Pages is already enabled. It does not attempt to bypass repository settings or
force-enable Pages using unavailable credentials.
