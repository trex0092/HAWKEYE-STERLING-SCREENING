import { NextResponse } from "next/server";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

type AuditSignBody = { payload?: string };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AuditSignBody;
  const hashPrefix = hash(body.payload ?? "")
    .toString(16)
    .slice(0, 8);
  return NextResponse.json({ ok: true, signed: true, hashPrefix });
}
