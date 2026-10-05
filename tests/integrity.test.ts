import { describe, expect, it } from "bun:test";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

describe("AgentAuth Specification Integrity", () => {
  it("verifies all files in SHA256SUMS.txt match their exact sha256 digests", () => {
    const checksumsFile = readFileSync("SHA256SUMS.txt", "utf-8");
    const lines = checksumsFile.split("\n").filter((l) => l.trim().length > 0);

    expect(lines.length).toBeGreaterThanOrEqual(36);

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      expect(parts.length).toBe(2);
      const [expectedHash, relativePath] = parts;

      expect(existsSync(relativePath)).toBe(true);
      const fileBytes = readFileSync(relativePath);
      const actualHash = createHash("sha256").update(fileBytes).digest("hex");

      expect(actualHash).toBe(expectedHash);
    }
  });
});
