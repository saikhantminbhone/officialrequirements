import { requireAdmin } from "@/lib/auth";
import { pendingOutcomes, approvedOutcomes } from "@/lib/outcomes";
import OutcomeModerateButton from "@/components/admin/OutcomeModerateButton";

export const dynamic = "force-dynamic";

export default async function OpsOutcomesPage() {
  await requireAdmin();
  const [pending, approved] = await Promise.all([pendingOutcomes(), approvedOutcomes()]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Outcome moderation</h1>
      <p className="mt-1 text-sm text-slate-500">
        Review user-submitted admission/visa outcomes. Approved entries become public on the outcomes
        tracker; rejected ones are deleted. {approved.length} approved so far.
      </p>

      {pending.length === 0 ? (
        <p className="mt-6 text-sm text-trust-green">No pending submissions.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {pending.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="text-sm text-slate-700">
                  <span className="font-semibold capitalize">{r.result}</span> · {r.type} · {r.destination.toUpperCase()}
                  {r.university ? ` · ${r.university}` : ""}{r.program ? ` · ${r.program}` : ""} · {r.intake ?? ""} {r.year}
                  <div className="mt-1 text-xs text-slate-500">
                    {[r.nationality ? `nat ${r.nationality.toUpperCase()}` : null, r.gpa != null ? `GPA ${r.gpa}` : null, r.ielts != null ? `IELTS ${r.ielts}` : null, r.fundsShownEur != null ? `€${r.fundsShownEur}` : null, r.processingWeeks != null ? `${r.processingWeeks} wks` : null].filter(Boolean).join(" · ")}
                  </div>
                  {r.note && <div className="mt-1 text-xs italic text-slate-500">“{r.note}”</div>}
                  <div className="mt-1 text-[11px] text-slate-400">{new Date(r.submittedAt).toLocaleString()}</div>
                </div>
                <OutcomeModerateButton id={r.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
