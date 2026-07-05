# Reviewing Pull Requests

Guidelines for maintainers (and anyone offering review) so that reviews are
consistent, fair, and fast. This complements [`CONTRIBUTING.md`](./CONTRIBUTING.md)
(for authors) and [`GOVERNANCE.md`](./GOVERNANCE.md) (for decision-making).

## Goals of a review

1. **Correctness** — does the change do what it claims, without regressions?
2. **Fit** — does it match the project's conventions and architecture
   (see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md))?
3. **Maintainability** — is it clear, tested, and documented?
4. **Safety** — no secrets, no live network calls in `/api/*`, no scope creep.

## What every PR must satisfy

- CI is green: type-check, lint, format check, unit tests, build, and E2E.
- The PR template checklist is complete.
- The PR title follows [Conventional Commits](https://www.conventionalcommits.org/)
  (enforced by the PR-title check).
- At least one maintainer (code owner) approval before merge.
- Conversations are resolved before merge.

## Review checklist

- [ ] The change is focused and its scope matches the description.
- [ ] Behaviour is covered by tests where it makes sense.
- [ ] No `any` escapes or type regressions; props/state are typed.
- [ ] Styling uses design-system tokens, not hard-coded hex values.
- [ ] `/api/*` handlers stay mock-first and env-gated — no secrets, no live calls.
- [ ] Docs / CHANGELOG updated when user-facing behaviour changes.
- [ ] Dependency additions are justified and pass Dependency Review.

## Giving good feedback

- Be specific and kind; review the code, not the person
  (see the [Code of Conduct](./CODE_OF_CONDUCT.md)).
- Distinguish **blocking** requests from **non-blocking** suggestions — prefix
  optional nits with `nit:`.
- Prefer suggestions with a concrete alternative over vague objections.
- Approve once blocking items are resolved; don't hold a PR for personal
  preference.

## Turnaround expectations

This is a best-effort community project with **no SLA**. Maintainers aim to
provide a first response within a few days; clear, small, well-tested PRs are
reviewed fastest.

## Merging

- Use **squash merge** to keep `main` history linear and readable.
- The squash commit subject should follow Conventional Commits.
- Delete the branch after merge (automated by repository settings).
