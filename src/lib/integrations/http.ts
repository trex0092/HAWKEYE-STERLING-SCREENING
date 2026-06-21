// Server-side fetch helpers with a hard timeout. These never throw — they
// return a result object so integration routes can cleanly fall back to
// deterministic mocks when a service is unconfigured, unreachable or slow.

export interface TextResult {
  ok: boolean;
  status: number;
  text: string | null;
  error?: string;
}

export interface JsonResult {
  ok: boolean;
  status: number;
  data: unknown;
  error?: string;
}

// ── In-transit encryption guard (ENC) ────────────────────────────────────────
// Refuse to send a request over plaintext HTTP to a remote host, so subject data
// is never put on the wire unencrypted. Loopback (localhost / 127.0.0.1 / [::1])
// is exempt so a locally-run service (e.g. yente over http://localhost) keeps
// working. Non-parseable URLs are rejected. Returns true when the URL is safe to
// fetch.
export function isTransportSecure(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol === "https:") return true;
  if (parsed.protocol === "http:") {
    const host = parsed.hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
  }
  return false;
}

export async function fetchTextWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 6000,
): Promise<TextResult> {
  if (!isTransportSecure(url)) {
    return {
      ok: false,
      status: 0,
      text: null,
      error: "Insecure transport: refusing plaintext HTTP to a non-loopback host.",
    };
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      text: null,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJsonWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 6000,
): Promise<JsonResult> {
  const res = await fetchTextWithTimeout(url, init, timeoutMs);
  if (!res.ok || res.text === null) {
    return { ok: false, status: res.status, data: null, error: res.error };
  }
  try {
    return { ok: true, status: res.status, data: JSON.parse(res.text) };
  } catch (err) {
    return {
      ok: false,
      status: res.status,
      data: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
