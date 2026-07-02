import type { MetadataRoute } from "next";
import { getVisaRecords, getUniversityRecords, getUniversityNoindexIds, getScholarships, getAllDestinations } from "@/lib/req-data";
import { visaIndexDecision, scholarshipIndexDecision } from "@/lib/page-policy";
import { getPromotedPairs } from "@/lib/promotions";
import { destinationPairs } from "@/lib/compare";
import { GUIDES } from "@/lib/guides";
import { UNIVERSITIES } from "@/lib/universities";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

// ─────────────────────────────────────────────────────────────────────────
// Sectioned sitemaps (served at /sitemap/<id>.xml, indexed by /sitemap.xml).
// Splitting by section makes GSC report indexing per content type — so we can
// see that e.g. guides index at 80% while visa pages sit at 10%, and invest
// accordingly. Anti-bloat rule unchanged: only indexable pages are listed.
// ─────────────────────────────────────────────────────────────────────────

export const SITEMAP_SECTIONS = ["core", "hubs", "visa", "university", "compare", "scholarships", "guides", "universities"] as const;
type Section = (typeof SITEMAP_SECTIONS)[number];

export function generateSitemaps(): { id: Section }[] {
  return SITEMAP_SECTIONS.map((id) => ({ id }));
}

type Freq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export default async function sitemap({ id: rawId }: { id: Section | string }): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  // Depending on the Next version, the id may arrive with an ".xml" suffix.
  const normalized = String(rawId).replace(/\.xml$/, "") as Section;
  const id: Section = SITEMAP_SECTIONS.includes(normalized) ? normalized : "core";

  switch (id) {
    case "core": {
      const primary: { path: string; p: number; f: Freq }[] = [
        { path: "/", p: 1.0, f: "daily" },
        { path: "/university", p: 0.8, f: "weekly" },
        { path: "/universities", p: 0.8, f: "weekly" },
        { path: "/scholarships", p: 0.8, f: "weekly" },
        { path: "/compare", p: 0.7, f: "weekly" },
        { path: "/reports", p: 0.7, f: "weekly" },
        { path: "/reports/study-abroad-index", p: 0.8, f: "weekly" },
        { path: "/reports/cheapest-student-visa-proof-of-funds", p: 0.7, f: "weekly" },
        { path: "/reports/student-visa-total-cost-by-country", p: 0.7, f: "weekly" },
        { path: "/reports/fastest-student-visa-processing", p: 0.7, f: "weekly" },
        { path: "/tools/eligibility", p: 0.6, f: "monthly" },
        { path: "/tools/checklist", p: 0.6, f: "monthly" },
        { path: "/tools/cost", p: 0.6, f: "monthly" },
        { path: "/tools/timeline", p: 0.6, f: "monthly" },
        { path: "/guides", p: 0.7, f: "weekly" },
        { path: "/outcomes", p: 0.7, f: "daily" },
        { path: "/share-outcome", p: 0.5, f: "monthly" },
        { path: "/data", p: 0.6, f: "weekly" },
        { path: "/widgets", p: 0.5, f: "monthly" },
        { path: "/methodology", p: 0.5, f: "monthly" },
        { path: "/data-sources", p: 0.4, f: "monthly" },
        { path: "/editorial-policy", p: 0.4, f: "yearly" },
        { path: "/changelog", p: 0.4, f: "weekly" },
        { path: "/about", p: 0.4, f: "yearly" },
      ];
      return primary.map(({ path, p, f }) => ({ url: `${SITE}${path}`, lastModified: now, changeFrequency: f, priority: p }));
    }

    case "hubs":
      return getAllDestinations().map((d) => ({
        url: `${SITE}/study/${d.code}`,
        lastModified: now,
        changeFrequency: "weekly" as Freq,
        priority: 0.8,
      }));

    case "visa": {
      const [visaAll, promoted] = await Promise.all([getVisaRecords(), getPromotedPairs()]);
      return visaAll
        .filter((r) => r.nationality && visaIndexDecision(r, promoted).index)
        .map((r) => ({
          url: `${SITE}/${r.nationality}/${r.destination}/student-visa`,
          lastModified: new Date(r.lastVerified),
          changeFrequency: "monthly" as Freq,
          priority: 0.7,
        }));
    }

    case "university": {
      const [universityAll, uniNoindex, promoted] = await Promise.all([
        getUniversityRecords(),
        getUniversityNoindexIds(),
        getPromotedPairs(),
      ]);
      return universityAll
        .filter((r) => visaIndexDecision(r, promoted).index && !uniNoindex.has(r.id))
        .map((r) => ({
          url: `${SITE}/university/${r.destination}/${r.program?.slug}`,
          lastModified: new Date(r.lastVerified),
          changeFrequency: "monthly" as Freq,
          priority: 0.6,
        }));
    }

    case "compare":
      return destinationPairs().map(({ a, b }) => ({
        url: `${SITE}/compare/study/${a}/${b}`,
        lastModified: now,
        changeFrequency: "monthly" as Freq,
        priority: 0.5,
      }));

    case "scholarships": {
      const scholarshipsAll = await getScholarships();
      return scholarshipsAll
        .filter((s) => scholarshipIndexDecision(s).index)
        .map((s) => ({
          url: `${SITE}/scholarships/${s.slug}`,
          lastModified: new Date(s.lastVerified),
          changeFrequency: "weekly" as Freq,
          priority: 0.7,
        }));
    }

    case "guides":
      return GUIDES.map((g) => ({
        url: `${SITE}/guides/${g.slug}`,
        lastModified: new Date(g.updated),
        changeFrequency: "monthly" as Freq,
        priority: 0.7,
      }));

    case "universities":
      return UNIVERSITIES.map((u) => ({
        url: `${SITE}/universities/${u.slug}`,
        lastModified: new Date(u.lastVerified),
        changeFrequency: "monthly" as Freq,
        priority: 0.8,
      }));
  }
}
