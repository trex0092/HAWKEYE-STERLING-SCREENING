"use client";

import type { AuditRow } from "@/lib/data/console-datasets";
import { EmptyState } from "./EmptyState";

export function AuditTimeline({ rows }: { rows: AuditRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        hint="Analyst actions and list syncs are logged here as they happen."
        icon="◷"
      />
    );
  }
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 11,
        background: "#0B0F18",
        padding: "6px 16px",
      }}
    >
      {rows.map((a, i) => (
        <div
          key={`${a.t}-${i}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            padding: "11px 0",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <span
            style={{
              fontSize: 11.5,
              color: "#646F86",
              letterSpacing: "0.04em",
              width: 64,
              flex: "none",
            }}
          >
            {a.t}
          </span>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              flex: "none",
              background: a.c,
              boxShadow: `0 0 8px ${a.c}`,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#E3E7EF",
              letterSpacing: "0.02em",
              flex: "none",
              minWidth: 90,
            }}
          >
            {a.actor}
          </span>
          <span style={{ fontSize: 13, color: "#A3ADC0", letterSpacing: "0.02em", flex: "none" }}>
            {a.action}
          </span>
          <span
            style={{
              fontSize: 12.5,
              color: "#646F86",
              letterSpacing: "0.02em",
              marginLeft: "auto",
              textAlign: "right",
            }}
          >
            {a.target}
          </span>
        </div>
      ))}
    </div>
  );
}
