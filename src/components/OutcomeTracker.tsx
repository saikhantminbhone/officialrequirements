import Link from "next/link";
import type { OutcomeRecord, OutcomeSummary } from "@/lib/outcomes-core";

// Public, aggregated view of APPROVED user-submitted outcomes — the proprietary
// data layer. Shows nothing-yet gracefully with a contribute CTA.
export default function OutcomeTracker({
  title,
  summary,
  records,
  shareHref,
}: {
  title: string;
  summary: OutcomeSummary;
  records: OutcomeRecord[];
  shareHref: string;
}) {
  return (
    <section className="mt-10 rounded-2xl border border-slate-900/[0.06] bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="section-kicker">Community data</span>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        </div>
        <Link href={shareHref} className="btn-secondary text-sm">Share your outcome</Link>
      </div>

      {summary.total === 0 ? (
        <p className="mt-4 text-sm text-slate-600">
          No verified outcomes yet — be the first to{" "}
          <Link href={shareHref} className="font-medium text-brand-700 hover:underline">share your result</Link> and help the next applicant.
        </p>
      ) : (
        <>
          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Reports" value={String(summary.total)} />
            {summary.acceptanceRate != null && <Stat label="Acceptance rate" value={`${summary.acceptanceRate}%`} />}
            {summary.medianGpa != null && <Stat label="Median GPA/grade" value={String(summary.medianGpa)} />}
            {summary.medianIelts != null && <Stat label="Median IELTS" value={String(summary.medianIelts)} />}
            {summary.medianProcessingWeeks != null && <Stat label="Median processing" value={`~${summary.medianProcessingWeeks} wks`} />}
          </dl>
          <ul className="mt-5 divide-y divide-slate-100 text-sm">
            {records.slice(0, 8).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-slate-700">
                  <span className="font-medium capitalize">{r.result}</span>
                  {r.program ? ` · ${r.program}` : ""}{r.intake ? ` · ${r.intake}` : ""} {r.year}
                </span>
                <span className="text-xs text-slate-500">
                  {[r.gpa != null ? `GPA ${r.gpa}` : null, r.ielts != null ? `IELTS ${r.ielts}` : null].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-400">Self-reported and human-reviewed. Indicative, not official.</p>
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-0.5 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
