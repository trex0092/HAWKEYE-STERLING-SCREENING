# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Client audit log survives a corrupt store** — `writeAuditEvent` previously
  aborted (dropping the new entry) if the persisted log was unparseable. It now
  parses defensively and starts a fresh log, so a single corrupt value can no
  longer block new audit entries.

### Added

- **Tests for the client fetch wrapper and audit log** — new suites for
  `fetchJson` (success, non-2xx, bad JSON, network error, header/body
  forwarding, timeout/abort) and the client audit log (append, ordering, the
  1000-entry cap, corruption recovery, update event). Overall coverage rose to
  ~75% statements / 64% branches, and the enforced thresholds were ratcheted up
  to match (statements 74 / branches 63 / functions 81 / lines 77).

### Security

- **Workflow security audit is now a clean, blocking gate** — zizmor runs clean
  across all workflows and fails CI on any finding. Added `persist-credentials:
  false` to every checkout (fixes zizmor's `artipacked`), downgraded the PR-title
  check from `pull_request_target` to the safer `pull_request` (it only reads the
  title), and annotated the one legitimate `pull_request_target` (contributor
  greetings — needs write to comment on fork PRs, no untrusted checkout) with a
  justified `# zizmor: ignore[dangerous-triggers]`.
- **All GitHub Actions pinned to full commit SHAs** — every `uses:` across the
  workflows is now pinned to an immutable commit (with a `# vX` comment for
  readability), closing the mutable-tag supply-chain risk and satisfying OpenSSF
  Scorecard's Pinned-Dependencies and zizmor's `unpinned-uses`. Dependabot keeps
  the pins current. This also fixed a latent bug (`trivy-action@0.28.0` did not
  exist — the tag is `v0.28.0`) and replaced the non-resolving
  `scorecard-action@v2` with the concrete `v2.4.3`.

### Changed

- **Hardened enforcement ("weaponized" CI)** — turned the defensive posture from
  advisory to enforcing: coverage thresholds ratcheted to just under current
  (statements 70 / branches 60 / functions 79 / lines 72) so any regression
  fails CI; the container release now **blocks on a fixable CRITICAL** image
  vulnerability (Trivy gate); Dependency Review tightened to `moderate`; CI and
  E2E runners gain `harden-runner` egress auditing; and a new
  [`ci-security.yml`](.github/workflows/ci-security.yml) audits the workflows
  themselves with `actionlint` + `zizmor` (SARIF to code scanning). The
  governance-files check now tracks 50 files.

### Added

- **Security depth: threat model & signed container supply chain** — added a
  STRIDE [`threat-model.md`](docs/governance/threat-model.md) (flipping the
  OpenSSF Security Insights `threat-model-created` to true) and a
  [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) runbook. Hardened the container
  release ([`docker-publish.yml`](.github/workflows/docker-publish.yml)) with an
  SPDX **SBOM**, a signed **SLSA build-provenance attestation**, and a **Trivy**
  image vulnerability scan published to code scanning — documented in
  [ADR-0006](docs/adr/0006-container-image-supply-chain.md). The governance
  matrix, six-layer status, README, and governance-files check now cover them.

### Changed

- **Dependencies** — bumped the minor/patch group (supersedes Dependabot #44):
  `next` 16.2.10, `@anthropic-ai/sdk` 0.110, `eslint-config-next` 16.2.10,
  `tailwindcss` / `@tailwindcss/postcss` 4.3.2, `postcss` 8.5.16,
  `@types/node` 26.1.0, and `prettier` 3.9.4. Reformatted three files for
  Prettier 3.9.4. Full CI green locally (format, typecheck, lint, coverage, build).

## [0.1.0] - 2026-07-05

The first tagged release. Establishes the offline screening-console reference
build and a complete GitHub governance, compliance, and quality baseline.

### Added

- **README hero screenshot & table of contents** — added a rendered screenshot
  of the console (`docs/assets/screenshot-console.png`) at the top of the README
  and a navigable Contents list, so the project reads professionally at a glance.

### Fixed

- **CI lint step no longer crashes** — under ESLint 10, `eslint-plugin-react`'s
  runtime React-version auto-detection threw `getFilename is not a function`,
  failing the `Lint` job. Pinned the React version in `eslint.config.mjs` to skip
  detection; `npm run lint` now passes cleanly.

### Added

- **Test-coverage reporting & regression guardrails** — `npm run test:coverage`
  measures coverage for `src/lib/**` via the v8 provider and enforces baseline
  thresholds (statements 65% / branches 55% / functions 72% / lines 68%). CI runs
  the covered test suite, publishes a coverage summary to the job page, and
  uploads the HTML report as an artifact.
- **Contributor recognition & decision records** — added an
  [all-contributors](https://allcontributors.org) setup (`.all-contributorsrc` +
  a Contributors table in the README) and two new ADRs: 0004 (HMAC-signed audit
  trail) and 0005 (four-eyes & MLRO human-oversight controls).
- **Process runbooks & enforced governance baseline** — added
  [`RELEASING.md`](RELEASING.md) (SemVer release runbook),
  [`TRIAGE.md`](TRIAGE.md) (issue/PR triage + label glossary), a third ADR
  (strict TypeScript & design tokens), and a `task` issue template. A new
  hermetic CI check ([`governance-check.yml`](.github/workflows/governance-check.yml)
  + [`scripts/check-governance.mjs`](scripts/check-governance.mjs)) fails the
  build if any of the 47 required governance files is removed.
- **Architecture & decision documentation** — added [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md),
  an Architecture Decision Record log ([`docs/adr/`](docs/adr/README.md)) with a
  template and the first two records, PR [`REVIEWING.md`](REVIEWING.md)
  guidelines, an [`AUTHORS`](AUTHORS) credits file, and an RFC 9116
  [`security.txt`](public/.well-known/security.txt) security-contact record. The
  compliance matrix and README governance index reference all of them.
- **Governance depth: maintainers, roadmap & compliance traceability** — added
  `MAINTAINERS.md`, `ROADMAP.md`, an OpenSSF `SECURITY-INSIGHTS.yml` manifest,
  and a `docs/governance/github-community-compliance.md` matrix mapping every
  community/supply-chain control to where it lives. Added governance-as-code via
  `.github/settings.yml` (repo + branch-protection intent), plus automation:
  Release Drafter, Conventional-Commits PR-title linting, first-contributor
  greetings, non-blocking Markdown link checking, and a documentation issue
  template.
- **GitHub governance & compliance hardening** — completed the community-health
  and supply-chain security baseline: a project `GOVERNANCE.md`, `SUPPORT.md`,
  `CITATION.cff`, and a `FUNDING.yml` placeholder; version-controlled issue
  labels (`.github/labels.yml`) with a sync workflow; automatic path-based PR
  labeling; and three scheduled/PR security checks — **CodeQL** (SAST),
  **Dependency Review** (vulnerable/non-compliant dependency gating), and
  **OpenSSF Scorecard** (supply-chain posture). README now surfaces a
  Governance & security section plus CodeQL and Scorecard badges.

- **Keyless sanctions + PEP screening from free bundled lists** — a build-time
  step (`scripts/build-sanctions-index.mjs`) downloads the free, openly-licensed
  OpenSanctions consolidated lists (OFAC, UN, EU, UK, Interpol) and PEP dataset
  and compiles them into a compact, gzipped index that ships inside the deploy.
  The screening route matches names against it **in-process at runtime — no API
  key and no per-request network**, which works on serverless. Matching is
  diacritic- and word-order-insensitive with a tunable threshold. The build is
  resilient (writes an empty index and reports an honest "not screened" if the
  data can't be fetched), and a remote yente/OpenSanctions API stays an optional
  fallback (`SANCTIONS_LIVE` + `OPENSANCTIONS_API_URL`). CI builds stay fast and
  hermetic via `SKIP_SANCTIONS_INDEX=1`.

### Changed

- **Adverse media is now all live and worldwide** — the Google-News feed runs
  live by default in every environment (dev + prod), not just production, and is
  searched across every major locale edition (US, UK, Türkiye, Arabic, Russia,
  China, India, Japan, and more) in parallel, then merged and de-duplicated. A
  subject's local-language press surfaces alongside the international wires.
  Live results are never replaced with seed/mock headlines: a failed or empty
  fetch returns no news rather than fabricated entries. Only the deterministic
  unit-test runner (or an explicit `ADVERSE_MEDIA_LIVE=false`) uses seed fixtures.

### Added

- **Adverse media wired into the screening verdict** — `/api/quick-screen` now
  queries the free Google-News adverse-media feed alongside the OpenSanctions
  sanctions/PEP lists and folds negative coverage into the subject's risk score.
  A subject with strong negative press is routed to review/escalate even when no
  sanctions/PEP record exists **and even when the live list source is
  unreachable** — so adverse-media-positive subjects no longer return 0/100.
  Adverse media scores in the review/escalate band only (never an auto-block
  without analyst verification), and the negative-article count surfaces in the
  case's List Intelligence line and audit trail.
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
