import { acceptedSources, allSources, addSourcesToR2, type CrawlSource } from "@/lib/sources";
import { classifySource } from "@/lib/source-trust";
import { detectGaps } from "@/lib/gap-detector";
import { putJsonSafe, getJson } from "@/lib/r2";
import { extractLinks, isRelevant, inferCategory } from "@/lib/discovery-core";

// ─────────────────────────────────────────────────────────────────────────
// Source auto-discovery engine (deterministic, no AI, no human).
//
// Spiders the trusted seed sources, follows their outbound links, and KEEPS ONLY
// links that pass the trust gate (official/reputable) and are on-topic. New ones
// are added to the registry automatically — adding a *source* is safe because
// publishing any *data* from it still goes through the crawl quality + YMYL
// gates. Discovery is prioritised toward destinations that have knowledge gaps.
// ─────────────────────────────────────────────────────────────────────────

export interface DiscoveryReport {
  ranAt: string;
  seedsCrawled: number;
  linksSeen: number;
  candidates: number;
  added: number;
  rejected: number;
  byCategory: Record<string, number>;
  gapDestinations: string[];
}

async function fetchHtml(url: string, timeoutMs = 9000): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "OfficialRequirements-Discovery/1.0 (+source discovery; official-only)" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!/html/i.test(ct)) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function runDiscovery(maxSeeds = 18, maxAdds = 60): Promise<DiscoveryReport> {
  const ranAt = new Date().toISOString();
  const [seeds, known, gapReport] = await Promise.all([acceptedSources(), allSources(), detectGaps()]);

  // Gap intelligence: destinations missing data get crawled first.
  const gapDestinations = [...new Set(gapReport.gaps.map((g) => g.destination))];
  const gapSet = new Set(gapDestinations);
  const ordered = [...seeds].sort((a, b) => Number(gapSet.has(b.country)) - Number(gapSet.has(a.country)));

  const knownUrls = new Set(known.map((s) => s.url));
  const candidates = new Map<string, CrawlSource>();
  let linksSeen = 0;
  let seedsCrawled = 0;

  for (const seed of ordered.slice(0, maxSeeds)) {
    const html = await fetchHtml(seed.url);
    if (!html) continue;
    seedsCrawled++;
    for (const link of extractLinks(html, seed.url)) {
      linksSeen++;
      if (knownUrls.has(link.url) || candidates.has(link.url)) continue;
      if (!isRelevant(link)) continue;
      // Quality gate — only official/reputable domains become sources.
      const tier = classifySource(link.url).tier;
      if (tier !== "official" && tier !== "reputable") continue;
      candidates.set(link.url, {
        url: link.url,
        country: seed.country,
        category: inferCategory(link),
        label: link.anchor || new URL(link.url).hostname,
      });
      if (candidates.size >= maxAdds) break;
    }
    if (candidates.size >= maxAdds) break;
  }

  // Auto-add (the registry re-applies the same gate as defence-in-depth).
  const list = [...candidates.values()];
  const { added, rejected } = await addSourcesToR2(list);

  const byCategory: Record<string, number> = {};
  for (const c of list) byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;

  const report: DiscoveryReport = {
    ranAt,
    seedsCrawled,
    linksSeen,
    candidates: list.length,
    added,
    rejected: rejected.length,
    byCategory,
    gapDestinations,
  };
  await putJsonSafe("seo/discovery-report.json", report);
  return report;
}

export async function loadDiscoveryReport(): Promise<DiscoveryReport | null> {
  return getJson<DiscoveryReport>("seo/discovery-report.json");
}
