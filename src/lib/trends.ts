import { putJsonSafe, getJson } from "@/lib/r2";
import { getAllDestinations } from "@/lib/req-data";
import { rankTrends, type TrendKeyword } from "@/lib/trends-score";

// ─────────────────────────────────────────────────────────────────────────
// Trending-keyword engine (deterministic, no AI). Harvests real query
// expansions from Google's public autocomplete — what people are actually
// typing about your topics — then filters/ranks them (see trends-score.ts) and
// stores a report. Like a human SEO watching the search box: discover trending
// long-tail, then a person picks which to turn into content. Nothing auto-publishes.
// ─────────────────────────────────────────────────────────────────────────

export type { TrendKeyword, TrendIntent } from "@/lib/trends-score";

export interface TrendReport {
  ranAt: string;
  seeds: number;
  totals: { harvested: number; relevant: number };
  keywords: TrendKeyword[];
  note: string;
}

async function fetchSuggestions(seed: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(seed)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "OfficialRequirements-TrendBot/1.0 (+keyword research)" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as [string, string[]];
    return Array.isArray(data?.[1]) ? data[1] : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

/** Seed list from our actual topics (destinations × intents). */
export function buildSeeds(maxDestinations = 12): string[] {
  const dests = getAllDestinations()
    .map((d) => d.meta.name.replace(/^the /, ""))
    .slice(0, maxDestinations);
  const perDest = dests.flatMap((d) => [`${d} student visa`, `study in ${d}`, `${d} scholarship`]);
  const generic = ["student visa requirements", "study abroad scholarship", "cheapest country to study abroad"];
  return [...generic, ...perDest];
}

export async function harvestTrends(limit = 60): Promise<TrendReport> {
  const year = new Date().getFullYear();
  const seeds = buildSeeds();
  const harvested: { seed: string; suggestions: string[] }[] = [];
  for (const seed of seeds) {
    harvested.push({ seed, suggestions: await fetchSuggestions(seed) });
  }
  const { keywords, totals } = rankTrends(harvested, year, limit);
  const report: TrendReport = {
    ranAt: new Date().toISOString(),
    seeds: seeds.length,
    totals,
    keywords,
    note: "Trending long-tail from Google autocomplete, filtered to on-topic and ranked. Pick which to turn into content — nothing is auto-published.",
  };
  await putJsonSafe("seo/trending-keywords.json", report);
  return report;
}

export async function loadTrendReport(): Promise<TrendReport | null> {
  return getJson<TrendReport>("seo/trending-keywords.json");
}
