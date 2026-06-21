// ── Tokenization (deterministic, salted) ─────────────────────────────────────
// Replaces a sensitive value with a stable, opaque token so it can be carried
// through logs/analytics without exposing the underlying data — yet the same
// input always yields the same token, so records stay correlatable. The mapping
// is one-way (no detokenize): this is for de-identified observability, not
// reversible storage. Pure JS (FNV-1a, no crypto dependency) so it runs the same
// on the server, in tests and in the browser.

const FNV_PRIME = 0x01000193;
const OFFSET_BASIS = 0x811c9dc5;

/** FNV-1a 32-bit over a string → unsigned 32-bit int. */
function fnv1a(input: string): number {
  let hash = OFFSET_BASIS;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return hash >>> 0;
}

function hex8(n: number): string {
  return (n >>> 0).toString(16).padStart(8, "0");
}

/**
 * Tokenize a value into `tok_<16 hex>`. The salt (e.g. a per-tenant secret)
 * scopes tokens so the same value tokenizes differently across contexts. Two
 * independent FNV passes give 64 bits of fingerprint. Empty input → "".
 */
export function tokenize(value: string, salt = ""): string {
  const v = value ?? "";
  if (v === "") return "";
  const a = fnv1a(`${salt}|${v}`);
  const b = fnv1a(`${v}|${salt}|${a}`);
  return `tok_${hex8(a)}${hex8(b)}`;
}

/** Tokenize a list of values with a shared salt. */
export function tokenizeAll(values: string[], salt = ""): string[] {
  return (values ?? []).map((v) => tokenize(v, salt));
}
