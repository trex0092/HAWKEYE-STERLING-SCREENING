import { NextResponse } from "next/server";
import { fetchSanctionSources } from "@/lib/integrations/sanctions";

// Watchlist sources for the Sanctions module. Reads live metadata from the free
// OpenSanctions data index when SANCTIONS_LIVE=true, else deterministic seeds.

export const dynamic = "force-dynamic";

export async function GET() {
  const { sources, live } = await fetchSanctionSources();
  return NextResponse.json({ ok: true, live, sources });
}
