// ── Data masking (field-level PII redaction) ─────────────────────────────────
// Obfuscates sensitive values for display or export while leaving enough to be
// useful to a reviewer (a name initial, an id's last 4). Distinct from
// tokenization (`tokenize.ts`, which yields an opaque, correlatable token) and
// from prompt hashing (`llm-log.ts`). Pure and offline-safe: no I/O, never
// throws, deterministic.

/** Mask a personal name to initials: "John Smith" → "J·· S··". Empty → "". */
export function maskName(name: string): string {
  const v = (name ?? "").trim();
  if (!v) return "";
  return v
    .split(/\s+/)
    .map((part) => {
      const first = [...part][0] ?? "";
      const rest = [...part]
        .slice(1)
        .map(() => "·")
        .join("");
      return first + rest;
    })
    .join(" ");
}

/** Mask an identifier, keeping the last `keep` chars: "AB1234567" → "·····4567". */
export function maskId(id: string, keep = 4): string {
  const v = (id ?? "").trim();
  if (!v) return "";
  if (v.length <= keep) return "·".repeat(v.length);
  return "·".repeat(v.length - keep) + v.slice(-keep);
}

/** Mask an email: "jane.doe@acme.com" → "j······@acme.com". */
export function maskEmail(email: string): string {
  const v = (email ?? "").trim();
  const at = v.indexOf("@");
  if (at <= 0) return maskId(v, 0);
  const local = v.slice(0, at);
  const domain = v.slice(at);
  const first = [...local][0] ?? "";
  return first + "·".repeat(Math.max(1, local.length - 1)) + domain;
}

/** Heuristically mask a free-text field: treat it as an email, then a name. */
export function maskValue(value: string): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  return v.includes("@") ? maskEmail(v) : maskName(v);
}
