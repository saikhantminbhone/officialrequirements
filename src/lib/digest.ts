import { getJson, putJsonSafe } from "@/lib/r2";
import { loadGscReport } from "@/lib/gsc";
import { loadIndexStatusReport } from "@/lib/index-status";
import { loadPromotionList } from "@/lib/promotions";
import { sendEmail } from "@/lib/subscriptions";
import type { FreshnessReport, SourceChangeReport } from "@/lib/maintenance";

// ─────────────────────────────────────────────────────────────────────────
// Weekly SEO digest — one place (and one email) answering: is the site getting
// indexed, is search demand growing, did anything drift, what needs a human?
// Compiled from reports the other crons already write to R2. Emailed to
// ADMIN_EMAIL when RESEND_API_KEY is set; always stored at seo/weekly-digest.json.
// ─────────────────────────────────────────────────────────────────────────

export interface WeeklyDigest {
  ranAt: string;
  index: { known: number; indexed: number; notIndexed: number; neverChecked: number } | null;
  search: { clicks: number; impressions: number; position: number; deltaImpressions: number | null } | null;
  promotions: { total: number; recent: string[] };
  freshness: { reVerifyQueue: number; autoUnpublished: number } | null;
  sourceChanges: number | null;
  actions: string[];
  emailed: boolean;
}

export async function runDigest(): Promise<WeeklyDigest> {
  const [gsc, idx, promos, freshness, changes, prev] = await Promise.all([
    loadGscReport(),
    loadIndexStatusReport(),
    loadPromotionList(),
    getJson<FreshnessReport>("seo/freshness-report.json"),
    getJson<SourceChangeReport>("seo/source-changes.json"),
    getJson<WeeklyDigest>("seo/weekly-digest.json"),
  ]);

  const index = idx?.connected
    ? { known: idx.totals.known, indexed: idx.totals.indexed, notIndexed: idx.totals.notIndexed, neverChecked: idx.totals.neverChecked }
    : null;
  const search = gsc?.connected && gsc.totals
    ? {
        clicks: gsc.totals.clicks,
        impressions: gsc.totals.impressions,
        position: Math.round(gsc.totals.position * 10) / 10,
        deltaImpressions: prev?.search ? gsc.totals.impressions - prev.search.impressions : null,
      }
    : null;

  const weekAgo = Date.now() - 7 * 864e5;
  const recentPromotions = promos.log.filter((l) => new Date(l.promotedAt).getTime() > weekAgo).map((l) => l.pair);

  // The "what should a human do this week" list — deterministic rules.
  const actions: string[] = [];
  if (!gsc?.connected) actions.push("Connect Google Search Console (GSC_SERVICE_ACCOUNT_JSON + GSC_SITE_URL).");
  if (index && index.indexed === 0) actions.push("Nothing indexed yet: request indexing for the homepage, hubs and guides in GSC URL Inspection.");
  if (index && index.notIndexed > index.indexed) actions.push(`${index.notIndexed} known pages not indexed — the lever is backlinks: pitch the data reports this week.`);
  if ((freshness?.totals.reVerifyQueue ?? 0) > 0) actions.push(`${freshness!.totals.reVerifyQueue} records in the re-verify queue → /ops/verify.`);
  if ((changes?.totals.changed ?? 0) > 0) actions.push(`${changes!.totals.changed} official sources changed since last watch — re-verify affected destinations.`);
  if (recentPromotions.length > 0) actions.push(`Demand promoted ${recentPromotions.join(", ")} — consider human-verifying them for the green label.`);
  if (actions.length === 0) actions.push("No red flags. Spend the week on outreach/backlinks — the one thing automation can't do.");

  const digest: WeeklyDigest = {
    ranAt: new Date().toISOString(),
    index,
    search,
    promotions: { total: promos.pairs.length, recent: recentPromotions },
    freshness: freshness ? { reVerifyQueue: freshness.totals.reVerifyQueue, autoUnpublished: freshness.totals.autoUnpublished } : null,
    sourceChanges: changes?.totals.changed ?? null,
    actions,
    emailed: false,
  };

  const admin = process.env.ADMIN_EMAIL;
  if (admin) {
    const fmt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-US"));
    const html = `
      <h2>OfficialRequirements — weekly SEO digest</h2>
      <p><strong>Index coverage:</strong> ${index ? `${fmt(index.indexed)} indexed / ${fmt(index.known)} in sitemap (${fmt(index.notIndexed)} known-not-indexed, ${fmt(index.neverChecked)} unchecked)` : "no sweep yet"}</p>
      <p><strong>Search (28d):</strong> ${search ? `${fmt(search.clicks)} clicks · ${fmt(search.impressions)} impressions${search.deltaImpressions != null ? ` (${search.deltaImpressions >= 0 ? "+" : ""}${fmt(search.deltaImpressions)} vs last digest)` : ""} · avg pos ${search.position}` : "GSC not connected"}</p>
      <p><strong>Auto-promotions:</strong> ${digest.promotions.total} total${recentPromotions.length ? ` — new this week: ${recentPromotions.join(", ")}` : ""}</p>
      <p><strong>Freshness:</strong> ${digest.freshness ? `${digest.freshness.reVerifyQueue} to re-verify · ${digest.freshness.autoUnpublished} auto-unpublished` : "—"} · <strong>Source changes:</strong> ${fmt(digest.sourceChanges)}</p>
      <h3>Do this week</h3>
      <ul>${actions.map((a) => `<li>${a}</li>`).join("")}</ul>`;
    digest.emailed = await sendEmail([admin], "Weekly SEO digest — OfficialRequirements", html);
  }

  await putJsonSafe("seo/weekly-digest.json", digest);
  return digest;
}
