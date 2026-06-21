"use client";

import { useState } from "react";

export type Resolution = "true" | "false" | "escalate" | "pending";

export interface TriageHit {
  id: string;
  source: string;
  sourceList: string;
  name: string;
  matchedAlias?: string;
  matchStrength: number;
  type: "PEP" | "SAN" | "RCA" | "AM" | "LE" | "OB" | "OTHER";
  programs?: string[];
  listRef?: string;
  citizenship?: string;
  countryLocation?: string;
  enteredDate?: string;
  url?: string;
  dob?: string;
}

export interface HitTriagePanelProps {
  subjectId: string;
  subjectName: string;
  hits: TriageHit[];
  commonNameExpansion?: boolean;
  resolutions: Record<string, Resolution>;
  onResolve: (
    hitId: string,
    resolution: Resolution,
    reason: string,
    reasonCode?: string,
  ) => void | Promise<void>;
}

// Structured false-positive reason codes (J-06 / G-05). The server enforces one
// of these whenever a hit is resolved as a false positive.
const FP_REASON_CODES: Array<{ code: string; label: string }> = [
  { code: "DOB_MISMATCH", label: "Date of birth mismatch" },
  { code: "NAME_COMMON", label: "Common name / weak match" },
  { code: "JURIS_MISMATCH", label: "Jurisdiction mismatch" },
  { code: "DIFF_ENTITY", label: "Confirmed different entity" },
  { code: "STALE_RECORD", label: "Delisted / stale record" },
];

const TYPE_STYLE: Record<TriageHit["type"], string> = {
  SAN: "bg-red-dim text-red border-red/30",
  LE: "bg-red-dim text-red border-red/30",
  PEP: "bg-amber-dim text-amber border-amber/30",
  RCA: "bg-amber-dim text-amber border-amber/30",
  AM: "bg-orange/10 text-orange border-orange/30",
  OB: "bg-brand-dim text-brand border-brand/30",
  OTHER: "bg-bg-2 text-ink-2 border-hair-2",
};

const RESOLUTION_STYLE: Record<Resolution, string> = {
  true: "bg-red-dim text-red border-red/30",
  false: "bg-green-dim text-green border-green/30",
  escalate: "bg-amber-dim text-amber border-amber/30",
  pending: "bg-bg-2 text-ink-3 border-hair-2",
};

function strengthColor(n: number): string {
  if (n >= 85) return "bg-red";
  if (n >= 60) return "bg-amber";
  return "bg-green";
}

export function HitTriagePanel({
  subjectName,
  hits,
  commonNameExpansion,
  resolutions,
  onResolve,
}: HitTriagePanelProps) {
  const [fpOpenFor, setFpOpenFor] = useState<string | null>(null);

  return (
    <div className="bg-bg-panel border border-hair-2 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-hair-2">
        <span className="text-11 font-semibold uppercase tracking-wide-3 text-ink-2">
          ⚑ Hit triage
        </span>
        <span className="text-11 text-ink-3">· {subjectName}</span>
        <span className="ml-auto text-10 font-mono text-ink-3">
          {hits.length} candidate{hits.length === 1 ? "" : "s"}
        </span>
      </div>

      {commonNameExpansion && (
        <div className="px-4 py-2 bg-amber-dim border-b border-amber/30 text-10.5 text-amber">
          ⚠ Common-name expansion active — candidate set widened; expect more weak matches.
        </div>
      )}

      <ul className="divide-y divide-hair">
        {hits.map((hit) => {
          const res = resolutions[hit.id] ?? "pending";
          const fpOpen = fpOpenFor === hit.id;
          return (
            <li key={hit.id} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 text-10 font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${TYPE_STYLE[hit.type]}`}
                >
                  {hit.type}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-12 font-medium text-ink-0 truncate">{hit.name}</span>
                    <span className="text-10 font-mono text-ink-3">{hit.sourceList}</span>
                    {hit.listRef && (
                      <span className="text-10 font-mono text-ink-3">· {hit.listRef}</span>
                    )}
                    <span
                      className={`ml-auto text-10 font-bold uppercase px-1.5 py-0.5 rounded border ${RESOLUTION_STYLE[res]}`}
                    >
                      {res}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="w-28 h-1.5 rounded bg-bg-2 overflow-hidden">
                      <div
                        className={`h-full ${strengthColor(hit.matchStrength)}`}
                        style={{ width: `${Math.max(0, Math.min(100, hit.matchStrength))}%` }}
                      />
                    </div>
                    <span className="text-10 font-mono text-ink-3">{hit.matchStrength}% match</span>
                    {hit.matchedAlias && (
                      <span className="text-10 text-ink-3">alias: {hit.matchedAlias}</span>
                    )}
                    {hit.citizenship && (
                      <span className="text-10 text-ink-3">· {hit.citizenship}</span>
                    )}
                    {hit.programs && hit.programs.length > 0 && (
                      <span className="text-10 text-ink-3 truncate">
                        · {hit.programs.join(", ")}
                      </span>
                    )}
                    {hit.url && (
                      <a
                        href={hit.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-10 text-brand hover:underline"
                      >
                        source ↗
                      </a>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => void onResolve(hit.id, "true", "confirmed true match")}
                      className="text-10 px-2 py-1 rounded border border-red/30 text-red hover:bg-red-dim transition-colors"
                    >
                      True match
                    </button>
                    <button
                      type="button"
                      onClick={() => setFpOpenFor(fpOpen ? null : hit.id)}
                      className="text-10 px-2 py-1 rounded border border-green/30 text-green hover:bg-green-dim transition-colors"
                    >
                      False positive ▾
                    </button>
                    <button
                      type="button"
                      onClick={() => void onResolve(hit.id, "escalate", "escalated for L2 review")}
                      className="text-10 px-2 py-1 rounded border border-amber/30 text-amber hover:bg-amber-dim transition-colors"
                    >
                      Escalate
                    </button>
                  </div>

                  {fpOpen && (
                    <div className="mt-2 flex flex-wrap gap-1.5 bg-bg-1 border border-hair-2 rounded p-2">
                      <span className="text-10 text-ink-3 self-center mr-1">Reason code:</span>
                      {FP_REASON_CODES.map((rc) => (
                        <button
                          key={rc.code}
                          type="button"
                          onClick={() => {
                            void onResolve(hit.id, "false", rc.label, rc.code);
                            setFpOpenFor(null);
                          }}
                          className="text-10 px-2 py-1 rounded border border-hair-2 text-ink-1 hover:bg-bg-2 transition-colors"
                        >
                          {rc.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
