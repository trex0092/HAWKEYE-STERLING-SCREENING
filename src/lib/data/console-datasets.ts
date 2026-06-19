// ── Console static datasets ──────────────────────────────────────────────────
// Illustrative seeds for the non-screening modules. These double as the
// deterministic *fallbacks* for the live integrations (Google adverse media,
// open sanctions lists) so the app renders identically offline or in CI.

export type ModuleKey =
  | "screening"
  | "cases"
  | "sanctions"
  | "media"
  | "crypto"
  | "vessels"
  | "audit"
  | "settings";

export interface SanctionSourceRow {
  name: string;
  code: string;
  entries: string;
  updated: string;
  status: "current" | "stale";
}

export const SOURCES: SanctionSourceRow[] = [
  {
    name: "OFAC SDN & Consolidated",
    code: "OFAC",
    entries: "12,438",
    updated: "18 Jun · 04:00",
    status: "current",
  },
  {
    name: "UN Security Council Consolidated",
    code: "UN",
    entries: "1,067",
    updated: "17 Jun · 22:10",
    status: "current",
  },
  {
    name: "EU Consolidated Financial Sanctions",
    code: "EU",
    entries: "3,512",
    updated: "18 Jun · 02:30",
    status: "current",
  },
  {
    name: "UK OFSI Consolidated",
    code: "UK",
    entries: "4,201",
    updated: "18 Jun · 03:15",
    status: "current",
  },
  {
    name: "INTERPOL Notices",
    code: "INTERPOL",
    entries: "8,940",
    updated: "16 Jun · 19:45",
    status: "stale",
  },
  {
    name: "EOCN Watchlist",
    code: "EOCN",
    entries: "612",
    updated: "18 Jun · 01:05",
    status: "current",
  },
];

export interface MediaHit {
  subject: string;
  cat: string;
  source: string;
  date: string;
  sent: "negative" | "positive" | "neutral";
  headline: string;
  url?: string;
}

export const MEDIA: MediaHit[] = [
  {
    subject: "Boris Volkov",
    cat: "Sanctions",
    source: "Reuters",
    date: "14 Jun 2026",
    sent: "negative",
    headline: "Asset-freeze designation expanded under EO 14024",
  },
  {
    subject: "Helena Vance",
    cat: "Litigation",
    source: "Financial Times",
    date: "12 Jun 2026",
    sent: "negative",
    headline: "Civil fraud suit filed against UK director in High Court",
  },
  {
    subject: "Zenith Trading FZE",
    cat: "Trade fraud",
    source: "OCCRP",
    date: "11 Jun 2026",
    sent: "negative",
    headline: "Free-zone shell linked to over-invoicing network",
  },
  {
    subject: "Cipher Node Exchange",
    cat: "Crypto",
    source: "CoinDesk",
    date: "10 Jun 2026",
    sent: "negative",
    headline: "Exchange flagged for mixer-adjacent settlement flows",
  },
  {
    subject: "Gamal Mubarak",
    cat: "PEP",
    source: "Associated Press",
    date: "09 Jun 2026",
    sent: "neutral",
    headline: "Family wealth under renewed regulatory scrutiny",
  },
  {
    subject: "MV Nordic Star",
    cat: "Sanctions",
    source: "Lloyd's List",
    date: "10 Jun 2026",
    sent: "negative",
    headline: "Vessel detained over dual-use cargo manifest",
  },
];

export interface WalletRow {
  label: string;
  chain: string;
  addr: string;
  exposure: string;
  risk: number;
  flag: string;
}

export const WALLETS: WalletRow[] = [
  {
    label: "Cipher Node Exchange — hot",
    chain: "ETH",
    addr: "0x9f2a…c41b",
    exposure: "1,750,000",
    risk: 65,
    flag: "Mixer adjacency",
  },
  {
    label: "Unhosted — counterparty",
    chain: "BTC",
    addr: "bc1q…7h2k",
    exposure: "420,000",
    risk: 48,
    flag: "Unhosted",
  },
  {
    label: "Zenith treasury",
    chain: "TRON",
    addr: "TJ9k…Lp3v",
    exposure: "2,100,000",
    risk: 60,
    flag: "High-risk VASP",
  },
  {
    label: "Bridge relay",
    chain: "ETH",
    addr: "0x41d8…9aa2",
    exposure: "880,000",
    risk: 38,
    flag: "Cross-chain",
  },
  {
    label: "OTC desk",
    chain: "USDT",
    addr: "0x7c0e…b15f",
    exposure: "310,000",
    risk: 22,
    flag: "—",
  },
];

export interface VesselRow {
  name: string;
  imo: string;
  flag: string;
  type: string;
  status: "Detained" | "Underway" | "Anchored" | "In port";
  lastPort: string;
  risk: number;
  lists: string[];
}

export const VESSELS: VesselRow[] = [
  {
    name: "MV Nordic Star",
    imo: "9483210",
    flag: "PANAMA",
    type: "Bulk carrier",
    status: "Detained",
    lastPort: "Novorossiysk",
    risk: 88,
    lists: ["UN", "EU"],
  },
  {
    name: "MT Caspian Pearl",
    imo: "9551203",
    flag: "LIBERIA",
    type: "Tanker",
    status: "Underway",
    lastPort: "Fujairah",
    risk: 64,
    lists: ["OFAC"],
  },
  {
    name: "MV Aegean Trader",
    imo: "9402118",
    flag: "MALTA",
    type: "Cargo",
    status: "Anchored",
    lastPort: "Piraeus",
    risk: 35,
    lists: [],
  },
  {
    name: "MT Gulf Horizon",
    imo: "9620045",
    flag: "UAE",
    type: "Tanker",
    status: "Underway",
    lastPort: "Jebel Ali",
    risk: 52,
    lists: ["EU"],
  },
  {
    name: "MV Baltic Crown",
    imo: "9388471",
    flag: "CYPRUS",
    type: "Container",
    status: "In port",
    lastPort: "Limassol",
    risk: 20,
    lists: [],
  },
];

export interface AuditRow {
  t: string;
  actor: string;
  action: string;
  target: string;
  c: string;
}

export const AUDIT: AuditRow[] = [
  {
    t: "13:08:42",
    actor: "Sentinel",
    action: "Escalated subject",
    target: "HS-10001 · Boris Volkov",
    c: "#FF6B6B",
  },
  {
    t: "12:54:10",
    actor: "Operator OP",
    action: "Opened case",
    target: "CS-10002 · MV Nordic Star",
    c: "#7FB3E8",
  },
  {
    t: "12:31:05",
    actor: "Talon",
    action: "Flagged vessel",
    target: "MV Nordic Star · IMO 9483210",
    c: "#FFAE57",
  },
  {
    t: "11:47:33",
    actor: "System",
    action: "List sync — OFAC SDN",
    target: "+12 entries · 04:00",
    c: "#4FD6A0",
  },
  {
    t: "11:20:58",
    actor: "Ember",
    action: "Adverse-media hit",
    target: "HS-10009 · Helena Vance",
    c: "#FFAE57",
  },
  {
    t: "10:58:14",
    actor: "Cypher",
    action: "Crypto exposure review",
    target: "Cipher Node Exchange",
    c: "#7FB3E8",
  },
  {
    t: "10:33:02",
    actor: "Operator OP",
    action: "Marked cleared",
    target: "HS-10007 · Lukas Brenner",
    c: "#4FD6A0",
  },
  {
    t: "09:51:47",
    actor: "Cobalt",
    action: "CDD posture → EDD",
    target: "HS-10005 · Zenith Trading FZE",
    c: "#FF9F45",
  },
  {
    t: "09:12:20",
    actor: "System",
    action: "List sync — EU Consolidated",
    target: "+4 entries · 02:30",
    c: "#4FD6A0",
  },
  {
    t: "08:40:05",
    actor: "Lattice",
    action: "UBO structure mapped",
    target: "HS-10012 · Crescent Holdings",
    c: "#7FB3E8",
  },
];

// ── Intake modal option lists ────────────────────────────────────────────────

export const COUNTRIES: string[] = [
  "UNITED KINGDOM",
  "GERMANY",
  "JORDAN",
  "EGYPT",
  "UNITED ARAB EMIR",
  "PANAMA",
  "SEYCHELLES",
  "RUSSIA",
  "UNITED STATES",
  "SINGAPORE",
  "SWITZERLAND",
  "HONG KONG",
];

export const ID_TYPES: string[] = [
  "Passport",
  "National ID",
  "Company Reg No.",
  "Driver Licence",
  "Tax ID",
];

// ── Per-module metadata (breadcrumb / header / HUD lead) ──────────────────────

export interface ModuleMeta {
  title: string;
  crumb: string;
  sub: string;
  /** Lead analyst persona id used by the HUD on non-screening modules. */
  lead: string;
  duty: string;
  note: string;
}

export const META: Record<ModuleKey, ModuleMeta> = {
  screening: {
    title: "Screening",
    crumb: "Subject Register",
    sub: "Live screening queue across people, corporates, vessels & crypto entities",
    lead: "ember",
    duty: "AI ANALYST ON CASE",
    note: "",
  },
  cases: {
    title: "Cases",
    crumb: "Investigations",
    sub: "Open investigations escalated or under review",
    lead: "iris",
    duty: "CASE DESK LEAD",
    note: "Cases open automatically when a subject is escalated or moved to review. The desk tracks stage and SLA until disposition.",
  },
  sanctions: {
    title: "Sanctions",
    crumb: "Watchlists",
    sub: "Watchlist sources feeding the screening engine",
    lead: "sentinel",
    duty: "WATCHLIST LEAD",
    note: "Six free and open sources feed the matching engine. Stale lists are surfaced so refreshes can be prioritised.",
  },
  media: {
    title: "Adverse Media",
    crumb: "Negative News",
    sub: "Negative-news hits scored for sentiment and category",
    lead: "ember",
    duty: "MEDIA SCREENING LEAD",
    note: "Hits are scored for sentiment and category. The feed pulls free Google-News results when enabled, with deterministic seed data otherwise.",
  },
  crypto: {
    title: "Crypto",
    crumb: "Wallet Exposure",
    sub: "Monitored wallets and VASP exposure",
    lead: "cypher",
    duty: "TM UNIT LEAD",
    note: "Wallet exposure is scored from chain analytics. Mixer adjacency and unhosted counterparties drive the risk weighting.",
  },
  vessels: {
    title: "Vessels",
    crumb: "Maritime",
    sub: "Flagged vessels under maritime tracking",
    lead: "talon",
    duty: "MARITIME LEAD",
    note: "Vessels are tracked for AIS gaps, dark-fleet behaviour and watchlist exposure. Detentions raise the risk band immediately.",
  },
  audit: {
    title: "Audit Log",
    crumb: "Activity",
    sub: "Chronological activity across the console",
    lead: "brass",
    duty: "RECORDS LEAD",
    note: "Every analyst action and list sync is written to an immutable timeline for compliance traceability.",
  },
  settings: {
    title: "Settings",
    crumb: "Configuration",
    sub: "Thresholds, integrations & security",
    lead: "sterling",
    duty: "SYSTEM OPERATOR",
    note: "Changes apply to this operator session. Integrations activate when their credentials are present in the environment.",
  },
};
