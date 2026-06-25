import { requireAdmin } from "@/lib/auth";
import { knowledgeOverview } from "@/lib/knowledge";
import { loadCronStatus, CRON_JOBS } from "@/lib/cron-status";
import { r2Configured } from "@/lib/r2";
import RebuildButton from "@/components/admin/RebuildButton";
import KnowledgeGraph from "@/components/admin/KnowledgeGraph";
import CronTasksTable from "@/components/admin/CronTasksTable";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const [overview, cronStatus] = await Promise.all([knowledgeOverview(), loadCronStatus()]);
  const ranCount = CRON_JOBS.filter((j) => cronStatus[j.id]).length;
  const ga4 = Boolean(process.env.NEXT_PUBLIC_GA4_ID);
  const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
  const region = process.env.VERCEL_REGION || "—";

  const statusCards = [
    { label: "Data store", value: r2Configured ? "Connected" : "Seed only", ok: r2Configured, sub: r2Configured ? "Cloudflare R2" : "Set R2 env vars" },
    { label: "Analytics", value: ga4 ? "Enabled" : "Off", ok: ga4, sub: ga4 ? "Google Analytics 4" : "Set GA4 id" },
    { label: "Environment", value: env, ok: env === "production", sub: `Region ${region}` },
    { label: "Cron tasks", value: `${ranCount}/${CRON_JOBS.length}`, ok: ranCount > 0, sub: "with a recorded run" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Autonomous knowledge pipeline — discovering, crawling, verifying and publishing.</p>
      </div>

      {/* Status cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statusCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{c.label}</div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${c.ok ? "bg-emerald-500" : "bg-amber-500"}`} />
              <span className="text-lg font-semibold tracking-tight text-slate-900">{c.value}</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Knowledge metrics + growth */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Knowledge</h2>
        <div className="mt-3">
          <KnowledgeGraph overview={overview} />
        </div>
      </div>

      {/* Scheduled tasks */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Scheduled tasks</h2>
          <RebuildButton />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          These run automatically on Vercel Cron; telemetry fills in as each runs (or when you trigger jobs on the Data page).
        </p>
        <div className="mt-3">
          <CronTasksTable status={cronStatus} />
        </div>
      </div>
    </div>
  );
}
