# AI System Register

> **Layer 1 — AI Discovery & Inventory.** A single place that records every automated or
> AI-driven decision component across the Hawkeye Sterling platform, so the organisation can see —
> and therefore govern — what is making or assisting decisions. "You can't govern what you can't
> see."

**Legend — Type:** `LLM` = large-language-model call · `Rules` = deterministic logic · `Control` =
governance/safety mechanism. **Autonomy:** `Advisory` (produces information a human acts on) ·
`Assistive` (shapes a verdict but cannot finalise a hard outcome alone) · `Automated` (acts
without a human in the immediate loop). All entries degrade gracefully to deterministic behaviour
or mocks when their integration is unconfigured.

_Last reviewed: 2026-06-21. Owner: Compliance / MLRO function._

---

## A. Application — AI / LLM components

| ID | Component | Type | Where | Inputs | Outputs | Autonomy | Failure mode | Human-in-the-loop |
|---|---|---|---|---|---|---|---|---|
| APP-AI-1 | Adverse-media classification — `classifyAdverseMedia()` | LLM (`claude-opus-4-8`) | `src/lib/ai/anthropic.ts` | News headline + subject name | `{sentiment, category}` (sentiment coerced to a whitelist; category free text, untrusted) | Advisory | Returns `null` → caller falls back to deterministic logic | Analyst reads classification in the Adverse Media module; never an auto-block input |
| APP-AI-2 | Screening-reasoning synthesis — `screeningReasoning()` | LLM (`claude-opus-4-8`) | `src/lib/ai/anthropic.ts` | Subject (name/country/risk/lists) + watchlist hits | `{summary, decision, score, factors}` — `decision` coerced to `clear\|review\|escalate\|block`, `score` clamped 0–100 | Assistive | Returns `null` → deterministic verdict stands | Analyst reviews the rationale; verdict is confirmed by a person |

Activation: both require `ANTHROPIC_API_KEY`. Without it the helpers return `null` and the app
runs entirely on the deterministic logic below. Model id and behaviour: see
[`model-card-claude.md`](./model-card-claude.md).

## B. Application — deterministic decision logic (no LLM)

| ID | Component | Type | Where | Logic / inputs | Output | Autonomy | Human-in-the-loop |
|---|---|---|---|---|---|---|---|
| APP-DET-1 | Subject auto-screen | Rules | `src/app/api/quick-screen/route.ts` | OpenSanctions/yente name match + Google-News adverse media; thresholds `≥90 block`, `≥75 escalate`, `≥50 review`, `<50 clear` (`decisionFor`) | Verdict: decision, severity, factors, recommendation | Assistive | Verdict surfaced to analyst; escalate/block routes to L2/MLRO |
| APP-DET-2 | Adverse-media scoring | Rules | `adverseMediaScore()` in `quick-screen/route.ts` | Count of negative articles → score, **capped at 75** (escalate band) | Adverse-media sub-score | Assistive | Adverse media alone can never auto-block; "requires analyst verification" |
| APP-DET-3 | Bulk re-screen | Rules | `src/app/api/screening/bulk-rescreen` | Deterministic portfolio refresh | Per-subject disposition (new-hit / cleared / unchanged) — no silent gaps | Assistive | Analyst dispositions flagged subjects |
| APP-DET-4 | Natural-language case search | Rules | `src/app/api/cases/nl-search/route.ts` | Keyword/risk-floor parsing (no LLM) | Structured filter + matched case IDs + confidence | Advisory | A search aid; no decisioning |
| APP-DET-5 | "Honest verdict" guard | Rules / Control | `cleanVerdict()` in `quick-screen/route.ts` | No live list source reached | Explicit "not screened" verdict — **no fabricated matches or score** | n/a | Recommendation: connect a live source before relying on the verdict |

## C. Application — governance & safety controls

| ID | Control | Type | Where | What it enforces |
|---|---|---|---|---|
| APP-CTL-1 | Four-eyes (maker-checker) | Control | `src/app/api/four-eyes/route.ts` | A `maker` may not approve their own decision (case-insensitive); self-approval rejected (HTTP 422) |
| APP-CTL-2 | Audit-chain signing | Control | `src/app/api/audit/sign/route.ts` | HMAC-SHA256 signing (POST) + constant-time verification (PUT). `AUDIT_SIGNING_SECRET` in prod; labelled insecure dev key offline |
| APP-CTL-3 | Client audit trail | Control | `src/lib/audit.ts` | Append-only, capped at 1000 entries `{ts, actor, action, target}`; emits `hawkeye:audit-updated` |
| APP-CTL-4 | LLM output coercion | Control | `src/lib/ai/anthropic.ts` | Untrusted model fields forced to safe values: decision whitelist, score clamp, refusal → `null` |
| APP-CTL-5 | Analyst personas | Rules | `src/lib/data/operators.ts` | 14 role-typed operator personas mapped to entity type (UI affordance, not autonomous) |

## D. Asana automation (external — `HAWKEYE-STERLING-RA` scheduled GitHub Actions)

All deterministic monitors. They diff a source, and on change create an Asana task. **Detection is
automatic; applying any change remains a reviewed human decision.** They write into the
**Regulations / Governance / Sanctions** project (sections: Regulatory changes · FATF list moves ·
Sanctions updates · AI / Governance · Site & function health) and the **Compliance Renewals**
project.

| ID | Automation | Type | Trigger | Data source | Output | Autonomy | Human-in-the-loop |
|---|---|---|---|---|---|---|---|
| ASA-1 | Regulatory Watch | Rules | Scheduled GH Action | ~12 regulator/standard-setter pages (MoE, FIU, VARA, Wolfsberg, LBMA, OFAC, EU, UK OFSI, Egmont, Basel, UNODC, RJC, …) | Task per detected content change w/ source + link | Automated (detect) / Advisory (apply) | Compliance officer reviews and applies any wording change |
| ASA-2 | Sanctions Watch | Rules | Scheduled GH Action | OFAC SDN/Consolidated, UN, EU FSF, UK OFSI, EOCN | Task per list change / customer screening hit | Automated (detect) | MLRO acts on hits per the Sanctions Screening SOP |
| ASA-3 | FATF Watchdog | Rules | Scheduled GH Action | FATF black/grey-list | Task per list move; standing posture in the brief | Automated (detect) | Compliance reviews jurisdiction-risk impact |
| ASA-4 | Expiry notifier | Rules | Daily GH Action | Customer Database task descriptions (licence / passport / Emirates ID / review dates) | Renewal task in **Compliance Renewals**, deduped via `dedup-key:` | Automated | Owner obtains the renewed document, updates the record |
| ASA-5 | Daily Compliance Brief | Rules | Daily GH Action | Aggregates ASA-1…ASA-4 + health | One summary task linking each detected item | Automated (compile) | Compliance reviews the brief each morning |
| ASA-6 | Site & function health | Rules | Scheduled GH Action | App / Netlify health checks | Task on failed check (e.g. "SITE DOWN") | Automated | Engineering/compliance triage |

> Note: the app's own Asana case sync (`src/app/api/asana/sync/route.ts`, `ASANA_ACCESS_TOKEN`)
> is **analyst-initiated** (a "Sync" button pushes an escalated case to Asana), distinct from the
> scheduled monitors above. It logs an audit event on use.

---

## How to keep this register current

- Add a row whenever a new automated/AI component, monitor, or control is introduced.
- For any new **LLM** use, also add/extend a model card and link it here.
- Re-confirm the Asana automation rows against the live workspace (project sections, automation
  outputs) at each periodic review.
- Treat changes to decision thresholds (`decisionFor`, `adverseMediaScore`) as governed changes —
  record the rationale and reviewer.
