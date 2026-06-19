import { NextResponse } from "next/server";

// ── Deterministic, offline screening mock ────────────────────────────────────
// Derives a plausible, reproducible verdict from a hash of the subject name.
// No external calls, no secrets. The response shape matches the page's
// QuickScreenAPIResponse contract exactly.

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

interface AugmentationRecord {
  source?: string;
  name?: string;
  legalName?: string;
  jurisdiction?: string;
  registrationNumber?: string;
  status?: string;
  incorporatedAt?: string;
  incorporationDate?: string;
  url?: string;
}

interface ScreenHit {
  listId: string;
  listRef: string;
  candidateName: string;
  matchedAlias?: string;
  score: number;
  method: string;
  programs?: string[];
}

interface SubjectPayload {
  name?: string;
  aliases?: string[];
  entityType?: string;
  jurisdiction?: string;
}

const LIST_TABLE: Array<{ id: string; ref: string; programs: string[] }> = [
  { id: "ofac_sdn", ref: "OFAC-SDN-12345", programs: ["RUSSIA-EO14024", "SDNTK"] },
  { id: "un_1267", ref: "UN-1267-987", programs: ["1267/1989 ISIL (Da'esh) & Al-Qaida"] },
  { id: "eu_consolidated", ref: "EU-CFSP-2022/336", programs: ["EU restrictive measures"] },
  { id: "uk_ofsi", ref: "OFSI-RUS-0042", programs: ["UK Russia regime"] },
];

const COMMON_FAMILIES = ["mohamed", "mohammed", "muhammad", "ahmed", "ahmad", "ali", "hussein", "khan", "ivanov", "kim"];

const METHODS = ["name+dob", "alias", "phonetic", "transliteration"];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { subject?: SubjectPayload };
  const subject = body.subject ?? {};
  const name = (subject.name ?? "").trim();
  const aliases = Array.isArray(subject.aliases) ? subject.aliases : [];
  const entityType = subject.entityType ?? "individual";
  const jurisdiction = (subject.jurisdiction ?? "").trim();
  const isOrg = entityType !== "individual";

  const h = hash(name || "unknown");
  const clean = /test|sample|demo/i.test(name);

  const topScore = clean ? h % 35 : 40 + (h % 60);
  const severity =
    topScore >= 85 ? "critical" : topScore >= 70 ? "high" : topScore >= 50 ? "medium" : "low";
  const decision: "clear" | "review" | "escalate" | "block" =
    topScore >= 90 ? "block" : topScore >= 75 ? "escalate" : topScore >= 50 ? "review" : "clear";

  // ── Hits ──
  const hitCount = clean ? 0 : 1 + (h % 3); // 1..3
  const hits: ScreenHit[] = [];
  for (let i = 0; i < hitCount; i++) {
    const entry = LIST_TABLE[(h + i) % LIST_TABLE.length]!;
    const useAlias = aliases.length > 0 && (h + i) % 2 === 0;
    const hit: ScreenHit = {
      listId: entry.id,
      listRef: entry.ref,
      candidateName: name || "Unknown subject",
      score: Math.max(55, topScore - i * 8),
      method: METHODS[(h + i) % METHODS.length]!,
      programs: entry.programs,
    };
    if (useAlias) hit.matchedAlias = aliases[(h + i) % aliases.length]!;
    hits.push(hit);
  }

  // ── Reasoning ──
  const factors = [
    { label: "Name / alias match", weight: Math.min(100, topScore + 5), detail: hits[0]?.method ?? "no strong match" },
    { label: "Jurisdiction risk", weight: jurisdiction ? 40 + (h % 50) : 20, detail: jurisdiction || "unspecified" },
    { label: "List-program severity", weight: hits[0] ? 60 + (h % 40) : 10, detail: hits[0]?.listId ?? "none" },
    { label: "Entity-type modifier", weight: isOrg ? 35 + (h % 30) : 25, detail: entityType },
  ];
  const reasoning = {
    summary: clean
      ? `No material sanctions or watchlist exposure found for "${name}". Screening completed with a low residual score.`
      : `Screening of "${name}" surfaced ${hitCount} candidate match(es) with a top score of ${topScore}. ${
          decision === "block" || decision === "escalate"
            ? "Strong overlap on sanctioned-program designations warrants escalation."
            : "Matches appear weak-to-moderate; analyst review recommended."
        }`,
    decision,
    score: topScore,
    factors,
    recommendation:
      decision === "clear"
        ? "Clear and proceed; retain record for ongoing screening."
        : decision === "review"
          ? "Route to L1 analyst for disposition within SLA."
          : "Escalate to L2 / MLRO; freeze onboarding pending review.",
  };

  // ── Augmentations (richer for organisations) ──
  const openSanctionsAugmentation: AugmentationRecord[] =
    hitCount > 0
      ? [
          {
            source: "opensanctions",
            name: name || "Unknown",
            jurisdiction: jurisdiction || "ZZ",
            status: "designated",
            url: "https://www.opensanctions.org/",
          },
        ]
      : [];

  const commercialAugmentation: AugmentationRecord[] = isOrg
    ? [
        {
          source: "dun_bradstreet",
          legalName: name,
          jurisdiction: jurisdiction || "AE",
          registrationNumber: `DUNS-${100000 + (h % 900000)}`,
          status: "active",
          incorporationDate: "2017-04-12",
        },
      ]
    : [];

  const registryAugmentation: AugmentationRecord[] = isOrg
    ? [
        {
          source: "opencorporates",
          legalName: name,
          jurisdiction: jurisdiction || "AE",
          registrationNumber: `OC-${200000 + (h % 700000)}`,
          status: "active",
          incorporatedAt: "2017-04-12",
          url: "https://opencorporates.com/",
        },
      ]
    : [];

  const countryRegistryAugmentation: AugmentationRecord[] = isOrg
    ? [{ source: "uae_ded", legalName: name, jurisdiction: "AE", registrationNumber: `DED-${10000 + (h % 89999)}`, status: "licensed" }]
    : [];

  const countrySanctionsAugmentation: AugmentationRecord[] =
    hitCount > 1 ? [{ source: "uae_eocn", name, jurisdiction: "AE", status: "listed" }] : [];

  const freeAdapterAugmentation: AugmentationRecord[] =
    h % 4 === 0 ? [{ source: "gleif", legalName: name, jurisdiction: jurisdiction || "AE", registrationNumber: `LEI-${h % 1_000_000}` }] : [];

  // ── Warnings + list health ──
  const screeningWarnings: string[] =
    h % 7 === 0 ? ["EU consolidated list was 38h stale at screening time — results may be incomplete."] : [];

  const listHealthAtScreeningTime: Record<string, { entityCount: number; ageHours: number; status: string }> = {
    ofac_sdn: { entityCount: 12483, ageHours: 3, status: "fresh" },
    un_1267: { entityCount: 642, ageHours: 9, status: "fresh" },
    eu_consolidated: { entityCount: 3110, ageHours: h % 7 === 0 ? 38 : 6, status: h % 7 === 0 ? "stale" : "fresh" },
    uk_ofsi: { entityCount: 4201, ageHours: 11, status: "fresh" },
  };

  const commonNameExpansion = COMMON_FAMILIES.some((f) => name.toLowerCase().includes(f));

  return NextResponse.json({
    ok: true,
    topScore,
    severity,
    reasoning,
    hits,
    openSanctionsAugmentation,
    commercialAugmentation,
    commercialProvider: "Dun & Bradstreet",
    registryAugmentation,
    registryProviders: ["OpenCorporates"],
    countryRegistryAugmentation,
    countryRegistryJurisdictions: ["AE"],
    countrySanctionsAugmentation,
    countrySanctionsLists: ["UAE EOCN"],
    freeAdapterAugmentation,
    freeAdapterProviders: ["GLEIF"],
    commonNameExpansion,
    screeningWarnings,
    listHealthAtScreeningTime,
  });
}
