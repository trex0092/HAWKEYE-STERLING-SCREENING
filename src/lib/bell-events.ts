/**
 * Notification "bell" event bus. Screening hits push a BellEvent which is
 * persisted (capped) to localStorage and broadcast on `hawkeye:bell` so the
 * header bell badge can update live.
 */
const BELL_KEY = "hawkeye.bell-events.v1";
const MAX_EVENTS = 200;

export interface BellEvent {
  id: string;
  listId: string;
  listLabel: string;
  matchedEntry: string;
  sourceRef: string;
  severity: "critical" | "high" | "medium" | "low";
  detectedAt: string;
  firedRedlineId?: string;
}

export function pushBellEvent(event: BellEvent): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(BELL_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    const list: BellEvent[] = Array.isArray(parsed) ? (parsed as BellEvent[]) : [];
    list.unshift(event);
    const trimmed = list.slice(0, MAX_EVENTS);
    window.localStorage.setItem(BELL_KEY, JSON.stringify(trimmed));
    window.dispatchEvent(new CustomEvent("hawkeye:bell", { detail: event }));
  } catch (err) {
    console.warn("[hawkeye] pushBellEvent failed:", err);
  }
}

export function readBellEvents(): BellEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BELL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as BellEvent[]) : [];
  } catch {
    return [];
  }
}
