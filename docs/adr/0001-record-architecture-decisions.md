# 0001. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Maintainers

## Context

As the project grows, the reasoning behind significant technical choices tends
to get lost — it lives in pull-request threads, chat, or people's memory. New
contributors then re-litigate settled questions, and there is no auditable
record of *why* the system is the way it is, which matters for a project whose
subject is compliance and governance.

## Decision

We will record significant architectural decisions as **Architecture Decision
Records** in [`docs/adr/`](./README.md), using the lightweight format popularised
by Michael Nygard. Each ADR is immutable once accepted; changes are captured by a
new ADR that supersedes the old one.

## Consequences

- Decisions and their rationale are reviewable in the same pull-request flow as
  code, and become part of the project's governance trail.
- There is a small, ongoing authoring cost — one short document per significant
  decision. Trivial choices do not need an ADR.
- The [Architecture overview](../ARCHITECTURE.md) links to ADRs for the "why".

## Alternatives considered

- **Leave decisions in PR descriptions** — not discoverable later and easily
  lost when history is squashed.
- **A single evolving design doc** — rewriting it loses the historical context
  of *when* and *why* a decision changed.
