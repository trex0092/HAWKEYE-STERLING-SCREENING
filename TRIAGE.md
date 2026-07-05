# Issue & Pull-Request Triage

How incoming issues and pull requests are sorted, labelled, and prioritised.
Triage keeps the backlog trustworthy: an open issue should mean something is
genuinely actionable or under discussion.

## Triage goals

- Every new issue gets an initial response and the right labels.
- Duplicates and out-of-scope items are closed with a clear reason.
- Contributors always know the current state of their report.

## The flow

1. **Acknowledge & classify.** Apply a **type** label — `bug`, `enhancement`,
   `documentation`, `refactor`, or `test`.
2. **Scope it.** Add an **area** label (`area: app`, `area: ci`,
   `area: docs`, `area: dependencies`) — pull requests get these automatically
   via the [labeler](./.github/labeler.yml).
3. **Assess.** Reproduce bugs; confirm feature requests have a clear use case.
   Ask for missing detail using the issue templates as a guide.
4. **Prioritise.** Use `help wanted` and `good first issue` to invite
   contribution; `pinned` to exempt long-running items from stale automation.
5. **Resolve or park.** Close duplicates (link the original), `wontfix`
   out-of-scope items with a reason, or leave it open with next steps.

## Label glossary

Labels are version-controlled in [`.github/labels.yml`](./.github/labels.yml).

| Label | Meaning |
|---|---|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Docs/governance change |
| `refactor` / `test` | Internal change / test work |
| `area: *` | Which part of the repo is affected |
| `dependencies` / `github-actions` | Dependency updates |
| `good first issue` | Approachable for newcomers |
| `help wanted` | Maintainers welcome help here |
| `in-progress` | Actively being worked on (stale-exempt) |
| `pinned` | Exempt from stale automation |
| `security` | Security-related (stale-exempt) |
| `stale` | No recent activity; scheduled for auto-close |
| `wontfix` | Will not be worked on |

## Stale handling

The [stale workflow](./.github/workflows/stale.yml) marks issues/PRs inactive
after 60 days and closes them 14 days later, unless labelled `pinned`,
`security`, or `in-progress`. Closing for staleness is not a judgement — anyone
can reopen with fresh context.

## Security reports

Security issues are **never** triaged in public. They come through private
[vulnerability reporting](./SECURITY.md); do not add security details to a
public issue.
