import { describe, it, expect, beforeEach } from "vitest";
import {
  rateLimit,
  rateLimitKey,
  resetRateLimits,
  type RateLimitResult,
} from "@/lib/auth/rate-limit";

describe("rate-limit (fixed window)", () => {
  beforeEach(() => resetRateLimits());

  it("allows up to the limit, then blocks", () => {
    const now = 1_000_000;
    let last: RateLimitResult | undefined;
    for (let i = 0; i < 3; i++) last = rateLimit("k", 3, 1000, now);
    expect(last!.allowed).toBe(true);
    const over = rateLimit("k", 3, 1000, now);
    expect(over.allowed).toBe(false);
    expect(over.remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    expect(rateLimit("k", 1, 1000, 0).allowed).toBe(true);
    expect(rateLimit("k", 1, 1000, 500).allowed).toBe(false);
    expect(rateLimit("k", 1, 1000, 1001).allowed).toBe(true);
  });

  it("derives a stable key from the actor (lower-cased) or ip", () => {
    const k = rateLimitKey(
      new Request("http://x/y", { headers: { "x-hawkeye-actor": "Ember" } }),
      "explain",
    );
    expect(k).toBe("explain:ember");
  });
});
