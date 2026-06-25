import type { Metadata } from "next";
import Link from "next/link";
import { studyAbroadIndex, eur } from "@/lib/reports";
import ReportPage from "@/components/reports/ReportPage";

export const dynamic = "force-static";

const YEAR = new Date().getFullYear();

export const metadata: Metadata = {
  title: { absolute: `Study Abroad Index ${YEAR} — Most Accessible Countries Ranked` },
  description: `The Study Abroad Index ${YEAR} ranks destinations by a single accessibility score blending first-year cost, visa processing speed and scholarship availability. Computed from official figures.`,
  alternates: { canonical: "/reports/study-abroad-index" },
  keywords: [
    `study abroad index ${YEAR}`,
    "most accessible countries to study abroad",
    "easiest countries to study abroad",
    "best countries to study abroad ranking",
  ],
};

export default async function Report() {
  const { rows, fxUpdatedAt } = await studyAbroadIndex();
  const top = rows[0];

  const tableRows = rows.map((r, i) => [
    `${i + 1}. ${r.name}`,
    String(r.index),
    eur(r.firstYearEur),
    r.processingWeeks ? `~${r.processingWeeks} wks` : "—",
    String(r.scholarships),
    <Link key={r.code} href={`/study/${r.code}`} className="text-brand-600 hover:underline">View</Link>,
  ]);

  return (
    <ReportPage
      slug="study-abroad-index"
      title={`Study Abroad Index ${YEAR}`}
      lede="A single accessibility score for each destination, blending what it costs in year one, how fast the visa is processed, and how much scholarship funding is available. Higher is more accessible. Computed from our sourced data — not opinion."
      headers={["Country", "Index", "First-year cost", "Processing", "Scholarships", ""]}
      rows={tableRows}
      rankItems={rows.map((r) => r.name)}
      fxUpdatedAt={fxUpdatedAt}
      keywords={[
        `study abroad index ${YEAR}`,
        "most accessible country to study abroad",
        "easiest country to get a student visa",
        "best value study abroad destination",
      ]}
      insight={
        top ? (
          <>
            <strong>{top.name}</strong> tops the {YEAR} index with a score of <strong>{top.index}/100</strong> —
            the strongest blend of affordability, processing speed and funding. The index weights cost at 50%,
            processing speed at 30% and scholarship availability at 20%, each normalised across all destinations,
            so it rewards countries that are accessible on every front rather than cheap on one.
          </>
        ) : null
      }
    />
  );
}
