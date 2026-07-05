# HAWKEYE · Sterling Screening

[![CI](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/ci.yml/badge.svg)](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/ci.yml)
[![E2E](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/e2e.yml/badge.svg)](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/e2e.yml)
[![CodeQL](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/codeql.yml/badge.svg)](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/actions/workflows/codeql.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/trex0092/HAWKEYE-STERLING-SCREENING/badge)](https://securityscorecards.dev/viewer/?uri=github.com/trex0092/HAWKEYE-STERLING-SCREENING)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg)](#contributors)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

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
- **Coverage** — `npm run test:coverage` reports coverage for `src/lib/**` and
  enforces baseline thresholds (statements 65% / branches 55% / functions 72% /
  lines 68%). CI publishes a coverage summary and uploads the HTML report as an
  artifact.
- **End-to-end** — [Playwright](https://playwright.dev) (Chromium) drives the built
  app. Run `npm run e2e` (it builds + boots the server automatically; first run:
  `npx playwright install --with-deps chromium`).

CI runs type-check, lint, format check, unit tests **with coverage**, and build on
every push/PR to `main`; the Playwright suite runs as its own workflow.

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
| `/api/screening/bulk-rescreen` | POST | Re-screen the portfolio (every subject gets a disposition: hit / cleared / unchanged) |
| `/api/screening/resolve` | POST | Persist a hit resolution |
| `/api/four-eyes` | POST | Four-eyes maker-checker review — rejects self-approval (maker ≠ checker enforced) |
| `/api/ongoing` | POST | Ongoing-screening enrolment |
| `/api/audit/sign` | POST | Sign an audit payload (HMAC-SHA256); `PUT` verifies a payload+signature for tamper detection |
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
| `ADVERSE_MEDIA_LIVE` | _(live)_ | Free Google-News headlines, **worldwide**: every major locale edition (US, UK, Türkiye, Arabic, Russia, China, …) searched in parallel and merged. Live everywhere (dev + prod); only unit tests use seed fixtures. Live results are never replaced with mock data. Set `false` to force seed-only |
| `SKIP_SANCTIONS_INDEX` | _(unset)_ | Set `1` to skip the build-time sanctions/PEP index download (used by CI for fast, hermetic builds) |
| `OPENSANCTIONS_DATA_BASE` | OpenSanctions latest | Base URL for the free OpenSanctions data exports the index is built from |
| `SANCTIONS_INDEX_MAX` | `1500000` | Cap on the number of indexed entities (bound bundle size / build memory) |
| `SANCTIONS_LIVE` | _(unset)_ | Optional remote OpenSanctions/yente API fallback, used **only** when no local index is bundled |
| `OPENSANCTIONS_API_URL` | public API | Point the optional remote fallback at a self-hosted [yente](https://www.opensanctions.org/docs/yente/) |
| `OPENSANCTIONS_INDEX_URL` | public index | Dataset metadata index URL (override when self-hosting) |

> **All-free data:** sanctions **+ PEP** screening needs **no API key**. At build
> time, `scripts/build-sanctions-index.mjs` downloads the free, openly-licensed
> OpenSanctions consolidated lists (OFAC, UN, EU, UK, Interpol) and PEP dataset
> and compiles a compact index that ships inside the deploy and is matched
> **in-process at runtime** — no key, no per-request network, serverless-friendly.
> **Google-News** adverse media is likewise free and worldwide. The build is
> resilient: if the data can't be fetched it writes an empty index and the console
> reports an honest "not screened" rather than fabricating a verdict. A remote
> yente/OpenSanctions API (`SANCTIONS_LIVE` + `OPENSANCTIONS_API_URL`) remains an
> optional fallback for when no index is bundled. Claude and Asana stay optional.

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
[Code of Conduct](./CODE_OF_CONDUCT.md), and get help via
[SUPPORT.md](./.github/SUPPORT.md).

## Governance & security

This project follows a documented, transparent governance and compliance model:

| Area | Where |
|---|---|
| Project governance & decision-making | [`GOVERNANCE.md`](./GOVERNANCE.md) |
| Maintainers | [`MAINTAINERS.md`](./MAINTAINERS.md) |
| Roadmap | [`ROADMAP.md`](./ROADMAP.md) |
| Contribution workflow | [`CONTRIBUTING.md`](./CONTRIBUTING.md) |
| Pull-request review guidelines | [`REVIEWING.md`](./REVIEWING.md) |
| Release process | [`RELEASING.md`](./RELEASING.md) |
| Issue / PR triage | [`TRIAGE.md`](./TRIAGE.md) |
| Architecture overview | [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) |
| Architecture Decision Records | [`docs/adr/`](./docs/adr/README.md) |
| Community standards | [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) |
| Getting support | [`SUPPORT.md`](./.github/SUPPORT.md) |
| Security & vulnerability disclosure | [`SECURITY.md`](./SECURITY.md) |
| Security Insights manifest (OpenSSF) | [`SECURITY-INSIGHTS.yml`](./SECURITY-INSIGHTS.yml) |
| Code owners / required reviewers | [`.github/CODEOWNERS`](./.github/CODEOWNERS) |
| Governance-as-code (repo & branch protection) | [`.github/settings.yml`](./.github/settings.yml) |
| Dependency automation | [`.github/dependabot.yml`](./.github/dependabot.yml) |
| Citation metadata | [`CITATION.cff`](./CITATION.cff) |
| Compliance traceability matrix | [`docs/governance/github-community-compliance.md`](./docs/governance/github-community-compliance.md) |
| AI-system & control governance | [`docs/governance/`](./docs/governance/README.md) |

**Automated compliance checks** run in CI on every pull request and on a
schedule:

- **CodeQL** — static application security testing
  ([`codeql.yml`](./.github/workflows/codeql.yml)).
- **Dependency Review** — blocks vulnerable or non-compliant dependencies
  ([`dependency-review.yml`](./.github/workflows/dependency-review.yml)).
- **OpenSSF Scorecard** — supply-chain security posture
  ([`scorecard.yml`](./.github/workflows/scorecard.yml)).
- **Type-check, lint, format, unit & E2E tests, build**
  ([`ci.yml`](./.github/workflows/ci.yml), [`e2e.yml`](./.github/workflows/e2e.yml)).
- **PR-title Conventional Commits check, release-note drafting, stale triage,
  auto-labeling, and Markdown link checking** round out the automation.

Report vulnerabilities privately per the [Security Policy](./SECURITY.md) —
never in a public issue.

## Contributors

Thanks to everyone who contributes to this project. This list follows the
[all-contributors](https://allcontributors.org) specification — contributions of
any kind (code, docs, ideas, review, infrastructure) are welcome and recognised.

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/trex0092"><img src="https://github.com/trex0092.png" width="100px;" alt="HAWKEYE Sterling"/><br /><sub><b>HAWKEYE Sterling</b></sub></a><br /><a href="#maintenance-trex0092" title="Maintenance">🚧</a> <a href="https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/commits?author=trex0092" title="Code">💻</a> <a href="https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/commits?author=trex0092" title="Documentation">📖</a> <a href="#infra-trex0092" title="Infrastructure">🚇</a> <a href="https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/pulls?q=is%3Apr+reviewed-by%3Atrex0092" title="Reviewed Pull Requests">👀</a></td>
    </tr>
  </tbody>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

To add a contributor, see the
[all-contributors CLI](https://allcontributors.org/docs/en/cli/usage) or the
`.all-contributorsrc` configuration.

## License

[MIT](./LICENSE) © HAWKEYE Sterling
