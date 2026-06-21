// ── LLM call log (drift observability) ───────────────────────────────────────
// A capped, in-memory record of every LLM call so behaviour can be reviewed for
// drift over time. It deliberately stores a *hash* of the prompt — never the raw
// prompt text — so no subject PII is retained here. Offline-safe: pure, never
// throws, never makes a network call. In a production deployment this same shape
// would be flushed to a durable sink; the demo keeps it process-local.

export type LlmOutcome = "ok" | "rejected" | "error";

export interface LlmLogEntry {
  ts: string;
  task: string;
  model: string;
  /** Non-reversible hash of the prompt — lets us spot input changes, not read them. */
  promptHash: string;
  outcome: LlmOutcome;
  /** Wall-clock latency of the call, milliseconds. */
  ms: number;
}

const MAX_ENTRIES = 500;
const log: LlmLogEntry[] = [];

/** Stable, non-cryptographic hash (djb2) → 8-hex chars. Used to fingerprint prompts. */
export function hashText(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) {
    h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Append a call record (capped, append-only). Never throws. */
export function recordLlmCall(entry: Omit<LlmLogEntry, "ts">): void {
  try {
    log.push({ ts: new Date().toISOString(), ...entry });
    if (log.length > MAX_ENTRIES) log.splice(0, log.length - MAX_ENTRIES);
  } catch {
    /* observability must never break the caller */
  }
}

/** Read a copy of the current log (newest last). */
export function readLlmLog(): LlmLogEntry[] {
  return log.slice();
}

/** Clear the log (used by tests and manual resets). */
export function clearLlmLog(): void {
  log.length = 0;
}
