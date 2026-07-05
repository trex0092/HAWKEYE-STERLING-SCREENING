# Architecture

A high-level tour of how **HAWKEYE · Sterling Screening** is put together. This
complements the [README](../README.md) (setup) and the AI-system governance
under [`docs/governance/`](./governance/README.md).

> **Demo / reference build.** Every `/api/*` route returns deterministic mock
> data by default; optional integrations activate only when their environment
> variables are set. Do not use it to make real compliance decisions.

## Overview

The application is a single **Next.js 16 (App Router)** project written in
**TypeScript (strict)** with **React 19** and **Tailwind CSS v4**. It renders a
dense, keyboard-driven analyst console and is backed by route handlers that are
mock-first and progressively enhanced by env-gated live integrations.

```
Browser (React console)
        │  fetch()
        ▼
Next.js route handlers  (src/app/api/*)
        │  env-gated
        ▼
Integrations (Asana · Google News · OpenSanctions · Anthropic)
        │  fallback
        ▼
Deterministic mocks / bundled sanctions index
```

## Layers

| Layer | Directory | Responsibility |
|---|---|---|
| App shell & routing | `src/app/` | Root layout, `/screening` console page, API route handlers |
| UI components | `src/components/` | Console HUD, subject register, per-module views |
| Domain logic | `src/lib/console/`, `src/lib/data/` | Pure risk/tone/sort derivation and datasets |
| Integrations | `src/lib/integrations/` | Asana, Google adverse-media, OpenSanctions clients |
| AI (optional) | `src/lib/ai/` | Claude enrichment, env-gated |
| Auth / API helpers | `src/lib/auth/`, `src/lib/api/` | Header-based identity, retrying fetch |

## Key design principles

1. **Mock-first, live-optional.** No route makes a live network call unless the
   relevant environment variable is set. Absence of a key degrades to
   deterministic mocks — never to fabricated "live" data.
2. **Deterministic decision logic.** Screening score → decision thresholds are
   fixed rules, not model output. The only true LLM surface is the optional
   Claude enrichment (see [`docs/governance/`](./governance/README.md)).
3. **Honest verdicts.** When a data source is unavailable, the UI reports "not
   screened" rather than a false clear.
4. **Auditability.** Actions produce an HMAC-signed audit trail
   (`/api/audit/sign`) that can be verified for tamper detection.
5. **Human oversight.** Four-eyes maker-checker (`/api/four-eyes`), override
   (`/api/override`), and MLRO sign-off (`/api/mlro-signoff`) gate decisions.

## Data flow: a quick screen

1. The console posts a subject to `/api/quick-screen`.
2. The handler matches the name against the **bundled OpenSanctions index**
   (built at deploy by `scripts/build-sanctions-index.mjs`) and queries the
   **Google-News adverse-media** feed.
3. Sanctions/PEP hits and negative coverage are folded into a risk score.
4. A fixed threshold maps the score to a disposition (clear / review /
   escalate), returned with reasoning and hits.

## Build & runtime

- **Build:** `scripts/build-sanctions-index.mjs` compiles a compact gzipped
  sanctions/PEP index, then `next build`. CI sets `SKIP_SANCTIONS_INDEX=1` to
  stay fast and hermetic.
- **Runtime:** Node.js ≥ 20.9. Matching runs in-process — no per-request
  network and no API key required for core screening.
- **Container:** the root `Dockerfile` produces the image published to GHCR on
  version tags.

## Testing

- **Unit / integration:** Vitest (`tests/`).
- **End-to-end:** Playwright / Chromium (`e2e/`).
- Both run in CI on every pull request.

## Decisions

Significant architectural choices are recorded as
[Architecture Decision Records](./adr/README.md).
