import { describe, it, expect } from "vitest";
import { isExpired, partitionByRetention, DEFAULT_RETENTION } from "@/lib/retention";

const DAY = 86_400_000;
const NOW = Date.parse("2026-06-21T00:00:00Z");

describe("retention", () => {
  it("flags a record past its window as expired", () => {
    const old = new Date(NOW - 400 * DAY).toISOString();
    expect(isExpired(old, 365, NOW)).toBe(true);
  });

  it("keeps a record within its window", () => {
    const recent = new Date(NOW - 10 * DAY).toISOString();
    expect(isExpired(recent, 365, NOW)).toBe(false);
  });

  it("keeps records with an unparseable timestamp (fail-safe)", () => {
    expect(isExpired("not-a-date", 1, NOW)).toBe(false);
  });

  it("partitions records into keep / purge", () => {
    const records = [
      { ts: new Date(NOW - 2000 * DAY).toISOString(), id: "old" },
      { ts: new Date(NOW - 10 * DAY).toISOString(), id: "fresh" },
    ];
    const { keep, purge } = partitionByRetention(records, DEFAULT_RETENTION.auditDays, NOW);
    expect(keep.map((r) => r.id)).toEqual(["fresh"]);
    expect(purge.map((r) => r.id)).toEqual(["old"]);
  });

  it("exposes policy defaults (5-year AML records, 12-month logs)", () => {
    expect(DEFAULT_RETENTION.auditDays).toBe(1825);
    expect(DEFAULT_RETENTION.llmLogDays).toBe(365);
    expect(DEFAULT_RETENTION.subjectPiiDays).toBe(30);
  });
});
