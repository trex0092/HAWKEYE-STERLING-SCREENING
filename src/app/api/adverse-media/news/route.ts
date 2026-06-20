import { NextResponse } from "next/server";
import { fetchAdverseMedia } from "@/lib/integrations/adverse-media";

// Negative-news feed for the Adverse Media module. Live by default (dev + prod):
// pulls free Google News RSS for real coverage. Only the unit-test runner (or an
// explicit ADVERSE_MEDIA_LIVE=false) returns deterministic seed hits instead.

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const subject = new URL(req.url).searchParams.get("subject") ?? "";
  const { hits, live } = await fetchAdverseMedia(subject);
  return NextResponse.json({ ok: true, live, hits });
}
