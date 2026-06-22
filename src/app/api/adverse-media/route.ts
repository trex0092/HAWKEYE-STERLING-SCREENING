import { NextResponse } from "next/server";
import { fetchAdverseMedia } from "@/lib/integrations/adverse-media";
import { liveEnabled } from "@/lib/integrations/config";

// ── Adverse-media verdict ────────────────────────────────────────────────────
// Honest by design: the risk tier is derived ONLY from real coverage. When a
// free Google-News source is live, the tier reflects how much negative news is
// actually found. With no live source there is nothing to judge, so the verdict
// is "clear" with no headlines — never a fabricated tier from a name hash.

export const dynamic = "force-dynamic";
// Give the bounded Claude web-search fallback room under Netlify's 26s synchronous
// function cap (default is 10s); the GDELT-first path returns in ~1-2s.
export const maxDuration = 26;

type AdverseMediaBody = { subject?: string; limit?: number };

const TIERS = ["clear", "low", "medium", "high", "critical"] as const;
type Tier = (typeof TIERS)[number];

function tierForNegativeCount(n: number): Tier {
  if (n >= 5) return "critical";
  if (n >= 3) return "high";
  if (n >= 1) return "medium";
  return "clear";
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AdverseMediaBody;
  const name = body.subject ?? "";

  let riskTier: Tier = "clear";
  let live = false;
  let headlines: Awaited<ReturnType<typeof fetchAdverseMedia>>["hits"] | undefined;

  if (liveEnabled("ADVERSE_MEDIA_LIVE") && name && !name.toLowerCase().includes("test")) {
    const result = await fetchAdverseMedia(name);
    live = result.live;
    headlines = result.hits.slice(0, 5);
    if (live) {
      const negatives = result.hits.filter((h) => h.sent === "negative").length;
      riskTier = tierForNegativeCount(negatives);
    }
  }

  return NextResponse.json({
    ok: true,
    live,
    verdict: { riskTier, sarRecommended: riskTier === "critical" },
    ...(headlines ? { headlines } : {}),
  });
}
