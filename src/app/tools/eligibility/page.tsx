import type { Metadata } from "next";
import { getScholarships } from "@/lib/req-data";
import ScholarshipPlayground from "@/components/tools/ScholarshipPlayground";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Scholarship eligibility checker",
  description: "Answer a few questions and get a personalized read on whether you're eligible for DAAD, Erasmus Mundus and more.",
  alternates: { canonical: "/tools/eligibility" },
};

export default async function EligibilityPage() {
  const scholarships = await getScholarships();
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-[2.4rem]">Scholarship eligibility checker</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Pick a scholarship and answer a few questions. You&apos;ll get a personalized read plus any
        red flags to fix. Informational only — always confirm on the official source.
      </p>
      <div className="mt-6">
        <ScholarshipPlayground records={scholarships} />
      </div>
    </div>
  );
}
