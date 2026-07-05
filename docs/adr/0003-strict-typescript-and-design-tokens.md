# 0003. Strict TypeScript and design-system tokens

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Maintainers

## Context

The console is a dense, information-heavy UI with many interdependent pieces of
state (risk scores, dispositions, filters, per-analyst theming). Two classes of
defect are especially costly here: **type drift** between data and UI, and
**visual inconsistency** from ad-hoc colours that break the dark theme.

## Decision

- **TypeScript runs in `strict` mode** with no `any` escapes; props and state
  are fully typed, and `npm run typecheck` (`tsc --noEmit`) gates CI.
- **Styling uses the Tailwind design-system tokens** (`ink-*`, `bg-*`, `brand`,
  `hair-*`, status colours) defined in the Tailwind config and `globals.css`.
  Hard-coded hex values are avoided.

## Consequences

- Data/UI mismatches surface at compile time rather than in production.
- The dark theme stays coherent, and per-analyst accents are applied
  consistently through tokens.
- Contributors must type new code fully and reach for tokens over raw colours;
  this is stated in [CONTRIBUTING](../../CONTRIBUTING.md) and checked in
  [review](../../REVIEWING.md).

## Alternatives considered

- **Loose/optional typing** — faster to write, but shifts defects to runtime in
  a domain where correctness matters.
- **Per-component ad-hoc colours** — quicker locally, but drifts from the design
  system and is hard to keep accessible in dark mode.
