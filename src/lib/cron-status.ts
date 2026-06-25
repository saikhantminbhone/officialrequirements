import { getJson, putJsonSafe } from "@/lib/r2";

// ─────────────────────────────────────────────────────────────────────────
// Cron telemetry — records each job's last run so the operations console can
// show a live "scheduled tasks" table (last run, duration, status). Best-effort
// (writes via putJsonSafe), so it never breaks a job.
// ─────────────────────────────────────────────────────────────────────────

export interface CronRun {
  lastRun: string;
  durationMs: number;
  ok: boolean;
  note?: string;
}
export type CronStatusMap = Record<string, CronRun>;

const KEY = "data/cron-status.json";

export async function loadCronStatus(): Promise<CronStatusMap> {
  return (await getJson<CronStatusMap>(KEY)) ?? {};
}

export async function recordCronRun(job: string, durationMs: number, ok = true, note?: string): Promise<void> {
  const map = await loadCronStatus();
  map[job] = { lastRun: new Date().toISOString(), durationMs: Math.round(durationMs), ok, note };
  await putJsonSafe(KEY, map);
}

/** Wrap a job so its run is timed and recorded. Re-throws on failure (recorded). */
export async function withCronStatus<T>(job: string, fn: () => Promise<T>): Promise<T> {
  const t = Date.now();
  try {
    const res = await fn();
    await recordCronRun(job, Date.now() - t, true);
    return res;
  } catch (e) {
    await recordCronRun(job, Date.now() - t, false, e instanceof Error ? e.message : "error");
    throw e;
  }
}

export type CronGroup = "Acquisition" | "Intelligence" | "Publishing" | "System";

export interface CronJobMeta {
  id: string;
  name: string;
  description: string;
  schedule: string;
  group: CronGroup;
}

// Mirrors vercel.json crons — the catalogue shown in the console.
export const CRON_JOBS: CronJobMeta[] = [
  { id: "crawl", name: "Self-healing crawl", description: "Finds gaps, crawls official + discovered sources, extracts candidates.", schedule: "Weekly · Mon 01:00", group: "Acquisition" },
  { id: "discover", name: "Source discovery", description: "Spiders trusted seeds, quality-gates links, auto-adds official sources.", schedule: "Weekly · Wed 02:00", group: "Acquisition" },
  { id: "watch-sources", name: "Source watch", description: "Hashes every official source and flags changes for re-verification.", schedule: "Weekly · Mon 03:00", group: "Acquisition" },
  { id: "fx", name: "FX rates", description: "Pulls ECB reference rates into the conversion table.", schedule: "Daily · 02:00", group: "Acquisition" },
  { id: "trends", name: "Trending keywords", description: "Harvests on-topic long-tail from Google autocomplete.", schedule: "Weekly · Mon 07:00", group: "Acquisition" },
  { id: "factcheck", name: "Cross-source fact-check", description: "Corroborates figures across 2+ official sources.", schedule: "Weekly · Tue 00:00", group: "Intelligence" },
  { id: "gsc", name: "Search Console sync", description: "Pulls performance + keyword opportunities + rising queries.", schedule: "Daily · 05:00", group: "Intelligence" },
  { id: "cwv", name: "Core Web Vitals", description: "Reads CrUX field data for the origin.", schedule: "Daily · 04:00", group: "Intelligence" },
  { id: "snapshot", name: "Knowledge snapshot", description: "Records totals so the dashboard can show growth.", schedule: "Daily · 23:00", group: "Intelligence" },
  { id: "maintain", name: "Freshness pass", description: "Re-verify queue + auto-unpublish stale records.", schedule: "Daily · 06:00", group: "System" },
  { id: "indexnow", name: "IndexNow (changed)", description: "Pushes changed URLs to Bing/IndexNow.", schedule: "Daily · 06:30", group: "Publishing" },
  { id: "indexnow-all", name: "IndexNow (all)", description: "Pushes every indexable URL to Bing/IndexNow.", schedule: "Weekly · Mon 08:00", group: "Publishing" },
];
