# 6-Layer AI Governance Alignment Assessment

Assessment of the Hawkeye Sterling platform (**app + Asana automation**) against the
**6 Layers of Agentic AI Governance**. For each layer: status, what exists (with references), what
is missing, and a prioritized remediation backlog.

**Status key:** 🟢 Good base · 🟡 Partial / improving · 🔴 Minimal.

_Last reviewed: 2026-06-21. Scope: app (`src/…`) + Asana monitoring automation
(`HAWKEYE-STERLING-RA`). See [`ai-system-register.md`](./ai-system-register.md) and
[`model-card-claude.md`](./model-card-claude.md)._

## Summary

| Layer | Status | Headline |
|---|---|---|
| 1 · Discovery & Inventory | 🟡 | Inventory now written down; was code-only. |
| 2 · Data Governance | 🟡 | Source lineage + honest verdicts; no bias screening / retention policy. |
| 3 · Security & Resilience | 🟡 | Signed audit, four-eyes, graceful fallback; no RBAC/auth, rate limiting. |
| 4 · Model & Agent Assurance | 🔴 | Defensive parsing + tests; no eval set or drift monitoring. |
| 5 · Human Oversight | 🟢 | Escalate/override, four-eyes, "detect automatic, apply reviewed". |
| 6 · Governance, Compliance & Audit | 🟢 | Tamper-evident audit, CI gates; no NIST/ISO/EU-AI-Act mapping. |

**Overall:** *partially aligned.* Strongest where it matters most for a regulated AML/DPMS
context — **Human Oversight (5)** and **Audit (6)**. Weakest on **Inventory (1)** and **Model &
Agent Assurance (4)**. The deterministic design of most automation keeps agentic risk low.

---

## Layer 1 — AI Discovery & Inventory 🟡

**Exists**
- Model id and prompts are explicit in code (`src/lib/ai/anthropic.ts`); env-gated via
  `ANTHROPIC_API_KEY` and documented in `.env.example`.
- 14 role-typed operator personas (`src/lib/data/operators.ts`).
- This register now documents every component (`ai-system-register.md`).

**Missing**
- ❌ Versioning of decision logic / thresholds as governed, recorded changes.
- ❌ Source metadata (OpenSanctions dataset version, index build date) surfaced as inventory.

**Backlog**
1. **P1** Keep `ai-system-register.md` current (owner: MLRO); review each periodic cycle.
2. **P2** Record OpenSanctions dataset versions + index build date alongside each screen.
3. **P3** Treat threshold changes (`decisionFor`, `adverseMediaScore`) as logged change records.

## Layer 2 — Data Governance Foundation 🟡

**Exists**
- Source lineage: OpenSanctions sets (OFAC SDN/Consolidated, UN, EU, UK, Interpol, PEPs) compiled
  at build (`scripts/build-sanctions-index.mjs`); global Google-News editions for adverse media
  (`src/lib/integrations/adverse-media.ts`).
- "Honest verdicts": no live source ⇒ explicit "not screened", never fabricated matches
  (`cleanVerdict()`); resilient build writes an empty index rather than guessing.
- Audit log capped at 1000 entries (`src/lib/audit.ts`).

**Missing**
- ❌ Data-quality metrics (freshness SLO, completeness checks).
- ❌ Bias screening for adverse-media classification (language/geography skew).
- ❌ Documented retention/deletion policy for audit logs and subject data (PII).
- ❌ Third-party data-risk assessment (Google News RSS, OpenSanctions, Asana).

**Backlog**
1. **P1** Write a data retention & deletion policy (audit log, screening records — note the
   5-year AML record-keeping expectation referenced in the Asana SOPs).
2. **P2** Add freshness/completeness signals (index age, source-reachable flags) to the UI/report.
3. **P2** Sample-test adverse-media classification across languages for bias.
4. **P3** Maintain a third-party data-source risk register.

## Layer 3 — Security & Resilience 🟡

**Exists**
- Tamper-evident audit signing: HMAC-SHA256 sign/verify, constant-time compare
  (`src/app/api/audit/sign/route.ts`); `AUDIT_SIGNING_SECRET` in prod, labelled insecure dev key
  offline.
- Four-eyes maker-checker control (`src/app/api/four-eyes/route.ts`).
- Defensive input parsing and enum whitelists across routes; graceful fallback to mocks; no
  network calls by default in dev/test/CI.

**Missing**
- ❌ RBAC / authentication / session management (operator is localStorage trust-on-first-use).
- ❌ Rate limiting and API authentication on routes.
- ❌ Secrets-rotation guidance; incident-response playbook.

**Backlog**
1. **P1** Add authn + RBAC before any multi-user/production deployment.
2. **P2** Rate-limit and authenticate API routes; document secret rotation
   (`AUDIT_SIGNING_SECRET`, `ANTHROPIC_API_KEY`, `ASANA_ACCESS_TOKEN`).
3. **P3** Write an incident-response & audit-correction playbook.

## Layer 4 — Model & Agent Assurance 🔴

**Exists**
- Untrusted-output controls on the LLM: refusal handling, defensive JSON parse, decision
  whitelist, score clamp (`src/lib/ai/anthropic.ts`).
- Unit + e2e tests for the deterministic controls (`tests/unit/quick-screen.test.ts`,
  `audit-sign.test.ts`, `four-eyes.test.ts`, `nl-search.test.ts`); TypeScript strict.

**Missing**
- ❌ Evaluation set / accuracy metrics for the Claude enrichment.
- ❌ Drift monitoring of LLM output over time / across model updates.
- ❌ Red-teaming / adversarial testing (spoofed headlines, prompt injection).
- ❌ Performance metrics (precision/recall) for screening decisions; calibration of risk scores.

**Backlog**
1. **P1** Add a golden eval set (headlines→sentiment/category; subjects→decision band) and run in
   CI.
2. **P1** Log LLM I/O (prompt hash, model id, output, latency) to enable drift review.
3. **P2** Red-team the two prompts and confirm whitelist/clamp controls hold under injection.
4. **P3** Build a small ground-truth set to measure screening precision/recall and score
   calibration.

## Layer 5 — Human Oversight 🟢

**Exists**
- Escalation as the safety valve: deterministic verdicts route to review/escalate/block; adverse
  media alone is capped at the escalate band and "requires analyst verification"
  (`adverseMediaScore`, `withAdverseMedia` in `quick-screen/route.ts`).
- Override authority: analysts change status, CDD/EDD/SDD posture, notes, reassignment.
- Four-eyes dual control on approvals (`four-eyes/route.ts`).
- Asana automation principle: **"Detection is automatic; applying any change stays a reviewed
  decision."**
- Every console action is written to the audit trail (`src/lib/audit.ts`).

**Missing**
- ❌ SLA-breach auto-escalation (subjects carry an SLA-notify field; not enforced).
- ❌ Enforced MLRO sign-off gate on hard outcomes (recommended in copy, not enforced in code).
- ❌ Feedback loop: analyst overrides are not captured to improve the logic.

**Backlog**
1. **P2** Enforce an MLRO sign-off gate for escalate/block before a hard outcome is final.
2. **P2** Add SLA-breach escalation.
3. **P3** Capture override + reason to feed periodic logic review.

## Layer 6 — Governance, Compliance & Audit 🟢

**Exists**
- Append-only, capped, HMAC-signable audit trail (`src/lib/audit.ts`, `audit/sign/route.ts`).
- CI/CD gates (lint, typecheck, build, unit, e2e) on every push; governance docs
  (`SECURITY.md`, `CONTRIBUTING.md`).
- "Honest verdicts" philosophy documented and enforced in code.
- Asana monitoring gives a continuous-assurance posture (daily brief, regulatory/sanctions/FATF
  watch, health checks).

**Missing**
- ❌ Explicit mapping to **NIST AI RMF**, **ISO/IEC 42001**, **EU AI Act**.
- ❌ Risk register; formal change-control for decision logic.
- ❌ Audit-log export / compliance report generation; explainability report ("why risk 85?").

**Backlog (with framework hooks)**
1. **P1** Stand up an AI risk register (what could go wrong: stale data, biased classification,
   wrong threshold) — supports **NIST AI RMF · Map/Measure** and **ISO 42001 · risk treatment**.
2. **P2** Map controls to **NIST AI RMF** (Govern/Map/Measure/Manage), **ISO/IEC 42001** (AIMS
   clauses), and assess **EU AI Act** applicability (likely limited-risk given advisory, human-in-
   the-loop use — confirm and document).
3. **P2** Add audit-log export + a per-subject explainability report.
4. **P3** Formal change-control record for threshold/prompt/model changes.

---

## Prioritized cross-layer backlog (top picks)

| Priority | Item | Layer |
|---|---|---|
| P1 | Data retention & deletion policy (5-year AML records) | 2 |
| P1 | LLM golden eval set in CI + LLM I/O logging (drift) | 4 |
| P1 | AI risk register (NIST/ISO hook) | 6 |
| P1 | Authn + RBAC before multi-user/production | 3 |
| P2 | Enforced MLRO sign-off gate + SLA-breach escalation | 5 |
| P2 | NIST AI RMF / ISO 42001 / EU AI Act control mapping | 6 |
| P2 | Red-team the two LLM prompts | 4 |
| P3 | Audit-log export + explainability report | 6 |

> Implementing these items is **out of scope for this documentation pass** (per the agreed plan).
> They are recorded here as the remediation backlog for a future, code-changing iteration.
