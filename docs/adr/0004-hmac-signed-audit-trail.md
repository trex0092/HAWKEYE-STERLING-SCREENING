# 0004. HMAC-signed, tamper-evident audit trail

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Maintainers

## Context

A screening console makes decisions that, in a real deployment, must be
defensible after the fact: who screened whom, what the verdict was, and that the
record has not been altered. Even as a reference build, the project should model
an **auditable, tamper-evident** trail rather than a plain, mutable log — this is
Layer 6 (Governance, Compliance & Audit) of the
[six-layer alignment](../governance/six-layer-alignment.md).

## Decision

Every auditable action is recorded and can be **signed with HMAC-SHA256** via
`/api/audit/sign`. The same route's `PUT` method **verifies** a payload against
its signature, so any modification to a recorded entry is detectable. The audit
trail can be exported (`/api/audit/export`) for external review.

In this demo the signing key is a mock/server-side secret; a production
deployment would source it from a real secret manager and a durable, append-only
sink.

## Consequences

- Audit entries are tamper-evident: a changed payload fails verification.
- The signing/verification surface is small and testable, and is covered by the
  unit tests.
- Real deployments must supply a managed key and a durable store — noted as
  production-hardening in the governance docs.

## Alternatives considered

- **Plain application log** — easy, but offers no integrity guarantee and is
  trivially altered.
- **Full hash-chain / Merkle log** — stronger, but heavier than needed for a
  reference build; can supersede this ADR if required later.
