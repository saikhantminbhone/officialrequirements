import type { RequirementRecord } from "@/lib/req-data/types";

// Cost & proof-of-funds calculator. Outputs the exact blocked-account / proof
// figure the embassy expects, plus a transparent breakdown. This computed
// number is unique per scenario — exactly the AI-resistant value the blueprint
// wants on each page.

export interface CostInput {
  months: number; // intended coverage period (visa year = 12)
  city?: "default" | "munich" | "berlin" | "cologne";
  includeInsurance: boolean;
  includeVisaFee: boolean;
  oneTimeSetupFees?: number; // e.g. blocked-account opening fee
}

export interface CostLine {
  label: string;
  amount: number;
  note?: string;
}

export interface CostResult {
  currency: string;
  lines: CostLine[];
  /** Null when the destination has no fixed proof figure (e.g. USA — set by the I-20). */
  blockedAccountMinimum: number | null;
  total: number;
}

const CITY_MULTIPLIER: Record<NonNullable<CostInput["city"]>, number> = {
  default: 1,
  munich: 1.25,
  berlin: 1.1,
  cologne: 1.05,
};

export function calculateCost(record: RequirementRecord, input: CostInput): CostResult {
  const d = record.toolDefaults ?? {};
  const currency = d.blockedAccountCurrency ?? "EUR";
  const months = Math.max(1, Math.round(input.months));
  const cityMult = CITY_MULTIPLIER[input.city ?? "default"];

  const monthlyLiving = Math.round((d.livingCostPerMonth ?? 992) * cityMult);
  const living = monthlyLiving * months;

  const lines: CostLine[] = [
    {
      label: "Living costs / blocked-account funds",
      amount: living,
      note: `${monthlyLiving} ${currency} × ${months} months${input.city && input.city !== "default" ? ` (${input.city} adjusted)` : ""}`,
    },
  ];

  if (input.includeInsurance) {
    const ins = (d.insurancePerMonth ?? 120) * months;
    lines.push({ label: "Health insurance", amount: ins, note: `${d.insurancePerMonth ?? 120} ${currency}/mo × ${months}` });
  }
  if (input.includeVisaFee && d.visaFee) {
    lines.push({ label: "Visa fee", amount: d.visaFee });
  }
  if (input.oneTimeSetupFees && input.oneTimeSetupFees > 0) {
    lines.push({ label: "Blocked-account / setup fees", amount: Math.round(input.oneTimeSetupFees) });
  }

  // The official proof-of-funds minimum is fixed by the year regardless of city.
  // Null when the destination sets no fixed figure (e.g. USA — per the I-20).
  const blockedAccountMinimum = d.blockedAccountAmount
    ? Math.round((d.blockedAccountAmount / 12) * months)
    : null;

  const total = lines.reduce((s, l) => s + l.amount, 0);
  return { currency, lines, blockedAccountMinimum, total };
}
