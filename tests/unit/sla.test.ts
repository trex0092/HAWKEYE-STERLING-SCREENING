import { describe, it, expect } from "vitest";
import { evaluateSla, slaHoursFor } from "@/lib/sla";

const H = 3_600_000;
const NOW = Date.parse("2026-06-21T12:00:00Z");

describe("evaluateSla", () => {
  it("is not breached within the window", () => {
    const opened = new Date(NOW - 2 * H).toISOString(); // 2h ago, high = 24h
    const s = evaluateSla(opened, "high", NOW);
    expect(s.breached).toBe(false);
    expect(s.escalateTo).toBe("none");
  });

  it("escalates to L2 once past the window", () => {
    const opened = new Date(NOW - 30 * H).toISOString(); // 30h, high = 24h
    const s = evaluateSla(opened, "high", NOW);
    expect(s.breached).toBe(true);
    expect(s.escalateTo).toBe("L2");
  });

  it("escalates to MLRO past twice the window", () => {
    const opened = new Date(NOW - 60 * H).toISOString(); // 60h > 48h
    const s = evaluateSla(opened, "high", NOW);
    expect(s.escalateTo).toBe("MLRO");
  });

  it("exposes the per-priority window", () => {
    expect(slaHoursFor("critical")).toBe(4);
    expect(slaHoursFor("low")).toBe(168);
  });
});
