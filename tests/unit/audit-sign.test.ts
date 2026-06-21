import { describe, it, expect } from "vitest";
import { POST, PUT } from "@/app/api/audit/sign/route";

function sign(payload: string): Promise<Response> {
  return POST(
    new Request("http://localhost/api/audit/sign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payload }),
    }),
  );
}

function verify(payload: string, signature: string): Promise<Response> {
  return PUT(
    new Request("http://localhost/api/audit/sign", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payload, signature }),
    }),
  );
}

describe("/api/audit/sign (HMAC-SHA256)", () => {
  it("signs a payload and verifies it back", async () => {
    const payload = '{"actor":"ember","action":"escalate","target":"HS-1"}';
    const signed = await (await sign(payload)).json();
    expect(signed.ok).toBe(true);
    expect(signed.algo).toBe("HMAC-SHA256");
    expect(typeof signed.signature).toBe("string");

    const verified = await (await verify(payload, signed.signature)).json();
    expect(verified.valid).toBe(true);
  });

  it("detects a tampered payload", async () => {
    const payload = '{"actor":"ember","action":"escalate","target":"HS-1"}';
    const signed = await (await sign(payload)).json();
    const tampered = payload.replace("escalate", "clear");

    const verified = await (await verify(tampered, signed.signature)).json();
    expect(verified.valid).toBe(false);
  });

  it("is deterministic for the same payload", async () => {
    const a = await (await sign("x")).json();
    const b = await (await sign("x")).json();
    expect(a.signature).toBe(b.signature);
  });

  it("rejects a verify request with no signature", async () => {
    const res = await verify("x", "");
    expect(res.status).toBe(422);
  });
});
