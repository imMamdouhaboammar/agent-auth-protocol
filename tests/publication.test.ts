import { describe, expect, it } from "bun:test";
import { readFileSync, existsSync, statSync } from "node:fs";
import YAML from "yaml";

const repoUrl = "https://github.com/imMamdouhaboammar/agent-auth-protocol";
const pagesUrl = "https://immamdouhaboammar.github.io/agent-auth-protocol/";

describe("AgentAuth publication, citation, and discoverability", () => {
  it("publishes the required authorship and licensing artifacts", () => {
    const files = [
      "NOTICE",
      "LICENSE-DOCS.md",
      "ATTRIBUTION.md",
      "HOW_TO_CITE.md",
      "AUTHORS.md",
      "DESIGN_PROVENANCE.md",
      "CITATION.cff",
      "DISCOVERABILITY.md"
    ];

    for (const file of files) {
      expect(existsSync(file)).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(150);
    }
  });

  it("keeps the README aligned with AgentAuth v0.2 and the canonical source", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toContain("AgentAuth v0.2");
    expect(readme).toContain(repoUrl);
    expect(readme).toContain("AI agent authentication");
    expect(readme).toContain("Login as Agent");
    expect(readme).toContain("CC BY 4.0");
    expect(readme).not.toContain("Status:** Draft system design v0.1");
  });

  it("exposes valid machine-readable citation metadata", () => {
    const citation = YAML.parse(readFileSync("CITATION.cff", "utf8"));

    expect(citation["cff-version"]).toBe("1.2.0");
    expect(citation.title).toBe("AgentAuth Protocol");
    expect(citation.url).toBe(repoUrl);
    expect(citation.authors[0]["family-names"]).toBe("Aboammar");
    expect(citation.authors[0]["given-names"]).toBe("Mamdouh");
    expect(citation["preferred-citation"].type).toBe("report");
    expect(citation["preferred-citation"].url).toBe(repoUrl);
  });

  it("publishes concise and expanded LLM navigation files", () => {
    const short = readFileSync("llms.txt", "utf8");
    const full = readFileSync("llms-full.txt", "utf8");

    expect(short).toContain("# AgentAuth Protocol");
    expect(short).toContain(repoUrl);
    expect(short).toContain("Original system design: Mamdouh Aboammar");
    expect(full).toContain("AgentAuth Protocol v0.2");
    expect(full).toContain("AI agent authentication");
    expect(full).toContain("Creative Commons Attribution 4.0");
  });

  it("publishes an answer-first documentation landing page with canonical metadata", () => {
    const html = readFileSync("docs/index.html", "utf8");

    expect(html).toContain('<link rel="canonical" href="' + pagesUrl + '">');
    expect(html).toContain("AI agent identity, authentication, authorization");
    expect(html).not.toMatch(/noindex/i);

    const match = html.match(
      /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/
    );
    expect(match).not.toBeNull();

    const structured = JSON.parse(match![1]);
    expect(structured["@context"]).toBe("https://schema.org");
    expect(structured["@graph"][0].author.name).toBe("Mamdouh Aboammar");
    expect(structured["@graph"][0].image).toContain("opengraph.githubassets.com");
    expect(structured["@graph"][1]["@type"]).toBe("WebSite");
    expect(structured["@graph"][1].url).toBe(pagesUrl);
    expect(structured["@graph"][2].codeRepository).toBe(repoUrl);
  });

  it("publishes distinct answer-first guides instead of keyword-duplicate pages", () => {
    const guides = [
      "docs/guides/what-is-agentauth.md",
      "docs/guides/login-as-agent.md",
      "docs/guides/agentauth-vs-oauth-mcp-spiffe.md",
      "docs/guides/faq.md"
    ];

    const contents = guides.map((file) => readFileSync(file, "utf8"));

    for (const [index, file] of guides.entries()) {
      expect(existsSync(file)).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(800);
      expect(contents[index]).toContain("permalink:");
    }

    expect(new Set(contents).size).toBe(guides.length);

    for (const content of contents) {
      expect(content).not.toMatch(/\]\((?:\.\.\/|login-as-agent\/|faq\/|agentauth-vs-oauth-mcp-spiffe\/)/);
    }
  });

  it("publishes a sitemap for the primary documentation entry points", () => {
    const sitemap = readFileSync("docs/sitemap.xml", "utf8");

    expect(sitemap).toContain(pagesUrl);
    expect(sitemap).toContain("/guides/what-is-agentauth/");
    expect(sitemap).toContain("/guides/login-as-agent/");
    expect(sitemap).toContain("/guides/agentauth-vs-oauth-mcp-spiffe/");
    expect(sitemap).toContain("/guides/faq/");
  });

  it("keeps software and documentation license boundaries explicit", () => {
    const software = readFileSync("LICENSE", "utf8");
    const docs = readFileSync("LICENSE-DOCS.md", "utf8");
    const attribution = readFileSync("ATTRIBUTION.md", "utf8");

    expect(software).toContain("Apache License");
    expect(docs).toContain("Creative Commons Attribution 4.0 International");
    expect(attribution).toContain(repoUrl);
    expect(attribution).toMatch(/independent\s+implementation/i);
  });

  it("ships a Pages workflow that does not try to force-enable repository Pages", () => {
    const workflow = readFileSync(".github/workflows/pages.yml", "utf8");

    expect(workflow).toContain("actions/jekyll-build-pages@v1");
    expect(workflow).toContain("actions/deploy-pages@v4");
    expect(workflow).toContain("cp llms.txt docs/llms.txt");
    expect(workflow).toContain("cp CITATION.cff docs/CITATION.cff");
    expect(workflow).toContain("GitHub Pages is not enabled");
    expect(workflow).not.toContain("enablement: true");
    expect(workflow).toContain('name: github-pages');
    expect(workflow).toContain('url: ${{ steps.deployment.outputs.page_url }}');
    expect(workflow).toContain('HTTP/');
    expect(workflow).toContain('404');
    expect(workflow).toContain('exit "$api_exit"');
    expect(workflow).not.toContain('gh api "repos/${GH_REPO}/pages" >/dev/null 2>&1');
  });

  it("aligns package discovery metadata with the actual protocol scope", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));

    expect(pkg.version).toMatch(/^0\.2\.0-draft/);
    expect(pkg.description).toContain("AI agent identity");
    expect(pkg.keywords).toContain("ai-agent-authentication");
    expect(pkg.keywords).toContain("login-as-agent");
    expect(pkg.keywords).toContain("agent-delegation");
  });
});
