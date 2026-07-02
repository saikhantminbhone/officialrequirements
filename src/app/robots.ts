import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

// Per-engine robots policy (same posture as OfficialSalary):
//  - Allowlist AI / answer-engine crawlers so the data is citable in AI search (GEO).
//  - Allow reputable SEO crawlers for backlink monitoring.
//  - Block bulk scrapers (CCBot).
//  - Keep admin + write APIs out of all indexes.
export default function robots(): MetadataRoute.Robots {
  const disallowPrivate = ["/ops", "/ops/", "/admin", "/admin/", "/api/admin", "/api/admin/", "/api/auth/"];

  // AI / answer engines — explicitly allowed (this is the GEO surface).
  const aiCrawlers = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "anthropic-ai",
    "ClaudeBot",
    "Claude-Web",
    "Applebot",
    "Applebot-Extended",
    "Amazonbot",
    "Bytespider",
    "cohere-ai",
    "DuckAssistBot",
    "MistralAI-User",
  ];

  // Major search engines — named explicitly so there's zero ambiguity.
  const searchCrawlers = ["Googlebot", "Bingbot", "Slurp", "DuckDuckBot", "YandexBot"];

  // Reputable SEO crawlers — allowed so we can monitor backlinks/authority.
  const seoCrawlers = ["AhrefsBot", "SemrushBot", "MJ12bot", "rogerbot", "dotbot"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: disallowPrivate },
      ...searchCrawlers.map((ua) => ({ userAgent: ua, allow: "/", disallow: disallowPrivate })),
      ...aiCrawlers.map((ua) => ({ userAgent: ua, allow: "/", disallow: disallowPrivate })),
      ...seoCrawlers.map((ua) => ({ userAgent: ua, allow: "/", disallow: disallowPrivate })),
      // Bulk dataset scraper with no search/citation benefit — blocked.
      { userAgent: "CCBot", disallow: "/" },
    ],
    // Sitemap index + section sitemaps (per-section indexing visibility in GSC).
    // /sitemap.xml 301s to the index, so previously-submitted URLs keep working.
    sitemap: [
      `${SITE}/sitemap-index.xml`,
      ...["core", "hubs", "visa", "university", "compare", "scholarships", "guides", "universities"].map(
        (s) => `${SITE}/sitemap/${s}.xml`
      ),
    ],
    host: SITE,
  };
}
