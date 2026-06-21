import { describe, it, expect } from "vitest";
import { computeMetrics, latencyMetrics } from "@/lib/metrics";
import type { LlmLogEntry } from "@/lib/ai/llm-log";

function entry(ms: number, outcome: LlmLogEntry["outcome"]): LlmLogEntry {
  return { ts: "2026-06-21T00:00:00Z", task: "t", model: "m", promptHash: "x", outcome, ms };
}

describe("latencyMetrics", () => {
  it("returns zeros for an empty series", () => {
    expect(latencyMetrics([])).toEqual({ count: 0, mean: 0, p50: 0, p95: 0, p99: 0, max: 0 });
  });

  it("computes percentiles and max", () => {
    const m = latencyMetrics([10, 20, 30, 40, 50]);
    expect(m.count).toBe(5);
    expect(m.mean).toBe(30);
    expect(m.p50).toBe(30);
    expect(m.max).toBe(50);
  });
});

describe("computeMetrics", () => {
  it("aggregates outcomes and rates", () => {
    const log = [entry(100, "ok"), entry(200, "ok"), entry(300, "error"), entry(50, "rejected")];
    const m = computeMetrics(log);
    expect(m.outcomes).toEqual({ ok: 2, rejected: 1, error: 1 });
    expect(m.okRate).toBe(0.5);
    expect(m.errorRate).toBe(0.25);
    expect(m.latency.count).toBe(4);
  });

  it("is safe on an empty log", () => {
    const m = computeMetrics([]);
    expect(m.errorRate).toBe(0);
    expect(m.okRate).toBe(0);
    expect(m.latency.count).toBe(0);
  });
});
