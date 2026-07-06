import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchJson } from "@/lib/api/fetchWithRetry";

/** Build a minimal Response-like object for the global fetch mock. */
function res(status: number, body: unknown, opts: { badJson?: boolean } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (opts.badJson) throw new SyntaxError("Unexpected token");
      return body;
    },
  };
}

describe("fetchJson", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns ok + parsed data on a 2xx response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res(200, { hello: "world" })));
    const r = await fetchJson<{ hello: string }>("/api/x");
    expect(r).toEqual({ ok: true, status: 200, data: { hello: "world" } });
  });

  it("reports a non-2xx status with a labelled error but keeps the body", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res(404, { error: "nope" })));
    const r = await fetchJson("/api/missing", { label: "Load subject" });
    expect(r.ok).toBe(false);
    expect(r.status).toBe(404);
    expect(r.error).toBe("Load subject (HTTP 404)");
    expect(r.data).toEqual({ error: "nope" });
  });

  it("succeeds with no data when the body is not valid JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res(204, null, { badJson: true })));
    const r = await fetchJson("/api/empty");
    expect(r.ok).toBe(true);
    expect(r.status).toBe(204);
    expect("data" in r).toBe(false);
  });

  it("never throws on a network error — resolves ok:false, status:0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const r = await fetchJson("/api/down", { label: "Sync" });
    expect(r.ok).toBe(false);
    expect(r.status).toBe(0);
    expect(r.error).toBeTruthy();
  });

  it("forwards method, headers and body to fetch", async () => {
    const spy = vi.fn().mockResolvedValue(res(200, {}));
    vi.stubGlobal("fetch", spy);
    await fetchJson("/api/post", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ a: 1 }),
    });
    const [url, init] = spy.mock.calls[0]!;
    expect(url).toBe("/api/post");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "content-type": "application/json" });
    expect(init.body).toBe('{"a":1}');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("aborts when the request exceeds the timeout", async () => {
    vi.useFakeTimers();
    // fetch that only rejects once its abort signal fires.
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            init.signal.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      ),
    );
    const p = fetchJson("/api/slow", { timeoutMs: 50, label: "Slow" });
    await vi.advanceTimersByTimeAsync(51);
    const r = await p;
    expect(r.ok).toBe(false);
    expect(r.status).toBe(0);
    vi.useRealTimers();
  });
});
