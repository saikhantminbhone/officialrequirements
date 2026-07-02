import { requireAdmin } from "@/lib/auth";
import { getAllRecordsForAdmin, getAllDestinations, getUniversityNoindexIds } from "@/lib/req-data";
import { visaIndexDecision } from "@/lib/page-policy";
import { loadGscReport } from "@/lib/gsc";
import { loadCwvReport, type CwvMetric } from "@/lib/cwv";
import { loadTrendReport } from "@/lib/trends";
import { sourceStats } from "@/lib/sources";
import { formatDate } from "@/components/SourceCite";
import { loadIndexStatusReport, isIndexed } from "@/lib/index-status";
import { loadPromotionList } from "@/lib/promotions";
import GscRunButton from "@/components/admin/GscRunButton";
import IndexStatusRunButton from "@/components/admin/IndexStatusRunButton";
import CwvRunButton from "@/components/admin/CwvRunButton";
import TrendsRunButton from "@/components/admin/TrendsRunButton";

export const dynamic = "force-dynamic";

// SEO & health module. Live data from Google Search Console + Core Web Vitals
// (CrUX field data). Vercel Speed Insights also collects RUM in the dashboard.
export default async function AdminSeoPage() {
  await requireAdmin();
  const [{ visa, university, scholarships }, gsc, cwv, trends, sources, uniNoindex, idx, promos] = await Promise.all([
    getAllRecordsForAdmin(),
    loadGscReport(),
    loadCwvReport(),
    loadTrendReport(),
    sourceStats(),
    getUniversityNoindexIds(),
    loadIndexStatusReport(),
    loadPromotionList(),
  ]);
  const drafts = [...visa, ...university, ...scholarships].filter((r) => r.status !== "published").length;
  const visaIndexed = visa.filter((r) => visaIndexDecision(r).index).length;
  const visaHeldBack = visa.length - visaIndexed;
  const uniIndexed = university.filter((r) => visaIndexDecision(r).index && !uniNoindex.has(r.id)).length;
  const verified = [...visa, ...university].filter((r) => r.verification === "human-verified").length;

  const metrics = [
    { label: "Visa pages indexed (launch batch)", value: visaIndexed },
    { label: "Long-tail held back (noindex)", value: visaHeldBack },
    { label: "University pages indexed", value: uniIndexed },
    { label: "Human-verified records", value: verified },
  ];

  const pct = (n: number) => `${n.toFixed(1)}%`;
  const num = (n: number) => n.toLocaleString("en-US");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">SEO &amp; site health</h1>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{m.value}</div>
            <div className="mt-1 text-sm text-slate-500">{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── Source registry (quality gate) ────────────────────────────────── */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-800">Source registry (quality-gated)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Only official/reputable domains pass the trust check; blogs and forums are rejected. The crawler
          and source-watch use the accepted set, kept fresh automatically.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Accepted sources" value={num(sources.accepted)} tone="good" />
          <Stat label="Official (gov/edu)" value={num(sources.official)} />
          <Stat label="Reputable" value={num(sources.reputable)} />
          <Stat label="Rejected (low trust)" value={num(sources.rejected)} tone={sources.rejected > 0 ? "warn" : undefined} />
        </div>
        <div className="mt-2 text-xs text-slate-400">
          By category — visa {sources.byCategory.visa} · admission {sources.byCategory.admission} · scholarship {sources.byCategory.scholarship} · general {sources.byCategory.general}
        </div>
      </section>

      {/* ── Google Search Console ─────────────────────────────────────────── */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Google Search Console</h2>
          <GscRunButton />
        </div>

        {!gsc || !gsc.connected ? (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="font-semibold">Not connected yet.</div>
            {gsc?.error && <div className="mt-1">{gsc.error}</div>}
            <ol className="mt-2 list-decimal pl-5">
              <li>Create a Google Cloud service account and enable the Search Console API.</li>
              <li>Put its JSON key in <code className="rounded bg-white px-1">GSC_SERVICE_ACCOUNT_JSON</code> (or R2 <code className="rounded bg-white px-1">credentials/gsc-sa.json</code>).</li>
              <li>Add the service-account email as a user on your property in Search Console → Settings → Users.</li>
              <li>Set <code className="rounded bg-white px-1">GSC_SITE_URL</code>, then click &ldquo;Sync Search Console now&rdquo;.</li>
            </ol>
          </div>
        ) : (
          <div className="mt-3">
            <div className="text-xs text-slate-400">
              {gsc.range?.startDate} → {gsc.range?.endDate} · synced {formatDate(gsc.ranAt)}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Clicks" value={num(gsc.totals?.clicks ?? 0)} />
              <Stat label="Impressions" value={num(gsc.totals?.impressions ?? 0)} />
              <Stat label="Avg position" value={(gsc.totals?.position ?? 0).toFixed(1)} />
              <Stat
                label="% tier-1 traffic"
                value={pct(gsc.tier1?.pct ?? 0)}
                tone={(gsc.tier1?.pct ?? 0) >= 40 ? "good" : "warn"}
                hint="Raptive needs ≥40%. The lever for display RPM in this niche."
              />
            </div>

            {gsc.topPages && gsc.topPages.length > 0 && (
              <table className="mt-5 w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-2">Page</th>
                    <th>Clicks</th>
                    <th>Impr.</th>
                    <th>Pos.</th>
                  </tr>
                </thead>
                <tbody>
                  {gsc.topPages.map((p) => (
                    <tr key={p.page} className="border-b border-slate-100">
                      <td className="py-2 max-w-md truncate text-slate-700">{p.page}</td>
                      <td>{num(p.clicks)}</td>
                      <td>{num(p.impressions)}</td>
                      <td>{p.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* ── Keyword ranking opportunities (the smart-ranking algorithm) ── */}
            {gsc.opportunities && gsc.opportunities.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-slate-800">Keyword opportunities</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Highest-ROI ranking moves, computed from your own Search Console data. Work these top-down.
                </p>
                <table className="mt-3 w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="py-2">Query</th>
                      <th>Pos.</th>
                      <th>Impr.</th>
                      <th>+Clicks</th>
                      <th>Move</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gsc.opportunities.map((o) => (
                      <tr key={o.query} className="border-b border-slate-100 align-top">
                        <td className="py-2 max-w-xs text-slate-700">
                          {o.query}
                          <div className="text-xs text-slate-400">{o.action}</div>
                        </td>
                        <td>{o.position}</td>
                        <td>{num(o.impressions)}</td>
                        <td className="font-semibold text-trust-green">+{num(o.potentialClicks)}</td>
                        <td>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${o.kind === "striking-distance" ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"}`}>
                            {o.kind === "striking-distance" ? "push to page 1" : "fix title/CTR"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {gsc.rising && gsc.rising.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-slate-800">Rising on your site</h3>
                <p className="mt-1 text-sm text-slate-500">Queries gaining impressions vs the prior 28 days — the trends your own audience is creating.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {gsc.rising.map((r) => (
                    <span key={r.query} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                      {r.query} <span className="font-semibold">+{num(r.delta)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Google index coverage (URL Inspection API) ────────────────────── */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Google index coverage</h2>
          <IndexStatusRunButton />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Per-URL coverage straight from Google (URL Inspection API) for every sitemap URL. This is the
          ground truth for &ldquo;is my site actually indexed&rdquo; — not impressions, not guesses.
        </p>
        {!idx || !idx.connected ? (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="font-semibold">No coverage sweep yet.</div>
            {idx?.error && <div className="mt-1">{idx.error}</div>}
            <p className="mt-1">Uses the same GSC service account. Click &ldquo;Check index coverage now&rdquo; to run the first sweep.</p>
          </div>
        ) : (
          <div className="mt-3">
            <div className="text-xs text-slate-400">Last sweep {formatDate(idx.ranAt)} · {idx.totals.checkedThisRun} URLs inspected this run</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Sitemap URLs" value={num(idx.totals.known)} />
              <Stat label="Indexed" value={num(idx.totals.indexed)} tone="good" />
              <Stat label="Known, not indexed" value={num(idx.totals.notIndexed)} tone={idx.totals.notIndexed > 0 ? "warn" : undefined} />
              <Stat label="Not yet inspected" value={num(idx.totals.neverChecked)} />
            </div>
            {Object.keys(idx.byState).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(idx.byState)
                  .sort((a, b) => b[1] - a[1])
                  .map(([state, count]) => (
                    <span key={state} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                      {state} <span className="font-semibold">{num(count)}</span>
                    </span>
                  ))}
              </div>
            )}
            {(() => {
              const notIndexed = Object.entries(idx.urls)
                .filter(([, s]) => !isIndexed(s))
                .sort((a, b) => a[1].coverageState.localeCompare(b[1].coverageState))
                .slice(0, 40);
              return notIndexed.length > 0 ? (
                <table className="mt-5 w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="py-2">Not-indexed URL</th>
                      <th>Coverage state</th>
                      <th>Last crawl</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notIndexed.map(([url, s]) => (
                      <tr key={url} className="border-b border-slate-100">
                        <td className="py-2 max-w-md truncate text-slate-700">{url.replace(/^https?:\/\/[^/]+/, "")}</td>
                        <td className="text-slate-600">{s.coverageState}</td>
                        <td className="text-slate-400">{s.lastCrawlTime ? formatDate(s.lastCrawlTime) : "never"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null;
            })()}
          </div>
        )}
        {promos.pairs.length > 0 && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <span className="font-semibold">Demand-promoted long-tail pages:</span>{" "}
            {promos.pairs.join(", ")} — promoted automatically from GSC impressions.
          </div>
        )}
      </section>

      {/* ── Trending keywords (Google autocomplete harvest) ───────────────── */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Trending keywords</h2>
          <TrendsRunButton />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Live long-tail from Google autocomplete for your topics, filtered to on-topic and ranked by intent
          and freshness. Pick the relevant ones and turn them into a page section, FAQ, or related-search link.
        </p>
        {!trends || trends.keywords.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No harvest yet — click &ldquo;Harvest trending keywords&rdquo; (needs network + R2).</p>
        ) : (
          <div className="mt-3">
            <div className="text-xs text-slate-400">{trends.totals.relevant} on-topic from {trends.seeds} seeds · {formatDate(trends.ranAt)}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {trends.keywords.slice(0, 40).map((k) => (
                <span key={k.query} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                  {k.query}
                  <span className="rounded-full bg-slate-100 px-1.5 text-[10px] uppercase text-slate-500">{k.intent}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Core Web Vitals (CrUX field data) ─────────────────────────────── */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Core Web Vitals (field data)</h2>
          <CwvRunButton />
        </div>
        {!cwv || !cwv.connected ? (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="font-semibold">No CrUX field data yet.</div>
            {cwv?.error && <div className="mt-1">{cwv.error}</div>}
            <p className="mt-1">
              Set <code className="rounded bg-white px-1">CRUX_API_KEY</code> and click sync. New origins
              need enough real traffic before Chrome has field data — detailed real-user metrics are
              available immediately in the Vercel dashboard (Speed Insights).
            </p>
          </div>
        ) : (
          <div className="mt-3">
            <div className="text-xs text-slate-400">Origin {cwv.origin} · synced {formatDate(cwv.ranAt)}</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Vital label="LCP" metric={cwv.lcp} unit="ms" />
              <Vital label="INP" metric={cwv.inp} unit="ms" />
              <Vital label="CLS" metric={cwv.cls} unit="" />
            </div>
          </div>
        )}
      </section>

      <div className="mt-8 rounded-lg border border-slate-200 p-4 text-sm text-slate-600">
        <div className="font-semibold text-slate-700">The metric that proves the thesis</div>
        Track the <strong>affiliate-vs-display revenue split</strong> against <strong>% tier-1 traffic</strong> above.
        On non-tier-1 traffic, affiliate should carry the P&amp;L (blueprint §0.1). If it doesn&apos;t,
        rethink the economics before scaling pages.
      </div>
    </div>
  );
}

function Vital({ label, metric, unit }: { label: string; metric?: CwvMetric; unit: string }) {
  const ratingColor =
    metric?.rating === "good" ? "text-trust-green" : metric?.rating === "poor" ? "text-red-600" : metric?.rating === "needs-improvement" ? "text-trust-amber" : "text-slate-400";
  const value = metric?.p75 == null ? "—" : unit === "ms" ? `${Math.round(metric.p75)} ${unit}` : metric.p75.toFixed(2);
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className={`text-2xl font-bold ${ratingColor}`}>{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label} <span className="text-xs text-slate-400">(p75)</span></div>
      {metric?.rating && metric.rating !== "none" && (
        <div className={`mt-1 text-xs ${ratingColor}`}>{metric.rating.replace("-", " ")}</div>
      )}
    </div>
  );
}

function Stat({ label, value, tone, hint }: { label: string; value: string; tone?: "good" | "warn"; hint?: string }) {
  const color = tone === "good" ? "text-trust-green" : tone === "warn" ? "text-trust-amber" : "text-slate-900";
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
