# Deployment

How to run **HAWKEYE · Sterling Screening** beyond `npm run dev`. This is a
reference build; treat any deployment as a demo, not a production compliance
system (see [SECURITY.md](../SECURITY.md)).

## Prerequisites

- **Node.js ≥ 20.9** (see [`.nvmrc`](../.nvmrc)); CI runs Node 22.
- For containers: Docker (or a registry that can run a standalone image).

## Build output

`next.config.mjs` sets `output: "standalone"`, so `next build` emits a
self-contained server under `.next/standalone`. `npm run build` first runs
`scripts/build-sanctions-index.mjs` to compile the bundled OpenSanctions/PEP
index, then builds. Set `SKIP_SANCTIONS_INDEX=1` to skip the index (CI does this
to stay fast and hermetic; the app then reports an honest "not screened").

## Option A — Node server

```bash
npm ci
npm run build
npm run start        # serves on http://localhost:3000
```

## Option B — Container (GHCR)

Images are published to **GitHub Container Registry** on version tags by
[`docker-publish.yml`](../.github/workflows/docker-publish.yml):

```bash
docker pull ghcr.io/trex0092/hawkeye-sterling-screening:0.1.0
docker run --rm -p 3000:3000 ghcr.io/trex0092/hawkeye-sterling-screening:0.1.0
```

Each published image carries a signed **SLSA build-provenance attestation**, an
**SPDX SBOM**, and a **Trivy** vulnerability scan (see
[ADR-0006](./adr/0006-container-image-supply-chain.md)). Verify provenance with
the GitHub CLI:

```bash
gh attestation verify oci://ghcr.io/trex0092/hawkeye-sterling-screening:0.1.0 \
  --owner trex0092
```

## Option C — Serverless (e.g. Vercel/Netlify)

The App Router build deploys to any Next.js-compatible host. The bundled
sanctions index is traced into the `/api/quick-screen` function
(`outputFileTracingIncludes`), so core screening runs in-process without a
per-request network call.

## Configuration

All integrations are **off by default** and enabled only via environment
variables — see [`.env.example`](../.env.example) and the README
[Configuration](../README.md#configuration) section. Never commit real secrets;
`.env*.local` is git-ignored. Recommended production practices:

- Source secrets from a managed secret store, not the image or repo.
- Terminate TLS at the edge and enforce HTTPS.
- Put rate limiting / a WAF in front of the app.
- Replace header-based identity with a real auth provider before any real use
  (see the [threat model](./governance/threat-model.md)).

## Health & smoke check

After deploy, confirm:

```bash
curl -fsS https://<host>/                # 307 → /screening
curl -fsS https://<host>/screening | grep "HAWKEYE STERLING"
```

## Rollback

Containers are immutable and tagged by version and by commit SHA
(`type=sha`), so rolling back is redeploying a previous tag. See
[RELEASING.md](../RELEASING.md) for the release/tag process.
