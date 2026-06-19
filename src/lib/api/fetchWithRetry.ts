import { caughtErrorMessage } from "@/lib/client/error-utils";

export interface FetchJsonOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  /** Label used for console diagnostics on failure. */
  label?: string;
  /** Abort the request after this many ms. Defaults to 10s. */
  timeoutMs?: number;
}

export interface FetchJsonResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * Thin fetch wrapper that always resolves (never throws) with a discriminated
 * result. Parses JSON on success, applies an AbortController timeout, and logs
 * a labelled warning on failure so call sites can stay terse.
 */
export async function fetchJson<T = unknown>(
  url: string,
  opts: FetchJsonOptions = {},
): Promise<FetchJsonResult<T>> {
  const { method = "GET", headers, body, label, timeoutMs = 10_000 } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      ...(headers ? { headers } : {}),
      ...(body !== undefined ? { body } : {}),
      signal: controller.signal,
    });
    let data: T | undefined;
    try {
      data = (await res.json()) as T;
    } catch {
      data = undefined;
    }
    if (!res.ok) {
      const msg = `${label ?? "Request failed"} (HTTP ${res.status})`;
      console.warn(`[hawkeye] ${msg}`);
      return { ok: false, status: res.status, error: msg, ...(data !== undefined ? { data } : {}) };
    }
    return { ok: true, status: res.status, ...(data !== undefined ? { data } : {}) };
  } catch (err) {
    const msg = caughtErrorMessage(err, label ?? "Request failed");
    console.warn(`[hawkeye] ${label ?? "Request failed"}:`, msg);
    return { ok: false, status: 0, error: msg };
  } finally {
    clearTimeout(timer);
  }
}
