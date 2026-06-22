// ─────────────────────────────────────────────────────────────────────────
// The requirements data layer — the product moat.
// Every record carries provenance (source + lastVerified) so pages can render
// trust signals and so the freshness pipeline can flag stale facts.
// ─────────────────────────────────────────────────────────────────────────

export type Vertical = "visa" | "university" | "scholarship";

/** ISO 3166-1 alpha-2 lowercase, used in URLs (e.g. "de", "mm"). */
export type ISOCountry = string;

export type SourceType = "government" | "university" | "official-body";

export interface Source {
  name: string;
  url: string;
  type: SourceType;
}

export interface RequirementItem {
  /** Stable key, e.g. "proof-of-funds". */
  key: string;
  label: string;
  detail: string;
  /** Whether this item is mandatory or conditional. */
  required: boolean;
  /** Optional numeric value the tools consume (e.g. blocked-account amount). */
  amount?: { value: number; currency: string; per?: "year" | "month" | "once" };
  /** Conditions under which this item applies (consumed by the checker). */
  appliesIf?: Record<string, string | number | boolean>;
  /** An affiliate intent tag — links this requirement to an offer category. */
  affiliateTag?: AffiliateTag;
}

export type AffiliateTag =
  | "english-test"
  | "money-transfer"
  | "insurance"
  | "esim"
  | "blocked-account"
  | "accommodation"
  | "agency-lead"
  | "flights";

export interface ChangeLogEntry {
  date: string; // ISO date
  note: string;
}

export interface RequirementRecord {
  id: string;
  vertical: Vertical;
  /** Origin country (visa vertical). */
  nationality?: ISOCountry;
  /** Target country. */
  destination: ISOCountry;
  /** e.g. "student-visa" | "msc-admission" | "daad-epos". */
  category: string;
  /** University vertical only: the program archetype this record covers. */
  program?: { slug: string; name: string; level: "bachelor" | "msc" | "mba" | "phd" };
  /** Human title for the page. */
  title: string;
  /** Short, unique intro — kept thin; the tools carry the value. */
  summary: string;
  requirements: RequirementItem[];
  /** Tool inputs/defaults specific to this record (e.g. blocked-account amount). */
  toolDefaults?: {
    blockedAccountAmount?: number;
    blockedAccountCurrency?: string;
    livingCostPerMonth?: number;
    visaFee?: number;
    insurancePerMonth?: number;
    processingWeeks?: number;
    intakeMonths?: number[]; // 1-12
  };
  source: Source;
  /** Additional primary sources cited on-page. */
  extraSources?: Source[];
  lastVerified: string; // ISO date — rendered on page
  verifiedBy: string;
  /** Honest provenance: 'machine-compiled' (seeded/crawled, NOT yet human-checked)
   *  vs 'human-verified' (a person confirmed it against the official source).
   *  Defaults to machine-compiled when absent — we never imply a human check that
   *  didn't happen (YMYL integrity). */
  verification?: VerificationStatus;
  status: "published" | "draft" | "unpublished-stale";
  changeLog: ChangeLogEntry[];
}

// machine-compiled: seeded/crawled, single source, NOT checked.
// auto-corroborated: the figure was confirmed by 2+ independent official sources
//   by the deterministic cross-source fact-check engine (no human, no AI).
// human-verified: a person confirmed it against the official source.
export type VerificationStatus = "human-verified" | "auto-corroborated" | "machine-compiled";

/** A scholarship eligibility record. */
export interface ScholarshipRecord {
  id: string;
  slug: string; // URL key, e.g. "daad-epos"
  name: string;
  provider: string;
  destination: ISOCountry | "multiple";
  summary: string;
  eligibility: EligibilityRule[];
  benefits: string[];
  deadlines: { intake: string; date: string }[];
  source: Source;
  lastVerified: string;
  verifiedBy: string;
  verification?: VerificationStatus;
  status: "published" | "draft" | "unpublished-stale";
  changeLog: ChangeLogEntry[];
}

/** A single, machine-checkable eligibility rule used by the checker. */
export interface EligibilityRule {
  key: string;
  question: string;
  /** Field on the user's answers this rule reads. */
  field: string;
  /** "eq" | "gte" | "lte" | "in" | "neq". */
  op: "eq" | "gte" | "lte" | "in" | "neq" | "truthy";
  value?: string | number | boolean | (string | number)[];
  /** Message shown when the rule fails. */
  failMessage: string;
  /** A soft warning rather than a hard fail. */
  soft?: boolean;
}
