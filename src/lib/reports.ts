import { getDestinationMeta } from "@/lib/req-data";
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
