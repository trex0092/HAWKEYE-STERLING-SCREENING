# HAWKEYE · Sterling Screening

[![CI](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/ci.yml/badge.svg)](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A compliance & sanctions **screening console** — a dense, keyboard-driven analyst
workspace for triaging subjects against sanctions lists, PEP databases, adverse
media, and corporate/ownership intelligence.

> [!IMPORTANT]
> **Demo / reference build.** This project runs **fully offline**: every `/api/*`
> route is a deterministic **mock** that returns synthetic data — there are **no
> external calls, no API keys, and no real sanctions data**. It is intended as a
> UI/architecture reference, **not** a production screening system. Do not use it
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
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

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

## Configuration

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_COMTRADE_ENABLED` | `false` | Set `true` to render the UN Comtrade panel |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Please also read the
[Code of Conduct](./CODE_OF_CONDUCT.md) and report vulnerabilities per the
[Security Policy](./SECURITY.md).

## License

[MIT](./LICENSE) © HAWKEYE Sterling
