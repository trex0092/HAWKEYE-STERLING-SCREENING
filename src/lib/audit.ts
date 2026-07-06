/**
 * Lightweight client-side audit trail. Appends a capped, append-only log to
 * localStorage so compliance actions are traceable without a backend. A
 * `hawkeye:audit-updated` event is dispatched so any open log view can refresh.
 */
const AUDIT_KEY = "hawkeye.audit-log.v1";
const MAX_ENTRIES = 1000;

export interface AuditEntry {
  ts: string;
  actor: string;
  action: string;
  target: string;
}

export function writeAuditEvent(actor: string, action: string, target: string): void {
  const entry: AuditEntry = {
    ts: new Date().toISOString(),
    actor,
    action,
    target,
  };
  if (typeof window === "undefined") return;
  try {
    let list: AuditEntry[] = [];
    try {
      const raw = window.localStorage.getItem(AUDIT_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(parsed)) list = parsed as AuditEntry[];
    } catch {
      // Corrupt store: start a fresh log rather than dropping this audit entry.
      list = [];
    }
    list.push(entry);
    const trimmed = list.slice(-MAX_ENTRIES);
    window.localStorage.setItem(AUDIT_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent("hawkeye:audit-updated", { detail: entry }));
  } catch (err) {
    console.warn("[hawkeye] writeAuditEvent failed:", err);
  }
}

export function readAuditLog(): AuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as AuditEntry[]) : [];
  } catch {
    return [];
  }
}
