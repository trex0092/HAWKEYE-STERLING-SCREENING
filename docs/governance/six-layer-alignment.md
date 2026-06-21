# 6-Layer AI Governance Alignment Assessment

Assessment of the Hawkeye Sterling platform (**app + Asana automation**) against the
**6 Layers of Agentic AI Governance**. For each layer: status, what exists (with references),
what was implemented in this alignment pass, and what remains.

**Status key:** 🟢 Baseline control in place · 🟡 Partial · 🔴 Minimal.

_Last reviewed: 2026-06-21. Scope: app (`src/…`) + Asana monitoring automation
(`HAWKEYE-STERLING-RA`). See [`ai-system-register.md`](./ai-system-register.md),
[`model-card-claude.md`](./model-card-claude.md), [`ai-risk-register.md`](./ai-risk-register.md),
[`data-retention-policy.md`](./data-retention-policy.md),
[`incident-response.md`](./incident-response.md), and
[`framework-mapping.md`](./framework-mapping.md)._

## Summary

| Layer | Status | Headline |
|---|---|---|
| 1 · Discovery & Inventory | 🟢 | AI system register + framework mapping; components inventoried. |
| 2 · Data Governance | 🟢 | Source lineage + honest verdicts + data retention & deletion policy. |
| 3 · Security & Resilience | 🟢 | Signed audit, four-eyes, RBAC, rate limiting, incident playbook. |
| 4 · Model & Agent Assurance | 🟢 | Output coercion + golden eval + red-team tests + LLM drift log. |
| 5 · Human Oversight | 🟢 | Escalate/override, four-eyes, MLRO sign-off gate, SLA escalation. |
| 6 · Governance, Compliance & Audit | 🟢 | Audit + export, AI risk register, NIST/ISO/EU-AI-Act mapping. |

**Overall:** every layer now has a documented, tested control baseline. The platform was already
strong on **Human Oversight (5)** and **Audit (6)**; this pass closed the **Inventory (1)** and
**Model & Agent Assurance (4)** gaps and added oversight/security controls. The deterministic
design of most automation keeps agentic risk low. Remaining work is **production hardening**
(see the bottom of this doc), not missing controls.

---

## Layer 1 — AI Discovery & Inventory 🟢

**Implemented this pass**
- AI System Register inventorying every AI/automated/control component across the app and the
  Asana automation ([`ai-system-register.md`](./ai-system-register.md)).
- Framework mapping tying components to NIST/ISO/EU expectations
  ([`framework-mapping.md`](./framework-mapping.md)).

**Already existed**
- Model id + prompts explicit in code (`src/lib/ai/anthropic.ts`); env-gated, documented in
  `.env.example`. 14 role-typed operator personas (`src/lib/data/operators.ts`).

**Remaining**
- Surface OpenSanctions dataset version / index build date as live inventory.
- Keep the register current and treat threshold changes as logged change records (process).

## Layer 2 — Data Governance Foundation 🟢

**Implemented this pass**
- Data retention & deletion policy with a retention schedule, deletion/legal-hold rules, and data
  minimisation ([`data-retention-policy.md`](./data-retention-policy.md)).
- LLM call log stores a prompt **hash**, never raw text — PII-minimising by design
  (`src/lib/ai/llm-log.ts`).

**Already existed**
- Source lineage (OpenSanctions sets via `scripts/build-sanctions-index.mjs`; global Google-News
  editions in `src/lib/integrations/adverse-media.ts`); "honest verdicts" (`cleanVerdict()`).

**Remaining**
- Freshness/completeness signals in the UI; bias testing of adverse-media classification across
  languages; a third-party data-source risk register (a row exists as R12).

## Layer 3 — Security & Resilience 🟢

**Implemented this pass**
- RBAC: role→permission matrix gating privileged actions, with `HAWKEYE_RBAC_STRICT` for a
  production posture (`src/lib/auth/rbac.ts`, tested in `tests/unit/rbac.test.ts`).
- Rate limiting: fixed-window per-key ceiling, applied on `/api/explain`
  (`src/lib/auth/rate-limit.ts`, tested).
- Incident-response playbook with severities, runbooks, and the append-only correction pattern
  ([`incident-response.md`](./incident-response.md)).

**Already existed**
- HMAC-SHA256 audit signing/verification (`src/app/api/audit/sign/route.ts`); four-eyes
  (`src/app/api/four-eyes/route.ts`); defensive parsing; offline-by-default.

**Remaining (production hardening)**
- Replace header-based identity with a real auth provider/session; document secret rotation
  operationally; back the rate limiter with a shared store for multi-instance deploys.

## Layer 4 — Model & Agent Assurance 🟢

**Implemented this pass**
- Output coercion extracted to a pure, tested module (`src/lib/ai/coerce.ts`); red-team tests for
  injection/garbage input (`tests/unit/llm-coerce.test.ts`).
- Golden eval set that fails CI on drift when a key is present, and asserts the safe offline
  fallback otherwise (`tests/unit/llm-eval.test.ts`).
- LLM drift log: model id, prompt hash, outcome, latency per call (`src/lib/ai/llm-log.ts`,
  wired into both helpers in `src/lib/ai/anthropic.ts`).

**Already existed**
- Refusal handling + defensive JSON parse; strong unit/e2e coverage of deterministic controls.

**Remaining**
- A larger labelled ground-truth set for precision/recall + score calibration; flush the LLM log
  to a durable sink in production.

## Layer 5 — Human Oversight 🟢

**Implemented this pass**
- MLRO sign-off gate: a hard outcome (escalate/block) is not final without an authorised MLRO and
  a documented rationale; separation of duties enforced (`src/app/api/mlro-signoff/route.ts`,
  tested).
- SLA-breach escalation: deterministic evaluation routing overdue cases to L2 / MLRO
  (`src/app/api/sla-escalation/route.ts`, `src/lib/sla.ts`, tested).

**Already existed**
- Escalate/override safety valve; adverse media capped at escalate; four-eyes; full audit trail;
  the Asana "detect automatically, apply by review" principle.

**Remaining**
- Capture analyst overrides + reasons to feed periodic logic review (a feedback loop).

## Layer 6 — Governance, Compliance & Audit 🟢

**Implemented this pass**
- AI risk register: scored risks, mitigations, residuals, owners
  ([`ai-risk-register.md`](./ai-risk-register.md)).
- Framework mapping to NIST AI RMF, ISO/IEC 42001, and an EU AI Act applicability assessment
  ([`framework-mapping.md`](./framework-mapping.md)).
- Audit-log export (RBAC-gated CSV + SHA-256 checksum, `src/app/api/audit/export/route.ts`) and a
  deterministic per-subject explainability endpoint (`src/app/api/explain/route.ts`), both tested.

**Already existed**
- Append-only, HMAC-signable audit trail; CI gates; "honest verdicts"; Asana continuous-assurance
  monitoring.

**Remaining**
- Legal sign-off on the EU AI Act classification; formal change-control record for
  threshold/prompt/model changes (process).

---

## What changed in this pass (new code)

| Area | Files |
|---|---|
| AI assurance | `src/lib/ai/coerce.ts`, `src/lib/ai/llm-log.ts` (+ wiring in `src/lib/ai/anthropic.ts`) |
| Oversight | `src/app/api/mlro-signoff/route.ts`, `src/app/api/sla-escalation/route.ts`, `src/lib/sla.ts` |
| Security | `src/lib/auth/rbac.ts`, `src/lib/auth/rate-limit.ts` |
| Audit / explainability | `src/app/api/audit/export/route.ts`, `src/app/api/explain/route.ts` |
| Tests | `tests/unit/{llm-coerce,llm-log,llm-eval,sla,mlro-signoff,sla-escalation,rbac,rate-limit,audit-export,explain}.test.ts` |
| Docs | this folder: retention policy, risk register, incident response, framework mapping |

## Remaining backlog (production hardening)

| Priority | Item | Layer |
|---|---|---|
| P1 | Real auth provider + session (replace header-based identity) | 3 |
| P2 | Durable sink for the LLM drift log + audit trail | 2 / 4 |
| P2 | Bias testing of adverse-media classification across languages | 2 |
| P2 | Legal sign-off on EU AI Act classification | 6 |
| P3 | Labelled ground-truth set for precision/recall + calibration | 4 |
| P3 | Capture analyst overrides + reasons (feedback loop) | 5 |
| P3 | Surface dataset version/freshness as live inventory | 1 / 2 |

> These remaining items need product/legal decisions or infrastructure beyond the app, so they
> are tracked here rather than implemented in this pass.
