# Model Card — Claude enrichment (`claude-opus-4-8`)

> **Layer 4 — Model & Agent Assurance (documentation portion).** This card describes the **only
> LLM in the platform**: the optional Claude enrichment used by the screening app. Everything else
> in the system is deterministic rules (see [`ai-system-register.md`](./ai-system-register.md)).

_Last reviewed: 2026-06-21. Owner: Compliance / MLRO function. Source of truth:
`src/lib/ai/anthropic.ts`._

## Overview

| Field | Value |
|---|---|
| Model | `claude-opus-4-8` (Anthropic, Opus tier) |
| Provider | Anthropic, via `@anthropic-ai/sdk` |
| Activation | Optional; only when `ANTHROPIC_API_KEY` is set. Unset ⇒ helpers return `null` and the app falls back to deterministic logic. |
| Call style | Short, single-turn JSON-only completions. No streaming. No sampling params, no extended thinking. `max_tokens` 200 (classification) / 400 (reasoning). |
| Location | `src/lib/ai/anthropic.ts` — `classifyAdverseMedia()`, `screeningReasoning()` |

## Intended use

1. **Adverse-media classification** — for a single news headline about a screened subject, return
   a sentiment label and a short category, to enrich the Adverse Media module.
2. **Screening-reasoning synthesis** — for a subject and its watchlist hits, produce a short,
   human-readable compliance rationale (summary, suggested decision, score, factors) to assist
   analyst triage.

Both are **advisory/assistive aids for a human analyst**. They speed up review; they do not
replace it.

## Out of scope (prohibited uses)

- **Never the sole basis for a hard outcome.** The model must not, on its own output, finalise a
  block/freeze or onboard a customer. Hard outcomes come from the deterministic engine and human
  sign-off.
- Not used to generate regulatory filings (STR/SAR/DPMSR), legal advice, or customer-facing
  communications.
- Not used to fabricate sanctions/PEP matches — when no live list source is reachable the app
  returns an honest "not screened" verdict (`cleanVerdict()`), independent of the LLM.

## Inputs / outputs and prompts

### 1. `classifyAdverseMedia(headline, subject)`
- **System prompt:** *"You are a financial-crime adverse-media analyst. For a news headline about
  a screened subject, return ONLY compact JSON:
  `{"sentiment":"negative|positive|neutral","category":"<2-3 word category>"}`."*
- **User content:** `Subject: <name>` + `Headline: <headline>`.
- **Output:** `{ sentiment: "negative"|"positive"|"neutral", category: string }`.

### 2. `screeningReasoning(subject, hits)`
- **System prompt:** *"You are an AML/sanctions screening analyst. Given a subject and its
  watchlist hits, return ONLY compact JSON:
  `{"summary":"<one sentence>","decision":"clear|review|escalate|block","score":<0-100>,"factors":["<short factor>", ...]}`."*
- **User content:** subject name, country, risk, lists, and the hit list.
- **Output:** `{ summary: string, decision: "clear"|"review"|"escalate"|"block", score: 0–100, factors: string[] }`.

## Safety controls (as built)

The model's output is treated as **untrusted**:

| Control | Implementation |
|---|---|
| Refusal handling | `stop_reason === "refusal"` ⇒ text is `null` ⇒ helper returns `null` (`firstText`). |
| Defensive JSON parse | `safeJson()` extracts the first `{…}` block and `try/catch`-parses; malformed ⇒ `null`. |
| Decision whitelist | `decision` coerced to `clear\|review\|escalate\|block`; anything else ⇒ `review`. Sentiment coerced to `negative` if not `positive`/`neutral`. |
| Score clamp | `score` rounded and clamped to `0–100`; non-finite ⇒ `0`. |
| Field typing | `summary`/`factors` forced to `String`/`string[]`; never injected as executable content. |
| Fail-safe fallback | Any exception ⇒ `null`; caller proceeds on deterministic logic. The LLM is never on a critical path. |
| Bounded cost | Small `max_tokens`; no tool use, no autonomous loop. |

## Known limitations & risks

- **No evaluation set / accuracy metrics.** Classification and reasoning quality are not measured
  against a labelled ground truth. *(Layer 4 gap.)*
- **No drift monitoring.** Output behaviour is not tracked over time or across model updates.
  *(Layer 4 gap.)*
- **Potential language/geography bias.** Adverse-media headlines are multi-language (global Google
  News editions); sentiment/category quality may vary by language or region. *(Layer 2 gap.)*
- **Non-determinism.** LLM output can vary run-to-run; this is why it is advisory and why decision
  fields are coerced.
- **Third-party dependency.** Availability and behaviour depend on the Anthropic API; mitigated by
  the graceful `null` fallback.

## Recommended assurance actions (backlog)

Tracked in [`six-layer-alignment.md`](./six-layer-alignment.md) under Layer 4:

1. Add a small **golden eval set** (headlines + expected sentiment/category; subjects + expected
   decision band) and run it in CI.
2. **Log LLM I/O** (prompt hash, model id, output, latency) to enable drift review.
3. **Red-team prompts** (spoofed/ambiguous headlines, prompt-injection in headline text) and
   confirm the whitelist/clamp controls hold.
4. Record the **model id and prompt versions** on each change as a governed change.
