// ── Data retention enforcement (pure) ────────────────────────────────────────
// Implements the schedule in docs/governance/data-retention-policy.md: given a
// set of dated records and a retention window, decide which to keep and which to
// purge. Pure and offline so it is fully testable; a scheduled job wires this to
// the actual store and audit-logs every deletion. A record with an unparseable
// timestamp is KEPT (fail-safe — never silently delete on bad data).

export interface RetentionPolicy {
  /** Screening records & verdicts. */
  screeningDays: number;
  /** Audit-trail entries. */
  auditDays: number;
  /** LLM call log (prompt hashes only). */
  llmLogDays: number;
  /** Subject PII with no resulting relationship. */
  subjectPiiDays: number;
}

// Defaults mirror the policy (5-year AML records; 12-month logs; 30-day orphan PII).
export const DEFAULT_RETENTION: RetentionPolicy = {
  screeningDays: 1825,
  auditDays: 1825,
  llmLogDays: 365,
  subjectPiiDays: 30,
};

const DAY_MS = 86_400_000;

export interface DatedRecord {
  ts: string;
}

/** Is a record older than its retention window? Unparseable ts ⇒ false (keep). */
export function isExpired(ts: string, retentionDays: number, now: number = Date.now()): boolean {
  const t = Date.parse(ts);
  if (!Number.isFinite(t)) return false;
  return now - t > retentionDays * DAY_MS;
}

/** Split records into those to keep and those past their retention window. */
export function partitionByRetention<T extends DatedRecord>(
  records: T[],
  retentionDays: number,
  now: number = Date.now(),
): { keep: T[]; purge: T[] } {
  const keep: T[] = [];
  const purge: T[] = [];
  for (const r of records) {
    if (isExpired(r.ts, retentionDays, now)) purge.push(r);
    else keep.push(r);
  }
  return { keep, purge };
}
