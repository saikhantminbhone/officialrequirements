import type { Metadata } from "next";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Study-abroad data reports & rankings",
  description: "Computed rankings from official student-visa data: cheapest proof of funds, total first-year cost, and fastest visa processing by country.",
  alternates: { canonical: "/reports" },
};

const REPORTS = [
  { slug: "cheapest-student-visa-proof-of-funds", title: "Cheapest countries by student-visa proof of funds", blurb: "Which destinations ask for the least money up front, ranked in euros." },
  { slug: "student-visa-total-cost-by-country", title: "Student-visa total first-year cost by country", blurb: "Proof of funds + insurance + visa fee, compared in euros." },
  { slug: "fastest-student-visa-processing", title: "Fastest student-visa processing by country", blurb: "Typical processing times, fastest to slowest." },
];

export default function ReportsHub() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-[2.4rem]">Data reports &amp; rankings</h1>
      <p className="mt-2 max-w-2xl text-slate-600" data-speakable>
        Rankings computed from our sourced student-visa dataset and live ECB exchange rates — updated
        as the underlying figures are re-verified.
      </p>

      <AdSlot id="in-content-1" pageType="hub" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {REPORTS.map((r) => (
          <Link key={r.slug} href={`/reports/${r.slug}`} className="rounded-xl border border-slate-200 p-5 hover:border-brand-300 hover:bg-brand-50/40">
            <div className="font-semibold text-slate-800">{r.title}</div>
            <p className="mt-1 text-sm text-slate-600">{r.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
