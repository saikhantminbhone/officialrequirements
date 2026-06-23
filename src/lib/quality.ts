// ─────────────────────────────────────────────────────────────────────────
// Quality / plausibility check (deterministic, no AI).
//
// Validates a crawled candidate value BEFORE it reaches the review queue, so
// extraction garbage (a year mistaken for a fee, a phone number, an empty
// field) never gets near publication. Pure rules + numeric bounds — the
// "quality check" half of the smart-without-AI pipeline.
// ─────────────────────────────────────────────────────────────────────────

export type QualityGrade = "pass" | "review" | "reject";

export interface QualityResult {
  grade: QualityGrade;
  checks: { name: string; ok: boolean; detail?: string }[];
}

// Generous per-field bounds — wide enough for every currency we cover (incl.
// JPY/KRW which run large), tight enough to catch obvious extraction errors.
// [min, max] in the value's own currency.
const BOUNDS: Record<string, { min: number; max: number; needsCurrency: boolean }> = {
  blockedAccountAmount: { min: 100, max: 100_000_000, needsCurrency: true },
  visaFee: { min: 0, max: 1_000_000, needsCurrency: true },
  livingCostPerMonth: { min: 10, max: 5_000_000, needsCurrency: true },
  insurancePerMonth: { min: 1, max: 500_000, needsCurrency: true },
  processingWeeks: { min: 1, max: 104, needsCurrency: false },
};

export interface Candidate {
  field: string;
  value: number;
  currency: string | null;
  confidence: "high" | "medium" | "low";
  status?: "matches" | "differs" | "new";
}

export function checkQuality(c: Candidate): QualityResult {
  const checks: QualityResult["checks"] = [];
  const bound = BOUNDS[c.field];

  const finite = Number.isFinite(c.value);
  checks.push({ name: "finite-number", ok: finite });

  // Unknown field — we can't bound it, so it always needs a human.
  if (!bound) {
    checks.push({ name: "known-field", ok: false, detail: c.field });
    return { grade: finite ? "review" : "reject", checks };
  }

  const inRange = finite && c.value >= bound.min && c.value <= bound.max;
  checks.push({
    name: "in-plausible-range",
    ok: inRange,
    detail: inRange ? undefined : `expected ${bound.min}–${bound.max}, got ${c.value}`,
  });

  // A bare 4-digit value that looks like a calendar year is almost always a
  // mis-extraction for a money field.
  const looksLikeYear = c.value >= 1990 && c.value <= 2099 && Number.isInteger(c.value);
  if (bound.needsCurrency) {
    checks.push({ name: "not-a-year", ok: !looksLikeYear });
  }

  const currencyOk = !bound.needsCurrency || Boolean(c.currency);
  checks.push({ name: "currency-present", ok: currencyOk });

  const confidenceOk = c.confidence !== "low";
  checks.push({ name: "extractor-confidence", ok: confidenceOk });

  // Reject outright on a hard failure (garbage value or wrong type).
  if (!finite || !inRange || (bound.needsCurrency && looksLikeYear)) {
    return { grade: "reject", checks };
  }
  // Pass cleanly only when everything holds; otherwise a human should glance.
  if (currencyOk && confidenceOk) {
    return { grade: "pass", checks };
  }
  return { grade: "review", checks };
}

// ── Combined recommendation: trust × quality × comparison status ───────────
export type Recommendation = "ready-to-approve" | "needs-review" | "reject";

export function recommend(args: {
  trustTier: "official" | "reputable" | "unknown" | "low";
  quality: QualityGrade;
  status?: "matches" | "differs" | "new";
}): Recommendation {
  const { trustTier, quality, status } = args;
  if (quality === "reject" || trustTier === "low") return "reject";

  // A clean, in-range value from an official source that matches what we
  // already hold is the strongest signal — safe to approve in one glance.
  if (trustTier === "official" && quality === "pass" && status === "matches") {
    return "ready-to-approve";
  }
  if (quality === "pass" && (trustTier === "official" || trustTier === "reputable")) {
    return "needs-review";
  }
  return "needs-review";
}
