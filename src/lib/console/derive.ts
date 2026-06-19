// ── Console derive helpers ───────────────────────────────────────────────────
// Pure presentation logic ported from the design prototype's renderVals().
// No React, no DOM — safe to unit-test in the node environment. Exact hex,
// thresholds and weights come straight from the handoff design tokens.

export type Tone = { c: string; bg: string; bd: string };

export const ACCENTS: Record<string, string> = {
  Pink: "255,92,168",
  Violet: "180,92,255",
  Cyan: "59,229,208",
  Amber: "247,197,60",
};

export const ACCENT_NAMES = ["Pink", "Violet", "Cyan", "Amber"] as const;
export type AccentName = (typeof ACCENT_NAMES)[number];

export function accentRgb(name: string): string {
  return ACCENTS[name] ?? "255,92,168";
}

// ── Risk bands ───────────────────────────────────────────────────────────────

export function riskColor(r: number): string {
  if (r >= 85) return "#FF6B6B";
  if (r >= 60) return "#FF9F45";
  if (r >= 40) return "#E0B341";
  if (r >= 1) return "#4FD6A0";
  return "#646F86";
}

export function riskGlow(r: number): string {
  if (r >= 85) return "rgba(255,107,107,0.5)";
  if (r >= 60) return "rgba(255,159,69,0.5)";
  if (r >= 40) return "rgba(224,179,65,0.5)";
  if (r >= 1) return "rgba(79,214,160,0.5)";
  return "rgba(100,111,134,0.4)";
}

export function severityWord(r: number): { w: string; c: string } {
  if (r >= 85) return { w: "critical", c: "#FF6B6B" };
  if (r >= 60) return { w: "high", c: "#FF9F45" };
  if (r >= 40) return { w: "medium", c: "#E0B341" };
  if (r >= 1) return { w: "low", c: "#4FD6A0" };
  return { w: "none", c: "#828DA4" };
}

/** HUD threat label, by the selected subject's risk. */
export function threatLabel(r: number): { t: string; c: string } {
  if (r >= 85) return { t: "CRITICAL", c: "#FF6B6B" };
  if (r >= 60) return { t: "ELEVATED", c: "#FF9F45" };
  if (r >= 40) return { t: "GUARDED", c: "#E0B341" };
  if (r >= 1) return { t: "NOMINAL", c: "#4FD6A0" };
  return { t: "NOMINAL", c: "#828DA4" };
}

// ── Status / CDD tones ───────────────────────────────────────────────────────

export function statusTone(s: string): Tone {
  if (s === "escalated")
    return { c: "#FF8A8A", bg: "rgba(255,87,87,0.13)", bd: "rgba(255,87,87,0.45)" };
  if (s === "review")
    return { c: "#FFAE57", bg: "rgba(255,148,52,0.12)", bd: "rgba(255,148,52,0.4)" };
  if (s === "cleared")
    return { c: "#4FD6A0", bg: "rgba(59,196,143,0.12)", bd: "rgba(59,196,143,0.4)" };
  return { c: "#7FB3E8", bg: "rgba(91,155,216,0.12)", bd: "rgba(91,155,216,0.38)" };
}

export function cddTone(c: string): Tone {
  if (c === "EDD") return { c: "#FF8A8A", bg: "rgba(255,87,87,0.12)", bd: "rgba(255,87,87,0.4)" };
  if (c === "SDD") return { c: "#FFAE57", bg: "rgba(255,148,52,0.12)", bd: "rgba(255,148,52,0.4)" };
  return { c: "#7FB3E8", bg: "rgba(91,155,216,0.12)", bd: "rgba(91,155,216,0.38)" };
}

// ── SLA ──────────────────────────────────────────────────────────────────────

export function slaHours(sla: string): number {
  const m = /(\d+)h/.exec(sla || "");
  const g = m?.[1];
  return g ? parseInt(g, 10) : 999;
}

export function slaColor(sla: string): string {
  const h = slaHours(sla);
  if (h < 12) return "#FF8A8A";
  if (h < 24) return "#FFAE57";
  return "#A3ADC0";
}

export function statusRank(s: string): number {
  const ranks: Record<string, number> = { escalated: 0, review: 1, active: 2, cleared: 3 };
  return ranks[s] ?? 9;
}

// ── Sorting (register) ───────────────────────────────────────────────────────

export type RegisterSortKey = "risk" | "name" | "sla" | "status";

export interface SortableRow {
  name: string;
  riskScore: number;
  slaNotify: string;
  status: string;
}

export function sortRows<T extends SortableRow>(rows: readonly T[], sortKey: RegisterSortKey): T[] {
  const copy = [...rows];
  if (sortKey === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortKey === "sla") copy.sort((a, b) => slaHours(a.slaNotify) - slaHours(b.slaNotify));
  else if (sortKey === "status") copy.sort((a, b) => statusRank(a.status) - statusRank(b.status));
  else copy.sort((a, b) => b.riskScore - a.riskScore);
  return copy;
}

// ── List chips ───────────────────────────────────────────────────────────────

const RED_LISTS = new Set(["OFAC", "UN", "EU", "UK", "EOCN"]);

export function listChip(x: string): Tone & { t: string } {
  if (!x || x === "—")
    return { t: "—", c: "#646F86", bg: "rgba(255,255,255,0.03)", bd: "rgba(255,255,255,0.08)" };
  if (RED_LISTS.has(x))
    return { t: x, c: "#FF8A8A", bg: "rgba(255,87,87,0.1)", bd: "rgba(255,87,87,0.3)" };
  return { t: x, c: "#FFB169", bg: "rgba(255,148,52,0.1)", bd: "rgba(255,148,52,0.3)" };
}

// ── Module-specific tones ────────────────────────────────────────────────────

export function stageInfo(r: number): Tone & { l: string } {
  if (r >= 85)
    return {
      l: "Investigation",
      c: "#FF8A8A",
      bg: "rgba(255,87,87,0.12)",
      bd: "rgba(255,87,87,0.4)",
    };
  if (r >= 60)
    return {
      l: "Enhanced review",
      c: "#FF9F45",
      bg: "rgba(255,148,52,0.12)",
      bd: "rgba(255,148,52,0.4)",
    };
  return { l: "Triage", c: "#7FB3E8", bg: "rgba(91,155,216,0.12)", bd: "rgba(91,155,216,0.38)" };
}

export function sentInfo(s: string): Tone {
  if (s === "negative")
    return { c: "#FF8A8A", bg: "rgba(255,87,87,0.12)", bd: "rgba(255,87,87,0.4)" };
  if (s === "positive")
    return { c: "#4FD6A0", bg: "rgba(59,196,143,0.12)", bd: "rgba(59,196,143,0.4)" };
  return { c: "#FFAE57", bg: "rgba(255,148,52,0.12)", bd: "rgba(255,148,52,0.4)" };
}

export function vesselStatusTone(s: string): Tone {
  if (s === "Detained")
    return { c: "#FF8A8A", bg: "rgba(255,87,87,0.12)", bd: "rgba(255,87,87,0.4)" };
  if (s === "Underway")
    return { c: "#7FB3E8", bg: "rgba(91,155,216,0.12)", bd: "rgba(91,155,216,0.38)" };
  if (s === "Anchored")
    return { c: "#FFAE57", bg: "rgba(255,148,52,0.12)", bd: "rgba(255,148,52,0.4)" };
  return { c: "#4FD6A0", bg: "rgba(59,196,143,0.12)", bd: "rgba(59,196,143,0.4)" };
}

// ── Analyst assignment ───────────────────────────────────────────────────────
// Maps either the intake-modal entity types (corporate/entity) or the Subject
// entityType union (organisation/other) to a default analyst persona.

export function analystForType(t: string): string {
  if (t === "vessel") return "talon";
  if (t === "aircraft") return "sterling";
  if (t === "corporate" || t === "organisation") return "lattice";
  if (t === "entity" || t === "other") return "cypher";
  return "ember";
}

// ── Projected risk (intake modal) ────────────────────────────────────────────

const COUNTRY_RISK: Record<string, number> = {
  RUSSIA: 42,
  "UNITED ARAB EMIR": 22,
  SEYCHELLES: 30,
  PANAMA: 26,
  EGYPT: 18,
  JORDAN: 12,
  "HONG KONG": 16,
  SINGAPORE: 8,
  SWITZERLAND: 6,
  "UNITED STATES": 10,
  "UNITED KINGDOM": 6,
  GERMANY: 5,
};

export function countryRisk(c: string): number {
  return COUNTRY_RISK[c] ?? 10;
}

const TYPE_PREMIUM: Record<string, number> = {
  vessel: 10,
  aircraft: 8,
  corporate: 6,
  entity: 8,
  individual: 0,
};

export interface DraftLike {
  type: string;
  country: string;
  issuingCountry?: string;
}

export function draftRisk(d: DraftLike): number {
  let r = countryRisk(d.country);
  r += TYPE_PREMIUM[d.type] ?? 0;
  r += Math.round(countryRisk(d.issuingCountry || d.country) * 0.4);
  return Math.max(0, Math.min(99, Math.round(r)));
}

// ── Clock / uptime ───────────────────────────────────────────────────────────

export function fmtUptime(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const x = s % 60;
  return [h, m, x].map((n) => String(n).padStart(2, "0")).join(":");
}

export function fmtClock(now: number): string {
  return new Date(now).toLocaleTimeString("en-GB", { hour12: false });
}
