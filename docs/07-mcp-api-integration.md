# MCP and API Integration

## Objective

Use one identity and delegation model across ordinary APIs and MCP servers.

MCP is treated as a resource integration protocol, not an identity root.

## API Resource Server profile

A Resource Server integrates in one of three ways:

### SDK mode

Application imports AgentAuth validation middleware.

### Gateway mode

A trusted gateway validates the credential and forwards verified actor context.

### Native OAuth mode

Application validates JWT or introspects opaque tokens using standard OAuth mechanisms and understands AgentAuth extension claims.

## Verified request context

After validation, the application receives a local context:

```json
{
  "actor": {
    "kind": "ai_agent",
    "agent_id": "agent_01...",
    "instance_id": "inst_01..."
  },
  "subject": {
    "kind": "human",
    "id": "user_123"
  },
  "grant_id": "grant_01...",
  "authority_mode": "delegated",
  "purpose": "crm-follow-up",
  "scopes": ["contacts.read", "contacts.update"],
  "trust_tier": "T2"
}
```

Incoming client-supplied `X-Agent-*` headers MUST be stripped before trusted headers are injected in gateway mode.

## MCP profile

MCP server authorization follows the current MCP authorization model and AgentAuth adds actor semantics.

### Discovery

The MCP server publishes protected resource and authorization metadata according to the MCP specification.

### Authorization

The Agent Runtime obtains a token whose audience is the MCP server.

The token contains:

- Subject
- Agent Actor
- Agent Instance
- active grant
- scopes
- proof binding

### Tool call authorization

Before each protected tool call:

1. validate token and proof
2. map MCP tool name to an AgentAuth Action
3. normalize security-sensitive arguments
4. evaluate grant constraints
5. evaluate local or central policy
6. execute only on `allow`
7. return step-up response when additional authorization is needed
8. audit the decision and result

## Tool mapping example

```yaml
server: urn:mcp:finance
tools:
  invoices.list:
    action: invoice.read
  payments.create:
    action: payment.create
    sensitive_arguments:
      - amount
      - currency
      - recipient
```

## Scope step-up

If the current token lacks authority, the server must not silently grant more scope.

Expected flow:

1. MCP server returns insufficient scope or an AgentAuth step-up hint
2. client asks AgentAuth for expanded authorization
3. AgentAuth checks whether expansion fits an existing grant
4. if not, human or organization approval is requested
5. a new token is issued
6. tool call is retried with explicit authority

## MCP Enterprise Managed Authorization

Where an organization uses enterprise-managed MCP authorization, AgentAuth should integrate with that IdP path rather than forcing independent per-server consent.

Agent identity still remains explicit at the Actor layer.

## API gateway enforcement

Recommended gateway order:

1. TLS
2. token parsing limits
3. issuer resolution
4. signature
5. audience
6. DPoP or mTLS
7. AgentAuth claims
8. revocation freshness
9. policy
10. rate limits
11. upstream forwarding

## Rate limiting

Rate limiting SHOULD include:

- tenant
- Agent Principal
- Agent Instance
- Subject
- resource
- action

This prevents one compromised Agent Instance from consuming the entire tenant allowance.

## Service-to-service calls

When a Resource Server calls another backend while preserving agent context, it SHOULD use token exchange to obtain a downstream audience token rather than forward the original token.

The downstream token preserves Subject and current Actor according to delegation semantics.
