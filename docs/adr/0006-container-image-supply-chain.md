# 0006. Container image supply-chain hardening

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Maintainers

## Context

The project publishes a container image to GHCR on release. For a tool whose
subject is compliance, the artifact it ships should itself be verifiable: a
consumer needs to know *what* is in the image, that it came from *this*
repository's pipeline, and whether it carries *known vulnerabilities*. A bare
`docker build && push` provides none of these guarantees.

## Decision

The [`docker-publish.yml`](../../.github/workflows/docker-publish.yml) workflow
hardens the artifact supply chain for every published image:

1. **Build-provenance attestation (SLSA)** — `actions/attest-build-provenance`
   signs a provenance statement (via GitHub's OIDC identity) binding the image
   digest to the workflow that built it, pushed to the registry.
2. **SBOM** — `anchore/sbom-action` generates an SPDX software bill of materials
   for the image and uploads it as a build artifact.
3. **Vulnerability scan** — `aquasecurity/trivy-action` scans the pushed image
   for CRITICAL/HIGH issues and publishes results to GitHub code scanning. The
   scan is reported, not gating, so a release is never silently blocked by an
   unfixable upstream CVE — findings are triaged openly.

The job runs with least privilege plus the specific tokens these steps need
(`id-token`, `attestations`, `security-events`).

## Consequences

- Consumers can verify image provenance
  (`gh attestation verify oci://…`) and inspect the SBOM.
- Known image vulnerabilities are visible in the Security tab per release.
- These steps run only on version tags / dispatch, so they add no latency to
  regular pull-request CI.
- The scan is intentionally non-gating; promoting it to blocking is a one-line
  change (`exit-code: "1"`) once the base image is on a clean cadence.

## Alternatives considered

- **Plain build & push** — simplest, but ships an opaque, unverifiable artifact.
- **Gating the release on the Trivy scan** — rejected for now: base-image CVEs
  outside our control would block legitimate releases; we prefer visible triage.
