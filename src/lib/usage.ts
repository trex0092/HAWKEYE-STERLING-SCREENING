// ── Usage analytics (pure aggregation) ───────────────────────────────────────
// Turns the existing audit trail (`src/lib/audit.ts`) and LLM call log
// (`src/lib/ai/llm-log.ts`) into "who/what is using the system" counts — per
// actor, per action, per task, per model. No new data is collected: this only
// summarises records the platform already keeps. Pure and offline-safe.

import type { AuditEntry } from "./audit";
import type { LlmLogEntry, LlmOutcome } from "./ai/llm-log";

export interface AuditUsageSummary {
  totalEvents: number;
  uniqueActors: number;
  byActor: Record<string, number>;
  byAction: Record<string, number>;
}

export interface LlmUsageSummary {
  totalCalls: number;
  byTask: Record<string, number>;
  byModel: Record<string, number>;
  byOutcome: Record<LlmOutcome, number>;
}

function tally<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

/** Summarise audit-trail usage: event volume per actor and per action. */
export function summariseAudit(entries: AuditEntry[]): AuditUsageSummary {
  const list = Array.isArray(entries) ? entries : [];
  const byActor = tally(list, (e) => e.actor || "unknown");
  return {
    totalEvents: list.length,
    uniqueActors: Object.keys(byActor).length,
    byActor,
    byAction: tally(list, (e) => e.action || "unknown"),
  };
}

/** Summarise LLM usage: call volume per task, per model and per outcome. */
export function summariseLlm(log: LlmLogEntry[]): LlmUsageSummary {
  const list = Array.isArray(log) ? log : [];
  const byOutcome: Record<LlmOutcome, number> = { ok: 0, rejected: 0, error: 0 };
  for (const entry of list) {
    if (entry.outcome in byOutcome) byOutcome[entry.outcome] += 1;
  }
  return {
    totalCalls: list.length,
    byTask: tally(list, (e) => e.task || "unknown"),
    byModel: tally(list, (e) => e.model || "unknown"),
    byOutcome,
  };
}
