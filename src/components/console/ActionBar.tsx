"use client";

import type { CSSProperties } from "react";

// Module breadcrumb + primary actions. "+ New" opens intake; "⟳ Sync" pushes
// the active register to Asana via /api/asana/sync.

const ghost: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  cursor: "pointer",
  padding: "6px 12px",
  borderRadius: 6,
  background: "transparent",
  color: "#A3ADC0",
  border: "1px solid rgba(255,255,255,0.13)",
};

export function ActionBar({
  moduleTitle,
  moduleCrumb,
  syncing,
  onNew,
  onRun,
  onCsv,
  onSync,
}: {
  moduleTitle: string;
  moduleCrumb: string;
  syncing: boolean;
  onNew: () => void;
  onRun: () => void;
  onCsv: () => void;
  onSync: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(11,15,24,0.5)",
      }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#828DA4",
        }}
      >
        {moduleTitle}
      </span>
      <span style={{ color: "#39414F" }}>/</span>
      <span
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#A3ADC0",
        }}
      >
        {moduleCrumb}
      </span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7 }}>
        <button
          type="button"
          onClick={onNew}
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
            padding: "6px 13px",
            borderRadius: 6,
            background: "rgba(180,92,255,0.12)",
            color: "#C895FF",
            border: "1px solid rgba(180,92,255,0.55)",
            boxShadow: "0 0 13px rgba(180,92,255,0.25),inset 0 0 10px rgba(180,92,255,0.08)",
          }}
        >
          + New
        </button>
        <button type="button" onClick={onRun} style={ghost}>
          ▶ Run
        </button>
        <button type="button" onClick={onCsv} style={ghost}>
          ⭳ CSV
        </button>
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          style={{ ...ghost, opacity: syncing ? 0.6 : 1 }}
        >
          {syncing ? "⟳ Syncing…" : "⟳ Sync"}
        </button>
      </div>
    </div>
  );
}
