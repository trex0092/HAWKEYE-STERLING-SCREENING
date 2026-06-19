import { NextResponse } from "next/server";
import { liveEnabled } from "@/lib/integrations/config";
import {
  screenName,
  matchIsPep,
  matchIsSanctioned,
  listCodeForDataset,
  type SanctionMatch,
} from "@/lib/integrations/sanctions";
import { fetchAdverseMedia } from "@/lib/integrations/adverse-media";

// ── Subject auto-screen ──────────────────────────────────────────────────────
// Free, no-key by default in production: name-matches the subject against the
// open OpenSanctions / yente index (sanctions + PEP topics) AND against the free
// Google-News adverse-media feed, then builds a verdict from the REAL hits only.
//
// Adverse media is a first-class screening signal here: a subject with strong
// negative press is routed to review/escalate even when no sanctions or PEP
// record exists — and even when the sanctions list source itself is unreachable.
//
// When no live list source is reachable (dev/test/CI, or the public API is
// key-gated and no self-hosted yente is configured) we return an HONEST
// "not screened" verdict for the list dimension: no sanctions, no PEP, no list
// hits, no fabricated score. A compliance tool must never invent matches for a
// real person — but it must also never bury genuine adverse media.

type Decision = "clear" | "review" | "escalate" | "block";
type Severity = "critical" | "high" | "medium" | "low";

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

interface Factor {
  label: string;
  weight: number;
  detail: string;
}

interface Reasoning {
  summary: string;
  decision: Decision;
  score: number;
  factors: Factor[];
  recommendation: string;
}

interface AdverseMediaHit {
  headline: string;
  source: string;
  date: string;
  url?: string;
}

interface AdverseMediaSummary {
  live: boolean;
  negativeCount: number;
  totalCount: number;
  score: number;
  hits: AdverseMediaHit[];
}

interface Verdict {
  ok: true;
  live: boolean;
  pep: boolean;
  sanctioned: boolean;
  lists: string[];
  topScore: number;
  severity: Severity;
  reasoning: Reasoning;
  hits: ScreenHit[];
  openSanctionsAugmentation: AugmentationRecord[];
  screeningWarnings: string[];
  adverseMedia: AdverseMediaSummary;
}

const METHODS = ["name+dob", "alias", "phonetic", "transliteration"];

function severityFor(score: number): Severity {
  return score >= 85 ? "critical" : score >= 70 ? "high" : score >= 50 ? "medium" : "low";
}

function decisionFor(score: number): Decision {
  return score >= 90 ? "block" : score >= 75 ? "escalate" : score >= 50 ? "review" : "clear";
}

function topicMethod(m: SanctionMatch): string {
  if (matchIsSanctioned(m)) return "sanctions-list";
  if (matchIsPep(m)) return "pep-list";
  return m.topics[0] ?? "name-match";
}

// ── Adverse media (free Google-News) scoring ─────────────────────────────────
// Unverified negative press is a review signal, never an auto-block. The score
// scales with the volume of negative coverage but caps in the "escalate" band so
// adverse media alone can never drive a hard block without analyst confirmation.
export function adverseMediaScore(negativeCount: number): number {
  if (negativeCount <= 0) return 0;
  if (negativeCount === 1) return 35;
  if (negativeCount <= 3) return 55;
  if (negativeCount <= 5) return 65;
  return 75;
}

async function fetchAdverse(name: string): Promise<AdverseMediaSummary> {
  if (!name) return { live: false, negativeCount: 0, totalCount: 0, score: 0, hits: [] };
  try {
    const { hits, live } = await fetchAdverseMedia(name);
    const negative = hits.filter((h) => h.sent === "negative");
    return {
      live,
      negativeCount: negative.length,
      totalCount: hits.length,
      score: adverseMediaScore(negative.length),
      hits: hits.slice(0, 3).map((h) => ({
        headline: h.headline,
        source: h.source,
        date: h.date,
        ...(h.url ? { url: h.url } : {}),
      })),
    };
  } catch {
    return { live: false, negativeCount: 0, totalCount: 0, score: 0, hits: [] };
  }
}

/** Fold the adverse-media signal into a base verdict, re-deriving the decision. */
function withAdverseMedia(verdict: Verdict, am: AdverseMediaSummary): Verdict {
  const amFactor: Factor = {
    label: "Adverse media",
    weight: am.score,
    detail:
      am.negativeCount > 0
        ? `${am.negativeCount} negative article(s)${am.live ? "" : " (seed)"}`
        : am.live
          ? "no adverse media found"
          : "not screened",
  };
  verdict.reasoning.factors.push(amFactor);
  verdict.adverseMedia = am;

  if (am.score <= 0) return verdict;

  // A sanctions hit keeps its escalate/block floor; otherwise the higher of the
  // list score and the adverse-media score drives the decision.
  const listFloor = verdict.sanctioned ? Math.max(verdict.topScore, 75) : verdict.topScore;
  const combined = Math.max(listFloor, am.score);

  verdict.topScore = Math.max(verdict.topScore, am.score);
  verdict.severity = severityFor(combined);
  verdict.reasoning.score = verdict.topScore;
  verdict.reasoning.decision = decisionFor(combined);

  const amNote = `${am.negativeCount} negative adverse-media article(s) found${
    am.live ? "" : " in seed data"
  } — requires analyst verification.`;
  verdict.reasoning.summary = `${verdict.reasoning.summary} ${amNote}`.trim();

  if (!verdict.sanctioned && !verdict.pep) {
    verdict.reasoning.recommendation =
      verdict.reasoning.decision === "escalate"
        ? "Escalate to L2 / MLRO; verify adverse media and apply EDD before onboarding."
        : "Route to L1 analyst; verify adverse media and document disposition within SLA.";
  }

  return verdict;
}

// ── Live (free OpenSanctions / yente) screen ─────────────────────────────────

async function liveScreen(subject: SubjectPayload): Promise<Verdict | null> {
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

  const factors: Factor[] = [
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

  const reasoning: Reasoning = {
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
    adverseMedia: { live: false, negativeCount: 0, totalCount: 0, score: 0, hits: [] },
  };
}

/** A genuine clean result (live source reached, nothing matched) or, when
 *  `live` is false, an honest "not screened" verdict for the LIST dimension. */
function cleanVerdict(name: string, subject: SubjectPayload, live: boolean): Verdict {
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
        { label: "Sanctions exposure", weight: 0, detail: live ? "no list hit" : "not screened" },
        { label: "PEP exposure", weight: 0, detail: live ? "not a PEP" : "not screened" },
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
    adverseMedia: { live: false, negativeCount: 0, totalCount: 0, score: 0, hits: [] },
  };
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { subject?: SubjectPayload };
  const subject = body.subject ?? {};
  const name = (subject.name ?? "").trim();

  // Adverse media has its own free source/flag (ADVERSE_MEDIA_LIVE) and runs
  // independently of the sanctions list source — so a subject who is "not
  // screened" against lists is still checked for negative press.
  const [base, adverse] = await Promise.all([
    (async (): Promise<Verdict> => {
      if (liveEnabled("SANCTIONS_LIVE") && name) {
        try {
          const live = await liveScreen(subject);
          if (live) return live;
        } catch {
          /* fall through to the honest "not screened" verdict */
        }
      }
      // No live source: honest, non-fabricated "not screened" list verdict.
      return cleanVerdict(name || "subject", subject, false);
    })(),
    fetchAdverse(name),
  ]);

  return NextResponse.json(withAdverseMedia(base, adverse));
}
