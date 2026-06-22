import { requireAdmin } from "@/lib/auth";
import { getAllRecordsForAdmin, daysSinceVerified, getAllDestinations } from "@/lib/req-data";
import { getJson } from "@/lib/r2";
import { formatDate } from "@/components/SourceCite";
import RebuildButton from "@/components/admin/RebuildButton";
import MaintenancePanel from "@/components/admin/MaintenancePanel";
import CrawlPanel from "@/components/admin/CrawlPanel";
import MarkVerifiedForm from "@/components/admin/MarkVerifiedForm";
import type { FreshnessReport, SourceChangeReport } from "@/lib/maintenance";
import type { CrawlReport } from "@/lib/crawl";

export const dynamic = "force-dynamic";

const STALE_DAYS = 180;
const WARN_DAYS = 90;

export default async function AdminDataPage() {
  await requireAdmin();
  const { visa, university, scholarships } = await getAllRecordsForAdmin();
  const [freshness, sourceChanges, crawl] = await Promise.all([
    getJson<FreshnessReport>("seo/freshness-report.json"),
    getJson<SourceChangeReport>("seo/source-changes.json"),
    getJson<CrawlReport>("seo/extraction-review.json"),
  ]);

  const rows = [
    ...visa.map((r) => ({ id: r.id, title: r.title, lastVerified: r.lastVerified, status: r.status, kind: "visa" })),
    ...university.map((r) => ({ id: r.id, title: r.title, lastVerified: r.lastVerified, status: r.status, kind: "university" })),
    ...scholarships.map((s) => ({ id: s.id, title: s.name, lastVerified: s.lastVerified, status: s.status, kind: "scholarship" })),
  ].sort((a, b) => daysSinceVerified(b.lastVerified) - daysSinceVerified(a.lastVerified));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Data freshness</h1>
        <RebuildButton />
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Records by verification age. Re-verify against the official source, then update the record&apos;s
        <code className="mx-1 rounded bg-slate-100 px-1">lastVerified</code> date. Records past{" "}
        {STALE_DAYS} days are auto-unpublished by the freshness job until a human re-verifies.
        Human-verify-before-publish is enforced for YMYL.
      </p>

      <div className="mt-5">
        <MaintenancePanel />
      </div>

      <div className="mt-5">
        <MarkVerifiedForm destinations={getAllDestinations().map((d) => ({ code: d.code, name: d.meta.name }))} />
      </div>

      <div className="mt-5">
        <CrawlPanel initial={crawl} />
      </div>

      {(freshness || sourceChanges) && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {freshness && (
            <div className="rounded-lg border border-slate-200 p-4 text-sm">
              <div className="font-semibold text-slate-700">Last freshness pass</div>
              <div className="mt-1 text-slate-500">{formatDate(freshness.ranAt)}</div>
              <div className="mt-2 text-slate-600">
                {freshness.totals.reVerifyQueue} queued to re-verify · {freshness.totals.autoUnpublished} auto-unpublished
              </div>
            </div>
          )}
          {sourceChanges && (
            <div className="rounded-lg border border-slate-200 p-4 text-sm">
              <div className="font-semibold text-slate-700">Last source watch</div>
              <div className="mt-1 text-slate-500">{formatDate(sourceChanges.ranAt)}</div>
              <div className="mt-2 text-slate-600">
                {sourceChanges.totals.changed} sources changed · {sourceChanges.totals.unreachable} unreachable of {sourceChanges.totals.sources}
              </div>
              {sourceChanges.changed.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-trust-amber">
                  {sourceChanges.changed.slice(0, 5).map((c) => (
                    <li key={c.url} className="break-all">
                      <a href={c.url} target="_blank" rel="noreferrer" className="hover:underline">{c.url}</a> — re-verify {c.affects.length} record(s)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <table className="mt-5 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2">Record</th>
            <th>Type</th>
            <th>Last verified</th>
            <th>Age</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const age = daysSinceVerified(r.lastVerified);
            const tone = age > STALE_DAYS ? "text-red-600" : age > WARN_DAYS ? "text-trust-amber" : "text-slate-600";
            return (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-800">{r.title}</td>
                <td className="text-slate-500">{r.kind}</td>
                <td className="text-slate-600">{formatDate(r.lastVerified)}</td>
                <td className={tone}>{age} d</td>
                <td>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{r.status}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <div className="font-semibold text-slate-700">Auto-expand workflow</div>
        Add a row to <code className="rounded bg-white px-1">nationalities.json</code> (or PUT a record to
        <code className="mx-1 rounded bg-white px-1">data/visa/&lt;id&gt;.json</code> in R2), then hit Rebuild.
        A fully-formed, sourced page is generated from the template automatically.
      </div>
    </div>
  );
}
