// ── Fixed-window rate limiter (in-memory) ────────────────────────────────────
// A real, server-side per-key ceiling for API routes. Process-local and
// dependency-free so it works offline and in tests; in a multi-instance
// production deployment this would be backed by a shared store (Redis/edge), but
// the enforcement contract — N requests per window, then 429 — is identical.

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Milliseconds until the current window resets. */
  resetMs: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Record a hit against `key` and report whether it is allowed. Defaults: 30
 * requests / 60s. `now` is injectable for deterministic tests.
 */
export function rateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000,
  now: number = Date.now(),
): RateLimitResult {
  const existing = buckets.get(key);
  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, limit, remaining: limit - 1, resetMs: windowMs };
  }
  existing.count += 1;
  const allowed = existing.count <= limit;
  return {
    allowed,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetMs: Math.max(0, existing.resetAt - now),
  };
}

/** Best-effort key for a request: authenticated actor if present, else client IP. */
export function rateLimitKey(req: Request, scope: string): string {
  const actor = (req.headers.get("x-hawkeye-actor") ?? "").trim().toLowerCase();
  const ip =
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  return `${scope}:${actor || ip}`;
}

/** Clear all buckets (tests / manual reset). */
export function resetRateLimits(): void {
  buckets.clear();
}
