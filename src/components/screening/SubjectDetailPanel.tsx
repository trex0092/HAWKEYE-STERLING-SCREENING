"use client";

import { useState } from "react";
import type { CDDPosture, Subject, SubjectStatus } from "@/lib/types";
import type { Resolution, TriageHit } from "@/components/screening/HitTriagePanel";

export interface DetailTriageResolution {
  hitId: string;
  matchedName: string;
  sourceList: string;
  matchStrength: number;
  type: TriageHit["type"];
  citizenship?: string;
  dob?: string;
  listRef?: string;
  resolution: Resolution | "unspecified";
  resolvedAt?: string;
}

export interface SubjectDetailPanelProps {
  subject: Subject;
  onUpdate: (id: string, update: Partial<Subject>) => void;
  allSubjects: Subject[];
  onSelectSubject: (id: string) => void;
  triageResolutions?: DetailTriageResolution[];
}

const STATUSES: SubjectStatus[] = ["active", "review", "escalated", "cleared"];
const POSTURES: CDDPosture[] = ["SDD", "CDD", "EDD"];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-10 uppercase tracking-wide-3 text-ink-3">{label}</div>
      <div className="text-12 text-ink-1 break-words">{value}</div>
    </div>
  );
}

const RES_STYLE: Record<DetailTriageResolution["resolution"], string> = {
  true: "text-red",
  false: "text-green",
  escalate: "text-amber",
  pending: "text-ink-3",
  unspecified: "text-ink-3",
};

export function SubjectDetailPanel({
  subject,
  onUpdate,
  allSubjects,
  onSelectSubject,
  triageResolutions,
}: SubjectDetailPanelProps) {
  const [notes, setNotes] = useState(subject.notes ?? "");

  const related = allSubjects
    .filter((s) => s.id !== subject.id && s.jurisdiction === subject.jurisdiction)
    .slice(0, 5);

  const isSnoozed = Boolean(subject.snoozedUntil);

  return (
    <aside className="h-full overflow-y-auto border-l border-hair-2 bg-bg-panel">
      <div className="p-4 border-b border-hair-2">
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink-0 truncate">{subject.name}</h2>
            <div className="text-11 text-ink-3">
              {subject.id} · {subject.type}
            </div>
          </div>
          <span className="ml-auto text-11 font-mono text-ink-1">{subject.riskScore}/100</span>
        </div>
        {subject.aliases && subject.aliases.length > 0 && (
          <div className="mt-1 text-10 text-ink-3">aka {subject.aliases.join(", ")}</div>
        )}
        <div className="mt-2 h-1.5 rounded bg-bg-2 overflow-hidden">
          <div
            className={`h-full ${subject.riskScore >= 85 ? "bg-red" : subject.riskScore >= 60 ? "bg-amber" : "bg-green"}`}
            style={{ width: `${subject.riskScore}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-hair-2 grid grid-cols-2 gap-3">
        <div>
          <div className="text-10 uppercase tracking-wide-3 text-ink-3 mb-1">Status</div>
          <select
            value={subject.status}
            onChange={(e) => onUpdate(subject.id, { status: e.target.value as SubjectStatus })}
            className="w-full bg-bg-1 border border-hair-2 rounded px-2 py-1 text-11 text-ink-1"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-10 uppercase tracking-wide-3 text-ink-3 mb-1">CDD posture</div>
          <select
            value={subject.cddPosture}
            onChange={(e) => onUpdate(subject.id, { cddPosture: e.target.value as CDDPosture })}
            className="w-full bg-bg-1 border border-hair-2 rounded px-2 py-1 text-11 text-ink-1"
          >
            {POSTURES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          {isSnoozed ? (
            <button
              type="button"
              onClick={() => onUpdate(subject.id, { snoozedUntil: "", snoozeReason: "" })}
              className="text-11 px-2.5 py-1 rounded border border-hair-2 text-ink-1 hover:bg-bg-1"
            >
              Un-snooze
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                onUpdate(subject.id, {
                  snoozedUntil: new Date(Date.now() + 7 * 864e5).toISOString(),
                  snoozeReason: "manual snooze 7d",
                })
              }
              className="text-11 px-2.5 py-1 rounded border border-hair-2 text-ink-1 hover:bg-bg-1"
            >
              Snooze 7d
            </button>
          )}
          {subject.status !== "cleared" && (
            <button
              type="button"
              onClick={() => onUpdate(subject.id, { status: "cleared" })}
              className="text-11 px-2.5 py-1 rounded border border-green/30 text-green hover:bg-green-dim"
            >
              Mark cleared
            </button>
          )}
          {isSnoozed && (
            <span className="text-10 text-ink-3 ml-auto">
              snoozed → {new Date(subject.snoozedUntil as string).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Facts */}
      <div className="p-4 border-b border-hair-2 grid grid-cols-2 gap-3">
        <Field label="Country" value={subject.country} />
        <Field label="Jurisdiction" value={subject.jurisdiction} />
        <Field label="Entity type" value={subject.entityType} />
        <Field label="Most serious" value={subject.mostSerious} />
        <Field label="SLA notify" value={subject.slaNotify} />
        <Field label="Exposure (AED)" value={subject.exposureAED} />
        <Field label="Opened" value={subject.openedAgo} />
        <Field label="RCA screened" value={subject.rca.screened ? "yes" : "no"} />
        {subject.riskCategory && <Field label="Risk category" value={subject.riskCategory} />}
        {subject.vesselImo && <Field label="IMO" value={subject.vesselImo} />}
        {subject.vesselMmsi && <Field label="MMSI" value={subject.vesselMmsi} />}
        {subject.aircraftTail && <Field label="Tail" value={subject.aircraftTail} />}
        <div className="col-span-2">
          <Field label="Meta" value={subject.meta} />
        </div>
      </div>

      {/* Lists */}
      <div className="p-4 border-b border-hair-2">
        <div className="text-10 uppercase tracking-wide-3 text-ink-3 mb-1.5">List coverage</div>
        {subject.listCoverage.length === 0 ? (
          <span className="text-11 text-ink-3">No list hits.</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {subject.listCoverage.map((l) => (
              <span key={l} className="text-10 font-mono bg-bg-2 border border-hair-2 rounded px-1.5 py-0.5 text-ink-2">
                {l}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* PEP / adverse media */}
      {(subject.pep || subject.adverseMedia) && (
        <div className="p-4 border-b border-hair-2 space-y-2">
          {subject.pep && (
            <div className="bg-amber-dim border border-amber/30 rounded p-2">
              <div className="text-10 uppercase tracking-wide-3 text-amber font-semibold">PEP · {subject.pep.tier}</div>
              <div className="text-11 text-ink-1">{subject.pep.rationale}</div>
            </div>
          )}
          {subject.adverseMedia && (
            <div className="bg-orange/10 border border-orange/30 rounded p-2">
              <div className="text-10 uppercase tracking-wide-3 text-orange font-semibold">
                Adverse media · {subject.adverseMedia.score}
              </div>
              <div className="text-11 text-ink-1">
                {subject.adverseMedia.source} · {subject.adverseMedia.reference} · {subject.adverseMedia.date}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wallets */}
      {subject.walletAddresses && subject.walletAddresses.length > 0 && (
        <div className="p-4 border-b border-hair-2">
          <div className="text-10 uppercase tracking-wide-3 text-ink-3 mb-1.5">Wallets</div>
          <ul className="space-y-1">
            {subject.walletAddresses.map((w) => (
              <li key={w} className="text-10 font-mono text-ink-2 break-all">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Triage resolutions */}
      {triageResolutions && triageResolutions.length > 0 && (
        <div className="p-4 border-b border-hair-2">
          <div className="text-10 uppercase tracking-wide-3 text-ink-3 mb-1.5">Triage resolutions</div>
          <ul className="space-y-1.5">
            {triageResolutions.map((t) => (
              <li key={t.hitId} className="flex items-center gap-2 text-11">
                <span className="font-mono text-ink-3 text-10">{t.sourceList}</span>
                <span className="text-ink-1 truncate flex-1">{t.matchedName}</span>
                <span className="font-mono text-ink-3 text-10">{t.matchStrength}%</span>
                <span className={`text-10 font-semibold uppercase ${RES_STYLE[t.resolution]}`}>{t.resolution}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      <div className="p-4 border-b border-hair-2">
        <div className="text-10 uppercase tracking-wide-3 text-ink-3 mb-1.5">Notes</div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => onUpdate(subject.id, { notes })}
          placeholder="Add investigation notes…"
          className="w-full bg-bg-1 border border-hair-2 rounded px-2 py-1.5 text-11 text-ink-1 resize-y min-h-[60px] focus:outline-none focus:border-brand/60"
        />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="p-4">
          <div className="text-10 uppercase tracking-wide-3 text-ink-3 mb-1.5">
            Related ({subject.jurisdiction})
          </div>
          <ul className="space-y-1">
            {related.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelectSubject(r.id)}
                  className="w-full text-left text-11 text-ink-1 hover:text-brand flex items-center gap-2"
                >
                  <span className="font-mono text-10 text-ink-3">{r.badge}</span>
                  <span className="truncate">{r.name}</span>
                  <span className="ml-auto font-mono text-10 text-ink-3">{r.riskScore}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
