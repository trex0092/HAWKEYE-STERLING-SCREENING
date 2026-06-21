# Regulatory Framework Mapping

> **Layer 6 — Governance, Compliance & Audit.** Maps the platform's controls to
> the major AI governance frameworks so a reviewer can trace each expectation to
> something concrete in the codebase. This is a self-assessment of a demo /
> reference build, not a certification.

_Last reviewed: 2026-06-21 · Owner: MLRO._

## NIST AI RMF (Govern · Map · Measure · Manage)

| Function | Expectation | Where it lives |
|---|---|---|
| **Govern** | Roles, policies, accountability | RBAC (`src/lib/auth/rbac.ts`); four-eyes; MLRO sign-off; this `docs/governance/` set |
| **Map** | Inventory context & risk | [`ai-system-register.md`](./ai-system-register.md); [`ai-risk-register.md`](./ai-risk-register.md) |
| **Measure** | Evaluate, monitor, test | Golden eval + red-team (`tests/unit/llm-eval.test.ts`, `llm-coerce.test.ts`); LLM call log (`src/lib/ai/llm-log.ts`); CI gates |
| **Manage** | Prioritise, respond, recover | Risk register residuals + backlog; [`incident-response.md`](./incident-response.md); SLA escalation |

## ISO/IEC 42001 (AI Management System)

| Clause theme | Expectation | Where it lives |
|---|---|---|
| Leadership & policy | AI policy, roles | `README.md` (this folder) + RBAC roles |
| Risk & impact assessment | Identify/treat AI risks | `ai-risk-register.md` |
| Operational controls | Controls over AI lifecycle | Output coercion, sign-off gate, RBAC, rate limiting, audit signing |
| Performance evaluation | Monitoring & internal audit | LLM log + golden eval; audit export (`/api/audit/export`) |
| Improvement | Corrective action | Incident playbook; backlog in `six-layer-alignment.md` |
| Data for AI | Data governance & retention | [`data-retention-policy.md`](./data-retention-policy.md); `model-card-claude.md` |

## EU AI Act (applicability assessment)

- **Role:** the only AI (Claude enrichment) is an **advisory aid** to a human
  analyst; it never makes an autonomous final decision (`/api/mlro-signoff` and
  four-eyes keep a human accountable).
- **Likely classification:** **limited-risk** for the current design — the system
  assists human AML decisions rather than being the sole automated decision-maker.
  A production deployment used for automated decisions affecting customers should
  re-assess against high-risk obligations (Annex III) with legal input.
- **Transparency:** the model card (`model-card-claude.md`) documents purpose,
  prompts, limitations; the explainability endpoint (`/api/explain`) renders the
  basis of a score.
- **Action:** confirm the classification with counsel and record the conclusion
  here before any production, customer-affecting use.

## Status
These mappings show **where** each expectation is met today and flag the
remaining gaps. Open items (formal classification sign-off, durable monitoring
sink, production auth) are tracked in
[`six-layer-alignment.md`](./six-layer-alignment.md).
