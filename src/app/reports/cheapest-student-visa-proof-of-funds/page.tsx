import type { Metadata } from "next";
import Link from "next/link";
import { destinationMetrics, eur } from "@/lib/reports";
import ReportPage from "@/components/reports/ReportPage";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Cheapest countries by student-visa proof of funds (2026)",
  description: "Student-visa proof-of-funds requirements ranked from lowest to highest, compared in euros at ECB rates. Sourced from official government pages.",
  alternates: { canonical: "/reports/cheapest-student-visa-proof-of-funds" },
};

export default async function Report() {
  const { rows, fxUpdatedAt } = await destinationMetrics();
  const ranked = rows.filter((r) => r.proofEur != null).sort((a, b) => (a.proofEur! - b.proofEur!));
  const cheapest = ranked[0];
  const priciest = ranked[ranked.length - 1];

  const tableRows = ranked.map((r, i) => [
    `${i + 1}. ${r.name}`,
    eur(r.proofEur),
    `${r.proofOriginal?.toLocaleString("en-US")} ${r.currency}/yr`,
    <Link key={r.code} href={`/study/${r.code}`} className="text-brand-600 hover:underline">View requirements</Link>,
  ]);

  return (
    <ReportPage
      slug="cheapest-student-visa-proof-of-funds"
      title="Cheapest countries by student-visa proof of funds"
      lede="How much money you must show for a student visa varies widely. Here are the major study destinations ranked from the lowest proof-of-funds requirement to the highest, compared in euros."
      headers={["Country", "Proof of funds (≈ EUR/yr)", "Official figure", ""]}
      rows={tableRows}
      rankItems={ranked.map((r) => r.name)}
      fxUpdatedAt={fxUpdatedAt}
      keywords={[
        "cheapest student visa proof of funds",
        "lowest proof of funds student visa 2026",
        "cheapest country to study abroad",
        "student visa bank balance requirement",
        "affordable study abroad destinations",
      ]}
      insight={
        cheapest && priciest ? (
          <>
            <strong>{cheapest.name}</strong> asks for the least up front (≈ {eur(cheapest.proofEur)}/year),
            while <strong>{priciest.name}</strong> asks the most (≈ {eur(priciest.proofEur)}/year) — a
            spread of about {eur((priciest.proofEur ?? 0) - (cheapest.proofEur ?? 0))}. Proof of funds is
            usually the single biggest barrier, so it&apos;s worth weighing against tuition and the right
            to work during study.
          </>
        ) : null
      }
    />
  );
}
