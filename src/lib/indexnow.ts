import { getJson } from "@/lib/r2";
import { getVisaRecords, getUniversityRecords, getScholarships, getAllDestinations } from "@/lib/req-data";
import { visaIndexDecision, scholarshipIndexDecision } from "@/lib/page-policy";
import { destinationPairs } from "@/lib/compare";
import { GUIDES } from "@/lib/guides";
import { UNIVERSITIES } from "@/lib/universities";
import type { SourceChangeReport } from "@/lib/maintenance";

// ─────────────────────────────────────────────────────────────────────────
// IndexNow — instant indexing. Pings Bing, Yandex and the shared IndexNow API
// so search engines re-crawl changed pages within minutes instead of waiting
// for the next organic crawl. The verification key is hosted at the ROOT
// ({key}.txt in public/) and referenced as keyLocation, so it authorizes the
// whole host (a sub-path key file would only authorize that sub-path).
// ─────────────────────────────────────────────────────────────────────────

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com").replace(/\/+$/, "");

// keyLocation MUST be the ROOT key file so it authorizes the whole host. A key
// file under a sub-path (e.g. /api/...) would only authorize URLs under that
// path (IndexNow spec, Option 2), causing 422 for our root-level URLs.
function keyLocation(key: string): string {
  return `${SITE}/${key}.txt`;
}

export interface IndexNowReport {
  ranAt: string;
  ok: boolean;
  submitted: number;
  status: number | null;
  scope: "changed" | "all";
  error?: string;
}

function host(): string {
  return new URL(SITE).hostname;
}

/** Build the full indexable URL list (capped — IndexNow allows up to 10k/request). */
async function allIndexableUrls(): Promise<string[]> {
  const [visa, university, scholarships] = await Promise.all([
    getVisaRecords(),
    getUniversityRecords(),
    getScholarships(),
  ]);
  const urls = new Set<string>();
  const add = (p: string) => urls.add(`${SITE}${p}`);

  ["/", "/university", "/compare", "/reports", "/reports/study-abroad-index", "/scholarships", "/guides", "/methodology", "/data-sources", "/editorial-policy", "/changelog", "/about"].forEach(add);
  getAllDestinations().forEach((d) => add(`/study/${d.code}`));
  GUIDES.forEach((g) => add(`/guides/${g.slug}`));
  add("/universities");
  UNIVERSITIES.forEach((u) => add(`/universities/${u.slug}`));
  ["/outcomes", "/share-outcome"].forEach(add);
  visa.filter((r) => visaIndexDecision(r).index).forEach((r) => add(`/${r.nationality}/${r.destination}/student-visa`));
  university.filter((r) => visaIndexDecision(r).index).forEach((r) => add(`/university/${r.destination}/${r.program?.slug}`));
  scholarships.filter((s) => scholarshipIndexDecision(s).index).forEach((s) => add(`/scholarships/${s.slug}`));
  destinationPairs().forEach(({ a, b }) => add(`/compare/study/${a}/${b}`));

  return [...urls].slice(0, 10000);
}

/** URLs whose source changed since the last source-watch run (targeted ping). */
async function changedUrls(): Promise<string[]> {
  const report = await getJson<SourceChangeReport>("seo/source-changes.json");
  if (!report?.changed?.length) return [];
  const visa = await getVisaRecords();
  const affected = new Set(report.changed.flatMap((c) => c.affects));
  return visa
    .filter((r) => affected.has(r.id))
    .map((r) => `${SITE}/${r.nationality}/${r.destination}/student-visa`);
}

export async function runIndexNow(scope: "changed" | "all" = "changed"): Promise<IndexNowReport> {
  const ranAt = new Date().toISOString();
  const key = process.env.INDEXNOW_KEY;
  if (!key) return { ranAt, ok: false, submitted: 0, status: null, scope, error: "INDEXNOW_KEY not set." };

  let urlList = scope === "all" ? await allIndexableUrls() : await changedUrls();
  if (scope === "changed" && urlList.length === 0) {
    return { ranAt, ok: true, submitted: 0, status: 200, scope, error: "No changed URLs to submit." };
  }
  urlList = urlList.slice(0, 10000);

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: host(), key, keyLocation: keyLocation(key), urlList }),
    });
    return { ranAt, ok: res.ok, submitted: urlList.length, status: res.status, scope };
  } catch (e) {
    return { ranAt, ok: false, submitted: 0, status: null, scope, error: e instanceof Error ? e.message : "indexnow failed" };
  }
}
