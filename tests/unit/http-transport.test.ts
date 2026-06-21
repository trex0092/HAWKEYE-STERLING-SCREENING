import { describe, it, expect } from "vitest";
import { isTransportSecure, fetchTextWithTimeout } from "@/lib/integrations/http";

describe("isTransportSecure", () => {
  it("allows https", () => {
    expect(isTransportSecure("https://api.opensanctions.org")).toBe(true);
  });

  it("allows http only for loopback hosts", () => {
    expect(isTransportSecure("http://localhost:8000")).toBe(true);
    expect(isTransportSecure("http://127.0.0.1:8000")).toBe(true);
  });

  it("rejects plaintext http to a remote host", () => {
    expect(isTransportSecure("http://example.com")).toBe(false);
  });

  it("rejects non-http(s) and malformed urls", () => {
    expect(isTransportSecure("ftp://example.com")).toBe(false);
    expect(isTransportSecure("not a url")).toBe(false);
  });
});

describe("fetchTextWithTimeout transport guard", () => {
  it("refuses an insecure URL without hitting the network", async () => {
    const res = await fetchTextWithTimeout("http://example.com/data");
    expect(res.ok).toBe(false);
    expect(res.status).toBe(0);
    expect(res.error).toMatch(/Insecure transport/);
  });
});
