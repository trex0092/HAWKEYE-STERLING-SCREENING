import type { QueueFilter, Subject } from "@/lib/types";

// ── Queue filters ────────────────────────────────────────────────────────────
// `count` is a placeholder the page overwrites via computeDynamicFilters().

export const QUEUE_FILTERS: QueueFilter[] = [
  { key: "all", label: "All open", count: "00", hint: "Every active subject in the book" },
  { key: "critical", label: "Critical", count: "00", hint: "Composite risk ≥ 85" },
  { key: "sanctions", label: "Sanctions", count: "00", hint: "Sanctions-list exposure" },
  { key: "edd", label: "EDD", count: "00", hint: "Enhanced due diligence posture" },
  { key: "pep", label: "PEP", count: "00", hint: "Politically exposed persons" },
  { key: "sla", label: "SLA risk", count: "00", hint: "Notify SLA ≤ 24h" },
  { key: "a24", label: "Added 24h", count: "00", hint: "Opened in the last 24 hours" },
  { key: "mine", label: "Mine", count: "00", hint: "Assigned to me" },
  { key: "closed", label: "Closed", count: "00", hint: "Cleared / resolved" },
];

// ── Subjects ─────────────────────────────────────────────────────────────────
// The screening register ships empty — there is no seed/demo data. Subjects are
// added at runtime through the intake flow (+ New) and screened live.

export const SUBJECTS: Subject[] = [];
