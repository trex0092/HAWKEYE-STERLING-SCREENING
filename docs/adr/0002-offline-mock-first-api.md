# 0002. Offline, mock-first API with env-gated live integrations

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Maintainers

## Context

This repository is a **demo / reference build** of a sanctions-screening
console. It must be safe to clone and run by anyone — including in CI and in
untrusted environments — without provisioning API keys, incurring cost, or
making outbound calls to third-party services. At the same time, it should be
able to demonstrate real integrations (Asana, Google News, OpenSanctions,
Anthropic) when a user chooses to configure them.

A screening tool that silently fabricates "live" results would also be
dangerous and misleading, even in a demo.

## Decision

Every `/api/*` route is **mock-first**: it returns deterministic mock data by
default and only performs live network calls when the relevant environment
variable is set. When a live source is configured but unavailable, the route
returns an **honest "not screened"** result rather than falling back to
fabricated data. Core sanctions/PEP matching runs **in-process** against a
bundled, gzipped index so it needs no key and no per-request network.

## Consequences

- The project runs fully offline, is hermetic in CI (`SKIP_SANCTIONS_INDEX=1`),
  and is safe to evaluate without secrets.
- Contributors must keep this invariant: **no live network calls or credentials
  in `/api/*`** unless env-gated (enforced in the PR checklist and
  [CONTRIBUTING](../../CONTRIBUTING.md)).
- Demonstrating a live integration requires the user to set env vars documented
  in the README's Configuration section.

## Alternatives considered

- **Always-live integrations** — would require keys to run at all, break CI
  hermeticity, and make the demo unusable offline.
- **Mock fallback that mimics live "clear" results** — rejected: a false clear
  is worse than an explicit "not screened" in a compliance context.
