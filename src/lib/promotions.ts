import { getJson, putJsonSafe } from "@/lib/r2";
import { PRIORITY_NATIONALITIES, PRIORITY_DESTINATIONS } from "@/lib/page-policy";
import type { GscReport } from "@/lib/gsc";

// ─────────────────────────────────────────────────────────────────────────
// Demand-driven index expansion (the "auto-expand" loop).
// Long-tail nationality×destination pages launch as noindex,follow. When GSC
// shows real impressions for one of them, it has proven demand — so we promote
// it into the indexable set, persist that decision in R2, and trigger a
// rebuild. Deterministic rules only; no AI, no backend, no database.
// ─────────────────────────────────────────────────────────────────────────

const KEY = "seo/promoted-pairs.json";

/** Impressions (28-day window) a held-out page must earn to be promoted. */
const PROMOTE_MIN_IMPRESSIONS = Number(process.env.PROMOTE_MIN_IMPRESSIONS || 30);

export interface PromotionList {
  updatedAt: string;
  /** Promoted pair ids, e.g. "uz-cz" (nationality-destination). */
  pairs: string[];
  log: { pair: string; impressions: number; promotedAt: string }[];
}

export async function loadPromotionList(): Promise<PromotionList> {
  const list = await getJson<PromotionList>(KEY);
  return list ?? { updatedAt: "", pairs: [], log: [] };
}

/** Set of promoted "nat-dest" pair ids, for page-policy / sitemap consumers. */
export async function getPromotedPairs(): Promise<Set<string>> {
  const list = await loadPromotionList();
  return new Set(list.pairs);
}

const VISA_PATH = /^\/([a-z]{2})\/([a-z]{2})\/student-visa\/?$/;

/** Scan a GSC report for held-out long-tail pages with proven impressions and
 *  promote them. Returns the newly promoted pairs. Triggers a rebuild when
 *  anything changed so the static pages pick up index,follow. */
export async function applyPromotionsFromReport(report: GscReport): Promise<{ promoted: string[] }> {
  const pages = report.topPages ?? [];
  if (pages.length === 0) return { promoted: [] };

  const list = await loadPromotionList();
  const have = new Set(list.pairs);
  const promoted: string[] = [];

  for (const p of pages) {
    let path: string;
    try {
      path = new URL(p.page).pathname;
    } catch {
      continue;
    }
    const m = VISA_PATH.exec(path);
    if (!m) continue;
    const [, nat, dest] = m;
    // Already indexable via the launch batch — nothing to promote.
    if (PRIORITY_NATIONALITIES.has(nat) && PRIORITY_DESTINATIONS.has(dest)) continue;
    const pair = `${nat}-${dest}`;
    if (have.has(pair)) continue;
    if (p.impressions >= PROMOTE_MIN_IMPRESSIONS) {
      have.add(pair);
      promoted.push(pair);
      list.log.push({ pair, impressions: p.impressions, promotedAt: new Date().toISOString() });
    }
  }

  if (promoted.length > 0) {
    list.pairs = [...have].sort();
    list.updatedAt = new Date().toISOString();
    await putJsonSafe(KEY, list);
    // Rebuild so the promoted pages go out with index,follow + sitemap entries.
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      try {
        await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" });
      } catch {
        /* non-fatal */
      }
    }
  }
  return { promoted };
}
