# GitHub Community & Supply-Chain Compliance Matrix

A traceability matrix mapping each expected GitHub **community standard** and
**supply-chain security** control to where it is implemented in this repository.
This complements the AI-system governance under
[`docs/governance/`](./README.md) and the project process in
[`GOVERNANCE.md`](../../GOVERNANCE.md).

Legend: ✅ implemented · ⚙️ automated in CI · 📄 documented · 🔒 settings-gated
(requires a repository/organisation setting to be enabled by an admin).

## GitHub Community Standards

| Standard | Status | Location |
|---|---|---|
| Description & topics | ✅ | Repo metadata / [`package.json`](../../package.json) |
| README | ✅ 📄 | [`README.md`](../../README.md) |
| License | ✅ | [`LICENSE`](../../LICENSE) (MIT) |
| Code of Conduct | ✅ 📄 | [`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md) |
| Contributing guide | ✅ 📄 | [`CONTRIBUTING.md`](../../CONTRIBUTING.md) |
| Security policy | ✅ 📄 | [`SECURITY.md`](../../SECURITY.md) |
| Support resources | ✅ 📄 | [`.github/SUPPORT.md`](../../.github/SUPPORT.md) |
| Governance model | ✅ 📄 | [`GOVERNANCE.md`](../../GOVERNANCE.md) |
| Maintainers | ✅ 📄 | [`MAINTAINERS.md`](../../MAINTAINERS.md) |
| Roadmap | ✅ 📄 | [`ROADMAP.md`](../../ROADMAP.md) |
| Review guidelines | ✅ 📄 | [`REVIEWING.md`](../../REVIEWING.md) |
| Release process | ✅ 📄 | [`RELEASING.md`](../../RELEASING.md) |
| Issue / PR triage | ✅ 📄 | [`TRIAGE.md`](../../TRIAGE.md) |
| Authors / credits | ✅ 📄 | [`AUTHORS`](../../AUTHORS) |
| Architecture overview | ✅ 📄 | [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Architecture Decision Records | ✅ 📄 | [`docs/adr/`](../adr/README.md) |
| Security contact (RFC 9116) | ✅ | [`public/.well-known/security.txt`](../../public/.well-known/security.txt) |
| Issue templates | ✅ | [`.github/ISSUE_TEMPLATE/`](../../.github/ISSUE_TEMPLATE) |
| Pull request template | ✅ | [`.github/pull_request_template.md`](../../.github/pull_request_template.md) |
| Code owners | ✅ | [`.github/CODEOWNERS`](../../.github/CODEOWNERS) |
| Citation metadata | ✅ | [`CITATION.cff`](../../CITATION.cff) |
| Funding config | ✅ | [`.github/FUNDING.yml`](../../.github/FUNDING.yml) (placeholder) |
| Changelog | ✅ 📄 | [`CHANGELOG.md`](../../CHANGELOG.md) |

## Supply-Chain & Application Security

| Control | Status | Location |
|---|---|---|
| Dependency updates (SCA) | ⚙️ | [`.github/dependabot.yml`](../../.github/dependabot.yml) |
| Static analysis (SAST) | ⚙️ | [`.github/workflows/codeql.yml`](../../.github/workflows/codeql.yml) |
| Dependency review on PRs | ⚙️ | [`.github/workflows/dependency-review.yml`](../../.github/workflows/dependency-review.yml) |
| Supply-chain posture | ⚙️ | [`.github/workflows/scorecard.yml`](../../.github/workflows/scorecard.yml) |
| Security Insights manifest | 📄 | [`SECURITY-INSIGHTS.yml`](../../SECURITY-INSIGHTS.yml) |
| Least-privilege workflow tokens | ✅ | `permissions:` block in every workflow |
| Concurrency / cancel-in-progress | ✅ | CI, CodeQL, Scorecard, stale workflows |
| Pinned action versions | ✅ | All `.github/workflows/*` |
| Private vulnerability reporting | 🔒 📄 | [`SECURITY.md`](../../SECURITY.md) (enable in Settings → Security) |
| Secret scanning & push protection | 🔒 | Settings → Code security (enable) |
| SBOM (dependency graph) | 🔒 | Settings → Code security → Dependency graph |

## CI / Quality Gates

| Gate | Status | Location |
|---|---|---|
| Type-check | ⚙️ | [`ci.yml`](../../.github/workflows/ci.yml) |
| Lint | ⚙️ | [`ci.yml`](../../.github/workflows/ci.yml) |
| Format check | ⚙️ | [`ci.yml`](../../.github/workflows/ci.yml) |
| Unit tests | ⚙️ | [`ci.yml`](../../.github/workflows/ci.yml) |
| Build | ⚙️ | [`ci.yml`](../../.github/workflows/ci.yml) |
| End-to-end tests | ⚙️ | [`e2e.yml`](../../.github/workflows/e2e.yml) |
| PR title convention | ⚙️ | [`pr-title-lint.yml`](../../.github/workflows/pr-title-lint.yml) |
| Container publish (tags) | ⚙️ | [`docker-publish.yml`](../../.github/workflows/docker-publish.yml) |

## Process & Automation

| Item | Status | Location |
|---|---|---|
| Governance-as-code (repo/branch protection) | 🔒 📄 | [`.github/settings.yml`](../../.github/settings.yml) |
| Version-controlled labels | ⚙️ | [`.github/labels.yml`](../../.github/labels.yml) + sync workflow |
| PR auto-labeling by path | ⚙️ | [`.github/labeler.yml`](../../.github/labeler.yml) |
| Release note drafting | ⚙️ | [`release-drafter.yml`](../../.github/workflows/release-drafter.yml) |
| Stale issue/PR triage | ⚙️ | [`.github/workflows/stale.yml`](../../.github/workflows/stale.yml) |
| First-time contributor greeting | ⚙️ | [`.github/workflows/greetings.yml`](../../.github/workflows/greetings.yml) |
| Documentation link check | ⚙️ | [`.github/workflows/links.yml`](../../.github/workflows/links.yml) |
| Governance baseline enforced in CI | ⚙️ | [`.github/workflows/governance-check.yml`](../../.github/workflows/governance-check.yml) + [`scripts/check-governance.mjs`](../../scripts/check-governance.mjs) |

## Settings that require an admin action

The items marked 🔒 are configured as code or documented here but only take
effect once enabled in the repository/organisation settings by an admin:

1. **Branch protection** for `main` — apply from `.github/settings.yml` (needs
   the [Repository Settings app](https://github.com/apps/settings)) or set
   manually to match it.
2. **Private vulnerability reporting** — Settings → Security → enable.
3. **Secret scanning + push protection** — Settings → Code security → enable.
4. **Dependency graph / SBOM export** — Settings → Code security → enable.

_Last reviewed: 2026-07-05._
