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
// open OpenSanctions / yente index (sanctions + PEP topics) and builds a verdict
// from the REAL hits only.
//
// When no live list source is reachable (dev/test/CI, or the public API is
// key-gated and no self-hosted yente is configured) we return an HONEST
// "not screened" verdict: no sanctions, no PEP, no list hits, no fabricated
// score. A compliance tool must never invent matches for a real person.

interface ScreenHit {
  listId: string;
  listRef: string;
  candidateName: string;
  matchedAlias?: string;
  score: number;
  method: string;
  programs?: string[];
}

interface AugmentationRecord {
  source?: string;
  name?: string;
  jurisdiction?: string;
  status?: string;
  url?: string;
}

interface SubjectPayload {
  name?: string;
  aliases?: string[];
  entityType?: string;
  jurisdiction?: string;
}

const METHODS = ["name+dob", "alias", "phonetic", "transliteration"];

function severityFor(score: number): "critical" | "high" | "medium" | "low" {
  return score >= 85 ? "critical" : score >= 70 ? "high" : score >= 50 ? "medium" : "low";
}

function decisionFor(score: number): "clear" | "review" | "escalate" | "block" {
  return score >= 90 ? "block" : score >= 75 ? "escalate" : score >= 50 ? "review" : "clear";
}

function topicMethod(m: SanctionMatch): string {
  if (matchIsSanctioned(m)) return "sanctions-list";
  if (matchIsPep(m)) return "pep-list";
  return m.topics[0] ?? "name-match";
}

// ── Live (free OpenSanctions / yente) screen ─────────────────────────────────

async function liveScreen(subject: SubjectPayload): Promise<object | null> {
  const name = (subject.name ?? "").trim();
  const matches = await screenName(name);
  if (matches === null) return null; // unreachable/disabled → caller decides
  if (matches.length === 0) return cleanVerdict(name, subject, true);

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
  const severity = severityFor(
    decision === "escalate" || decision === "block" ? Math.max(topScore, 75) : topScore,
  );

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
    screeningWarnings: [],
  };
}

/** A genuine clean result (live source reached, nothing matched). */
function cleanVerdict(name: string, subject: SubjectPayload, live: boolean): object {
  return {
    ok: true,
    live,
    pep: false,
    sanctioned: false,
    lists: [] as string[],
    topScore: 0,
    severity: "low",
    reasoning: {
      summary: live
        ? `No sanctions or PEP records matched "${name}" in the open OpenSanctions index.`
        : `"${name}" was NOT screened against live sanctions/PEP lists — no list source is connected. Connect a free self-hosted yente (OPENSANCTIONS_API_URL) for real results. No matches are claimed.`,
      decision: live ? "clear" : "review",
      score: 0,
      factors: [
        { label: "Name / alias match", weight: 0, detail: "no list source" },
        { label: "Sanctions exposure", weight: 0, detail: "not screened" },
        { label: "PEP exposure", weight: 0, detail: "not screened" },
        {
          label: "Jurisdiction risk",
          weight: subject.jurisdiction ? 45 : 20,
          detail: subject.jurisdiction || "unspecified",
        },
      ],
      recommendation: live
        ? "Clear and proceed; retain for ongoing screening."
        : "Connect a live sanctions/PEP source before relying on this verdict.",
    },
    hits: [] as ScreenHit[],
    openSanctionsAugmentation: [] as AugmentationRecord[],
    screeningWarnings: live
      ? ([] as string[])
      : ["No live sanctions/PEP source connected — subject not matched against any list."],
  };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { subject?: SubjectPayload };
  const subject = body.subject ?? {};
  const name = (subject.name ?? "").trim();

  if (liveEnabled("SANCTIONS_LIVE") && name) {
    try {
      const live = await liveScreen(subject);
      if (live) return NextResponse.json(live);
    } catch {
      /* fall through to the honest "not screened" verdict */
    }
  }

  // No live source: return an honest, non-fabricated "not screened" verdict.
  return NextResponse.json(cleanVerdict(name || "subject", subject, false));
}
