"use client";

import type { Subject, SubjectStatus, CDDPosture } from "@/lib/types";
import type { MediaHit } from "@/lib/data/console-datasets";
import { OPERATORS } from "@/lib/data/operators";
import { cddTone, listChip, riskColor, sentInfo, slaColor, statusTone } from "@/lib/console/derive";

const STATUS_OPTS: SubjectStatus[] = ["active", "review", "escalated", "cleared"];
const CDD_OPTS: CDDPosture[] = ["SDD", "CDD", "EDD"];

// Real sanctions list codes (vs. advisory lists) used to flag a sanctions hit.
const SANCTION_LISTS = new Set(["OFAC", "UN", "EU", "UK", "EOCN", "INTERPOL"]);

function seriousColor(s: string): string {
  if (s === "critical") return "#FF6B6B";
  if (s === "high") return "#FF9F45";
  if (s === "medium") return "#E0B341";
  if (s === "low") return "#4FD6A0";
  return "#A3ADC0";
}

const sectionTop = { borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 13 } as const;
const labelCap = {
  fontSize: 9.5,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#646F86",
} as const;

export function SubjectDetail({
  subject,
  related,
  onReassign,
  onStatus,
  onCdd,
  onSnooze,
  onClear,
  onNotes,
  onSelectRelated,
  adverseMediaHeadlines,
  screeningHits,
}: {
  subject: Subject;
  related: Subject[];
  adverseMediaHeadlines?: MediaHit[];
  screeningHits?: { name: string; list: string; score: number; programs?: string[] }[];
  onReassign: (analystId: string) => void;
  onStatus: (s: SubjectStatus) => void;
  onCdd: (c: CDDPosture) => void;
  onSnooze: () => void;
  onClear: () => void;
  onNotes: (text: string) => void;
  onSelectRelated: (id: string) => void;
}) {
  const lists = subject.listCoverage.length ? subject.listCoverage : ["—"];
  const sanctionHit = subject.listCoverage.some((l) => SANCTION_LISTS.has(l));
  const isPep = Boolean(subject.pep);
  const fields: { k: string; v: string; c?: string }[] = [
    { k: "Country", v: subject.country },
    { k: "Jurisdiction", v: subject.jurisdiction },
    { k: "Entity type", v: subject.entityType },
    { k: "Most serious", v: subject.mostSerious, c: seriousColor(subject.mostSerious) },
    { k: "SLA notify", v: subject.slaNotify, c: slaColor(subject.slaNotify) },
    { k: "Exposure (AED)", v: subject.exposureAED },
    { k: "Opened", v: subject.openedAgo },
    { k: "RCA screened", v: subject.rca.screened ? "Yes" : "No" },
    {
      k: "PEP",
      v: isPep ? (subject.pep?.tier ?? "Yes") : "No",
      ...(isPep ? { c: "#FFB169" } : {}),
    },
    { k: "Risk category", v: subject.riskCategory ?? "—" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      <div>
        <div style={{ ...labelCap, marginBottom: 8, letterSpacing: "0.16em" }}>
          Reassign Analyst
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {OPERATORS.length === 0 && (
            <span style={{ fontSize: 12, color: "#646F86", letterSpacing: "0.03em" }}>
              No analysts configured.
            </span>
          )}
          {OPERATORS.map((o) => {
            const on = subject.analyst === o.id;
            return (
              <button
                key={o.id}
                type="button"
                title={o.name}
                onClick={() => onReassign(o.id)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 9,
                  overflow: "hidden",
                  cursor: "pointer",
                  flex: "none",
                  padding: 0,
                  background: "#070A11",
                  border: `2px solid rgba(${o.ac},${on ? 0.9 : 0.4})`,
                  boxShadow: on ? `0 0 13px rgba(${o.ac},0.6)` : "none",
                  opacity: on ? 1 : 0.5,
                  filter: on ? "none" : "grayscale(0.45)",
                  transition: "all .2s",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundImage: `url('${o.img}')`,
                    backgroundSize: "cover",
                    backgroundPosition: o.pos,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ ...sectionTop, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span
              style={{
                fontSize: 10.5,
                letterSpacing: "0.04em",
                color: "rgb(var(--ac))",
                border: "1px solid rgba(var(--ac),0.3)",
                background: "rgba(var(--ac),0.08)",
                borderRadius: 4,
                padding: "2px 6px",
              }}
            >
              {subject.id}
            </span>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "#828DA4",
              }}
            >
              {subject.type}
            </span>
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 23,
              color: "#fff",
              letterSpacing: "0.01em",
              lineHeight: 1.1,
            }}
          >
            {subject.name}
          </div>
          <div style={{ fontSize: 11.5, color: "#646F86", marginTop: 3, letterSpacing: "0.03em" }}>
            aka {subject.aliases?.length ? subject.aliases.join(", ") : "—"}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 34,
              lineHeight: 1,
              letterSpacing: "0.02em",
              color: riskColor(subject.riskScore),
            }}
          >
            {subject.riskScore}
          </div>
          <div style={{ ...labelCap, marginTop: 2, letterSpacing: "0.12em" }}>/100 risk</div>
        </div>
      </div>

      {(sanctionHit || isPep) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {sanctionHit && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "#FF8A8A",
                background: "rgba(255,87,87,0.12)",
                border: "1px solid rgba(255,87,87,0.45)",
                borderRadius: 5,
                padding: "3px 9px",
              }}
            >
              ⚑ Sanctions match
            </span>
          )}
          {isPep && (
            <span
              title={subject.pep?.rationale}
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "#FFB169",
                background: "rgba(255,148,52,0.12)",
                border: "1px solid rgba(255,148,52,0.45)",
                borderRadius: 5,
                padding: "3px 9px",
              }}
            >
              ★ PEP{subject.pep?.tier ? ` · ${subject.pep.tier}` : ""}
            </span>
          )}
        </div>
      )}

      <div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#828DA4",
            marginBottom: 7,
          }}
        >
          Status
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {STATUS_OPTS.map((s) => {
            const on = subject.status === s;
            const t = statusTone(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => onStatus(s)}
                style={{
                  flex: 1,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  padding: "6px 4px",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: on ? t.c : "#A3ADC0",
                  background: on ? t.bg : "transparent",
                  border: `1px solid ${on ? t.bd : "rgba(255,255,255,0.13)"}`,
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#828DA4",
            marginBottom: 7,
          }}
        >
          CDD Posture
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {CDD_OPTS.map((c) => {
            const on = subject.cddPosture === c;
            const t = cddTone(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => onCdd(c)}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  padding: "6px 15px",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: on ? t.c : "#A3ADC0",
                  background: on ? t.bg : "transparent",
                  border: `1px solid ${on ? t.bd : "rgba(255,255,255,0.13)"}`,
                }}
              >
                {c}
              </button>
            );
          })}
          <div style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            <button
              type="button"
              onClick={onSnooze}
              style={{
                fontSize: 10.5,
                letterSpacing: "0.05em",
                color: "#A3ADC0",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.13)",
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Snooze 7d
            </button>
            <button
              type="button"
              onClick={onClear}
              style={{
                fontSize: 10.5,
                letterSpacing: "0.05em",
                color: "#4FD6A0",
                background: "rgba(59,196,143,0.1)",
                border: "1px solid rgba(59,196,143,0.4)",
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Mark cleared
            </button>
          </div>
        </div>
      </div>

      <div style={sectionTop}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px 18px" }}>
          {fields.map((f) => (
            <div key={f.k}>
              <div style={{ ...labelCap, marginBottom: 3 }}>{f.k}</div>
              <div style={{ fontSize: 13, color: f.c ?? "#DCE1EC", letterSpacing: "0.02em" }}>
                {f.v}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={sectionTop}>
        <div style={{ ...labelCap, marginBottom: 5 }}>List intelligence</div>
        <div
          style={{
            fontSize: 12.5,
            color: "#C9D2E2",
            letterSpacing: "0.02em",
            marginBottom: 9,
            lineHeight: 1.5,
          }}
        >
          {subject.meta}
        </div>
        {isPep && subject.pep?.rationale && (
          <div
            style={{
              fontSize: 11.5,
              color: "#FFB169",
              letterSpacing: "0.02em",
              marginBottom: 9,
              lineHeight: 1.5,
            }}
          >
            PEP: {subject.pep.rationale}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {lists.map((l, i) => {
            const c = listChip(l);
            return (
              <span
                key={`${l}-${i}`}
                style={{
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  color: c.c,
                  background: c.bg,
                  border: `1px solid ${c.bd}`,
                  borderRadius: 5,
                  padding: "2px 7px",
                }}
              >
                {c.t}
              </span>
            );
          })}
        </div>
      </div>

      {screeningHits && screeningHits.length > 0 && (
        <div style={sectionTop}>
          <div style={{ ...labelCap, marginBottom: 8 }}>Sanctions / PEP matches</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {screeningHits.map((h, i) => {
              const c = listChip(h.list);
              return (
                <div key={`${h.name}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 9.5,
                      letterSpacing: "0.06em",
                      color: c.c,
                      background: c.bg,
                      border: `1px solid ${c.bd}`,
                      borderRadius: 5,
                      padding: "2px 7px",
                      flexShrink: 0,
                    }}
                  >
                    {c.t}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 12.5,
                      color: "#DCE1EC",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {h.name}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: riskColor(h.score), flexShrink: 0 }}>
                    {h.score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {adverseMediaHeadlines && adverseMediaHeadlines.length > 0 && (
        <div style={sectionTop}>
          <div style={{ ...labelCap, marginBottom: 8 }}>Adverse Media</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {adverseMediaHeadlines.slice(0, 6).map((h, i) => {
              const tone = sentInfo(h.sent);
              const srcLine = `${h.source}${h.date ? ` · ${h.date}` : ""}`;
              return (
                <div
                  key={`${h.headline}-${i}`}
                  style={{
                    display: "flex",
                    gap: 9,
                    paddingBottom: 8,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span style={{ width: 3, borderRadius: 99, background: tone.c, flex: "none" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {h.url ? (
                      <a
                        href={h.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E3E7EF", lineHeight: 1.4 }}>
                          {h.headline}
                        </div>
                        <div style={{ fontSize: 11, color: "#828DA4", marginTop: 2, letterSpacing: "0.02em" }}>
                          {srcLine}
                        </div>
                      </a>
                    ) : (
                      <>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E3E7EF", lineHeight: 1.4 }}>
                          {h.headline}
                        </div>
                        <div style={{ fontSize: 11, color: "#828DA4", marginTop: 2, letterSpacing: "0.02em" }}>
                          {srcLine}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div style={{ ...labelCap, marginBottom: 6 }}>Notes</div>
        <textarea
          value={subject.notes ?? ""}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="Add an analyst note…"
          style={{
            width: "100%",
            minHeight: 54,
            resize: "vertical",
            background: "#0B101A",
            border: "1px solid rgba(255,255,255,0.11)",
            borderRadius: 7,
            color: "#EDEFF4",
            padding: "8px 10px",
            fontSize: 12.5,
            fontFamily: "'Arial Narrow',sans-serif",
            outline: "none",
            lineHeight: 1.5,
          }}
        />
      </div>

      {related.length > 0 && (
        <div style={sectionTop}>
          <div style={{ ...labelCap, marginBottom: 8 }}>Related Subjects</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {related.map((r) => (
              <div
                key={r.id}
                onClick={() => onSelectRelated(r.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "7px 9px",
                  borderRadius: 7,
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: "#828DA4",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    padding: "1px 5px",
                  }}
                >
                  {r.id}
                </span>
                <span style={{ flex: 1, fontSize: 13, color: "#DCE1EC", letterSpacing: "0.02em" }}>
                  {r.name}
                </span>
                <span style={{ fontWeight: 700, fontSize: 14, color: riskColor(r.riskScore) }}>
                  {r.riskScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
