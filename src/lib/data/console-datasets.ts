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

// Watchlist sources ship empty. When SANCTIONS_LIVE is enabled the engine
// overlays live OpenSanctions metadata onto these rows — with no seed rows the
// Sanctions module renders empty until a source is connected.
export const SOURCES: SanctionSourceRow[] = [];

export interface MediaHit {
  subject: string;
  cat: string;
  source: string;
  date: string;
  sent: "negative" | "positive" | "neutral";
  headline: string;
  url?: string;
}

// Adverse-media hits ship empty. Live deployments pull real Google-News results
// per screened subject; the deterministic offline runner returns this seed.
export const MEDIA: MediaHit[] = [];

export interface WalletRow {
  label: string;
  chain: string;
  addr: string;
  exposure: string;
  risk: number;
  flag: string;
}

// Monitored wallets ship empty — added at runtime as crypto entities are tracked.
export const WALLETS: WalletRow[] = [];

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

// Tracked vessels ship empty — added at runtime as maritime entities are flagged.
export const VESSELS: VesselRow[] = [];

export interface AuditRow {
  t: string;
  actor: string;
  action: string;
  target: string;
  c: string;
}

// The audit timeline ships empty — every entry is a real action written at
// runtime via writeAuditEvent() (persisted to localStorage), not seeded.
export const AUDIT: AuditRow[] = [];

// ── Intake modal option lists ────────────────────────────────────────────────

export interface CountryOption {
  name: string;
  /** ISO 3166-1 alpha-2 code. */
  code: string;
}

// Full ISO 3166-1 country / territory list (alpha-2). Names are upper-cased to
// match the console's display style. This is the single source of truth — the
// `COUNTRIES` name list and `COUNTRY_CODES` lookup are derived from it.
export const COUNTRY_OPTIONS: CountryOption[] = [
  { name: "—", code: "" }, // no country / not specified
  { name: "AFGHANISTAN", code: "AF" },
  { name: "ÅLAND ISLANDS", code: "AX" },
  { name: "ALBANIA", code: "AL" },
  { name: "ALGERIA", code: "DZ" },
  { name: "AMERICAN SAMOA", code: "AS" },
  { name: "ANDORRA", code: "AD" },
  { name: "ANGOLA", code: "AO" },
  { name: "ANGUILLA", code: "AI" },
  { name: "ANTARCTICA", code: "AQ" },
  { name: "ANTIGUA AND BARBUDA", code: "AG" },
  { name: "ARGENTINA", code: "AR" },
  { name: "ARMENIA", code: "AM" },
  { name: "ARUBA", code: "AW" },
  { name: "AUSTRALIA", code: "AU" },
  { name: "AUSTRIA", code: "AT" },
  { name: "AZERBAIJAN", code: "AZ" },
  { name: "BAHAMAS", code: "BS" },
  { name: "BAHRAIN", code: "BH" },
  { name: "BANGLADESH", code: "BD" },
  { name: "BARBADOS", code: "BB" },
  { name: "BELARUS", code: "BY" },
  { name: "BELGIUM", code: "BE" },
  { name: "BELIZE", code: "BZ" },
  { name: "BENIN", code: "BJ" },
  { name: "BERMUDA", code: "BM" },
  { name: "BHUTAN", code: "BT" },
  { name: "BOLIVIA", code: "BO" },
  { name: "BONAIRE, SINT EUSTATIUS AND SABA", code: "BQ" },
  { name: "BOSNIA AND HERZEGOVINA", code: "BA" },
  { name: "BOTSWANA", code: "BW" },
  { name: "BOUVET ISLAND", code: "BV" },
  { name: "BRAZIL", code: "BR" },
  { name: "BRITISH INDIAN OCEAN TERRITORY", code: "IO" },
  { name: "BRUNEI DARUSSALAM", code: "BN" },
  { name: "BULGARIA", code: "BG" },
  { name: "BURKINA FASO", code: "BF" },
  { name: "BURUNDI", code: "BI" },
  { name: "CABO VERDE", code: "CV" },
  { name: "CAMBODIA", code: "KH" },
  { name: "CAMEROON", code: "CM" },
  { name: "CANADA", code: "CA" },
  { name: "CAYMAN ISLANDS", code: "KY" },
  { name: "CENTRAL AFRICAN REPUBLIC", code: "CF" },
  { name: "CHAD", code: "TD" },
  { name: "CHILE", code: "CL" },
  { name: "CHINA", code: "CN" },
  { name: "CHRISTMAS ISLAND", code: "CX" },
  { name: "COCOS (KEELING) ISLANDS", code: "CC" },
  { name: "COLOMBIA", code: "CO" },
  { name: "COMOROS", code: "KM" },
  { name: "CONGO", code: "CG" },
  { name: "CONGO, DEMOCRATIC REPUBLIC OF THE", code: "CD" },
  { name: "COOK ISLANDS", code: "CK" },
  { name: "COSTA RICA", code: "CR" },
  { name: "CÔTE D'IVOIRE", code: "CI" },
  { name: "CROATIA", code: "HR" },
  { name: "CUBA", code: "CU" },
  { name: "CURAÇAO", code: "CW" },
  { name: "CYPRUS", code: "CY" },
  { name: "CZECHIA", code: "CZ" },
  { name: "DENMARK", code: "DK" },
  { name: "DJIBOUTI", code: "DJ" },
  { name: "DOMINICA", code: "DM" },
  { name: "DOMINICAN REPUBLIC", code: "DO" },
  { name: "ECUADOR", code: "EC" },
  { name: "EGYPT", code: "EG" },
  { name: "EL SALVADOR", code: "SV" },
  { name: "EQUATORIAL GUINEA", code: "GQ" },
  { name: "ERITREA", code: "ER" },
  { name: "ESTONIA", code: "EE" },
  { name: "ESWATINI", code: "SZ" },
  { name: "ETHIOPIA", code: "ET" },
  { name: "FALKLAND ISLANDS", code: "FK" },
  { name: "FAROE ISLANDS", code: "FO" },
  { name: "FIJI", code: "FJ" },
  { name: "FINLAND", code: "FI" },
  { name: "FRANCE", code: "FR" },
  { name: "FRENCH GUIANA", code: "GF" },
  { name: "FRENCH POLYNESIA", code: "PF" },
  { name: "FRENCH SOUTHERN TERRITORIES", code: "TF" },
  { name: "GABON", code: "GA" },
  { name: "GAMBIA", code: "GM" },
  { name: "GEORGIA", code: "GE" },
  { name: "GERMANY", code: "DE" },
  { name: "GHANA", code: "GH" },
  { name: "GIBRALTAR", code: "GI" },
  { name: "GREECE", code: "GR" },
  { name: "GREENLAND", code: "GL" },
  { name: "GRENADA", code: "GD" },
  { name: "GUADELOUPE", code: "GP" },
  { name: "GUAM", code: "GU" },
  { name: "GUATEMALA", code: "GT" },
  { name: "GUERNSEY", code: "GG" },
  { name: "GUINEA", code: "GN" },
  { name: "GUINEA-BISSAU", code: "GW" },
  { name: "GUYANA", code: "GY" },
  { name: "HAITI", code: "HT" },
  { name: "HEARD ISLAND AND MCDONALD ISLANDS", code: "HM" },
  { name: "HOLY SEE", code: "VA" },
  { name: "HONDURAS", code: "HN" },
  { name: "HONG KONG", code: "HK" },
  { name: "HUNGARY", code: "HU" },
  { name: "ICELAND", code: "IS" },
  { name: "INDIA", code: "IN" },
  { name: "INDONESIA", code: "ID" },
  { name: "IRAN", code: "IR" },
  { name: "IRAQ", code: "IQ" },
  { name: "IRELAND", code: "IE" },
  { name: "ISLE OF MAN", code: "IM" },
  { name: "ISRAEL", code: "IL" },
  { name: "ITALY", code: "IT" },
  { name: "JAMAICA", code: "JM" },
  { name: "JAPAN", code: "JP" },
  { name: "JERSEY", code: "JE" },
  { name: "JORDAN", code: "JO" },
  { name: "KAZAKHSTAN", code: "KZ" },
  { name: "KENYA", code: "KE" },
  { name: "KIRIBATI", code: "KI" },
  { name: "KOREA, NORTH", code: "KP" },
  { name: "KOREA, SOUTH", code: "KR" },
  { name: "KOSOVO", code: "XK" },
  { name: "KUWAIT", code: "KW" },
  { name: "KYRGYZSTAN", code: "KG" },
  { name: "LAOS", code: "LA" },
  { name: "LATVIA", code: "LV" },
  { name: "LEBANON", code: "LB" },
  { name: "LESOTHO", code: "LS" },
  { name: "LIBERIA", code: "LR" },
  { name: "LIBYA", code: "LY" },
  { name: "LIECHTENSTEIN", code: "LI" },
  { name: "LITHUANIA", code: "LT" },
  { name: "LUXEMBOURG", code: "LU" },
  { name: "MACAO", code: "MO" },
  { name: "MADAGASCAR", code: "MG" },
  { name: "MALAWI", code: "MW" },
  { name: "MALAYSIA", code: "MY" },
  { name: "MALDIVES", code: "MV" },
  { name: "MALI", code: "ML" },
  { name: "MALTA", code: "MT" },
  { name: "MARSHALL ISLANDS", code: "MH" },
  { name: "MARTINIQUE", code: "MQ" },
  { name: "MAURITANIA", code: "MR" },
  { name: "MAURITIUS", code: "MU" },
  { name: "MAYOTTE", code: "YT" },
  { name: "MEXICO", code: "MX" },
  { name: "MICRONESIA", code: "FM" },
  { name: "MOLDOVA", code: "MD" },
  { name: "MONACO", code: "MC" },
  { name: "MONGOLIA", code: "MN" },
  { name: "MONTENEGRO", code: "ME" },
  { name: "MONTSERRAT", code: "MS" },
  { name: "MOROCCO", code: "MA" },
  { name: "MOZAMBIQUE", code: "MZ" },
  { name: "MYANMAR", code: "MM" },
  { name: "NAMIBIA", code: "NA" },
  { name: "NAURU", code: "NR" },
  { name: "NEPAL", code: "NP" },
  { name: "NETHERLANDS", code: "NL" },
  { name: "NEW CALEDONIA", code: "NC" },
  { name: "NEW ZEALAND", code: "NZ" },
  { name: "NICARAGUA", code: "NI" },
  { name: "NIGER", code: "NE" },
  { name: "NIGERIA", code: "NG" },
  { name: "NIUE", code: "NU" },
  { name: "NORFOLK ISLAND", code: "NF" },
  { name: "NORTH MACEDONIA", code: "MK" },
  { name: "NORTHERN MARIANA ISLANDS", code: "MP" },
  { name: "NORWAY", code: "NO" },
  { name: "OMAN", code: "OM" },
  { name: "PAKISTAN", code: "PK" },
  { name: "PALAU", code: "PW" },
  { name: "PALESTINE, STATE OF", code: "PS" },
  { name: "PANAMA", code: "PA" },
  { name: "PAPUA NEW GUINEA", code: "PG" },
  { name: "PARAGUAY", code: "PY" },
  { name: "PERU", code: "PE" },
  { name: "PHILIPPINES", code: "PH" },
  { name: "PITCAIRN", code: "PN" },
  { name: "POLAND", code: "PL" },
  { name: "PORTUGAL", code: "PT" },
  { name: "PUERTO RICO", code: "PR" },
  { name: "QATAR", code: "QA" },
  { name: "RÉUNION", code: "RE" },
  { name: "ROMANIA", code: "RO" },
  { name: "RUSSIA", code: "RU" },
  { name: "RWANDA", code: "RW" },
  { name: "SAINT BARTHÉLEMY", code: "BL" },
  { name: "SAINT HELENA", code: "SH" },
  { name: "SAINT KITTS AND NEVIS", code: "KN" },
  { name: "SAINT LUCIA", code: "LC" },
  { name: "SAINT MARTIN (FRENCH PART)", code: "MF" },
  { name: "SAINT PIERRE AND MIQUELON", code: "PM" },
  { name: "SAINT VINCENT AND THE GRENADINES", code: "VC" },
  { name: "SAMOA", code: "WS" },
  { name: "SAN MARINO", code: "SM" },
  { name: "SAO TOME AND PRINCIPE", code: "ST" },
  { name: "SAUDI ARABIA", code: "SA" },
  { name: "SENEGAL", code: "SN" },
  { name: "SERBIA", code: "RS" },
  { name: "SEYCHELLES", code: "SC" },
  { name: "SIERRA LEONE", code: "SL" },
  { name: "SINGAPORE", code: "SG" },
  { name: "SINT MAARTEN (DUTCH PART)", code: "SX" },
  { name: "SLOVAKIA", code: "SK" },
  { name: "SLOVENIA", code: "SI" },
  { name: "SOLOMON ISLANDS", code: "SB" },
  { name: "SOMALIA", code: "SO" },
  { name: "SOUTH AFRICA", code: "ZA" },
  { name: "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS", code: "GS" },
  { name: "SOUTH SUDAN", code: "SS" },
  { name: "SPAIN", code: "ES" },
  { name: "SRI LANKA", code: "LK" },
  { name: "SUDAN", code: "SD" },
  { name: "SURINAME", code: "SR" },
  { name: "SVALBARD AND JAN MAYEN", code: "SJ" },
  { name: "SWEDEN", code: "SE" },
  { name: "SWITZERLAND", code: "CH" },
  { name: "SYRIA", code: "SY" },
  { name: "TAIWAN", code: "TW" },
  { name: "TAJIKISTAN", code: "TJ" },
  { name: "TANZANIA", code: "TZ" },
  { name: "THAILAND", code: "TH" },
  { name: "TIMOR-LESTE", code: "TL" },
  { name: "TOGO", code: "TG" },
  { name: "TOKELAU", code: "TK" },
  { name: "TONGA", code: "TO" },
  { name: "TRINIDAD AND TOBAGO", code: "TT" },
  { name: "TUNISIA", code: "TN" },
  { name: "TÜRKIYE", code: "TR" },
  { name: "TURKMENISTAN", code: "TM" },
  { name: "TURKS AND CAICOS ISLANDS", code: "TC" },
  { name: "TUVALU", code: "TV" },
  { name: "UGANDA", code: "UG" },
  { name: "UKRAINE", code: "UA" },
  { name: "UNITED ARAB EMIRATES", code: "AE" },
  { name: "UNITED KINGDOM", code: "GB" },
  { name: "UNITED STATES", code: "US" },
  { name: "UNITED STATES MINOR OUTLYING ISLANDS", code: "UM" },
  { name: "URUGUAY", code: "UY" },
  { name: "UZBEKISTAN", code: "UZ" },
  { name: "VANUATU", code: "VU" },
  { name: "VENEZUELA", code: "VE" },
  { name: "VIETNAM", code: "VN" },
  { name: "VIRGIN ISLANDS, BRITISH", code: "VG" },
  { name: "VIRGIN ISLANDS, U.S.", code: "VI" },
  { name: "WALLIS AND FUTUNA", code: "WF" },
  { name: "WESTERN SAHARA", code: "EH" },
  { name: "YEMEN", code: "YE" },
  { name: "ZAMBIA", code: "ZM" },
  { name: "ZIMBABWE", code: "ZW" },
];

export const COUNTRIES: string[] = COUNTRY_OPTIONS.map((c) => c.name);

/** Country display name → ISO 3166-1 alpha-2 code. */
export const COUNTRY_CODES: Record<string, string> = Object.fromEntries(
  COUNTRY_OPTIONS.map((c) => [c.name, c.code]),
);

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
