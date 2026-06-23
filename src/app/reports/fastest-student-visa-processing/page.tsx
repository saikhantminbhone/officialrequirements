import type { Metadata } from "next";
import Link from "next/link";
import { destinationMetrics } from "@/lib/reports";
import ReportPage from "@/components/reports/ReportPage";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Fastest student-visa processing by country (2026)",
  description: "Typical student-visa processing times ranked from fastest to slowest by country. Sourced from official guidance.",
  alternates: { canonical: "/reports/fastest-student-visa-processing" },
};

export default async function Report() {
  const { rows, fxUpdatedAt } = await destinationMetrics();
  const ranked = rows.filter((r) => r.processingWeeks != null).sort((a, b) => (a.processingWeeks! - b.processingWeeks!));
  const fastest = ranked[0];
  const slowest = ranked[ranked.length - 1];

  const tableRows = ranked.map((r, i) => [
    `${i + 1}. ${r.name}`,
    `~${r.processingWeeks} weeks`,
    <Link key={r.code} href={`/study/${r.code}`} className="text-brand-600 hover:underline">View requirements</Link>,
  ]);

  return (
    <ReportPage
      slug="fastest-student-visa-processing"
      title="Fastest student-visa processing by country"
      lede="Processing time decides how early you must lock in admission, funds and an appointment. Here are typical student-visa processing times by destination, fastest to slowest — plan backwards from your intake."
      headers={["Country", "Typical processing", ""]}
      rows={tableRows}
      rankItems={ranked.map((r) => r.name)}
      fxUpdatedAt={fxUpdatedAt}
      keywords={[
        "fastest student visa processing time",
        "quickest student visa to get 2026",
        "student visa processing time by country",
        "how long does a student visa take",
        "student visa appointment wait times",
      ]}
      insight={
        fastest && slowest ? (
          <>
            <strong>{fastest.name}</strong> is typically quickest (~{fastest.processingWeeks} weeks) and{" "}
            <strong>{slowest.name}</strong> the slowest (~{slowest.processingWeeks} weeks). Embassy
            appointment availability is often the real bottleneck — use the{" "}
            <Link href="/tools/timeline" className="text-brand-600 hover:underline">timeline planner</Link> to
            work back from your intake date.
          </>
        ) : null
      }
    />
  );
}
