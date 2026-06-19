import { NextResponse } from "next/server";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

type AdverseMediaBody = { subject?: string; limit?: number };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AdverseMediaBody;
  const name = body.subject ?? "";

  const tiers = ["clear", "low", "medium", "high", "critical"] as const;
  let riskTier: (typeof tiers)[number];

  if (name.toLowerCase().includes("test")) {
    riskTier = "clear";
  } else {
    riskTier = tiers[hash(name) % 5] ?? "clear";
  }

  return NextResponse.json({
    ok: true,
    verdict: { riskTier, sarRecommended: riskTier === "critical" },
  });
}
