import { requireAdmin } from "@/lib/auth";
import { detectGaps } from "@/lib/gap-detector";
import { registryView, sourceStats } from "@/lib/sources";
import { loadDiscoveryReport } from "@/lib/discovery";
import { formatDate } from "@/components/SourceCite";
import SourceGovernance from "@/components/admin/SourceGovernance";

export const dynamic = "force-dynamic";

export default async function OpsSourcesPage() {
  await requireAdmin();
  const [gaps, registry, stats, discovery] = await Promise.all([
    detectGaps(),
    registryView(),
    sourceStats(),
    loadDiscoveryReport(),
  ]);
  const num = (n: number) => n.toLocaleString("en-US");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Knowledge gaps &amp; source governance</h1>
      <p className="mt-1 text-sm text-slate-500">
        The autonomous pipeline keeps running — discovering, crawling and refreshing. You stay in control:
        block, pause, delete or pin (override) any source below.
      </p>

      {/* ── Knowledge gaps ────────────────────────────────────────────────── */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold text-slate-800">Knowledge gaps</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <Stat label="Records scanned" value={num(gaps.totals.records)} />
          <Stat label="With gaps" value={num(gaps.totals.withGaps)} tone={gaps.totals.withGaps > 0 ? "warn" : undefined} />
          <Stat label="Stale" value={num(gaps.totals.stale)} tone={gaps.totals.stale > 0 ? "warn" : undefined} />
          <Stat label="Missing fields" value={num(gaps.totals.missingFields)} />
        </div>
        {gaps.gaps.length > 0 && (
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Record</th><th>Missing</th><th>Stale</th>
              </tr>
            </thead>
            <tbody>
              {gaps.gaps.slice(0, 20).map((g) => (
                <tr key={g.recordId} className="border-b border-slate-100 align-top">
                  <td className="py-2 max-w-xs text-slate-700">{g.title}</td>
                  <td className="text-xs text-trust-amber">{g.missing.join(", ") || "—"}</td>
                  <td className="text-xs text-slate-500">{g.stale ? `${g.ageDays}d` : "ok"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ── Source registry + governance ──────────────────────────────────── */}
      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Source registry ({num(registry.length)})</h2>
          <div className="text-xs text-slate-500">
            {stats.official} official · {stats.reputable} reputable · {stats.accepted} accepted
            {discovery ? ` · last discovery added ${discovery.added}` : ""}
          </div>
        </div>
        <div className="mt-3 space-y-2">
          {registry.map((s) => (
            <div key={s.url} className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-slate-800">{s.label}</div>
                  <a href={s.url} target="_blank" rel="noreferrer" className="block max-w-xl truncate text-xs text-brand-600 hover:underline">{s.url}</a>
                  <div className="mt-1 text-xs text-slate-500">
                    {s.country.toUpperCase()} · {s.category} · trust {s.tier} ({s.score})
                  </div>
                </div>
                <SourceGovernance source={s} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {discovery && (
        <p className="mt-6 text-xs text-slate-400">
          Last auto-discovery {formatDate(discovery.ranAt)} — {discovery.seedsCrawled} seeds, {discovery.candidates} candidates,
          {" "}{discovery.added} added, {discovery.rejected} rejected by the quality gate.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className={`text-2xl font-bold ${tone === "warn" ? "text-trust-amber" : "text-slate-900"}`}>{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}
