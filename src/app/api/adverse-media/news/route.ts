import { NextResponse } from "next/server";
import { fetchAdverseMedia } from "@/lib/integrations/adverse-media";
import { anthropicConfigured } from "@/lib/ai/anthropic";

// Negative-news feed for the Adverse Media module. Live by default (dev + prod):
// primary source is Claude web search (lifetime coverage) when an ANTHROPIC_API_KEY
// is set, with GDELT + Google-News RSS as keyless fallbacks. Only the unit-test
// runner (or an explicit ADVERSE_MEDIA_LIVE=false) returns deterministic seed hits.

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const subject = new URL(req.url).searchParams.get("subject") ?? "";
  const { hits, live } = await fetchAdverseMedia(subject);
  // `configured` exposes whether the AI web-search key is present in THIS runtime, so an
  // empty result can be told apart from a missing key on the deploy (no secret is leaked).
  return NextResponse.json({ ok: true, live, configured: anthropicConfigured(), hits });
}
