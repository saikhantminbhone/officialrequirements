import { createHash } from "crypto";
import { FRESHNESS } from "@/lib/cron";
import { getAllRecordsForAdmin, daysSinceVerified, getDestinationMeta } from "@/lib/req-data";
import { notifySourceChanges } from "@/lib/subscriptions";
import { acceptedSources } from "@/lib/sources";
import { getJson, putJsonSafe, r2Configured } from "@/lib/r2";

// Shared, deterministic maintenance routines. Used by both the scheduled cron
// routes and the admin "Run now" buttons. No AI anywhere — pure rules + hashing.

export interface FreshnessReport {
  ranAt: string;
  totals: { records: number; reVerifyQueue: number; autoUnpublished: number };
  thresholds: typeof FRESHNESS;
  reVerifyQueue: { id: string; title: string; ageDays: number; kind: string }[];
  autoUnpublished: { id: string; title: string; ageDays: number; kind: string }[];
  rebuilt?: boolean;
}

export async function runMaintain(): Promise<FreshnessReport> {
  const { visa, university, scholarships } = await getAllRecordsForAdmin();
  const all = [
    ...visa.map((r) => ({ kind: "visa" as const, id: r.id, title: r.title, lastVerified: r.lastVerified, status: r.status, record: r })),
    ...university.map((r) => ({ kind: "university" as const, id: r.id, title: r.title, lastVerified: r.lastVerified, status: r.status, record: r })),
    ...scholarships.map((s) => ({ kind: "scholarship" as const, id: s.id, title: s.name, lastVerified: s.lastVerified, status: s.status, record: s })),
  ];

  const reVerifyQueue: FreshnessReport["reVerifyQueue"] = [];
  const autoUnpublished: FreshnessReport["autoUnpublished"] = [];

  const prefixFor = (kind: string) =>
    kind === "visa" ? "data/visa" : kind === "university" ? "data/university" : "data/scholarship";

  for (const item of all) {
    const age = daysSinceVerified(item.lastVerified);
    if (age > FRESHNESS.STALE_DAYS && item.status === "published") {
      if (r2Configured) {
        const updated = { ...item.record, status: "unpublished-stale" as const };
        await putJsonSafe(`${prefixFor(item.kind)}/${item.id}.json`, updated);
      }
      autoUnpublished.push({ id: item.id, title: item.title, ageDays: age, kind: item.kind });
    } else if (age > FRESHNESS.WARN_DAYS) {
      reVerifyQueue.push({ id: item.id, title: item.title, ageDays: age, kind: item.kind });
    }
  }
  reVerifyQueue.sort((a, b) => b.ageDays - a.ageDays);

  let rebuilt = false;
  if (autoUnpublished.length > 0 && process.env.VERCEL_DEPLOY_HOOK_URL) {
    try {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" });
      rebuilt = true;
    } catch {
      /* non-fatal */
    }
  }

  const report: FreshnessReport = {
    ranAt: new Date().toISOString(),
    totals: { records: all.length, reVerifyQueue: reVerifyQueue.length, autoUnpublished: autoUnpublished.length },
    thresholds: FRESHNESS,
    reVerifyQueue,
    autoUnpublished,
    rebuilt,
  };
  await putJsonSafe("seo/freshness-report.json", report);
  return report;
}

type HashMap = Record<string, { hash: string; checkedAt: string; status: number }>;

export interface SourceChangeReport {
  ranAt: string;
  totals: { sources: number; changed: number; unreachable: number };
  changed: { url: string; affects: string[] }[];
  unreachable: string[];
  note: string;
}

async function fetchHash(url: string): Promise<{ hash: string; status: number } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "OfficialRequirements-SourceWatcher/1.0 (+freshness check)" },
      redirect: "follow",
    });
    const text = await res.text();
    const normalized = text.replace(/\s+/g, " ").trim();
    return { hash: createHash("sha256").update(normalized).digest("hex"), status: res.status };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function runWatchSources(): Promise<SourceChangeReport> {
  const { visa, university, scholarships } = await getAllRecordsForAdmin();
  const urlToRecords = new Map<string, string[]>();
  const add = (url: string, id: string) => {
    const arr = urlToRecords.get(url) ?? [];
    arr.push(id);
    urlToRecords.set(url, arr);
  };
  visa.forEach((r) => [r.source, ...(r.extraSources ?? [])].forEach((s) => add(s.url, r.id)));
  university.forEach((r) => [r.source, ...(r.extraSources ?? [])].forEach((s) => add(s.url, r.id)));
  scholarships.forEach((s) => add(s.source.url, s.id));
  // Also monitor every quality-passed source in the registry, so the 1000+
  // official sources are kept fresh — a change flags re-verification.
  (await acceptedSources()).forEach((s) => add(s.url, `registry:${s.category}`));

  const prev = (await getJson<HashMap>("seo/source-hashes.json")) ?? {};
  const next: HashMap = { ...prev };
  const changed: { url: string; affects: string[] }[] = [];
  const unreachable: string[] = [];

  for (const [url, ids] of urlToRecords) {
    const result = await fetchHash(url);
    if (!result) {
      unreachable.push(url);
      continue;
    }
    const before = prev[url]?.hash;
    next[url] = { hash: result.hash, checkedAt: new Date().toISOString(), status: result.status };
    if (before && before !== result.hash) changed.push({ url, affects: ids });
  }

  const report: SourceChangeReport = {
    ranAt: new Date().toISOString(),
    totals: { sources: urlToRecords.size, changed: changed.length, unreachable: unreachable.length },
    changed,
    unreachable,
    note: "Changed sources are flagged for human re-verification. Data is never auto-edited from a diff (YMYL).",
  };
  await putJsonSafe("seo/source-hashes.json", next);
  await putJsonSafe("seo/source-changes.json", report);

  // Change alerts: tell subscribers their destination's official source moved.
  // Best-effort — never blocks or breaks the freshness pass.
  if (changed.length > 0) {
    await notifySourceChanges(changed, (code) => getDestinationMeta(code)?.name ?? code.toUpperCase());
  }

  return report;
}
