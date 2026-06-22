"use client";

import type { MediaHit } from "@/lib/data/console-datasets";
import { sentInfo } from "@/lib/console/derive";
import { EmptyState } from "./EmptyState";

export function MediaFeed({ hits }: { hits: MediaHit[] }) {
  if (hits.length === 0) {
    return (
      <EmptyState
        title="No adverse-media hits"
        hint="Negative-news results appear here once a subject is screened."
        icon="📰"
      />
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {hits.map((m, i) => {
        const tone = sentInfo(m.sent);
        return (
          <div
            key={`${m.headline}-${i}`}
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: 13,
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 11,
              background: "#0B0F18",
              padding: "13px 15px",
            }}
          >
            <div
              style={{
                width: 3,
                borderRadius: 99,
                background: tone.c,
                flex: "none",
                boxShadow: `0 0 8px ${tone.bg}`,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#EDEFF4",
                  letterSpacing: "0.01em",
                  lineHeight: 1.35,
                }}
              >
                {m.headline}
              </div>
              <div
                style={{ fontSize: 11.5, color: "#828DA4", marginTop: 4, letterSpacing: "0.03em" }}
              >
                {m.subject} · {m.source}
                {m.date ? ` · ${m.date}` : ""}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 6,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: 5,
                  color: tone.c,
                  background: tone.bg,
                  border: `1px solid ${tone.bd}`,
                }}
              >
                {m.sent}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  letterSpacing: "0.06em",
                  color: "#A3ADC0",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 5,
                  padding: "2px 8px",
                }}
              >
                {m.cat}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
