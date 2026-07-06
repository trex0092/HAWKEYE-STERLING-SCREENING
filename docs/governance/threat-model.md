# Threat Model

A structured threat model for **HAWKEYE · Sterling Screening**, using the
[STRIDE](https://en.wikipedia.org/wiki/STRIDE_model) methodology. It complements
the [Security Policy](../../SECURITY.md), the
[Incident Response playbook](./incident-response.md), and the
[six-layer alignment](./six-layer-alignment.md) (Layer 3 — Security & Resilience).

> **Scope caveat.** This is a **demo / reference build**. Every `/api/*` route is
> a deterministic offline mock by default; there is no real sanctions data, no
> production auth, and no secrets in the repository. This model therefore
> documents the *intended* control posture and the hardening a production
> deployment would require — it is **not** an assertion that the demo is
> production-secure.

## System overview

| Element | Description | Trust boundary |
|---|---|---|
| Browser client | React console (`src/app`, `src/components`) | Untrusted |
| Route handlers | Next.js API routes (`src/app/api/*`) | Trusted server |
| Identity | Header-based operator identity (`src/lib/auth`) | **Weak** (demo) |
| Screening index | Build-time OpenSanctions/PEP index, read in-process | Trusted, read-only |
| Integrations | Asana, Google News, OpenSanctions, Anthropic (env-gated) | External |
| Audit trail | HMAC-signed entries (`/api/audit/*`) | Trusted server |

### Assets to protect

1. **Integrity of screening decisions** — a subject must not be silently mis-scored.
2. **Integrity & non-repudiation of the audit trail** — records must be tamper-evident.
3. **Separation of duties** — four-eyes / MLRO controls must not be bypassable.
4. **Confidentiality of any configured secrets** — API keys for optional integrations.
5. **Availability** of the screening console.

## STRIDE analysis

### S — Spoofing (identity)

- **Threat:** Header-based identity (`x-operator-*`) can be forged; one operator
  impersonates another to defeat four-eyes.
- **Current control:** Server enforces maker ≠ checker on `/api/four-eyes`;
  actions are written to the signed audit trail.
- **Residual risk (demo):** No real authentication. **Production hardening:**
  replace header identity with a real auth provider (OIDC/session) and bind the
  operator identity server-side. Tracked in
  [`six-layer-alignment.md`](./six-layer-alignment.md).

### T — Tampering (data integrity)

- **Threat:** Modification of audit entries, request bodies, or the screening
  verdict in transit or at rest.
- **Current control:** Audit entries are **HMAC-SHA256 signed**
  ([ADR-0004](../adr/0004-hmac-signed-audit-trail.md)); `/api/audit/sign` `PUT`
  verifies a payload+signature and detects any change. Route handlers parse
  bodies defensively.
- **Production hardening:** durable append-only store; key in a secret manager;
  TLS enforced at the edge.

### R — Repudiation

- **Threat:** An operator denies having taken an action.
- **Current control:** Every consequential action produces a signed, exportable
  audit record (`/api/audit/export`) with actor, timestamp, and payload.
- **Production hardening:** bind audit actor to the authenticated identity;
  ship audit to an immutable external sink.

### I — Information disclosure

- **Threat:** Leakage of configured integration secrets or of subject data.
- **Current control:** No secrets in the repo; `.env*.local` is git-ignored;
  `/api/*` make no live calls unless env-gated. Secret scanning + push
  protection are recommended in [`SECURITY.md`](../../SECURITY.md).
- **Production hardening:** least-privilege API keys, per-tenant data isolation,
  and output redaction in logs.

### D — Denial of service

- **Threat:** Expensive screening/enrichment requests exhaust resources.
- **Current control:** In-process sanctions matching (no per-request network for
  core screening); rate limiting on sensitive routes; resilient index build
  (empty index + honest "not screened" on fetch failure).
- **Production hardening:** edge rate limiting/WAF, request timeouts, and quotas
  on the optional LLM path.

### E — Elevation of privilege

- **Threat:** A user performs actions above their role (e.g. self-approves,
  signs off as MLRO).
- **Current control:** RBAC (`src/lib/auth`), four-eyes maker-checker, and the
  MLRO sign-off gate ([ADR-0005](../adr/0005-human-oversight-controls.md)).
- **Production hardening:** enforce RBAC against authenticated claims, not
  client-supplied headers.

## Supply-chain threats

The build and release pipeline is itself in scope:

- **Dependency compromise** — mitigated by Dependabot, Dependency Review, and
  `package-lock.json` pinning.
- **Source/CI compromise** — least-privilege `permissions:` in every workflow,
  pinned actions, OpenSSF Scorecard monitoring.
- **Artifact tampering** — the container image publish generates an **SBOM** and
  a signed **build-provenance attestation** (SLSA), and is scanned for known
  vulnerabilities before it is trusted
  ([`docker-publish.yml`](../../.github/workflows/docker-publish.yml),
  [ADR-0006](../adr/0006-container-image-supply-chain.md)).

## Out of scope

- Physical security and cloud-provider infrastructure.
- The security of external services (Asana, Google, OpenSanctions, Anthropic)
  beyond how this project calls them.
- Real sanctions-data accuracy — the demo ships no production data.

## Review cadence

This model is reviewed at least annually and whenever a new trust boundary,
route, or integration is added. _Last reviewed: 2026-07-05._
