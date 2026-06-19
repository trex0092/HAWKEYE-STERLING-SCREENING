# HAWKEYE · Sterling Screening

[![CI](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/ci.yml/badge.svg)](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/ci.yml)
[![E2E](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/e2e.yml/badge.svg)](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/e2e.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
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

- **8-module console** — Screening, Cases, Sanctions, Adverse Media, Crypto,
  Vessels, Audit Log and Settings, switched from a sticky nav rail.
- **Animated AI-analyst HUD** — a radar HUD (spinning rings + persona avatar)
  fronted by 14 analyst personas, themed by a per-analyst accent.
- **Subject register & dossier** — sortable register with risk bars and
  status/CDD/SLA/list chips; a detail panel for reassign-analyst, status & CDD
  controls, fields, notes, and related subjects.
- **New-Subject intake** — modal with a live projected-risk readout that opens a
  case and assigns an analyst by entity type.
- **Live integrations** — Asana case sync, free Google-News adverse media,
  free/open OpenSanctions lists, and optional Anthropic (Claude) enrichment —
  each env-gated with deterministic mock fallbacks.
- **Auditability** — local + (mock) server-signed audit trail for every action.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 6 (strict) |
| UI | React 19 |
| Styling | Tailwind CSS v4 (custom dark design-system tokens) |
| AI | Anthropic SDK (`claude-opus-4-8`), optional |
| Runtime | Node.js ≥ 20.9 (CI: 22) |

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
│  ├─ globals.css           # design-system tokens + console animations
│  ├─ screening/page.tsx    # the 8-module console (main page)
│  └─ api/                  # route handlers (mock by default, env-gated live)
│     ├─ asana/sync/        ├─ adverse-media/news/  ├─ sanctions/sources/
│     ├─ sanctions/screen/  ├─ quick-screen/        └─ … (mock routes)
├─ components/
│  └─ console/             # console UI — HUD, register, per-module views
└─ lib/
   ├─ console/derive.ts    # pure risk/tone/sort helpers
   ├─ data/                # subjects, operators, console datasets
   ├─ integrations/        # Asana, Google adverse-media, OpenSanctions clients
   └─ ai/anthropic.ts      # optional Claude enrichment
```

Tests live in `tests/` (Vitest unit/integration) and `e2e/` (Playwright), and the
container build is defined by the root `Dockerfile`.

## API routes (mock)

| Route | Method | Purpose |
|---|---|---|
| `/api/quick-screen` | POST | Auto-screen a subject against free OpenSanctions (sanctions + PEP) → score, severity, reasoning, hits; deterministic mock offline |
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
| `ADVERSE_MEDIA_LIVE` | _(live)_ | Free Google-News headlines. Live everywhere (dev + prod); only unit tests use seed fixtures. Live results are never replaced with mock data. Set `false` to force seed-only |
| `SANCTIONS_LIVE` | _(prod: on)_ | Free OpenSanctions sanctions **+ PEP** data powering the real screening verdict. On in production, off in dev/test; set `true`/`false` to override |
| `OPENSANCTIONS_API_URL` | public API | Point at a self-hosted [yente](https://www.opensanctions.org/docs/yente/) for unlimited, rate-limit-free matching (still free) |
| `OPENSANCTIONS_INDEX_URL` | public index | Dataset metadata index URL (override when self-hosting) |

> **All-free data:** **Google-News** adverse media needs no key and works as
> soon as the deploy has outbound network. **OpenSanctions** sanctions + PEP
> matching is also 100% free, but the *public hosted* API is now key-gated
> (returns `403` without a subscription), so for the zero-cost live path point
> `OPENSANCTIONS_API_URL` at a **self-hosted [yente](https://www.opensanctions.org/docs/yente/)**
> (see below). Without it the console gracefully serves deterministic results.
> Claude and Asana remain optional.

### Run yente locally (free live sanctions + PEP)

[yente](https://www.opensanctions.org/docs/yente/) is OpenSanctions' open-source
matching engine. Run it against the free, open data for unlimited, key-free
screening:

```bash
# 1. Start yente (it loads the free OpenSanctions default dataset on boot)
docker run -p 8000:8000 ghcr.io/opensanctions/yente:latest

# 2. Point the app at it, then start the app
export SANCTIONS_LIVE=true
export OPENSANCTIONS_API_URL=http://localhost:8000
export OPENSANCTIONS_INDEX_URL=http://localhost:8000/catalog
npm run dev   # or: npm run build && npm run start
```

`Run screening` now returns real sanctions/PEP hits from your local yente — no
API key, no per-request cost. For production, run yente as a service and set the
same env vars on the deploy.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Please also read the
[Code of Conduct](./CODE_OF_CONDUCT.md) and report vulnerabilities per the
[Security Policy](./SECURITY.md).

## License

[MIT](./LICENSE) © HAWKEYE Sterling
