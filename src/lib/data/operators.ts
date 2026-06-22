// ── AI-analyst personas ──────────────────────────────────────────────────────
// The roster that fronts the animated radar HUD. Ships empty — no seed personas.
// When the roster is empty, `operatorById` returns undefined and the HUD renders
// a neutral standby state. Each Operator carries an accent RGB used to theme the
// HUD when active, plus a per-persona avatar background-position.

export interface Operator {
  id: string;
  img: string;
  /** CSS background-position for the circular avatar crop. */
  pos: string;
  name: string;
  role: string;
  /** Accent as an "r,g,b" string, used as rgb(var(--ac)) / rgba(var(--ac),a). */
  ac: string;
}

export const OPERATORS: Operator[] = [];

const OPERATOR_BY_ID: Record<string, Operator> = Object.fromEntries(
  OPERATORS.map((o) => [o.id, o]),
);

/** Resolve an operator by id. Returns undefined when unknown or the roster is empty. */
export function operatorById(id: string | undefined): Operator | undefined {
  return id ? OPERATOR_BY_ID[id] : undefined;
}
