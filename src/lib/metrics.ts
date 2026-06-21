// ── Operational metrics (MON / LAT / PERF) ───────────────────────────────────
// Derives real-time-style health metrics from the in-memory LLM call log
// (`src/lib/ai/llm-log.ts`): latency percentiles (p50/p95/p99), the outcome mix,
// and the error/success rates. This is the aggregation layer the raw per-call
// log was missing — the same shape would feed a dashboard or an alert rule in a
// production deployment. Pure and offline-safe.

import type { LlmLogEntry, LlmOutcome } from "./ai/llm-log";
import { quantile } from "./anomaly";

export interface LatencyMetrics {
  count: number;
  mean: number;
  p50: number;
  p95: number;
  p99: number;
  max: number;
}

export interface LlmMetrics {
  latency: LatencyMetrics;
  outcomes: Record<LlmOutcome, number>;
  /** Share of calls that errored (0–1). */
  errorRate: number;
  /** Share of calls that returned a usable result (0–1). */
  okRate: number;
}

function round(n: number): number {
  return Number(n.toFixed(2));
}

export function latencyMetrics(samples: number[]): LatencyMetrics {
  const finite = (samples ?? []).filter((v) => typeof v === "number" && Number.isFinite(v));
  if (finite.length === 0) {
    return { count: 0, mean: 0, p50: 0, p95: 0, p99: 0, max: 0 };
  }
  const sum = finite.reduce((a, b) => a + b, 0);
  return {
    count: finite.length,
    mean: round(sum / finite.length),
    p50: round(quantile(finite, 0.5)),
    p95: round(quantile(finite, 0.95)),
    p99: round(quantile(finite, 0.99)),
    max: Math.max(...finite),
  };
}

/** Compute latency + outcome metrics over an LLM call log. */
export function computeMetrics(log: LlmLogEntry[]): LlmMetrics {
  const list = Array.isArray(log) ? log : [];
  const outcomes: Record<LlmOutcome, number> = { ok: 0, rejected: 0, error: 0 };
  for (const entry of list) {
    if (entry.outcome in outcomes) outcomes[entry.outcome] += 1;
  }
  const total = list.length;
  return {
    latency: latencyMetrics(list.map((e) => e.ms)),
    outcomes,
    errorRate: total === 0 ? 0 : round(outcomes.error / total),
    okRate: total === 0 ? 0 : round(outcomes.ok / total),
  };
}
