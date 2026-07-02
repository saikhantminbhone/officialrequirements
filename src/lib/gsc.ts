import { createSign } from "crypto";
import { getJson, putJson } from "@/lib/r2";
import { computeOpportunities, type KeywordOpportunity, type QueryRow } from "@/lib/keyword-opportunities";
import { applyPromotionsFromReport } from "@/lib/promotions";

// ─────────────────────────────────────────────────────────────────────────
// Google Search Console integration (no extra dependencies).
// A service account (JSON key) is used to mint a JWT, exchange it for an
// access token, and query Search Console's searchAnalytics API. We compute
// per-page performance and the niche-critical "% tier-1 traffic" metric, then
// store a report in R2 for the admin SEO dashboard.
//
// Setup:
//   1. Google Cloud → create a service account, enable the Search Console API.
//   2. Download its JSON key; put the whole JSON in env GSC_SERVICE_ACCOUNT_JSON
//      (or store it at credentials/gsc-sa.json in R2).
//   3. In Search Console → Settings → Users, add the service account email as a
//      full/restricted user on the property.
//   4. Set GSC_SITE_URL, e.g. "sc-domain:officialrequirements.com" or
//      "https://officialrequirements.com/".
// ─────────────────────────────────────────────────────────────────────────

const TIER1 = new Set(["usa", "gbr", "can", "aus", "nzl"]); // GSC uses ISO-3 lowercase

export interface GscReport {
  ranAt: string;
  connected: boolean;
  error?: string;
  range?: { startDate: string; endDate: string };
  totals?: { clicks: number; impressions: number; ctr: number; position: number };
  tier1?: { clicks: number; total: number; pct: number };
  topPages?: { page: string; clicks: number; impressions: number; position: number }[];
  // Keyword ranking opportunities (striking-distance + CTR gaps), highest ROI first.
  opportunities?: KeywordOpportunity[];
  // Queries gaining impressions vs the prior period — trending on your own site.
  rising?: { query: string; impressions: number; prevImpressions: number; delta: number; position: number }[];
}

export type ServiceAccount = { client_email: string; private_key: string };

export async function loadServiceAccount(): Promise<ServiceAccount | null> {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (raw) {
    try {
      return JSON.parse(raw) as ServiceAccount;
    } catch {
      return null;
    }
  }
  // Fallback: stored in R2 (keeps secrets out of env, like OfficialSalary).
  return getJson<ServiceAccount>("credentials/gsc-sa.json");
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signingInput = `${header}.${claim}`;
  const signature = createSign("RSA-SHA256").update(signingInput).sign(sa.private_key);
  const jwt = `${signingInput}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`token exchange failed (${res.status})`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function query(token: string, siteUrl: string, body: object) {
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`searchAnalytics query failed (${res.status})`);
  return res.json() as Promise<{ rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[] }>;
}

export async function runGsc(): Promise<GscReport> {
  const ranAt = new Date().toISOString();
  const siteUrl = process.env.GSC_SITE_URL;
  const sa = await loadServiceAccount();
  if (!sa || !siteUrl) {
    return { ranAt, connected: false, error: "GSC not configured (set GSC_SERVICE_ACCOUNT_JSON + GSC_SITE_URL)." };
  }

  try {
    const token = await getAccessToken(sa);
    const startDate = dateNDaysAgo(28);
    const endDate = dateNDaysAgo(1);

    const [pages, countries, queries] = await Promise.all([
      query(token, siteUrl, { startDate, endDate, dimensions: ["page"], rowLimit: 100 }),
      query(token, siteUrl, { startDate, endDate, dimensions: ["country"], rowLimit: 250 }),
      query(token, siteUrl, { startDate, endDate, dimensions: ["query"], rowLimit: 500 }),
    ]);

    const pageRows = pages.rows ?? [];
    const totals = pageRows.reduce(
      (acc, r) => {
        acc.clicks += r.clicks;
        acc.impressions += r.impressions;
        return acc;
      },
      { clicks: 0, impressions: 0 }
    );
    const weightedPos = pageRows.reduce((s, r) => s + r.position * r.impressions, 0);
    const position = totals.impressions ? weightedPos / totals.impressions : 0;
    const ctr = totals.impressions ? totals.clicks / totals.impressions : 0;

    const countryRows = countries.rows ?? [];
    const countryTotalClicks = countryRows.reduce((s, r) => s + r.clicks, 0);
    const tier1Clicks = countryRows.filter((r) => TIER1.has(r.keys[0])).reduce((s, r) => s + r.clicks, 0);

    // Keyword opportunity mining from the query dimension.
    const queryRows: QueryRow[] = (queries.rows ?? []).map((r) => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    }));
    const opportunities = computeOpportunities(queryRows, 40);

    // Rising queries: impressions vs the prior 28-day window.
    const prevQueries = await query(token, siteUrl, {
      startDate: dateNDaysAgo(56),
      endDate: dateNDaysAgo(29),
      dimensions: ["query"],
      rowLimit: 500,
    }).catch(() => ({ rows: [] as { keys: string[]; impressions: number }[] }));
    const prevMap = new Map((prevQueries.rows ?? []).map((r) => [r.keys[0], r.impressions]));
    const rising = queryRows
      .map((r) => {
        const prevImpressions = prevMap.get(r.query) ?? 0;
        return { query: r.query, impressions: r.impressions, prevImpressions, delta: r.impressions - prevImpressions, position: r.position };
      })
      .filter((r) => r.impressions >= 30 && r.delta > 0 && r.impressions >= r.prevImpressions * 1.5)
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 20);

    const report: GscReport = {
      ranAt,
      connected: true,
      range: { startDate, endDate },
      totals: { clicks: totals.clicks, impressions: totals.impressions, ctr, position },
      tier1: { clicks: tier1Clicks, total: countryTotalClicks, pct: countryTotalClicks ? (tier1Clicks / countryTotalClicks) * 100 : 0 },
      topPages: pageRows
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 25)
        .map((r) => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: r.position })),
      opportunities,
      rising,
    };

    await putJson("seo/gsc-report.json", report);

    // Demand-driven expansion: promote held-out long-tail pages that are already
    // earning impressions (the "auto-expand" loop — deterministic, no AI).
    try {
      await applyPromotionsFromReport(report);
    } catch {
      /* non-fatal — promotion must never break the GSC sync */
    }

    return report;
  } catch (e) {
    return { ranAt, connected: false, error: e instanceof Error ? e.message : "GSC query failed" };
  }
}

export async function loadGscReport(): Promise<GscReport | null> {
  return getJson<GscReport>("seo/gsc-report.json");
}
