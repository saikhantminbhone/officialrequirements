import { getJson, putJsonSafe } from "@/lib/r2";
import { studyAbroadIndex } from "@/lib/reports";

// ─────────────────────────────────────────────────────────────────────────
// Quarterly index snapshots. On the first snapshot-cron run of each quarter,
// the current Study Abroad Index is frozen to R2. The report page then shows
// movement vs the previous quarter — turning a static ranking into a
// quarterly release ("X overtakes Y") that's newly pitchable every 3 months
// with zero manual work.
// ─────────────────────────────────────────────────────────────────────────

export interface QuarterSnapshot {
  quarter: string; // "2026-Q3"
  frozenAt: string;
  rows: { code: string; name: string; index: number; rank: number }[];
}

export function quarterId(d = new Date()): string {
  return `${d.getUTCFullYear()}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
}

export function prevQuarterId(d = new Date()): string {
  const q = Math.floor(d.getUTCMonth() / 3); // 0-based current quarter
  return q === 0 ? `${d.getUTCFullYear() - 1}-Q4` : `${d.getUTCFullYear()}-Q${q}`;
}

const keyFor = (q: string) => `reports/index-snapshot-${q}.json`;

/** Idempotent: freezes the current quarter's index once. Called by the daily
 *  snapshot cron; cheap no-op after the first run of a quarter. */
export async function ensureQuarterSnapshot(): Promise<{ quarter: string; created: boolean }> {
  const q = quarterId();
  const existing = await getJson<QuarterSnapshot>(keyFor(q));
  if (existing) return { quarter: q, created: false };
  const { rows } = await studyAbroadIndex();
  const snapshot: QuarterSnapshot = {
    quarter: q,
    frozenAt: new Date().toISOString(),
    rows: rows.map((r, i) => ({ code: r.code, name: r.name, index: r.index, rank: i + 1 })),
  };
  await putJsonSafe(keyFor(q), snapshot);
  return { quarter: q, created: true };
}

/** The previous quarter's frozen ranking, for delta display. Null in Q1 of the
 *  site's life — the page degrades gracefully. */
export async function loadPrevQuarterSnapshot(): Promise<QuarterSnapshot | null> {
  return getJson<QuarterSnapshot>(keyFor(prevQuarterId()));
}
