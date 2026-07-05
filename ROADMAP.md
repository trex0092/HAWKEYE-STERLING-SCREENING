# Roadmap

This roadmap communicates direction, not commitments. Items and priorities may
change; nothing here is a guarantee of delivery or a delivery date. Substantial
proposals are discussed in
[Discussions](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/discussions)
before implementation — see [`GOVERNANCE.md`](./GOVERNANCE.md).

> **Reminder:** this is a **demo / reference build**, not a production screening
> system. Roadmap items improve the reference, its architecture, and its
> governance posture — they do not turn it into a certified compliance product.

## Now — in progress

- **Governance & compliance baseline** — community-health files, supply-chain
  security workflows (CodeQL, Dependency Review, OpenSSF Scorecard), and
  governance-as-code. _(This branch.)_

## Next — planned

- **Branch protection enforced via code** — required reviews and status checks
  applied from [`.github/settings.yml`](./.github/settings.yml).
- **Release automation** — drafted release notes from merged PR labels.
- **Test-coverage reporting** — publish coverage from the unit-test run.
- **Accessibility pass** — audit the keyboard-driven console against WCAG 2.2 AA.

## Later — exploratory

- **Real authentication provider** in place of header-based identity (see
  [`docs/governance/six-layer-alignment.md`](./docs/governance/six-layer-alignment.md)).
- **Durable monitoring sink** for the audit trail and LLM drift logs.
- **Bias / fairness testing** for the optional Claude enrichment path.
- **EU AI Act classification** legal sign-off.

## Out of scope

- Real sanctions/PEP data feeds bundled into the repo.
- Live external network calls from `/api/*` mock routes.
- Any use as a production compliance decision system.

## How to influence the roadmap

Open a [feature request](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/issues/new?template=feature_request.yml)
or start a [Discussion](https://github.com/trex0092/HAWKEYE-STERLING-SCREENING/discussions).
Well-scoped issues with a clear use case are the fastest way to move an item up.
