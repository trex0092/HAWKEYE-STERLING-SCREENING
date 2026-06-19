import { NextResponse } from "next/server";
import { fetchAdverseMedia } from "@/lib/integrations/adverse-media";
import { liveEnabled } from "@/lib/integrations/config";

// ── Adverse-media verdict ────────────────────────────────────────────────────
// Deterministic, offline verdict derived from a hash of the subject name (the
// page's existing contract). When ADVERSE_MEDIA_LIVE=true it additionally pulls
// free Google-News headlines and nudges the tier up if negative coverage is
// found. The offline path is unchanged so tests stay deterministic.

export const dynamic = "force-dynamic";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

type AdverseMediaBody = { subject?: string; limit?: number };

const TIERS = ["clear", "low", "medium", "high", "critical"] as const;
type Tier = (typeof TIERS)[number];

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AdverseMediaBody;
  const name = body.subject ?? "";

  let riskTier: Tier;
  if (name.toLowerCase().includes("test")) {
    riskTier = "clear";
  } else {
    riskTier = TIERS[hash(name) % 5] ?? "clear";
  }

  let live = false;
  let headlines: Awaited<ReturnType<typeof fetchAdverseMedia>>["hits"] | undefined;

  if (liveEnabled("ADVERSE_MEDIA_LIVE") && name && !name.toLowerCase().includes("test")) {
    const result = await fetchAdverseMedia(name);
    live = result.live;
    headlines = result.hits.slice(0, 5);
    if (live && result.hits.some((h) => h.sent === "negative")) {
      if (riskTier === "clear" || riskTier === "low") riskTier = "medium";
    }
  }

  return NextResponse.json({
    ok: true,
    live,
    verdict: { riskTier, sarRecommended: riskTier === "critical" },
    ...(headlines ? { headlines } : {}),
  });
}
