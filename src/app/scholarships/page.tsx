import type { Metadata } from "next";
import Link from "next/link";
import { getScholarships } from "@/lib/req-data";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Scholarship eligibility & requirements",
  description:
    "Check eligibility for DAAD, Erasmus Mundus and other scholarships with an interactive checker. Sourced from official scholarship bodies and verified.",
  alternates: { canonical: "/scholarships" },
};

export default async function ScholarshipsHub() {
  const scholarships = await getScholarships();
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Scholarship eligibility</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Eligibility rules are confusing by design. Each guide below has an interactive checker that
        gives you a personalized read in under a minute — plus the official source and deadlines.
      </p>

      <AdSlot id="in-content-1" pageType="hub" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {scholarships.map((s) => (
          <Link
            key={s.id}
            href={`/scholarships/${s.slug}`}
            className="rounded-xl border border-slate-200 p-5 hover:border-brand-300 hover:bg-brand-50/40"
          >
            <div className="font-semibold text-slate-800">{s.name}</div>
            <div className="mt-1 text-sm text-slate-500">{s.provider}</div>
            <p className="mt-2 text-sm text-slate-600">{s.summary}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
