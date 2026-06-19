# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Screening Console rebuild** — faithful recreation of the design handoff: an
  8-module console (Screening, Cases, Sanctions, Adverse Media, Crypto, Vessels,
  Audit Log, Settings) with nav-rail module switching, an animated "AI analyst"
  radar **HUD** fronted by 14 personas, a New-Subject intake modal with live
  projected risk, and a Settings accent/density/grid switcher.
- **Live integrations (env-gated, mock fallback):** Asana case sync
  (`/api/asana/sync`), free **Google News** adverse media
  (`/api/adverse-media/news`, `ADVERSE_MEDIA_LIVE`), free/open **OpenSanctions**
  lists (`/api/sanctions/sources`, `/api/sanctions/screen`, `SANCTIONS_LIVE`),
  and optional **Anthropic (Claude `claude-opus-4-8`)** enrichment
  (`ANTHROPIC_API_KEY`). Each degrades to deterministic mocks when unconfigured,
  so the build, tests and offline runs stay green.
- Professional repository scaffolding: README, MIT `LICENSE`, `CONTRIBUTING`,
  `CODE_OF_CONDUCT`, `SECURITY` policy, and this changelog.
- Continuous integration (GitHub Actions): type-check, lint, format check, unit
  tests, and build on every push and pull request to `main`.
- Test suites: **Vitest** unit/integration tests (helpers, seed data, mock API
  routes, one jsdom component test) and a **Playwright** end-to-end smoke suite
  with its own workflow.
- Containerization: multi-stage non-root **Dockerfile** (Next.js standalone
  output), `.dockerignore`, and a workflow that publishes images to GHCR on tags.
- Issue & pull-request templates, `CODEOWNERS`, and Dependabot configuration.
- Tooling configuration: ESLint (`next/core-web-vitals`), Prettier,
  `.editorconfig`, `.gitattributes`, `.nvmrc`, and `.env.example`.

### Changed

- Refreshed README badges, tech-stack table, features and project-structure to
  match the current stack (Next.js 16, React 19, Tailwind v4, TypeScript 6,
  Node ≥ 20.9) and the rebuilt console.

### Fixed

- E2E: use an unambiguous locator for the module-switch test (the previous
  `getByText("Stage")` matched both the column header and the module-brief note).

## [0.1.0] - 2026-06-19

### Added

- Initial full reconstruction of the HAWKEYE Sterling Screening application:
  Next.js 14 App Router, React 18, TypeScript (strict), Tailwind v3 dark design
  system.
- Screening console (`/screening`) with queue, filters, sort, search, intake
  form, hit triage, subject detail dossier, bulk actions, saved searches,
  compare, and CSV export.
- 11 offline mock API routes and a 14-subject seed corpus exercising every queue
  filter.

[Unreleased]: https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/releases/tag/v0.1.0
