import { NextResponse } from "next/server";
import { fetchAdverseMedia } from "@/lib/integrations/adverse-media";

// Negative-news feed for the Adverse Media module. Pulls free Google News RSS
// when ADVERSE_MEDIA_LIVE=true, otherwise returns deterministic seed hits.

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const subject = new URL(req.url).searchParams.get("subject") ?? "";
  const { hits, live } = await fetchAdverseMedia(subject);
  return NextResponse.json({ ok: true, live, hits });
}
