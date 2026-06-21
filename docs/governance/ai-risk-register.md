# AI Risk Register

> **Layer 6 — Governance, Compliance & Audit.** A living record of what could go
> wrong with the platform's automated/AI components, how likely and severe it is,
> the controls that mitigate it, and who owns it. Supports NIST AI RMF (Map /
> Measure / Manage) and ISO/IEC 42001 risk treatment.

_Last reviewed: 2026-06-21 · Owner: MLRO · Review cycle: quarterly or on material change._

**Scoring:** Likelihood (L) and Impact (I) on a 1–5 scale; Residual = risk after
the listed controls. Component IDs reference [`ai-system-register.md`](./ai-system-register.md).

| ID | Risk | Component | L | I | Mitigating controls (as built) | Residual | Owner |
|---|---|---|---|---|---|---|---|
| R1 | LLM mislabels adverse media (false negative) lets a risky subject pass | APP-AI-1 | 3 | 4 | Advisory only; adverse-media score capped at escalate (`adverseMediaScore`); analyst verification required; golden eval `tests/unit/llm-eval.test.ts` | Medium | MLRO |
| R2 | LLM hallucinates a decision/score into a compliance field | APP-AI-2 | 2 | 4 | `coerceReasoning` whitelists decision + clamps score; refusal→null; unit-tested (`llm-coerce.test.ts`) | Low | Eng |
| R3 | Model drift after a provider update changes behaviour silently | APP-AI-1/2 | 3 | 3 | LLM call log (`llm-log.ts`); golden eval fails CI on drift; model id pinned | Medium | Eng |
| R4 | Prompt injection via a crafted headline | APP-AI-1 | 2 | 3 | JSON-only contract; defensive parse (`safeJson`); output coercion; red-team tests | Low | Eng |
| R5 | Stale/unreachable sanctions data → missed designation | APP-DET-1/5 | 3 | 5 | Honest "not screened" verdict, never fabricated; build resilience; freshness signal (backlog) | Medium | MLRO |
| R6 | Wrong screening threshold lets hits through / over-blocks | APP-DET-1 | 2 | 4 | Thresholds centralised + tested (`quick-screen.test.ts`); change-control requirement (this register) | Low | MLRO |
| R7 | Auto hard-outcome without human accountability | APP-DET-1 | 2 | 4 | MLRO sign-off gate (`/api/mlro-signoff`) + four-eyes; tested | Low | MLRO |
| R8 | Overdue case missed (no escalation) | — | 3 | 3 | SLA evaluation + escalation (`/api/sla-escalation`, `sla.ts`); tested | Low | MLRO |
| R9 | Unauthorised access to export/sign-off | APP-CTL | 3 | 4 | RBAC (`src/lib/auth/rbac.ts`); rate limiting; strict-mode env; tested | Medium | Eng |
| R10 | Audit trail tampered or lost | APP-CTL-2/3 | 2 | 5 | HMAC-SHA256 signing; SHA-256 export checksum; append-only cap | Low | Eng |
| R11 | PII over-retention in logs | data | 2 | 3 | LLM log stores prompt **hashes** only; retention policy; minimised audit fields | Low | MLRO |
| R12 | Asana monitor false "no change" (missed regulatory update) | ASA-1/2/3 | 2 | 4 | Multiple independent sources; daily brief surfaces gaps; human applies changes | Medium | MLRO |

## How to use this register
- Re-score quarterly; add a row for every new component or incident.
- Any **Medium** residual needs a named follow-up in the backlog
  ([`six-layer-alignment.md`](./six-layer-alignment.md)).
- Threshold, prompt, or model changes are **governed changes** — record the
  rationale, reviewer, and date.
