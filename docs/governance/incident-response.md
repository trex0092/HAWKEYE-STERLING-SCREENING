# Incident Response Playbook (AI / Screening)

> **Layer 3 — Security & Resilience.** What to do when something goes wrong with a
> screening decision, the AI enrichment, the data sources, or the audit trail.

_Last reviewed: 2026-06-21 · Owner: MLRO + Engineering on-call · Review cycle: annual._

## Severity levels
| Sev | Meaning | Examples | Target response |
|---|---|---|---|
| **S1** | Compliance failure / designated party processed | A confirmed sanctions match not actioned; freeze missed | Immediate |
| **S2** | Control broken | Sign-off gate or RBAC bypass; audit signature fails to verify | Same business day |
| **S3** | Degraded but safe | Sanctions source unreachable; LLM API down; drift eval failing | Next business day |
| **S4** | Minor | Single mislabelled headline; cosmetic | Backlog |

## Roles
- **Incident lead:** MLRO (compliance impact) or Engineering on-call (technical).
- **Scribe:** records the timeline into the audit trail / incident note.
- The MLRO owns any **regulatory notification** decision.

## Response steps
1. **Detect & triage** — assign a severity; record start time.
2. **Contain** — for S1/S2, suspend the affected pathway (e.g. require manual
   screening, disable the LLM via removing `ANTHROPIC_API_KEY`, or set
   `HAWKEYE_RBAC_STRICT=1`). Place affected cases on hold.
3. **Preserve evidence** — export the audit trail (`/api/audit/export`) and the
   LLM call log; do **not** edit historical records.
4. **Correct** — never mutate a past audit entry. Append a **correcting entry**
   (actor, action="correction", target, reason) so the trail stays append-only.
5. **Recover** — restore the source/control; re-screen impacted subjects.
6. **Report** — MLRO decides on regulator/EOCN notification (e.g. confirmed
   sanctions match → freeze within 24h, file within 5 business days).
7. **Review** — within 5 business days, run a blameless post-incident review;
   add/raise a row in [`ai-risk-register.md`](./ai-risk-register.md) and a backlog
   item if a control gap is found.

## Specific runbooks
- **Sanctions source down (S3):** app already returns honest "not screened" — do
  not rely on the list dimension; switch to manual screening per the SOP until
  restored.
- **LLM drift (S3):** golden eval (`tests/unit/llm-eval.test.ts`) red — pin/revert
  the model, inspect the LLM log, re-validate before re-enabling enrichment.
- **Audit signature mismatch (S2):** treat the record as suspect; preserve it,
  investigate key handling (`AUDIT_SIGNING_SECRET`), rotate the secret.
- **RBAC/abuse (S2):** enable strict mode, rotate credentials, review rate-limit
  logs.

## Verification
- Run a tabletop test of one S1 and one S2 scenario annually; confirm the audit
  trail captured the timeline and the correcting-entry pattern was used.
