import type { Metadata } from "next";
import Link from "next/link";
import { destinationMetrics, eur } from "@/lib/reports";
import ReportPage from "@/components/reports/ReportPage";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Student-visa total first-year cost by country (2026)",
  description: "First-year student-visa cost (proof of funds + insurance + visa fee) ranked by country in euros. Sourced from official government figures.",
  alternates: { canonical: "/reports/student-visa-total-cost-by-country" },
};

export default async function Report() {
  const { rows, fxUpdatedAt } = await destinationMetrics();
  const ranked = rows.filter((r) => r.firstYearEur != null).sort((a, b) => (a.firstYearEur! - b.firstYearEur!));
  const lowest = ranked[0];
  const highest = ranked[ranked.length - 1];

  const tableRows = ranked.map((r, i) => [
    `${i + 1}. ${r.name}`,
    eur(r.firstYearEur),
    eur(r.proofEur),
    <Link key={r.code} href={`/study/${r.code}`} className="text-brand-600 hover:underline">View requirements</Link>,
  ]);

  return (
    <ReportPage
      slug="student-visa-total-cost-by-country"
      title="Student-visa total first-year cost by country"
      lede="Beyond proof of funds, the first year carries insurance and visa fees too. This ranks destinations by an estimated first-year outlay — proof of funds plus a year of insurance plus the visa fee — in euros."
      headers={["Country", "First-year est. (≈ EUR)", "of which proof of funds", ""]}
      rows={tableRows}
      rankItems={ranked.map((r) => r.name)}
      fxUpdatedAt={fxUpdatedAt}
      insight={
        lowest && highest ? (
          <>
            <strong>{lowest.name}</strong> is the lightest first-year commitment (≈ {eur(lowest.firstYearEur)}),
            and <strong>{highest.name}</strong> the heaviest (≈ {eur(highest.firstYearEur)}). Most of this is
            recoverable living money (you spend it studying), not a fee — but you must be able to show it
            before the visa is granted.
          </>
        ) : null
      }
    />
  );
}
