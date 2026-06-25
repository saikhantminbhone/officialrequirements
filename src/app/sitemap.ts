import type { MetadataRoute } from "next";
import { getVisaRecords, getUniversityRecords, getUniversityNoindexIds, getScholarships, getAllDestinations } from "@/lib/req-data";
import { visaIndexDecision, scholarshipIndexDecision } from "@/lib/page-policy";
import { destinationPairs } from "@/lib/compare";
import { GUIDES } from "@/lib/guides";
import { UNIVERSITIES } from "@/lib/universities";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [visaAll, universityAll, scholarshipsAll, uniNoindex] = await Promise.all([
    getVisaRecords(),
    getUniversityRecords(),
    getScholarships(),
    getUniversityNoindexIds(),
  ]);

  // Anti-bloat: only indexable, non-duplicate pages belong in the sitemap.
  const visa = visaAll.filter((r) => visaIndexDecision(r).index);
  const university = universityAll.filter((r) => visaIndexDecision(r).index && !uniNoindex.has(r.id));
  const scholarships = scholarshipsAll.filter((s) => scholarshipIndexDecision(s).index);

  const now = new Date();
  type Freq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

  // Home + top hubs/tools are the highest-priority, most-linked entry points.
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
    { path: "/methodology", p: 0.5, f: "monthly" },
    { path: "/data-sources", p: 0.4, f: "monthly" },
    { path: "/editorial-policy", p: 0.4, f: "yearly" },
    { path: "/changelog", p: 0.4, f: "weekly" },
    { path: "/about", p: 0.4, f: "yearly" },
  ];
  const staticRoutes = primary.map(({ path, p, f }) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: f,
    priority: p,
  }));

  const hubRoutes = getAllDestinations().map((d) => ({
    url: `${SITE}/study/${d.code}`,
    lastModified: now,
    changeFrequency: "weekly" as Freq,
    priority: 0.8,
  }));

  const visaRoutes = visa.map((r) => ({
    url: `${SITE}/${r.nationality}/${r.destination}/student-visa`,
    lastModified: new Date(r.lastVerified),
    changeFrequency: "monthly" as Freq,
    priority: 0.7,
  }));

  const universityRoutes = university.map((r) => ({
    url: `${SITE}/university/${r.destination}/${r.program?.slug}`,
    lastModified: new Date(r.lastVerified),
    changeFrequency: "monthly" as Freq,
    priority: 0.6,
  }));

  const compareRoutes = destinationPairs().map(({ a, b }) => ({
    url: `${SITE}/compare/study/${a}/${b}`,
    lastModified: now,
    changeFrequency: "monthly" as Freq,
    priority: 0.5,
  }));

  const scholarshipRoutes = scholarships.map((s) => ({
    url: `${SITE}/scholarships/${s.slug}`,
    lastModified: new Date(s.lastVerified),
    changeFrequency: "weekly" as Freq,
    priority: 0.7,
  }));

  const guideRoutes = GUIDES.map((g) => ({
    url: `${SITE}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "monthly" as Freq,
    priority: 0.7,
  }));

  const namedUniRoutes = UNIVERSITIES.map((u) => ({
    url: `${SITE}/universities/${u.slug}`,
    lastModified: new Date(u.lastVerified),
    changeFrequency: "monthly" as Freq,
    priority: 0.8,
  }));

  return [
    ...staticRoutes,
    ...hubRoutes,
    ...visaRoutes,
    ...universityRoutes,
    ...compareRoutes,
    ...scholarshipRoutes,
    ...guideRoutes,
    ...namedUniRoutes,
  ];
}
