# Data Retention & Deletion Policy

> **Layer 2 — Data Governance.** Defines how long each class of data is kept, when
> it is deleted, and who is accountable. Aligns with the 5-year AML record-keeping
> expectation referenced in the screening SOPs.

_Last reviewed: 2026-06-21 · Owner: MLRO · Review cycle: annual._

## Scope
Covers data held by Hawkeye Sterling Screening: screening records and verdicts,
audit-trail entries, subject identifiers (PII), and LLM observability logs.

## Retention schedule

| Data class | Retain for | Basis |
|---|---|---|
| Screening records & verdicts | 5 years after the relationship/transaction ends | UAE AML record-keeping |
| Audit-trail entries (`src/lib/audit.ts`) | 5 years | UAE AML record-keeping |
| Case sign-off records (MLRO gate) | 5 years | Demonstrable decision accountability |
| LLM call log (`src/lib/ai/llm-log.ts`) | 12 months | Drift review; holds prompt **hashes**, never raw prompts/PII |
| Subject PII with no resulting relationship | 30 days | Data minimisation |

## Deletion
- Data past its retention period is purged on a scheduled job; **each deletion is
  itself audit-logged** (actor, action, target).
- A **legal hold** (regulatory request, investigation) overrides purge until the
  MLRO releases it.
- The in-memory LLM log is capped at 500 entries and is non-durable by design;
  a production sink must enforce the 12-month limit and PII-free contract.

## Data minimisation (as built)
- The LLM log stores a **non-reversible hash** of each prompt, not its text.
- The "honest verdict" guard (`cleanVerdict()` in `quick-screen/route.ts`) avoids
  fabricating or storing matches that were never screened.
- The audit trail records only `{ts, actor, action, target}` — no payload bodies.

## Responsibilities
- **Data controller:** Hawkeye Sterling LLC. **Processor:** the application host.
- The **MLRO** approves any early deletion and owns legal holds.
- Engineering implements and tests the purge job and keeps this schedule current
  under change control.

## Verification
- A periodic check confirms no record exceeds its retention period (excepting
  legal holds) and that purge events appear in the audit trail.
