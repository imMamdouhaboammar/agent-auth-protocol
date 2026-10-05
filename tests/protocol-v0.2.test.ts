import { describe, expect, it } from "bun:test";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { existsSync, statSync } from "node:fs";

import providerMetadataSchema from "../schemas/provider-metadata.schema.json";
import agentClientMetadataSchema from "../schemas/agent-client-metadata.schema.json";
import challengeSchema from "../schemas/agentauth-challenge.schema.json";

import providerMetadata from "../examples/provider-metadata.json";
import agentClientMetadata from "../examples/agent-client-metadata.json";
import stepUpChallenge from "../examples/challenge-step-up.json";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

describe("AgentAuth v0.2 three-party protocol design", () => {
  it("keeps the protocol design documents and ADR in the repository", () => {
    const files = [
      "docs/17-three-party-protocol-architecture.md",
      "docs/18-agent-sdk-contract.md",
      "docs/19-provider-sdk-contract.md",
      "docs/20-protocol-ceremonies.md",
      "docs/21-discovery-and-metadata.md",
      "docs/adr/0005-three-party-protocol-and-sdk-boundaries.md"
    ];

    for (const file of files) {
      expect(existsSync(file)).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(500);
    }
  });

  it("validates the Provider AgentAuth extension metadata example", () => {
    const validate = ajv.compile(providerMetadataSchema);
    const extension =
      providerMetadata["urn:agentauth:resource-metadata:v1"];

    expect(validate(extension)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("validates the Agent Client metadata extension example", () => {
    const validate = ajv.compile(agentClientMetadataSchema);
    const extension =
      agentClientMetadata["urn:agentauth:client-metadata:v1"];

    expect(validate(extension)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("validates the structured step-up challenge example", () => {
    const validate = ajv.compile(challengeSchema);

    expect(validate(stepUpChallenge)).toBe(true);
    expect(validate.errors).toBeNull();
  });

  it("rejects Provider metadata with no proof method", () => {
    const validate = ajv.compile(providerMetadataSchema);
    const invalid = {
      version: "0.2",
      actor_types_supported: ["ai_agent"],
      profiles_supported: ["AA-PROVIDER-API-1"],
      proof_methods_supported: []
    };

    expect(validate(invalid)).toBe(false);
  });

  it("rejects unknown Provider actor types", () => {
    const validate = ajv.compile(providerMetadataSchema);
    const invalid = {
      version: "0.2",
      actor_types_supported: ["human"],
      profiles_supported: ["AA-PROVIDER-API-1"],
      proof_methods_supported: ["dpop"]
    };

    expect(validate(invalid)).toBe(false);
  });

  it("rejects an insecure Agent metadata URI", () => {
    const validate = ajv.compile(agentClientMetadataSchema);
    const invalid = {
      agent_id: "urn:agentauth:agent:test",
      agent_metadata_uri: "http://publisher.example/agent.json",
      profiles_supported: ["AA-CLIENT-1"],
      proof_methods_supported: ["dpop"]
    };

    expect(validate(invalid)).toBe(false);
  });

  it("rejects unrecognized structured challenge errors", () => {
    const validate = ajv.compile(challengeSchema);
    const invalid = {
      error: "please_do_whatever",
      agentauth: {
        required_action: "human_approval"
      }
    };

    expect(validate(invalid)).toBe(false);
  });
});
