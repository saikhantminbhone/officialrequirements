import { getVisaRecords, getScholarships } from "@/lib/req-data";

// ─────────────────────────────────────────────────────────────────────────
// Open data export (CC BY 4.0, attribution = a link). Journalists, researchers
// and bloggers cite datasets — every citation is a backlink the site can't
// earn any other way. Compiled straight from the same records the pages use.
// ─────────────────────────────────────────────────────────────────────────

export interface OpenDataRow {
  nationality: string;
  destination: string;
  proof_of_funds_amount: number | null;
  proof_of_funds_currency: string | null;
  proof_of_funds_per: string | null;
  visa_fee: number | null;
  living_cost_per_month: number | null;
  processing_weeks: number | null;
  intake_months: string | null;
  source_name: string;
  source_url: string;
  last_verified: string;
  verification: string;
}

export async function buildOpenData(): Promise<{ rows: OpenDataRow[]; scholarships: number; generatedAt: string }> {
  const [records, scholarships] = await Promise.all([getVisaRecords(), getScholarships()]);
  const rows: OpenDataRow[] = records
    .filter((r) => r.nationality)
    .map((r) => ({
      nationality: r.nationality!,
      destination: r.destination,
      proof_of_funds_amount: r.toolDefaults?.blockedAccountAmount ?? null,
      proof_of_funds_currency: r.toolDefaults?.blockedAccountCurrency ?? null,
      proof_of_funds_per: r.toolDefaults?.blockedAccountAmount ? "year" : null,
      visa_fee: r.toolDefaults?.visaFee ?? null,
      living_cost_per_month: r.toolDefaults?.livingCostPerMonth ?? null,
      processing_weeks: r.toolDefaults?.processingWeeks ?? null,
      intake_months: r.toolDefaults?.intakeMonths?.join("|") ?? null,
      source_name: r.source?.name ?? "",
      source_url: r.source?.url ?? "",
      last_verified: r.lastVerified,
      verification: r.verification ?? "machine-compiled",
    }));
  return { rows, scholarships: scholarships.length, generatedAt: new Date().toISOString() };
}

export function toCsv(rows: OpenDataRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]) as (keyof OpenDataRow)[];
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}
