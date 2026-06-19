import { NextResponse } from "next/server";
import { liveEnabled } from "@/lib/integrations/config";
import {
  screenName,
  matchIsPep,
  matchIsSanctioned,
  listCodeForDataset,
  type SanctionMatch,
} from "@/lib/integrations/sanctions";

// ── Subject auto-screen ──────────────────────────────────────────────────────
// Free, no-key by default in production: name-matches the subject against the
// open OpenSanctions index (sanctions + PEP topics) and builds a verdict from
// the real hits. In dev/test/CI — or whenever the live lookup is unreachable —
// it falls back to a deterministic, offline mock derived from a hash of the
// name, so the response shape and tests stay stable.

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

const COMMON_FAMILIES = [
  "mohamed",
  "mohammed",
  "muhammad",
  "ahmed",
  "ahmad",
  "ali",
  "hussein",
  "khan",
  "ivanov",
  "kim",
];

const METHODS = ["name+dob", "alias", "phonetic", "transliteration"];

function severityFor(score: number): "critical" | "high" | "medium" | "low" {
  return score >= 85 ? "critical" : score >= 70 ? "high" : score >= 50 ? "medium" : "low";
}

function decisionFor(score: number): "clear" | "review" | "escalate" | "block" {
  return score >= 90 ? "block" : score >= 75 ? "escalate" : score >= 50 ? "review" : "clear";
}

// ── Live (free OpenSanctions) screen ─────────────────────────────────────────

async function liveScreen(subject: SubjectPayload): Promise<object | null> {
  const name = (subject.name ?? "").trim();
  const matches = await screenName(name);
  if (!matches || matches.length === 0) {
    // Reachable but no hits → a genuine, real "clear" verdict.
    if (matches !== null) return cleanVerdict(name, subject);
    return null; // unreachable/disabled → caller falls back to the mock
  }

  matches.sort((a, b) => b.score - a.score);
  const top = matches[0]!;
  const topScore = Math.max(1, Math.min(99, Math.round(top.score * 100)));
  const pep = matches.some(matchIsPep);
  const sanctioned = matches.some(matchIsSanctioned);
  const lists = Array.from(
    new Set(
      matches.flatMap((m) =>
        m.datasets.map(listCodeForDataset).filter((c): c is NonNullable<typeof c> => !!c),
      ),
    ),
  );

  const hits: ScreenHit[] = matches.slice(0, 5).map((m, i) => {
    const code = m.datasets.map(listCodeForDataset).find(Boolean) ?? null;
    const hit: ScreenHit = {
      listId: code ? code.toLowerCase() : (m.datasets[0] ?? "opensanctions"),
      listRef: m.datasets[0] ?? "opensanctions",
      candidateName: m.name,
      score: Math.max(1, Math.min(99, Math.round(m.score * 100))),
      method: m.topics.length ? topicMethod(m) : METHODS[i % METHODS.length]!,
    };
    if (m.topics.length) hit.programs = m.topics;
    return hit;
  });

  const decision = sanctioned ? decisionFor(Math.max(topScore, 75)) : decisionFor(topScore);
  const severity = severityFor(decision === "escalate" || decision === "block" ? Math.max(topScore, 75) : topScore);

  const factors = [
    { label: "Name / alias match", weight: topScore, detail: top.schema ?? "entity" },
    {
      label: "Sanctions exposure",
      weight: sanctioned ? Math.max(80, topScore) : 10,
      detail: sanctioned ? lists.join(", ") || "listed" : "no list hit",
    },
    {
      label: "PEP exposure",
      weight: pep ? 70 : 10,
      detail: pep ? "politically-exposed person" : "not a PEP",
    },
    {
      label: "Jurisdiction risk",
      weight: subject.jurisdiction ? 45 : 20,
      detail: subject.jurisdiction || "unspecified",
    },
  ];

  const reasoning = {
    summary: `OpenSanctions matched "${name}" to ${matches.length} record(s); top score ${topScore}.${
      sanctioned ? " Subject appears on a sanctions list." : ""
    }${pep ? " Subject is flagged as a PEP." : ""}`,
    decision,
    score: topScore,
    factors,
    recommendation:
      decision === "clear"
        ? "Clear and proceed; retain for ongoing screening."
        : decision === "review"
          ? "Route to L1 analyst for disposition within SLA."
          : "Escalate to L2 / MLRO; freeze onboarding pending review.",
  };

  const openSanctionsAugmentation: AugmentationRecord[] = matches.slice(0, 3).map((m) => ({
    source: "opensanctions",
    name: m.name,
    jurisdiction: subject.jurisdiction || "ZZ",
    status: matchIsSanctioned(m) ? "designated" : matchIsPep(m) ? "pep" : "listed",
    url: "https://www.opensanctions.org/",
  }));

  return {
    ok: true,
    live: true,
    pep,
    sanctioned,
    lists,
    topScore,
    severity,
    reasoning,
    hits,
    openSanctionsAugmentation,
    commonNameExpansion: COMMON_FAMILIES.some((f) => name.toLowerCase().includes(f)),
    screeningWarnings: [],
  };
}

function cleanVerdict(name: string, subject: SubjectPayload): object {
  return {
    ok: true,
    live: true,
    pep: false,
    sanctioned: false,
    lists: [] as string[],
    topScore: 5,
    severity: "low",
    reasoning: {
      summary: `No sanctions or PEP records matched "${name}" in the open OpenSanctions index.`,
      decision: "clear",
      score: 5,
      factors: [
        { label: "Name / alias match", weight: 5, detail: "no strong match" },
        { label: "Sanctions exposure", weight: 5, detail: "no list hit" },
        { label: "PEP exposure", weight: 5, detail: "not a PEP" },
        {
          label: "Jurisdiction risk",
          weight: subject.jurisdiction ? 45 : 20,
          detail: subject.jurisdiction || "unspecified",
        },
      ],
      recommendation: "Clear and proceed; retain for ongoing screening.",
    },
    hits: [] as ScreenHit[],
    openSanctionsAugmentation: [] as AugmentationRecord[],
    commonNameExpansion: COMMON_FAMILIES.some((f) => name.toLowerCase().includes(f)),
    screeningWarnings: [] as string[],
  };
}

function topicMethod(m: SanctionMatch): string {
  if (matchIsSanctioned(m)) return "sanctions-list";
  if (matchIsPep(m)) return "pep-list";
  return m.topics[0] ?? "name-match";
}

// ── Deterministic offline mock ───────────────────────────────────────────────

function mockScreen(subject: SubjectPayload): object {
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

  const LIST_TO_CODE: Record<string, string> = {
    ofac_sdn: "OFAC",
    un_1267: "UN",
    eu_consolidated: "EU",
    uk_ofsi: "UK",
  };

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

  const lists = Array.from(new Set(hits.map((x) => LIST_TO_CODE[x.listId]).filter(Boolean)));

  // ── Reasoning ──
  const factors = [
    {
      label: "Name / alias match",
      weight: Math.min(100, topScore + 5),
      detail: hits[0]?.method ?? "no strong match",
    },
    {
      label: "Jurisdiction risk",
      weight: jurisdiction ? 40 + (h % 50) : 20,
      detail: jurisdiction || "unspecified",
    },
    {
      label: "List-program severity",
      weight: hits[0] ? 60 + (h % 40) : 10,
      detail: hits[0]?.listId ?? "none",
    },
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
    ? [
        {
          source: "uae_ded",
          legalName: name,
          jurisdiction: "AE",
          registrationNumber: `DED-${10000 + (h % 89999)}`,
          status: "licensed",
        },
      ]
    : [];

  const countrySanctionsAugmentation: AugmentationRecord[] =
    hitCount > 1 ? [{ source: "uae_eocn", name, jurisdiction: "AE", status: "listed" }] : [];

  const freeAdapterAugmentation: AugmentationRecord[] =
    h % 4 === 0
      ? [
          {
            source: "gleif",
            legalName: name,
            jurisdiction: jurisdiction || "AE",
            registrationNumber: `LEI-${h % 1_000_000}`,
          },
        ]
      : [];

  // ── Warnings + list health ──
  const screeningWarnings: string[] =
    h % 7 === 0
      ? ["EU consolidated list was 38h stale at screening time — results may be incomplete."]
      : [];

  const listHealthAtScreeningTime: Record<
    string,
    { entityCount: number; ageHours: number; status: string }
  > = {
    ofac_sdn: { entityCount: 12483, ageHours: 3, status: "fresh" },
    un_1267: { entityCount: 642, ageHours: 9, status: "fresh" },
    eu_consolidated: {
      entityCount: 3110,
      ageHours: h % 7 === 0 ? 38 : 6,
      status: h % 7 === 0 ? "stale" : "fresh",
    },
    uk_ofsi: { entityCount: 4201, ageHours: 11, status: "fresh" },
  };

  const commonNameExpansion = COMMON_FAMILIES.some((f) => name.toLowerCase().includes(f));

  return {
    ok: true,
    live: false,
    pep: false,
    sanctioned: hitCount > 0,
    lists,
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
  };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { subject?: SubjectPayload };
  const subject = body.subject ?? {};

  if (liveEnabled("SANCTIONS_LIVE") && (subject.name ?? "").trim()) {
    try {
      const live = await liveScreen(subject);
      if (live) return NextResponse.json(live);
    } catch {
      /* fall through to deterministic mock */
    }
  }

  return NextResponse.json(mockScreen(subject));
}
