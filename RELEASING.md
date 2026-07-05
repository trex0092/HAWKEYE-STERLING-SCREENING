# Releasing

The release process for **HAWKEYE · Sterling Screening**. Releases are cut by
maintainers (see [`GOVERNANCE.md`](./GOVERNANCE.md)).

## Versioning

The project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** — incompatible/breaking changes.
- **MINOR** — backwards-compatible functionality.
- **PATCH** — backwards-compatible fixes.

Pre-1.0.0, minor versions may still carry breaking changes; these are called out
explicitly in the [Changelog](./CHANGELOG.md).

## What automation does for you

- **[Release Drafter](./.github/workflows/release-drafter.yml)** keeps a draft
  GitHub Release up to date, categorising merged PRs by label.
- **[Dependabot](./.github/dependabot.yml)** proposes dependency bumps weekly.
- **[Publish Docker image](./.github/workflows/docker-publish.yml)** builds and
  pushes the container to GHCR when a `v*` tag is pushed.

## Release checklist

1. **Ensure `main` is green.** All required checks pass on the latest commit.
2. **Finalise the changelog.** Move entries from `## [Unreleased]` into a new
   `## [X.Y.Z] - YYYY-MM-DD` section in [`CHANGELOG.md`](./CHANGELOG.md).
3. **Bump the version** in [`package.json`](./package.json) (and
   [`CITATION.cff`](./CITATION.cff) if the release is citable).
4. **Open a release PR** with those changes and merge it once green.
5. **Tag the release** from `main`:
   ```bash
   git checkout main && git pull
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   ```
6. **Publish the GitHub Release** — open the Release Drafter draft, confirm the
   notes and the tag, and publish. Tagging triggers the container publish.
7. **Verify** the image appears in GHCR and the release notes render correctly.

## Refresh reminders

- Update the `Expires` date in
  [`public/.well-known/security.txt`](./public/.well-known/security.txt) and the
  `expiration-date` in [`SECURITY-INSIGHTS.yml`](./SECURITY-INSIGHTS.yml) at
  least annually.

## Hotfixes

For an urgent fix to a released version, branch from the release tag, apply the
minimal fix, follow the checklist above with a PATCH bump, and forward-port the
fix to `main` if it isn't already there.
