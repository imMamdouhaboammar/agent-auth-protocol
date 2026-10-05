# Reference Deployment Topology

## Minimal production region

```text
Internet / Private Network
        |
    API Gateway
        |
  Control Plane x3
    |     |     |
    |     |     +--> KMS/HSM
    |     +--------> PostgreSQL HA
    +--------------> Event Bus
                         |
                    Audit Worker
                         |
                 Immutable Object Store

Runtime Brokers ---> Authorization Server
Resource Servers --> JWKS / Policy / Introspection as configured
Browser Workers ---> Isolated Worker Network ---> Approved Targets
```

## Trust zones

Zone A: public ingress

- rate limiting
- TLS
- WAF
- no private signing keys

Zone B: control plane

- authorization
- grants
- policy
- registry

Zone C: key zone

- KMS/HSM
- restricted service identity

Zone D: browser execution

- untrusted web content
- outbound-only
- no direct database access
- vault access only through constrained broker

Zone E: audit

- append-only sink
- immutable export
- restricted delete permission

## Network rules

- browser workers cannot connect directly to control-plane database
- public ingress cannot access KMS directly
- Resource Servers fetch public keys, not signing keys
- only authorization service identity may request signing operation
- audit worker cannot issue tokens
- model worker cannot access vault backend directly

## Scaling

Scale independently:

- token validation mostly at Resource Server
- token issuance control plane
- policy evaluation
- browser workers
- audit pipeline

Do not scale by sharing one unrestricted superuser database credential.
