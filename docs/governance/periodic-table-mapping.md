# AI Governance & Security "Periodic Table" — Code Coverage

> Maps the 35 building blocks of the *AI Governance & Security Periodic Table (2026)*
> to **what actually exists in this codebase**. Status reflects code, not intent:
> 🟢 implemented in code · 🟡 partial (control present but demo-grade / doc-only) ·
> 🔴 absent. Items that cannot be satisfied by application code alone (they need an
> auth vendor, a datastore, or legal sign-off) are called out explicitly.
>
> _Last reviewed: 2026-06-21._

## Identity & Access Control

| Block | Status | Where it lives / what's missing |
|---|---|---|
| RBAC | 🟢 | `src/lib/auth/rbac.ts` — role→permission matrix, server-enforced |
| ABAC | 🟢 | `src/lib/auth/abac.ts` — attribute predicates (jurisdiction / clearance / env), composable with RBAC |
| MFA | 🔴 | UI label only (`SettingsPanel.tsx`). Needs an auth provider — not code-only |
| SSO | 🔴 | None. Needs an OIDC/SAML provider — not code-only |
| IAM | 🟡 | Header identity + `HAWKEYE_RBAC_STRICT`. Real sessions/user-store need a provider |
| ZTA | 🟢 | Per-route `authorize()`; `override` route gap closed; strict mode denies anon |

## Data Protection

| Block | Status | Where it lives / what's missing |
|---|---|---|
| VDB | 🔴 | No vector DB/embeddings (N/A to current design) |
| PIPE | 🟡 | Integration gating + timeouts (`integrations/config.ts`, `http.ts`); + transport guard |
| TOKEN | 🟢 | `src/lib/tokenize.ts` — deterministic salted tokenization for de-identified logs |
| ENC | 🟡 | In-transit guard (`isTransportSecure` in `http.ts`) + HMAC audit signing. **At-rest needs a datastore** |
| MASK | 🟢 | `src/lib/mask.ts` (name/id/email) + opt-in `mask` flag on `/api/audit/export` |

## Risk Management

| Block | Status | Where it lives / what's missing |
|---|---|---|
| RISK | 🟡 | AML scoring (`quick-screen`) + AI risk register (doc). No live AI-output risk engine |
| DRIFT | 🟢 | Golden eval fails CI (`tests/unit/llm-eval.test.ts`) + LLM log (`src/lib/ai/llm-log.ts`) |
| BIAS | 🟡 | Unit-level bias probe (`llm-bias.test.ts`). No runtime fairness monitoring |
| HALL | 🟢 | Output coercion (`src/lib/ai/coerce.ts`) + red-team tests |
| THREAT | 🟢 | `src/lib/threat.ts` — prompt-injection/jailbreak detector, wired into the LLM input path |
| REDT | 🟡 | Static red-team tests (`llm-coerce.test.ts`). No continuous red-teaming |

## Compliance & Governance

| Block | Status | Where it lives / what's missing |
|---|---|---|
| DOC | 🟢 | This `docs/governance/` set (registers, model card, mappings) |
| POLICY | 🟢 | Thresholds + caps + sign-off gates (`quick-screen`, `mlro-signoff`, `four-eyes`) |
| ISO42K | 🟡 | Clause mapping (`framework-mapping.md`). Certification is external |
| AIACT | 🟡 | Applicability assessment (`framework-mapping.md`). Legal sign-off pending |
| GDPR | 🟡 | Retention policy + `src/lib/retention.ts`. DPA + at-rest encryption are external |

## Monitoring & Observability

| Block | Status | Where it lives / what's missing |
|---|---|---|
| AUDIT | 🟢 | `src/lib/audit.ts` + `/api/audit/{sign,export}` (HMAC + SHA-256) |
| MON | 🟡 | `src/lib/metrics.ts` derives health metrics; rate-limit counters. Durable sink/alerting external |
| TRACE | 🟢 | `src/lib/ai/llm-log.ts` (model, promptHash, outcome, latency) |
| ANOM | 🟢 | `src/lib/anomaly.ts` — z-score + IQR outlier detection |
| LOG | 🟢 | Audit + LLM logs (durable sink is a production item) |
| LAT | 🟢 | `src/lib/metrics.ts` — p50/p95/p99 latency aggregation |
| USAGE | 🟢 | `src/lib/usage.ts` — per-actor/action/task/model aggregation |

## Audit & Accountability

| Block | Status | Where it lives / what's missing |
|---|---|---|
| RESP | 🟢 | Actor→role ownership (`rbac.ts` + audit actor field) |
| RCause | 🟢 | `src/lib/rcause.ts` — override aggregation (rate, directions, themes) |
| ESC | 🟢 | `src/lib/sla.ts` + `/api/sla-escalation` |
| APPROVE | 🟢 | Four-eyes + MLRO sign-off gate |
| HITL | 🟢 | Human gate on every hard outcome; no auto-execution |
| PERF | 🟡 | Bias + golden eval + determinism tests; metrics layer. Production accuracy dashboard external |

## Summary

- **Implemented in code (🟢): 22 of 35** — including the 11 added/hardened this pass:
  ABAC, ANOM, USAGE, LAT, MASK, TOKEN, THREAT, RCause (new); ZTA, ENC, MON (hardened).
- **Partial (🟡): 9** — present but demo-grade or documentation/legal-bound.
- **Absent (🔴): 4** — MFA, SSO (need an auth vendor), VDB (N/A), and the at-rest half of ENC.

### Cannot be "code only" (tracked, not built)
Need infra/vendor: **SSO, MFA, real IAM/sessions, encryption-at-rest, durable log sink, VDB**.
Need legal: **EU AI Act sign-off, ISO 42001 certification, GDPR DPA**. See
[`six-layer-alignment.md`](./six-layer-alignment.md) backlog.

### New code added this pass
`src/lib/auth/abac.ts`, `src/lib/anomaly.ts`, `src/lib/usage.ts`, `src/lib/metrics.ts`,
`src/lib/mask.ts`, `src/lib/tokenize.ts`, `src/lib/rcause.ts`, `src/lib/threat.ts`;
edits to `src/app/api/override/route.ts` (RBAC), `src/app/api/audit/export/route.ts` (masking),
`src/lib/integrations/http.ts` (transport guard), `src/lib/ai/anthropic.ts` (threat scan).
Each library has a matching `tests/unit/*.test.ts`.
