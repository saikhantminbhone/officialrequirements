// ─────────────────────────────────────────────────────────────────────────
// Outcome tracker — pure core (validation + aggregation, no IO, unit-testable).
//
// User-submitted admission/visa outcomes are the proprietary data competitors
// can't copy. Everything here is deterministic; the IO + moderation live in
// outcomes.ts. User input is NEVER trusted: validate hard, and nothing is shown
// publicly until a human approves it.
// ─────────────────────────────────────────────────────────────────────────

export type OutcomeType = "admission" | "visa";
export type OutcomeResult = "accepted" | "rejected" | "waitlisted" | "approved" | "refused";
export type OutcomeStatus = "pending" | "approved" | "rejected";

export interface OutcomeInput {
  type: OutcomeType;
  destination: string; // ISO country code
  university?: string; // slug (admission)
  program?: string;
  nationality?: string; // ISO code (visa)
  result: OutcomeResult;
  year: number; // intake year
  intake?: string; // e.g. "Fall", "Winter"
  gpa?: number; // 0–4 or 0–100 (stored as given)
  ielts?: number; // 0–9
  fundsShownEur?: number;
  processingWeeks?: number;
  note?: string;
  // Honeypot: must be empty (bots fill it).
  website?: string;
}

export interface OutcomeRecord extends OutcomeInput {
  id: string;
  submittedAt: string;
  status: OutcomeStatus;
}

const RESULTS: OutcomeResult[] = ["accepted", "rejected", "waitlisted", "approved", "refused"];

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  clean?: OutcomeInput;
}

const CURRENT_YEAR = new Date().getFullYear();

/** Hard validation + sanitization of an untrusted submission. */
export function validateOutcome(raw: Partial<OutcomeInput>): ValidationResult {
  const errors: string[] = [];

  // Honeypot — silently invalid (a bot filled the hidden field).
  if (raw.website && raw.website.trim() !== "") errors.push("spam");

  const type = raw.type;
  if (type !== "admission" && type !== "visa") errors.push("type must be admission or visa");

  const destination = (raw.destination || "").toLowerCase().trim();
  if (!/^[a-z]{2}$/.test(destination)) errors.push("destination must be a 2-letter country code");

  const result = raw.result as OutcomeResult;
  if (!RESULTS.includes(result)) errors.push("invalid result");

  const year = Number(raw.year);
  if (!Number.isInteger(year) || year < CURRENT_YEAR - 5 || year > CURRENT_YEAR + 2) {
    errors.push("year out of range");
  }

  // Bounded optional numerics — reject absurd values rather than store garbage.
  const num = (v: unknown, min: number, max: number) => {
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) && n >= min && n <= max ? n : NaN;
  };
  const gpa = num(raw.gpa, 0, 100);
  const ielts = num(raw.ielts, 0, 9);
  const fundsShownEur = num(raw.fundsShownEur, 0, 1_000_000);
  const processingWeeks = num(raw.processingWeeks, 0, 104);
  for (const [k, v] of Object.entries({ gpa, ielts, fundsShownEur, processingWeeks })) {
    if (Number.isNaN(v)) errors.push(`${k} out of range`);
  }

  const note = (raw.note || "").trim();
  if (note.length > 500) errors.push("note too long");
  if (/https?:\/\/|www\.|\b[\w.-]+@[\w.-]+\b/i.test(note)) errors.push("note may not contain links or emails");

  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    errors: [],
    clean: {
      type: type!,
      destination,
      university: str(raw.university, 80),
      program: str(raw.program, 120),
      nationality: str(raw.nationality, 2)?.toLowerCase(),
      result,
      year,
      intake: str(raw.intake, 20),
      gpa: gpa as number | undefined,
      ielts: ielts as number | undefined,
      fundsShownEur: fundsShownEur as number | undefined,
      processingWeeks: processingWeeks as number | undefined,
      note: note || undefined,
    },
  };
}

function median(values: number[]): number | null {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : Math.round(((v[mid - 1] + v[mid]) / 2) * 100) / 100;
}

export interface OutcomeSummary {
  total: number;
  accepted: number;
  rejected: number;
  approved: number;
  refused: number;
  /** Share of decided admission outcomes that were accepted (0–100), or null. */
  acceptanceRate: number | null;
  medianGpa: number | null;
  medianIelts: number | null;
  medianProcessingWeeks: number | null;
}

/** Aggregate a set of APPROVED outcomes into public-facing stats. */
export function summarize(records: OutcomeRecord[]): OutcomeSummary {
  const accepted = records.filter((r) => r.result === "accepted").length;
  const rejected = records.filter((r) => r.result === "rejected").length;
  const approved = records.filter((r) => r.result === "approved").length;
  const refused = records.filter((r) => r.result === "refused").length;
  const decided = accepted + rejected;
  return {
    total: records.length,
    accepted,
    rejected,
    approved,
    refused,
    acceptanceRate: decided > 0 ? Math.round((accepted / decided) * 100) : null,
    medianGpa: median(records.map((r) => r.gpa).filter((x): x is number => x != null)),
    medianIelts: median(records.map((r) => r.ielts).filter((x): x is number => x != null)),
    medianProcessingWeeks: median(records.map((r) => r.processingWeeks).filter((x): x is number => x != null)),
  };
}
