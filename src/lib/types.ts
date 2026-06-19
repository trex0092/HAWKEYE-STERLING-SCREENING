// ── Core enums / unions ──────────────────────────────────────────────────────

export type EntityType = "individual" | "organisation" | "vessel" | "aircraft" | "other";

export type CDDPosture = "CDD" | "EDD" | "SDD";

export type SubjectStatus = "active" | "review" | "escalated" | "cleared";

export type SortKey = "name" | "riskScore" | "slaNotify" | "status" | "cddPosture";

export type FilterKey =
  | "all"
  | "critical"
  | "sanctions"
  | "edd"
  | "pep"
  | "sla"
  | "a24"
  | "mine"
  | "closed";

export type TableColumnKey = "risk" | "status" | "cdd" | "sla" | "lists" | "snooze";

export type SanctionSource =
  | "OFAC"
  | "UN"
  | "EU"
  | "UK"
  | "EOCN"
  | "AU"
  | "CH"
  | "CA"
  | "JP"
  | "FATF"
  | "INTERPOL"
  | "WB"
  | "ADB";

export type BadgeTone = "violet" | "red" | "amber" | "green" | "brand";

// ── Sub-objects ──────────────────────────────────────────────────────────────

export interface PepInfo {
  tier: string;
  rationale: string;
}

export interface RcaInfo {
  screened: boolean;
}

export interface AdverseMediaInfo {
  source: string;
  score: number;
  name: string;
  reference: string;
  date: string;
}

// ── Subject ──────────────────────────────────────────────────────────────────

export interface Subject {
  id: string;
  badge: string;
  badgeTone: BadgeTone;
  name: string;
  aliases?: string[];
  meta: string;
  country: string;
  jurisdiction: string;
  type: string;
  entityType: EntityType;
  riskScore: number;
  status: SubjectStatus;
  cddPosture: CDDPosture;
  listCoverage: SanctionSource[];
  pep?: PepInfo;
  rca: RcaInfo;
  exposureAED: string;
  slaNotify: string;
  mostSerious: string;
  openedAgo: string;
  openedAt?: string;
  assignedTo?: string;
  snoozedUntil?: string;
  snoozeReason?: string;
  notes?: string;
  riskCategory?: string;
  adverseMedia?: AdverseMediaInfo;
  walletAddresses?: string[];
  vesselImo?: string;
  vesselMmsi?: string;
  aircraftTail?: string;
  listHealthWarnings?: string[];
}

// ── Queue filters / saved searches ───────────────────────────────────────────

export interface QueueFilter {
  key: FilterKey;
  label: string;
  count: string;
  hint?: string;
}

export interface SavedSearch {
  id: string;
  label: string;
  query?: string;
  filter?: FilterKey;
  statusFilter?: SubjectStatus | "all";
  minRisk?: number;
}
