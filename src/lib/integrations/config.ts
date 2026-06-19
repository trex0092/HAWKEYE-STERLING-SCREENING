// ── Free integration gating ──────────────────────────────────────────────────
// The OpenSanctions (sanctions + PEP) and Google-News (adverse media) sources
// are free and need no API key, so they default ON in production deploys. They
// stay OFF in dev/test/CI so unit + e2e runs remain deterministic and offline.
// An explicit env value always wins: "true" forces on, "false" forces off.

export type FreeFlag = "SANCTIONS_LIVE" | "ADVERSE_MEDIA_LIVE";

export function liveEnabled(flag: FreeFlag): boolean {
  const v = process.env[flag];
  if (v === "true") return true;
  if (v === "false") return false;
  return process.env.NODE_ENV === "production";
}
