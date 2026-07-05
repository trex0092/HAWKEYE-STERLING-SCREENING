# Architecture Decision Records

This directory holds **Architecture Decision Records (ADRs)** — short documents
capturing a significant architectural decision, its context, and its
consequences. ADRs make the "why" behind the codebase reviewable and durable.

## Why ADRs

- They give reviewers and future contributors the reasoning, not just the code.
- They create an auditable trail of technical governance decisions.
- They keep discussions from being re-litigated: a decision is recorded once.

## Format

Each record is a numbered Markdown file: `NNNN-short-title.md`. Use
[`0000-template.md`](./0000-template.md) as the starting point. A record has a
**status** (`Proposed`, `Accepted`, `Deprecated`, or `Superseded by …`).

## How to add one

1. Copy `0000-template.md` to the next number, e.g. `0003-my-decision.md`.
2. Fill in the sections and open a pull request.
3. Once merged, the decision is `Accepted`. To change it later, add a **new**
   ADR that supersedes the old one — don't rewrite history.

## Index

| # | Title | Status |
|---|---|---|
| [0001](./0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](./0002-offline-mock-first-api.md) | Offline, mock-first API with env-gated live integrations | Accepted |
| [0003](./0003-strict-typescript-and-design-tokens.md) | Strict TypeScript and design-system tokens | Accepted |
