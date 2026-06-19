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

export async function fetchTextWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 6000,
): Promise<TextResult> {
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
