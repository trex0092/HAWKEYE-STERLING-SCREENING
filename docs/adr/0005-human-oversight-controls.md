# 0005. Human oversight: four-eyes and MLRO sign-off

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Maintainers

## Context

In compliance operations, consequential decisions should not rest with a single
person or be made automatically. The screening console needs to model **human
oversight** — Layer 5 of the [six-layer alignment](../governance/six-layer-alignment.md)
— so that high-impact actions require independent confirmation and an
accountable sign-off.

## Decision

The console enforces three human-oversight controls at the API layer:

- **Four-eyes maker-checker** (`/api/four-eyes`) — a decision proposed by one
  operator must be approved by a different one; **self-approval is rejected**
  (maker ≠ checker is enforced server-side).
- **Override** (`/api/override`) — an explicit, recorded human override path,
  captured in the audit trail.
- **MLRO sign-off** (`/api/mlro-signoff`) — a Money-Laundering-Reporting-Officer
  gate for escalated cases.

Decision logic that feeds these controls is deterministic (fixed thresholds);
humans make the final call.

## Consequences

- No single operator can unilaterally approve their own high-impact action.
- Oversight actions are auditable (see [ADR-0004](./0004-hmac-signed-audit-trail.md)).
- Tests assert the maker ≠ checker invariant so it cannot silently regress.

## Alternatives considered

- **Fully automated decisions** — rejected: removes accountable human judgement
  from a domain that requires it.
- **Single-approver sign-off** — simpler, but provides no independent check and
  no separation of duties.
