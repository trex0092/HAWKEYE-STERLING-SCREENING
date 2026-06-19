import type { ModuleKey } from "@/lib/data/console-datasets";

export type { ModuleKey };

export type Density = "Comfortable" | "Compact";

export type DraftType = "individual" | "corporate" | "entity" | "vessel" | "aircraft";

export interface ConsoleSettings {
  sync: boolean;
  autoEscalate: boolean;
  mediaScan: boolean;
  chainAnalytics: boolean;
  emailAlerts: boolean;
  twoFactor: boolean;
}

export interface Draft {
  name: string;
  type: DraftType;
  gender: "Male" | "Female";
  altNames: string;
  dob: string;
  country: string;
  idNumber: string;
  idType: string;
  issuingCountry: string;
}

export const EMPTY_DRAFT: Draft = {
  name: "",
  type: "individual",
  gender: "Male",
  altNames: "",
  dob: "",
  country: "UNITED KINGDOM",
  idNumber: "",
  idType: "Passport",
  issuingCountry: "UNITED KINGDOM",
};
