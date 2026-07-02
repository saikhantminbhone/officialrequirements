import { requireAdmin } from "@/lib/auth";
import { getVisaRecords, getAllDestinations } from "@/lib/req-data";
import { PRIORITY_DESTINATIONS } from "@/lib/page-policy";
import { formatDate } from "@/components/SourceCite";
import VerifyRowButton from "@/components/admin/VerifyRowButton";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────
// Human-verification queue. The single highest-leverage manual task for a
// young YMYL site: a person confirms each destination's money figures against
// the official source, which (a) makes the public trust label honest,
// (b) raises pageQualityScore, and (c) lets long-tail pages index via the
// "trusted" path in page-policy. Launch-batch destinations first.
// ─────────────────────────────────────────────────────────────────────────
export default async function VerifyQueuePage() {
  await requireAdmin();
  const [records, destinations] = await Promise.all([getVisaRecords(), Promise.resolve(getAllDestinations())]);
  const destName = new Map(destinations.map((d) => [d.code, d.meta.name]));

  // One representative record per destination (figures are destination-level).
  const byDest = new Map<string, (typeof records)[number]>();
  for (const r of records) {
    if (r.nationality && !byDest.has(r.destination)) byDest.set(r.destination, r);
  }

  const rows = [...byDest.entries()]
    .map(([code, r]) => ({
      code,
      name: destName.get(code) ?? code.toUpperCase(),
      priority: PRIORITY_DESTINATIONS.has(code),
      verified: r.verification === "human-verified",
      corroborated: r.verification === "auto-corroborated",
      lastVerified: r.lastVerified,
      funds: r.toolDefaults?.blockedAccountAmount,
      currency: r.toolDefaults?.blockedAccountCurrency,
      fee: r.toolDefaults?.visaFee,
      weeks: r.toolDefaults?.processingWeeks,
      sourceName: r.source?.name,
      sourceUrl: r.source?.url,
    }))
    // Unverified launch-batch first, then unverified rest, then done.
    .sort((a, b) => Number(a.verified) - Number(b.verified) || Number(b.priority) - Number(a.priority) || a.name.localeCompare(b.name));

  const remaining = rows.filter((r) => !r.verified).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Verification queue</h1>
      <p className="mt-2 max-w-3xl text-sm text-slate-500">
        For each destination: open the official source, confirm the funds figure, visa fee and processing
        time match what we show, then mark it verified. Verified destinations get the green public label,
        a higher quality score, and their long-tail pages become eligible to index. Work top-down —
        launch-batch destinations (★) first.
      </p>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm">
        <span className="font-semibold text-slate-900">{rows.length - remaining}</span>
        <span className="text-slate-500">of {rows.length} destinations verified</span>
      </div>

      <table className="mt-5 w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2">Destination</th>
            <th>Funds figure</th>
            <th>Fee</th>
            <th>Weeks</th>
            <th>Official source (open & check)</th>
            <th>Last verified</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code} className="border-b border-slate-100 align-top">
              <td className="py-2.5 font-medium text-slate-800">
                {r.priority && <span className="mr-1 text-amber-500" title="Launch-batch destination">★</span>}
                {r.name}
              </td>
              <td className="text-slate-700">{r.funds ? `${r.funds.toLocaleString("en-US")} ${r.currency ?? ""}` : "—"}</td>
              <td className="text-slate-700">{r.fee ?? "—"}</td>
              <td className="text-slate-700">{r.weeks ?? "—"}</td>
              <td className="max-w-xs">
                {r.sourceUrl ? (
                  <a href={r.sourceUrl} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                    {r.sourceName ?? r.sourceUrl}
                  </a>
                ) : (
                  <span className="text-red-600">no source!</span>
                )}
              </td>
              <td className="text-slate-500">{formatDate(r.lastVerified)}</td>
              <td>
                {r.verified ? (
                  <span className="text-xs font-medium text-trust-green">✓ human-verified</span>
                ) : (
                  <div className="flex flex-col gap-1">
                    {r.corroborated && <span className="text-[11px] text-slate-400">auto-corroborated</span>}
                    <VerifyRowButton destination={r.code} />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
        <div className="font-semibold text-slate-700">After a verification session</div>
        Trigger a rebuild (Dashboard → Rebuild) so the green labels and index changes go live, then run
        the IndexNow job so engines re-fetch the updated pages.
      </div>
    </div>
  );
}
