import { NextResponse } from "next/server";
import { rateLimit, rateLimitKey } from "@/lib/auth/rate-limit";

// ── Decision explainability ──────────────────────────────────────────────────
// Turns a screening verdict into a plain-language explanation of WHY a subject
// landed at its score/decision: the band it falls in, the thresholds, and the
// factors ranked by contribution. Fully deterministic (no LLM) so the
// explanation is reproducible for an auditor. Rate-limited to curb abuse.

interface FactorInput {
  label?: string;
  weight?: number;
  detail?: string;
}

interface Body {
  name?: string;
  score?: number;
  decision?: string;
  factors?: FactorInput[];
}

// Mirrors the thresholds in /api/quick-screen (decisionFor). Kept in sync under
// change control — see docs/governance/six-layer-alignment.md (Layer 1).
function bandFor(score: number): { decision: string; threshold: string } {
  if (score >= 90) return { decision: "block", threshold: "score ≥ 90" };
  if (score >= 75) return { decision: "escalate", threshold: "75 ≤ score < 90" };
  if (score >= 50) return { decision: "review", threshold: "50 ≤ score < 75" };
  return { decision: "clear", threshold: "score < 50" };
}

export async function POST(req: Request) {
  const rl = rateLimit(rateLimitKey(req, "explain"), 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded; retry shortly." },
      { status: 429, headers: { "retry-after": String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  const body = (await req.json().catch(() => ({}))) as Body;
  const name = (body.name ?? "").trim() || "subject";
  const score =
    typeof body.score === "number" && Number.isFinite(body.score)
      ? Math.max(0, Math.min(100, Math.round(body.score)))
      : 0;

  const band = bandFor(score);
  const factors = (Array.isArray(body.factors) ? body.factors : [])
    .map((f) => ({
      label: String(f.label ?? "factor"),
      weight:
        typeof f.weight === "number" && Number.isFinite(f.weight)
          ? Math.max(0, Math.min(100, Math.round(f.weight)))
          : 0,
      detail: String(f.detail ?? ""),
    }))
    .sort((a, b) => b.weight - a.weight);

  const top = factors.slice(0, 3);
  const drivers = top.length
    ? top.map((f) => `${f.label} (${f.weight})`).join(", ")
    : "no contributing factors supplied";

  const explanation =
    `"${name}" scored ${score}, which falls in the "${band.decision}" band (${band.threshold}). ` +
    `The decision is driven primarily by: ${drivers}. ` +
    `This score is deterministic and reproducible; any AI enrichment is advisory only and ` +
    `never the sole basis for a hard outcome.`;

  return NextResponse.json({
    ok: true,
    name,
    score,
    decision: band.decision,
    threshold: band.threshold,
    topFactors: top,
    rankedFactors: factors,
    explanation,
    generatedAt: new Date().toISOString(),
  });
}
