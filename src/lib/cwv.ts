import { getJson, putJson } from "@/lib/r2";

// ─────────────────────────────────────────────────────────────────────────
// Core Web Vitals — field data from the Chrome UX Report (CrUX) API.
// This is real-user data (not lab), the same signal Google ranks on. Vercel
// Speed Insights also collects RUM (viewable in the Vercel dashboard); this
// surfaces the headline p75 metrics inside our own admin SEO page.
//
// Setup: enable the "Chrome UX Report API" in Google Cloud, create an API key,
// set it as CRUX_API_KEY. (Vercel Speed Insights/Analytics need no key — just
// the components in the layout, already added.)
// ─────────────────────────────────────────────────────────────────────────

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

export interface CwvMetric {
  p75: number | null;
  rating: "good" | "needs-improvement" | "poor" | "none";
}
export interface CwvReport {
  ranAt: string;
  connected: boolean;
  error?: string;
  origin?: string;
  lcp?: CwvMetric; // ms
  inp?: CwvMetric; // ms
  cls?: CwvMetric; // unitless
}

function rate(metric: string, p75: number | null): CwvMetric["rating"] {
  if (p75 == null) return "none";
  if (metric === "lcp") return p75 <= 2500 ? "good" : p75 <= 4000 ? "needs-improvement" : "poor";
  if (metric === "inp") return p75 <= 200 ? "good" : p75 <= 500 ? "needs-improvement" : "poor";
  if (metric === "cls") return p75 <= 0.1 ? "good" : p75 <= 0.25 ? "needs-improvement" : "poor";
  return "none";
}

export async function runCwv(): Promise<CwvReport> {
  const ranAt = new Date().toISOString();
  const key = process.env.CRUX_API_KEY;
  if (!key) return { ranAt, connected: false, error: "CRUX_API_KEY not set." };

  try {
    const res = await fetch(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: SITE,
        metrics: ["largest_contentful_paint", "interaction_to_next_paint", "cumulative_layout_shift"],
      }),
    });
    if (!res.ok) {
      // 404 = not enough field data yet for this origin (common on new sites).
      const reason = res.status === 404 ? "No field data yet for this origin (new site)." : `CrUX error ${res.status}`;
      return { ranAt, connected: false, error: reason };
    }
    const json = (await res.json()) as {
      record?: { metrics?: Record<string, { percentiles?: { p75?: number | string } }> };
    };
    const m = json.record?.metrics ?? {};
    const p75 = (k: string): number | null => {
      const v = m[k]?.percentiles?.p75;
      return v == null ? null : Number(v);
    };
    const lcp = p75("largest_contentful_paint");
    const inp = p75("interaction_to_next_paint");
    const cls = p75("cumulative_layout_shift");

    const report: CwvReport = {
      ranAt,
      connected: true,
      origin: SITE,
      lcp: { p75: lcp, rating: rate("lcp", lcp) },
      inp: { p75: inp, rating: rate("inp", inp) },
      cls: { p75: cls, rating: rate("cls", cls) },
    };
    await putJson("seo/cwv-report.json", report);
    return report;
  } catch (e) {
    return { ranAt, connected: false, error: e instanceof Error ? e.message : "CrUX query failed" };
  }
}

export async function loadCwvReport(): Promise<CwvReport | null> {
  return getJson<CwvReport>("seo/cwv-report.json");
}
