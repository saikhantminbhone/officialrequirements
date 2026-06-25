import type { Metadata } from "next";
import Link from "next/link";
import { approvedOutcomes } from "@/lib/outcomes";
import { summarize } from "@/lib/outcomes-core";
import { getUniversity } from "@/lib/universities";
import { getDestinationMeta } from "@/lib/req-data";
import OutcomeTracker from "@/components/OutcomeTracker";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Admission & visa outcomes tracker — real applicant results" },
  description:
    "Real, community-submitted university-admission and student-visa outcomes: acceptance rates, grades, funds and processing times by institution and country. Reviewed before publishing.",
  alternates: { canonical: "/outcomes" },
  keywords: ["admission results tracker", "visa approval timeline", "university acceptance rate self-reported", "student visa outcomes"],
};

export default async function OutcomesIndex() {
  const all = await approvedOutcomes();
  const overall = summarize(all);

  // Group by university (admission) for per-institution trackers.
  const byUni = new Map<string, typeof all>();
  for (const r of all) {
    if (r.type === "admission" && r.university) {
      const arr = byUni.get(r.university) ?? [];
      arr.push(r);
      byUni.set(r.university, arr);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <span className="section-kicker">Community data</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-[2.4rem]">
          Admission &amp; visa outcomes
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">
          Real results from applicants — the data competitors can&apos;t copy. Self-reported and human-reviewed,
          so treat it as indicative. Add yours to make it stronger.
        </p>
        <Link href="/share-outcome" className="btn-primary mt-5">Share your outcome</Link>
      </div>

      <OutcomeTracker title="All reported outcomes" summary={overall} records={all} shareHref="/share-outcome" />

      {[...byUni.entries()].map(([slug, records]) => {
        const uni = getUniversity(slug);
        const dest = uni ? getDestinationMeta(uni.destination) : undefined;
        return (
          <OutcomeTracker
            key={slug}
            title={`${uni?.name ?? slug}${dest ? ` · ${dest.name}` : ""}`}
            summary={summarize(records)}
            records={records}
            shareHref="/share-outcome"
          />
        );
      })}
    </div>
  );
}
