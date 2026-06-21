import { describe, it, expect } from "vitest";
import { detectAnomalies, mean, stdDev, quantile } from "@/lib/anomaly";

describe("statistics helpers", () => {
  it("computes mean", () => {
    expect(mean([2, 4, 6])).toBe(4);
    expect(mean([])).toBe(0);
  });

  it("computes sample std-dev (0 for <2 values)", () => {
    expect(stdDev([5])).toBe(0);
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 2);
  });

  it("computes interpolated quantiles", () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBeCloseTo(2.5, 5);
    expect(quantile([1, 2, 3, 4, 5], 0)).toBe(1);
    expect(quantile([1, 2, 3, 4, 5], 1)).toBe(5);
  });
});

describe("detectAnomalies", () => {
  it("returns nothing for a constant series", () => {
    expect(detectAnomalies([5, 5, 5, 5])).toEqual([]);
  });

  it("returns nothing for a series shorter than 2", () => {
    expect(detectAnomalies([42])).toEqual([]);
  });

  it("flags a clear z-score outlier", () => {
    const series = [...Array(19).fill(1), 10];
    const found = detectAnomalies(series, { method: "zscore", zThreshold: 3 });
    expect(found).toHaveLength(1);
    expect(found[0]?.index).toBe(19);
    expect(found[0]?.value).toBe(10);
  });

  it("flags an IQR outlier robustly", () => {
    const series = [10, 10, 11, 9, 10, 10, 200];
    const found = detectAnomalies(series, { method: "iqr" });
    expect(found.map((a) => a.value)).toContain(200);
  });

  it("ignores non-finite entries", () => {
    const found = detectAnomalies([1, 1, 1, NaN, 1, 10] as number[], { zThreshold: 2 });
    expect(found.every((a) => Number.isFinite(a.value))).toBe(true);
  });
});
