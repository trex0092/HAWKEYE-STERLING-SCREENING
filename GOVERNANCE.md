# Project Governance

This document describes how the **HAWKEYE · Sterling Screening** project is
organised and how decisions are made. It is intended to keep the project
transparent, predictable, and welcoming to contributors.

> This governance model covers the **software repository**. AI-system and
> compliance-control governance for the screening platform itself is documented
> separately under [`docs/governance/`](./docs/governance/README.md).

## Values

- **Transparency** — decisions and their rationale happen in the open, on
  issues and pull requests.
- **Quality over speed** — every change must keep CI green (type-check, lint,
  format, tests, build) and match the project's design-system conventions.
- **Respect** — all participation is governed by our
  [Code of Conduct](./CODE_OF_CONDUCT.md).

## Roles

### Users

Anyone who runs or evaluates the project. Users contribute by filing
well-scoped issues, joining discussions, and improving documentation.

### Contributors

Anyone who opens a pull request or issue. Contributors agree to the
[Code of Conduct](./CODE_OF_CONDUCT.md) and follow the
[Contributing Guide](./CONTRIBUTING.md). No formal onboarding is required to
contribute.

### Maintainers

Maintainers are responsible for the long-term health of the project. They
review and merge pull requests, triage issues, cut releases, and steward the
technical direction. Current maintainers are the code owners listed in
[`.github/CODEOWNERS`](./.github/CODEOWNERS).

Maintainer responsibilities:

- Review pull requests fairly and in a timely manner.
- Keep the `main` branch releasable at all times.
- Enforce the Code of Conduct and the security-disclosure process.
- Uphold the review, CI, and branch-protection requirements below.

## Decision-making

The project uses **lazy consensus**:

1. Changes are proposed as pull requests.
2. A proposal is accepted when a maintainer approves it and required checks
   pass, provided no other maintainer has a sustained objection.
3. Disagreements are resolved by discussion on the pull request or issue. If
   consensus cannot be reached, the maintainers make the final call, favouring
   the option that best serves the project's users and stability.

Substantial or breaking changes should be discussed in an issue or
[Discussion](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/discussions)
**before** significant implementation work begins.

## Change-management requirements

Every change to `main` is expected to meet these gates:

- Land through a **pull request** — no direct pushes to `main`.
- Receive at least **one maintainer approval** (via `CODEOWNERS`).
- Pass **all required status checks** (CI, E2E where applicable).
- Follow the [Contributing Guide](./CONTRIBUTING.md) coding standards.

Automated dependency updates are managed via
[Dependabot](./.github/dependabot.yml) and are still subject to CI.

## Releases

Releases follow [Semantic Versioning](https://semver.org/). Notable changes are
recorded in the [Changelog](./CHANGELOG.md). Tagging a `v*` release triggers the
[container publish workflow](./.github/workflows/docker-publish.yml).

## Security

Vulnerabilities must be reported privately per the
[Security Policy](./SECURITY.md), never as a public issue.

## Becoming a maintainer

Contributors who show sustained, high-quality involvement — thoughtful reviews,
reliable contributions, and good community citizenship — may be invited to
become maintainers by the existing maintainers.

## Amending this document

Changes to this governance model are proposed as pull requests and adopted
under the same decision-making process described above.
