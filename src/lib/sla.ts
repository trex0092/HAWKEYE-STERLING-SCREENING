// ── SLA breach evaluation (pure) ─────────────────────────────────────────────
// Deterministic helper that decides whether an open case has breached its review
// SLA and, if so, where it must escalate. Pure and offline so it is fully unit-
// testable. Hours per priority are deliberately conservative for a DPMS context;
// adjust under change control (a governed change — see docs/governance).

export type CasePriority = "critical" | "high" | "medium" | "low";

const SLA_HOURS: Record<CasePriority, number> = {
  critical: 4,
  high: 24,
  medium: 72,
  low: 168,
};

export type EscalationTarget = "none" | "L2" | "MLRO";

export interface SlaStatus {
  priority: CasePriority;
  ageHours: number;
  slaHours: number;
  breached: boolean;
  escalateTo: EscalationTarget;
}

/** SLA window, in hours, for a priority. */
export function slaHoursFor(priority: CasePriority): number {
  return SLA_HOURS[priority];
}

/**
 * Evaluate a case against its SLA. A breach past the window escalates to L2;
 * past twice the window it escalates to the MLRO. `now` is injectable for tests.
 */
export function evaluateSla(
  openedAt: string,
  priority: CasePriority,
  now: number = Date.now(),
): SlaStatus {
  const opened = Date.parse(openedAt);
  const ageHours = Number.isFinite(opened) ? Math.max(0, (now - opened) / 3_600_000) : 0;
  const slaHours = SLA_HOURS[priority];
  const breached = ageHours > slaHours;
  const escalateTo: EscalationTarget = !breached ? "none" : ageHours > slaHours * 2 ? "MLRO" : "L2";
  return {
    priority,
    ageHours: Math.round(ageHours * 10) / 10,
    slaHours,
    breached,
    escalateTo,
  };
}
