"use client";

import { useState } from "react";
import type { CDDPosture, EntityType } from "@/lib/types";

export interface ScreeningCheckTypes {
  rca: boolean;
  adverseMedia: boolean;
}

export interface ScreeningFormData {
  name: string;
  entityType: EntityType;
  alternateNames: string[];
  caseId: string;
  checkTypes: ScreeningCheckTypes;
  ongoingScreening: boolean;
  citizenship?: string;
  countryLocation?: string;
  registeredCountry?: string;
  group?: string;
  riskCategory?: string;
  relationshipType?: string;
  cddPosture?: CDDPosture;
  notes?: string;
  walletAddresses?: string[];
  vesselImo?: string;
  vesselMmsi?: string;
  aircraftTail?: string;
}

export interface NewScreeningFormProps {
  suggestedCaseId: string;
  onScreen: (data: ScreeningFormData) => void;
  onSave: (data: ScreeningFormData) => void;
  onCancel: () => void;
}

const ENTITY_TYPES: Array<{ value: EntityType; label: string }> = [
  { value: "individual", label: "Individual" },
  { value: "organisation", label: "Organisation" },
  { value: "vessel", label: "Vessel" },
  { value: "aircraft", label: "Aircraft" },
  { value: "other", label: "Other" },
];

const inputCls =
  "w-full bg-bg-1 border border-hair-2 rounded px-2.5 py-1.5 text-12 text-ink-0 placeholder:text-ink-3 focus:outline-none focus:border-brand/60";
const labelCls = "block text-10 uppercase tracking-wide-3 text-ink-3 mb-1";

function splitList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function NewScreeningForm({
  suggestedCaseId,
  onScreen,
  onSave,
  onCancel,
}: NewScreeningFormProps) {
  const [name, setName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("individual");
  const [altNames, setAltNames] = useState("");
  const [caseId, setCaseId] = useState(suggestedCaseId);
  const [citizenship, setCitizenship] = useState("");
  const [countryLocation, setCountryLocation] = useState("");
  const [registeredCountry, setRegisteredCountry] = useState("");
  const [group, setGroup] = useState("");
  const [riskCategory, setRiskCategory] = useState("");
  const [relationshipType, setRelationshipType] = useState("");
  const [cddPosture, setCddPosture] = useState<CDDPosture | "">("");
  const [notes, setNotes] = useState("");
  const [wallets, setWallets] = useState("");
  const [vesselImo, setVesselImo] = useState("");
  const [vesselMmsi, setVesselMmsi] = useState("");
  const [aircraftTail, setAircraftTail] = useState("");
  const [rca, setRca] = useState(true);
  const [adverseMedia, setAdverseMedia] = useState(true);
  const [ongoingScreening, setOngoingScreening] = useState(true);

  const isIndividual = entityType === "individual";
  const isVessel = entityType === "vessel";
  const isAircraft = entityType === "aircraft";

  function buildData(): ScreeningFormData {
    const alternateNames = splitList(altNames);
    const walletAddresses = splitList(wallets);
    return {
      name: name.trim(),
      entityType,
      alternateNames,
      caseId: caseId.trim() || suggestedCaseId,
      checkTypes: { rca, adverseMedia },
      ongoingScreening,
      ...(citizenship.trim() ? { citizenship: citizenship.trim() } : {}),
      ...(countryLocation.trim() ? { countryLocation: countryLocation.trim() } : {}),
      ...(registeredCountry.trim() ? { registeredCountry: registeredCountry.trim() } : {}),
      ...(group.trim() ? { group: group.trim() } : {}),
      ...(riskCategory.trim() ? { riskCategory: riskCategory.trim() } : {}),
      ...(relationshipType.trim() ? { relationshipType: relationshipType.trim() } : {}),
      ...(cddPosture ? { cddPosture } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(walletAddresses.length > 0 ? { walletAddresses } : {}),
      ...(vesselImo.trim() ? { vesselImo: vesselImo.trim() } : {}),
      ...(vesselMmsi.trim() ? { vesselMmsi: vesselMmsi.trim() } : {}),
      ...(aircraftTail.trim() ? { aircraftTail: aircraftTail.trim() } : {}),
    };
  }

  const canSubmit = name.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) onScreen(buildData());
      }}
      className="bg-bg-panel border border-hair-2 rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-12 font-semibold text-ink-0">＋ New screening</span>
        <span className="text-10 font-mono text-ink-3">· {caseId || suggestedCaseId}</span>
        <button
          type="button"
          onClick={onCancel}
          className="ml-auto text-11 text-ink-3 hover:text-ink-0"
          aria-label="Close form"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className={labelCls}>Name *</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full legal name"
            autoFocus
          />
        </div>
        <div>
          <label className={labelCls}>Entity type</label>
          <select
            className={inputCls}
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as EntityType)}
          >
            {ENTITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Case ID</label>
          <input className={inputCls} value={caseId} onChange={(e) => setCaseId(e.target.value)} />
        </div>

        <div>
          <label className={labelCls}>Alternate names</label>
          <input
            className={inputCls}
            value={altNames}
            onChange={(e) => setAltNames(e.target.value)}
            placeholder="comma, separated"
          />
        </div>

        {isIndividual ? (
          <>
            <div>
              <label className={labelCls}>Citizenship</label>
              <input
                className={inputCls}
                value={citizenship}
                onChange={(e) => setCitizenship(e.target.value)}
                placeholder="e.g. RU"
              />
            </div>
            <div>
              <label className={labelCls}>Country / location</label>
              <input
                className={inputCls}
                value={countryLocation}
                onChange={(e) => setCountryLocation(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div>
            <label className={labelCls}>Registered country</label>
            <input
              className={inputCls}
              value={registeredCountry}
              onChange={(e) => setRegisteredCountry(e.target.value)}
              placeholder="e.g. AE"
            />
          </div>
        )}

        <div>
          <label className={labelCls}>Group</label>
          <input className={inputCls} value={group} onChange={(e) => setGroup(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Risk category</label>
          <input
            className={inputCls}
            value={riskCategory}
            onChange={(e) => setRiskCategory(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Relationship</label>
          <input
            className={inputCls}
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value)}
            placeholder="UBO / Counterparty"
          />
        </div>
        <div>
          <label className={labelCls}>CDD posture</label>
          <select
            className={inputCls}
            value={cddPosture}
            onChange={(e) => setCddPosture(e.target.value as CDDPosture | "")}
          >
            <option value="">Auto</option>
            <option value="SDD">SDD</option>
            <option value="CDD">CDD</option>
            <option value="EDD">EDD</option>
          </select>
        </div>

        {isVessel && (
          <>
            <div>
              <label className={labelCls}>IMO</label>
              <input
                className={inputCls}
                value={vesselImo}
                onChange={(e) => setVesselImo(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>MMSI</label>
              <input
                className={inputCls}
                value={vesselMmsi}
                onChange={(e) => setVesselMmsi(e.target.value)}
              />
            </div>
          </>
        )}
        {isAircraft && (
          <div>
            <label className={labelCls}>Tail number</label>
            <input
              className={inputCls}
              value={aircraftTail}
              onChange={(e) => setAircraftTail(e.target.value)}
            />
          </div>
        )}

        <div className="lg:col-span-1">
          <label className={labelCls}>Wallet addresses</label>
          <input
            className={inputCls}
            value={wallets}
            onChange={(e) => setWallets(e.target.value)}
            placeholder="0x…, bc1…"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <label className={labelCls}>Notes</label>
          <textarea
            className={`${inputCls} resize-y min-h-[60px]`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-1.5 text-11 text-ink-1">
          <input
            type="checkbox"
            className="accent-brand"
            checked={rca}
            onChange={(e) => setRca(e.target.checked)}
          />
          RCA screening
        </label>
        <label className="flex items-center gap-1.5 text-11 text-ink-1">
          <input
            type="checkbox"
            className="accent-brand"
            checked={adverseMedia}
            onChange={(e) => setAdverseMedia(e.target.checked)}
          />
          Adverse media
        </label>
        <label className="flex items-center gap-1.5 text-11 text-ink-1">
          <input
            type="checkbox"
            className="accent-brand"
            checked={ongoingScreening}
            onChange={(e) => setOngoingScreening(e.target.checked)}
          />
          Ongoing screening
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-11 px-3 py-1.5 rounded border border-hair-2 text-ink-2 hover:bg-bg-1"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSave(buildData())}
            className="text-11 px-3 py-1.5 rounded border border-hair-2 text-ink-1 hover:bg-bg-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save only
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="text-11 px-3 py-1.5 rounded bg-brand text-white font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Screen now
          </button>
        </div>
      </div>
    </form>
  );
}
