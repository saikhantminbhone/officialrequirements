import { getDestinationMeta, getScholarships } from "@/lib/req-data";
import { representativeByDestination } from "@/lib/compare";
import { getFxRates, convert } from "@/lib/fx";

// Computed data-story metrics per destination — the substance behind the
// /reports pages. Everything is derived from the sourced dataset + ECB FX, so
// the rankings are defensible and update as the data does. These pages double
// as link-bait (the one ranking lever the blueprint flags as operational).

export interface ReportRow {
  code: string;
  name: string;
  currency: string;
  proofOriginal: number | null;
  proofEur: number | null;
  firstYearEur: number | null;
  processingWeeks: number | null;
  fxNote: string;
}

export interface ReportData {
  rows: ReportRow[];
  fxUpdatedAt: string;
}

function capitalize(s: string): string {
  if (s.startsWith("the ")) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function destinationMetrics(): Promise<ReportData> {
  const [reps, fx] = await Promise.all([representativeByDestination(), getFxRates()]);
  const rows: ReportRow[] = [];

  for (const [code, rec] of reps) {
    const meta = getDestinationMeta(code);
    const d = rec.toolDefaults ?? {};
    const cur = d.blockedAccountCurrency ?? meta?.currency ?? "EUR";
    const proof = d.blockedAccountAmount ?? null;
    const proofEur = proof != null ? convert(proof, cur, "EUR", fx.rates) : null;

    // First-year outlay ≈ proof of funds + 12 months insurance + visa fee.
    let firstYearEur: number | null = null;
    if (proofEur != null) {
      const insuranceYr = (d.insurancePerMonth ?? 0) * 12;
      const visaFee = d.visaFee ?? 0;
      const insEur = convert(insuranceYr, cur, "EUR", fx.rates) ?? 0;
      const feeEur = convert(visaFee, cur, "EUR", fx.rates) ?? 0;
      firstYearEur = proofEur + insEur + feeEur;
    }

    rows.push({
      code,
      name: capitalize(meta?.name ?? code),
      currency: cur,
      proofOriginal: proof,
      proofEur: proofEur != null ? Math.round(proofEur) : null,
      firstYearEur: firstYearEur != null ? Math.round(firstYearEur) : null,
      processingWeeks: d.processingWeeks ?? null,
      fxNote: proof == null ? "Set by your admission document (e.g. I-20)" : "",
    });
  }

  return { rows, fxUpdatedAt: fx.updatedAt };
}

export function eur(n: number | null): string {
  return n == null ? "—" : `€${n.toLocaleString("en-US")}`;
}

// ── Study Abroad Index ─────────────────────────────────────────────────────
// A single composite 0–100 accessibility score per destination, blended from
// affordability (first-year cost), speed (processing time) and funding
// (scholarships available). Transparent, deterministic, link-worthy.
export interface IndexRow {
  code: string;
  name: string;
  index: number;
  affordability: number;
  speed: number;
  funding: number;
  firstYearEur: number | null;
  processingWeeks: number | null;
  scholarships: number;
}

export interface IndexData {
  rows: IndexRow[];
  fxUpdatedAt: string;
}

// Normalise so that LOWER raw value → HIGHER score (for cost/time).
function invNormalize(value: number, min: number, max: number): number {
  if (max <= min) return 100;
  return Math.round(((max - value) / (max - min)) * 100);
}
function normalize(value: number, min: number, max: number): number {
  if (max <= min) return value > 0 ? 100 : 0;
  return Math.round(((value - min) / (max - min)) * 100);
}

export async function studyAbroadIndex(): Promise<IndexData> {
  const [{ rows, fxUpdatedAt }, scholarships] = await Promise.all([destinationMetrics(), getScholarships()]);

  const fundingCount = (code: string) =>
    scholarships.filter((s) => s.destination === code || s.destination === "multiple").length;

  const costs = rows.map((r) => r.firstYearEur).filter((v): v is number => v != null);
  const times = rows.map((r) => r.processingWeeks).filter((v): v is number => v != null);
  const funds = rows.map((r) => fundingCount(r.code));
  const minCost = Math.min(...costs), maxCost = Math.max(...costs);
  const minTime = Math.min(...times), maxTime = Math.max(...times);
  const minFund = Math.min(...funds), maxFund = Math.max(...funds);

  const out: IndexRow[] = rows.map((r) => {
    const scholarshipsN = fundingCount(r.code);
    const affordability = r.firstYearEur != null ? invNormalize(r.firstYearEur, minCost, maxCost) : 50;
    const speed = r.processingWeeks != null ? invNormalize(r.processingWeeks, minTime, maxTime) : 50;
    const funding = normalize(scholarshipsN, minFund, maxFund);
    const index = Math.round(0.5 * affordability + 0.3 * speed + 0.2 * funding);
    return {
      code: r.code,
      name: r.name,
      index,
      affordability,
      speed,
      funding,
      firstYearEur: r.firstYearEur,
      processingWeeks: r.processingWeeks,
      scholarships: scholarshipsN,
    };
  });

  out.sort((a, b) => b.index - a.index);
  return { rows: out, fxUpdatedAt };
}
