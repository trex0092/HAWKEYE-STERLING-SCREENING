import { NextResponse } from "next/server";
import { screenName } from "@/lib/integrations/sanctions";

// Name-match a subject against free/open sanctions data (OpenSanctions) when
// SANCTIONS_LIVE=true; offline it returns an empty deterministic result so the
// caller can fall back to the local screening mock.

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = (body.name ?? "").trim();
  const matches = await screenName(name);

  if (matches === null) {
    return NextResponse.json({ ok: true, live: false, name, matches: [] });
  }
  return NextResponse.json({ ok: true, live: true, name, matches });
}
