"use client";

import type { SanctionSourceRow } from "@/lib/data/console-datasets";
import { EmptyState } from "./EmptyState";

export function SanctionsGrid({ sources }: { sources: SanctionSourceRow[] }) {
  if (sources.length === 0) {
    return (
      <EmptyState
        title="No watchlist sources"
        hint="Connect a sanctions source to feed the screening engine."
        icon="🛡"
      />
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
      {sources.map((x) => {
        const current = x.status === "current";
        const statusColor = current ? "#4FD6A0" : "#FFAE57";
        const statusBg = current ? "rgba(59,196,143,0.12)" : "rgba(255,148,52,0.12)";
        const statusBd = current ? "rgba(59,196,143,0.4)" : "rgba(255,148,52,0.4)";
        return (
          <div
            key={x.code}
            style={{
              position: "relative",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 11,
              background: "#0B0F18",
              padding: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 1,
                background: "linear-gradient(90deg,transparent,rgba(var(--ac),0.6),transparent)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "rgb(var(--ac))",
                  border: "1px solid rgba(var(--ac),0.3)",
                  background: "rgba(var(--ac),0.08)",
                  borderRadius: 4,
                  padding: "2px 7px",
                }}
              >
                {x.code}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  padding: "2px 8px",
                  borderRadius: 5,
                  color: statusColor,
                  background: statusBg,
                  border: `1px solid ${statusBd}`,
                  textTransform: "uppercase",
                }}
              >
                {x.status}
              </span>
            </div>
            <div
              style={{
                fontSize: 13.5,
                color: "#E3E7EF",
                lineHeight: 1.35,
                minHeight: 36,
                letterSpacing: "0.01em",
              }}
            >
              {x.name}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
              <span
                style={{ fontWeight: 700, fontSize: 24, color: "#fff", letterSpacing: "0.02em" }}
              >
                {x.entries}
              </span>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#646F86",
                }}
              >
                entries
              </span>
            </div>
            <div style={{ fontSize: 11, color: "#828DA4", marginTop: 7, letterSpacing: "0.03em" }}>
              Updated {x.updated}
            </div>
          </div>
        );
      })}
    </div>
  );
}
