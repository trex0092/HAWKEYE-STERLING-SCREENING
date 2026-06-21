import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

// ── Audit-chain signing (HMAC-SHA256) ────────────────────────────────────────
// Real tamper detection for the audit trail: a payload is signed with a keyed
// HMAC, so a signature cannot be forged or recomputed without the server secret.
// POST signs a payload; PUT verifies a (payload, signature) pair in constant
// time. Set AUDIT_SIGNING_SECRET in production; offline falls back to a clearly
// labelled ephemeral dev key so the demo still runs (but can't be trusted).

function signingSecret(): string {
  return process.env.AUDIT_SIGNING_SECRET || "hawkeye-dev-insecure-audit-key";
}

function sign(payload: string): string {
  return createHmac("sha256", signingSecret()).update(payload).digest("hex");
}

/** Constant-time hex-signature comparison (never throws on bad input). */
function signaturesMatch(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

type AuditSignBody = { payload?: string };
type AuditVerifyBody = { payload?: string; signature?: string };

/** Sign an audit payload. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AuditSignBody;
  const payload = body.payload ?? "";
  const signature = sign(payload);
  return NextResponse.json({
    ok: true,
    signed: true,
    algo: "HMAC-SHA256",
    signature,
    // Short prefix kept for backwards compatibility with the prior mock.
    hashPrefix: signature.slice(0, 8),
    signedAt: new Date().toISOString(),
  });
}

/** Verify a previously signed (payload, signature) pair — genuine tamper check. */
export async function PUT(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AuditVerifyBody;
  const payload = body.payload ?? "";
  const signature = (body.signature ?? "").trim();
  if (!signature) {
    return NextResponse.json({ ok: false, error: "signature is required." }, { status: 422 });
  }
  const valid = signaturesMatch(sign(payload), signature);
  return NextResponse.json({ ok: true, valid });
}
