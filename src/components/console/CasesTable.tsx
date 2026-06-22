"use client";

import type { Subject } from "@/lib/types";
import { operatorById } from "@/lib/data/operators";
import { riskColor, slaColor, stageInfo } from "@/lib/console/derive";
import { EmptyState } from "./EmptyState";

const COLS = "84px minmax(150px,1.4fr) 134px 120px 64px 80px";

export function CasesTable({
  subjects,
  onOpen,
}: {
  subjects: Subject[];
  onOpen: (id: string) => void;
}) {
  const rows = subjects
    .filter((s) => s.status === "escalated" || s.status === "review")
    .sort((a, b) => b.riskScore - a.riskScore);

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No open cases"
        hint="Cases open automatically when a subject is escalated or moved to review."
        icon="⚖"
      />
    );
  }

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 11,
        background: "#0B0F18",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: COLS,
          alignItems: "center",
          gap: 9,
          padding: "9px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontSize: 10,
          letterSpacing: "0.13em",
          textTransform: "uppercase",
          color: "#646F86",
        }}
      >
        <span>Case</span>
        <span>Subject</span>
        <span>Stage</span>
        <span>Analyst</span>
        <span>Risk</span>
        <span>SLA</span>
      </div>
      {rows.map((s) => {
        const stage = stageInfo(s.riskScore);
        return (
          <div
            key={s.id}
            onClick={() => onOpen(s.id)}
            style={{
              display: "grid",
              gridTemplateColumns: COLS,
              alignItems: "center",
              gap: 9,
              padding: "11px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.03em",
                color: "rgb(var(--ac))",
                border: "1px solid rgba(var(--ac),0.3)",
                background: "rgba(var(--ac),0.08)",
                borderRadius: 4,
                padding: "2px 6px",
                width: "fit-content",
              }}
            >
              CS-{s.badge}
            </span>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#EDEFF4",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.name}
              </div>
              <div style={{ fontSize: 11, color: "#646F86" }}>{s.id}</div>
            </div>
            <div>
              <span
                style={{
                  display: "inline-flex",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  padding: "3px 9px",
                  borderRadius: 5,
                  color: stage.c,
                  background: stage.bg,
                  border: `1px solid ${stage.bd}`,
                }}
              >
                {stage.l}
              </span>
            </div>
            <span style={{ fontSize: 13, color: "#C9D2E2", letterSpacing: "0.02em" }}>
              {operatorById(s.analyst)?.name ?? "Unassigned"}
            </span>
            <span style={{ fontWeight: 700, fontSize: 16, color: riskColor(s.riskScore) }}>
              {s.riskScore}
            </span>
            <span style={{ fontSize: 11.5, color: slaColor(s.slaNotify) }}>{s.slaNotify}</span>
          </div>
        );
      })}
    </div>
  );
}
