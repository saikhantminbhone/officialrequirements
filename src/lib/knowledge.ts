import { getAllRecordsForAdmin } from "@/lib/req-data";
import { GUIDES } from "@/lib/guides";
import { UNIVERSITIES } from "@/lib/universities";
import { sourceStats } from "@/lib/sources";
import { approvedOutcomes } from "@/lib/outcomes";
import { visaIndexDecision } from "@/lib/page-policy";
import { getJson, putJsonSafe } from "@/lib/r2";

// ─────────────────────────────────────────────────────────────────────────
// Knowledge metrics — the "how much do we know, and how fast is it growing"
// layer. computeSnapshot() reads the whole dataset; a daily cron stores a dated
// snapshot so the dashboard can show totals, today's increase, and a trend.
// ─────────────────────────────────────────────────────────────────────────

export interface KnowledgeSnapshot {
  date: string; // YYYY-MM-DD
  ts: string;
  visa: number;
  university: number;
  scholarship: number;
  guides: number;
  namedUniversities: number;
  approvedOutcomes: number;
  sources: number; // accepted (quality-passed) sources
  verified: number; // human-verified records
  indexed: number; // pages allowed to rank
  total: number; // grand total knowledge items
}

const HISTORY_KEY = "data/metrics/history.json";
const MAX_DAYS = 120;

export async function computeSnapshot(): Promise<KnowledgeSnapshot> {
  const [{ visa, university, scholarships }, sources, outcomes] = await Promise.all([
    getAllRecordsForAdmin(),
    sourceStats(),
    approvedOutcomes(),
  ]);
  const pubVisa = visa.filter((r) => r.status === "published");
  const pubUni = university.filter((r) => r.status === "published");
  const pubSch = scholarships.filter((s) => s.status === "published");
  const indexed =
    pubVisa.filter((r) => visaIndexDecision(r).index).length +
    pubUni.filter((r) => visaIndexDecision(r).index).length;
  const verified = [...visa, ...university].filter((r) => r.verification === "human-verified").length;

  const total =
    pubVisa.length + pubUni.length + pubSch.length + GUIDES.length + UNIVERSITIES.length + outcomes.length;

  return {
    date: new Date().toISOString().slice(0, 10),
    ts: new Date().toISOString(),
    visa: pubVisa.length,
    university: pubUni.length,
    scholarship: pubSch.length,
    guides: GUIDES.length,
    namedUniversities: UNIVERSITIES.length,
    approvedOutcomes: outcomes.length,
    sources: sources.accepted,
    verified,
    indexed,
    total,
  };
}

/** Append/replace today's snapshot in the rolling history (best-effort write). */
export async function saveSnapshot(): Promise<KnowledgeSnapshot> {
  const snap = await computeSnapshot();
  const history = (await getJson<KnowledgeSnapshot[]>(HISTORY_KEY)) ?? [];
  const without = history.filter((h) => h.date !== snap.date);
  const next = [...without, snap].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-MAX_DAYS);
  await putJsonSafe(HISTORY_KEY, next);
  return snap;
}

export interface KnowledgeOverview {
  current: KnowledgeSnapshot;
  history: KnowledgeSnapshot[];
  delta: { total: number; sources: number; verified: number } | null; // vs the previous snapshot day
}

export async function knowledgeOverview(): Promise<KnowledgeOverview> {
  const current = await computeSnapshot();
  const history = (await getJson<KnowledgeSnapshot[]>(HISTORY_KEY)) ?? [];
  // Most recent snapshot from a day before today.
  const prev = [...history].reverse().find((h) => h.date < current.date) ?? null;
  const delta = prev
    ? { total: current.total - prev.total, sources: current.sources - prev.sources, verified: current.verified - prev.verified }
    : null;
  // Ensure the graph always includes the live point.
  const merged = [...history.filter((h) => h.date !== current.date), current].slice(-MAX_DAYS);
  return { current, history: merged, delta };
}
