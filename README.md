# HAWKEYE · Sterling Screening

[![CI](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/ci.yml/badge.svg)](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A compliance & sanctions **screening console** — a dense, keyboard-driven analyst
workspace for triaging subjects against sanctions lists, PEP databases, adverse
media, and corporate/ownership intelligence.

> [!IMPORTANT]
> **Demo / reference build.** Out of the box this project runs **fully offline**:
> every `/api/*` route returns deterministic **mock** data with no external calls
> or keys. Optional integrations — **Asana** case sync, free **Google News**
> adverse media, free/open **OpenSanctions** lists, and **Anthropic (Claude)**
> enrichment — activate only when their environment variables are set (see
> [Configuration](#configuration)) and otherwise degrade to the mocks. It is a
> UI/architecture reference, **not** a production screening system; do not use it
> to make real compliance decisions.

---

## Features

- **Queue & triage** — sortable, filterable subject queue (critical, sanctions,
  EDD, PEP, SLA risk, recently added, assigned-to-me, closed) with bulk actions.
- **Screening workflow** — intake form, auto-screen with AI-style reasoning,
  World-Check-style hit triage with structured false-positive reason codes.
- **Detail dossier** — per-subject panel with risk, list coverage, PEP/adverse
  media, wallets, notes, related entities, snooze, and status/CDD controls.
- **Search** — fuzzy/transliteration/phonetic search plus a natural-language
  search that resolves a query into a structured filter.
- **Productivity** — saved searches, column chooser, CSV export, side-by-side
  compare, and full keyboard shortcuts.
- **Auditability** — local + (mock) server-signed audit trail for every action.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| UI | React 18 |
| Styling | Tailwind CSS v3 (custom dark design-system tokens) |
| Runtime | Node.js ≥ 18.17 |

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. (optional) configure environment
cp .env.example .env.local

# 3. Run the dev server
npm run dev
```

Open <http://localhost:3000> — `/` redirects to **`/screening`**.

> Tip: set `localStorage.hawkeye.operator = "analyst-A"` in the browser console to
> activate the **Mine** queue filter against the seed data.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (`next lint`) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run test` | Unit/integration tests (Vitest) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run e2e` | End-to-end tests (Playwright) |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

## Testing

- **Unit / integration** — [Vitest](https://vitest.dev). Covers the pure helpers,
  the seed-data invariants, and the mock API route handlers; one component render
  test runs under jsdom. Run `npm run test`.
- **End-to-end** — [Playwright](https://playwright.dev) (Chromium) drives the built
  app. Run `npm run e2e` (it builds + boots the server automatically; first run:
  `npx playwright install --with-deps chromium`).

CI runs type-check, lint, format check, unit tests, and build on every push/PR to
`main`; the Playwright suite runs as its own workflow.

## Docker

A multi-stage, non-root image is built from the Next.js **standalone** output:

```bash
docker build -t hawkeye-screening .
docker run --rm -p 3000:3000 hawkeye-screening
```

Tagged releases (`v*`) are published to GHCR by the *Publish Docker image* workflow.

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx            # root layout (dark theme)
│  ├─ page.tsx              # redirects / → /screening
│  ├─ globals.css           # design-system CSS variables
│  ├─ screening/page.tsx    # the screening console (main page)
│  └─ api/                  # offline mock route handlers
│     ├─ quick-screen/      ├─ adverse-media/   ├─ ongoing/
│     ├─ four-eyes/         ├─ audit/sign/      ├─ cases/nl-search/
│     ├─ screening/         └─ sanctions/
├─ components/              # layout shell + screening UI components
└─ lib/                     # types, data seeds, hooks, utilities
```

Tests live in `tests/` (Vitest unit/integration) and `e2e/` (Playwright), and the
container build is defined by the root `Dockerfile`.

## API routes (mock)

| Route | Method | Purpose |
|---|---|---|
| `/api/quick-screen` | POST | Auto-screen a subject → score, severity, reasoning, hits |
| `/api/adverse-media` | POST | Adverse-media verdict (risk tier, SAR flag) |
| `/api/cases/nl-search` | POST | Resolve a natural-language query into matches |
| `/api/screening/bulk-rescreen` | POST | Re-screen the portfolio |
| `/api/screening/resolve` | POST | Persist a hit resolution |
| `/api/four-eyes` | POST | Escalation / four-eyes enqueue |
| `/api/ongoing` | POST | Ongoing-screening enrolment |
| `/api/audit/sign` | POST | (Mock) HMAC audit-chain mirror |
| `/api/sanctions/operator-refresh` | POST | Kick off a sanctions refresh job |
| `/api/sanctions/refresh-status/[jobId]` | GET | Poll refresh job status |
| `/api/sanctions/last-errors` | GET | Last sanctions ingestion errors |
| `/api/asana/sync` | GET/POST | Push a case to Asana (mock without a token) |
| `/api/adverse-media/news` | GET | Free Google-News adverse-media feed (seed offline) |
| `/api/sanctions/sources` | GET | Watchlist sources — live OpenSanctions or seed |
| `/api/sanctions/screen` | POST | Name-match against open sanctions data |

## Configuration

All integrations degrade to deterministic mocks when their variable is unset, so
the app builds, tests and runs fully offline. Set these to go live:

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_COMTRADE_ENABLED` | `false` | Set `true` to render the UN Comtrade panel |
| `ANTHROPIC_API_KEY` | _(unset)_ | Enable Claude (`claude-opus-4-8`) media/screening enrichment |
| `ASANA_ACCESS_TOKEN` | _(unset)_ | Personal access token for `/api/asana/sync` (else mock) |
| `ASANA_PROJECT_ID` / `ASANA_WORKSPACE_ID` | _(unset)_ | Where synced Asana tasks land |
| `ADVERSE_MEDIA_LIVE` | `false` | `true` pulls live free Google-News headlines |
| `SANCTIONS_LIVE` | `false` | `true` reads live free OpenSanctions list data |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Please also read the
[Code of Conduct](./CODE_OF_CONDUCT.md) and report vulnerabilities per the
[Security Policy](./SECURITY.md).

## License

[MIT](./LICENSE) © HAWKEYE Sterling
