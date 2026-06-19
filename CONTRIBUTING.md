# Contributing

Thanks for your interest in improving HAWKEYE Sterling Screening! This document
explains how to propose changes.

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By
participating, you are expected to uphold it.

## Getting set up

```bash
npm install
npm run dev
```

Requires Node.js ≥ 18.17 (see [`.nvmrc`](./.nvmrc) — `nvm use`).

## Development workflow

1. **Branch** off `main`:
   ```bash
   git switch -c feat/short-description
   ```
2. **Make your change.** Keep it focused; match the style of surrounding code.
3. **Verify locally** — all three must pass:
   ```bash
   npm run typecheck   # tsc --noEmit (strict)
   npm run lint        # next lint
   npm run build       # production build
   ```
   Format with `npm run format` before committing.
4. **Open a pull request** into `main` using the PR template. CI must be green.

## Commit messages

Use clear, imperative-mood subjects (e.g. "Add column chooser persistence").
[Conventional Commits](https://www.conventionalcommits.org/) prefixes
(`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`) are encouraged.

## Coding standards

- **TypeScript strict** — no `any` escapes; type all props and state.
- **Components** are client (`"use client"`) when they use state/effects/handlers.
- **Styling** uses the Tailwind design-system tokens (`ink-*`, `bg-*`, `brand`,
  `hair-*`, status colours) defined in `tailwind.config.ts` / `globals.css` —
  avoid hard-coded hex values.
- **No live network calls** in `/api/*` routes — they are deterministic mocks.

## Reporting bugs / requesting features

Open an issue using the appropriate template. For security issues, **do not**
open a public issue — follow the [Security Policy](./SECURITY.md).
