# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
