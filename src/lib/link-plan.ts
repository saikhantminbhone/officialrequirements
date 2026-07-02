import { getJson, putJsonSafe } from "@/lib/r2";

// ─────────────────────────────────────────────────────────────────────────
// Striking-distance internal-link booster.
// GSC tells us which queries rank 5–20 (one push from page 1) and which page
// ranks for them. This module turns that into a deterministic "link plan":
// high-authority pages (home, hubs) render these links with the query as
// anchor text, concentrating internal PageRank exactly where it converts to
// clicks. The site re-optimises itself from its own search data — no AI.
// ─────────────────────────────────────────────────────────────────────────

const KEY = "seo/link-plan.json";
const MAX_ENTRIES = 15;

export interface LinkPlanEntry {
  query: string; // used as anchor text
  path: string; // internal pathname of the page ranking for it
  position: number;
  impressions: number;
}

export interface LinkPlan {
  updatedAt: string;
  entries: LinkPlanEntry[];
}

export async function loadLinkPlan(): Promise<LinkPlan> {
  return (await getJson<LinkPlan>(KEY)) ?? { updatedAt: "", entries: [] };
}

/** Persist the plan. Returns true when the link set materially changed
 *  (so callers can decide whether a rebuild is worth it). */
export async function saveLinkPlan(entries: LinkPlanEntry[]): Promise<boolean> {
  const prev = await loadLinkPlan();
  const sig = (l: LinkPlanEntry[]) => l.map((e) => `${e.query}→${e.path}`).sort().join("|");
  const changed = sig(prev.entries) !== sig(entries);
  if (changed) await putJsonSafe(KEY, { updatedAt: new Date().toISOString(), entries } satisfies LinkPlan);
  return changed;
}

/** Build the plan from striking-distance opportunities + a query→page map. */
export function computeLinkPlan(
  opportunities: { query: string; position: number; impressions: number; kind: string }[],
  pageForQuery: Map<string, string>,
  siteOrigin: string
): LinkPlanEntry[] {
  const entries: LinkPlanEntry[] = [];
  const seenPaths = new Set<string>();
  for (const o of opportunities) {
    if (o.kind !== "striking-distance") continue;
    const page = pageForQuery.get(o.query);
    if (!page) continue;
    let path: string;
    try {
      const u = new URL(page);
      if (u.origin !== siteOrigin) continue;
      path = u.pathname;
    } catch {
      continue;
    }
    // Never boost the homepage from itself; one link per target page.
    if (path === "/" || seenPaths.has(path)) continue;
    seenPaths.add(path);
    entries.push({ query: o.query, path, position: Math.round(o.position * 10) / 10, impressions: o.impressions });
    if (entries.length >= MAX_ENTRIES) break;
  }
  return entries;
}
