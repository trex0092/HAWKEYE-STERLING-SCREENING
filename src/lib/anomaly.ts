// ── Anomaly detection (pure, statistical) ────────────────────────────────────
// Flags unusual values in a numeric series — e.g. an out-of-pattern screening
// score, a latency spike, or an abnormal disposition count. Two standard,
// dependency-free methods: z-score (distance from the mean in std-devs) and IQR
// (Tukey fences off the inter-quartile range, robust to outliers). Pure and
// offline-safe: no I/O, never throws, deterministic for a given input.

export type AnomalyMethod = "zscore" | "iqr";

export interface AnomalyOptions {
  method?: AnomalyMethod;
  /** z-score: number of std-devs to flag (default 3). */
  zThreshold?: number;
  /** IQR: fence multiplier (default 1.5; 3 = "far out"). */
  iqrK?: number;
}

export interface Anomaly {
  index: number;
  value: number;
  /** Method-specific score: |z| for zscore, signed distance past the fence for iqr. */
  score: number;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Linear-interpolated quantile (0..1) over a copy-sorted series. */
export function quantile(values: number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const pos = (sorted.length - 1) * Math.min(1, Math.max(0, q));
  const base = Math.floor(pos);
  const rest = pos - base;
  const lo = sorted[base] ?? 0;
  const hi = sorted[base + 1];
  return hi === undefined ? lo : lo + rest * (hi - lo);
}

function zscoreAnomalies(values: number[], threshold: number): Anomaly[] {
  const m = mean(values);
  const sd = stdDev(values);
  if (sd === 0) return [];
  const out: Anomaly[] = [];
  values.forEach((value, index) => {
    const z = Math.abs((value - m) / sd);
    if (z >= threshold) out.push({ index, value, score: Number(z.toFixed(4)) });
  });
  return out;
}

function iqrAnomalies(values: number[], k: number): Anomaly[] {
  const q1 = quantile(values, 0.25);
  const q3 = quantile(values, 0.75);
  const iqr = q3 - q1;
  if (iqr === 0) return [];
  const lower = q1 - k * iqr;
  const upper = q3 + k * iqr;
  const out: Anomaly[] = [];
  values.forEach((value, index) => {
    if (value < lower) out.push({ index, value, score: Number((lower - value).toFixed(4)) });
    else if (value > upper) out.push({ index, value, score: Number((value - upper).toFixed(4)) });
  });
  return out;
}

/**
 * Detect anomalies in a numeric series. Defaults to z-score (threshold 3).
 * Non-finite entries are dropped first, so reported indices refer to the
 * finite-only series. A series too short or with no spread returns no anomalies
 * (never a false alarm).
 */
export function detectAnomalies(values: number[], opts: AnomalyOptions = {}): Anomaly[] {
  if (!Array.isArray(values)) return [];
  const finite = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  if (finite.length < 2) return [];
  const method = opts.method ?? "zscore";
  return method === "iqr"
    ? iqrAnomalies(finite, opts.iqrK ?? 1.5)
    : zscoreAnomalies(finite, opts.zThreshold ?? 3);
}
