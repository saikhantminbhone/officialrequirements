import { CRON_JOBS, type CronStatusMap } from "@/lib/cron-status";

function ago(iso?: string): string {
  if (!iso) return "—";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
function dur(ms?: number): string {
  if (ms == null) return "—";
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

// Live "scheduled tasks" table for the operations console.
export default function CronTasksTable({ status }: { status: CronStatusMap }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">Task</th>
            <th className="px-4 py-3 font-medium">Schedule</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Last run</th>
            <th className="px-4 py-3 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody>
          {CRON_JOBS.map((job) => {
            const run = status[job.id];
            const state = !run ? "idle" : run.ok ? "success" : "failed";
            return (
              <tr key={job.id} className="border-b border-slate-100 last:border-0 align-top">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{job.name}</div>
                  <div className="mt-0.5 max-w-md text-xs text-slate-500">{job.description}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{job.schedule}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                      state === "success"
                        ? "bg-emerald-50 text-emerald-700"
                        : state === "failed"
                        ? "bg-red-50 text-red-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${state === "success" ? "bg-emerald-500" : state === "failed" ? "bg-red-500" : "bg-slate-400"}`} />
                    {state === "idle" ? "Scheduled" : state === "success" ? "Success" : "Failed"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{ago(run?.lastRun)}</td>
                <td className="px-4 py-3 text-slate-600">{dur(run?.durationMs)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
