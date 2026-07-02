import { loadServiceAccount, getAccessToken } from "@/lib/gsc";
import { getJson, putJsonSafe } from "@/lib/r2";

// ─────────────────────────────────────────────────────────────────────────
// Google index-coverage monitor (URL Inspection API).
// Answers the question the searchAnalytics report can't: "which of my pages
// are actually in Google's index, and why not?" — per URL, straight from
// Google. Results accumulate in R2 (no database) and surface in /ops/seo.
//
// Quotas: 2,000 inspections/day per property. We inspect a bounded batch per
// run (never-checked URLs first, then stalest), so full coverage converges
// over a few daily runs and stays fresh thereafter.
// ─────────────────────────────────────────────────────────────────────────

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";
const KEY = "seo/index-status.json";
const BATCH = Number(process.env.INDEX_INSPECT_BATCH || 150);
const CONCURRENCY = 4;

export interface UrlIndexStatus {
  verdict: string; // PASS | NEUTRAL | FAIL | VERDICT_UNSPECIFIED
  coverageState: string; // e.g. "Submitted and indexed", "Discovered - currently not indexed"
  indexingState?: string;
  robotsTxtState?: string;
  pageFetchState?: string;
  lastCrawlTime?: string;
  googleCanonical?: string;
  checkedAt: string;
}

export interface IndexStatusReport {
  ranAt: string;
  connected: boolean;
  error?: string;
  totals: { known: number; checkedThisRun: number; indexed: number; notIndexed: number; neverChecked: number };
  byState: Record<string, number>;
  urls: Record<string, UrlIndexStatus>;
}

/** Canonical URL inventory = whatever the live sitemaps declare indexable.
 *  Handles both a flat sitemap and a sitemap index of section sitemaps. */
async function collectSiteUrls(): Promise<string[]> {
  const locsOf = async (url: string): Promise<string[]> => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return [];
      const xml = await res.text();
      return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    } catch {
      return [];
    }
  };
  const top = await locsOf(`${SITE}/sitemap.xml`);
  const childSitemaps = top.filter((u) => u.endsWith(".xml"));
  if (childSitemaps.length === 0) return top;
  const nested = await Promise.all(childSitemaps.map((u) => locsOf(u)));
  return [...new Set(nested.flat())];
}

type InspectResult = {
  inspectionResult?: {
    indexStatusResult?: {
      verdict?: string;
      coverageState?: string;
      indexingState?: string;
      robotsTxtState?: string;
      pageFetchState?: string;
      lastCrawlTime?: string;
      googleCanonical?: string;
    };
  };
};

async function inspect(token: string, siteUrl: string, url: string): Promise<UrlIndexStatus | null> {
  const res = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inspectionUrl: url, siteUrl }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as InspectResult;
  const r = json.inspectionResult?.indexStatusResult;
  if (!r) return null;
  return {
    verdict: r.verdict ?? "VERDICT_UNSPECIFIED",
    coverageState: r.coverageState ?? "Unknown",
    indexingState: r.indexingState,
    robotsTxtState: r.robotsTxtState,
    pageFetchState: r.pageFetchState,
    lastCrawlTime: r.lastCrawlTime,
    googleCanonical: r.googleCanonical,
    checkedAt: new Date().toISOString(),
  };
}

export function isIndexed(s: UrlIndexStatus): boolean {
  return s.verdict === "PASS" || /submitted and indexed|indexed, not submitted/i.test(s.coverageState);
}

export async function runIndexStatus(): Promise<IndexStatusReport> {
  const ranAt = new Date().toISOString();
  const siteUrl = process.env.GSC_SITE_URL;
  const sa = await loadServiceAccount();
  const empty = { known: 0, checkedThisRun: 0, indexed: 0, notIndexed: 0, neverChecked: 0 };
  if (!sa || !siteUrl) {
    return { ranAt, connected: false, error: "GSC not configured (set GSC_SERVICE_ACCOUNT_JSON + GSC_SITE_URL).", totals: empty, byState: {}, urls: {} };
  }

  const [token, siteUrls, prev] = await Promise.all([
    getAccessToken(sa),
    collectSiteUrls(),
    getJson<IndexStatusReport>(KEY),
  ]);
  if (siteUrls.length === 0) {
    return { ranAt, connected: true, error: "sitemap.xml returned no URLs", totals: empty, byState: {}, urls: prev?.urls ?? {} };
  }

  const urls: Record<string, UrlIndexStatus> = { ...(prev?.urls ?? {}) };
  // Drop URLs no longer in the sitemap so the report never bloats.
  const live = new Set(siteUrls);
  for (const u of Object.keys(urls)) if (!live.has(u)) delete urls[u];

  // Priority: never inspected first, then the stalest checks.
  const queue = [...siteUrls].sort((a, b) => {
    const ta = urls[a]?.checkedAt ?? "";
    const tb = urls[b]?.checkedAt ?? "";
    return ta.localeCompare(tb);
  });
  const batch = queue.slice(0, BATCH);

  let checked = 0;
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const results = await Promise.all(batch.slice(i, i + CONCURRENCY).map((u) => inspect(token, siteUrl, u).catch(() => null)));
    results.forEach((r, j) => {
      if (r) {
        urls[batch[i + j]] = r;
        checked++;
      }
    });
  }

  const byState: Record<string, number> = {};
  let indexed = 0;
  let notIndexed = 0;
  for (const u of siteUrls) {
    const s = urls[u];
    if (!s) continue;
    byState[s.coverageState] = (byState[s.coverageState] ?? 0) + 1;
    if (isIndexed(s)) indexed++;
    else notIndexed++;
  }

  const report: IndexStatusReport = {
    ranAt,
    connected: true,
    totals: {
      known: siteUrls.length,
      checkedThisRun: checked,
      indexed,
      notIndexed,
      neverChecked: siteUrls.filter((u) => !urls[u]).length,
    },
    byState,
    urls,
  };
  await putJsonSafe(KEY, report);
  return report;
}

export async function loadIndexStatusReport(): Promise<IndexStatusReport | null> {
  return getJson<IndexStatusReport>(KEY);
}
