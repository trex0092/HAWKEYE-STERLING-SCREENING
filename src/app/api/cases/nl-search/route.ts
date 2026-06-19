import { NextResponse } from "next/server";
import type { CDDPosture, EntityType, SubjectStatus } from "@/lib/types";

/**
 * Structured filter the natural-language search resolves a query into. Exported
 * because the screening page imports this type to apply the same filter locally.
 */
export type NlSearchFilter = {
  riskScoreMin?: number;
  riskScoreMax?: number;
  pepFlag?: boolean;
  sanctionsHit?: boolean;
  minListCount?: number;
  slaBreach?: boolean;
  statuses?: SubjectStatus[];
  cddPostures?: CDDPosture[];
  entityTypes?: EntityType[];
  countries?: string[];
  nameContains?: string[];
  metaContains?: string[];
};

interface SlimSubject {
  id: string;
  name: string;
  meta: string;
  country: string;
  jurisdiction: string;
  entityType: string;
  riskScore: number;
  cddPosture: string;
  listCoverage: string[];
  status: string;
  pep: unknown;
  adverseMedia: unknown;
  aliases: string[];
}

interface NlSearchBody {
  query?: string;
  subjects?: SlimSubject[];
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as NlSearchBody;
  const query = (body.query ?? "").trim();
  const subjects = Array.isArray(body.subjects) ? body.subjects : [];
  const q = query.toLowerCase();

  // Deterministic keyword rules — no model, pure string logic so the route is
  // fully offline and reproducible.
  const rules: Array<{ test: boolean; why: string; pred: (s: SlimSubject) => boolean }> = [
    { test: /\bsanction|sdn|ofac|listed\b/.test(q), why: "sanctions-list exposure", pred: (s) => s.listCoverage.length > 0 },
    { test: /\bpep|political\b/.test(q), why: "politically exposed", pred: (s) => s.pep != null },
    { test: /\bcritical|high[- ]?risk\b/.test(q), why: "risk ≥ 85", pred: (s) => s.riskScore >= 85 },
    { test: /\bedd|enhanced\b/.test(q), why: "EDD posture", pred: (s) => s.cddPosture === "EDD" },
    { test: /\bvessel|ship|maritime\b/.test(q), why: "vessel entity", pred: (s) => s.entityType === "vessel" },
    { test: /\baircraft|jet|tail\b/.test(q), why: "aircraft entity", pred: (s) => s.entityType === "aircraft" },
    { test: /\bcrypto|wallet|chain\b/.test(q), why: "crypto exposure", pred: (s) => /wallet|crypto|mixer|chain/.test(s.meta.toLowerCase()) || s.entityType === "other" },
    { test: /\bcleared|closed|resolved\b/.test(q), why: "cleared", pred: (s) => s.status === "cleared" },
    { test: /\badverse|media\b/.test(q), why: "adverse media", pred: (s) => s.adverseMedia != null },
  ];

  const active = rules.filter((r) => r.test);

  // A bare number in the query becomes a risk floor.
  const numMatch = q.match(/\b(\d{1,3})\b/);
  const riskFloor = numMatch && numMatch[1] !== undefined ? Number.parseInt(numMatch[1], 10) : null;

  // Free-text tokens (excluding stopwords) become name/meta/country substrings.
  const STOP = new Set(["the", "and", "with", "show", "all", "find", "list", "risk", "subjects", "subject", "over", "above", "score"]);
  const tokens = q.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 2 && !STOP.has(t) && !/^\d+$/.test(t));

  function matches(s: SlimSubject): boolean {
    for (const r of active) {
      if (!r.pred(s)) return false;
    }
    if (riskFloor !== null && s.riskScore < riskFloor) return false;
    if (active.length === 0 && riskFloor === null && tokens.length > 0) {
      const hay = `${s.name} ${s.meta} ${s.country} ${s.jurisdiction} ${s.aliases.join(" ")}`.toLowerCase();
      return tokens.some((t) => hay.includes(t));
    }
    return true;
  }

  const matchIds = subjects.filter(matches).map((s) => s.id);

  const why = [
    ...active.map((r) => r.why),
    ...(riskFloor !== null ? [`risk ≥ ${riskFloor}`] : []),
    ...(active.length === 0 && riskFloor === null && tokens.length > 0 ? [`text match: ${tokens.join(", ")}`] : []),
  ];
  const hadSignal = why.length > 0;
  const confidence = hadSignal ? Math.min(0.95, 0.6 + active.length * 0.1) : 0.35;
  const interpretation = hadSignal
    ? `Subjects matching ${why.join(" + ")}`
    : query
      ? `Best-effort text search for "${query}"`
      : "All subjects";

  return NextResponse.json({
    ok: true,
    matchIds,
    interpretation,
    confidence,
    reasoning: hadSignal
      ? `Resolved ${active.length} rule(s)${riskFloor !== null ? " + risk floor" : ""}; ${matchIds.length} of ${subjects.length} subjects matched.`
      : `No structured signal detected; fell back to substring search across name/meta/country.`,
  });
}
