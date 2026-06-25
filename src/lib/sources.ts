import { classifySource, type TrustTier } from "@/lib/source-trust";
import { getJson, putJsonSafe } from "@/lib/r2";
import { loadGovernance, matches } from "@/lib/governance";

// ─────────────────────────────────────────────────────────────────────────
// Quality-gated source registry.
//
// The set of official sources the crawler fans out over. Every source is
// auto-graded by source-trust; only `official`/`reputable` domains are accepted
// — blogs, forums and low-trust sites are rejected automatically. Seeded with
// real government/official bodies and built to scale: bulk-import more (with the
// same gate) via addSourcesToR2, and the crawler reads the merged set.
// ─────────────────────────────────────────────────────────────────────────

export type SourceCategory = "visa" | "scholarship" | "admission" | "general";

export interface CrawlSource {
  url: string;
  country: string; // ISO code, or "intl"
  category: SourceCategory;
  label: string;
}

// Curated seed of real official sources. Extend freely — the quality gate keeps
// it clean. (Government/official immigration + study + scholarship bodies.)
export const SEED_SOURCES: CrawlSource[] = [
  // Germany
  { url: "https://www.auswaertiges-amt.de/en/visa-service/studying-working", country: "de", category: "visa", label: "German Federal Foreign Office" },
  { url: "https://www.study-in-germany.de/en/plan-your-studies/requirements/", country: "de", category: "admission", label: "Study in Germany (DAAD)" },
  { url: "https://www.make-it-in-germany.com/en/studying-training/studying", country: "de", category: "visa", label: "Make it in Germany" },
  { url: "https://www.daad.de/en/study-and-research-in-germany/scholarships/", country: "de", category: "scholarship", label: "DAAD scholarships" },
  // UK
  { url: "https://www.gov.uk/student-visa", country: "gb", category: "visa", label: "GOV.UK Student visa" },
  { url: "https://www.gov.uk/student-visa/money", country: "gb", category: "visa", label: "GOV.UK maintenance funds" },
  { url: "https://www.ucas.com/undergraduate/applying-university", country: "gb", category: "admission", label: "UCAS" },
  // Canada
  { url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html", country: "ca", category: "visa", label: "IRCC study permit" },
  { url: "https://www.educanada.ca/scholarships-bourses/index.aspx", country: "ca", category: "scholarship", label: "EduCanada scholarships" },
  // Australia
  { url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500", country: "au", category: "visa", label: "Home Affairs subclass 500" },
  { url: "https://www.studyaustralia.gov.au/en/plan-your-studies/how-to-apply", country: "au", category: "admission", label: "Study Australia" },
  // USA
  { url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html", country: "us", category: "visa", label: "US Dept of State student visa" },
  { url: "https://studyinthestates.dhs.gov/students", country: "us", category: "visa", label: "Study in the States (DHS)" },
  // Netherlands
  { url: "https://ind.nl/en/study", country: "nl", category: "visa", label: "IND Netherlands" },
  { url: "https://www.studyinnl.org/finances", country: "nl", category: "admission", label: "Study in NL" },
  // Ireland
  { url: "https://www.irishimmigration.ie/coming-to-study-in-ireland/", country: "ie", category: "visa", label: "Irish Immigration Service" },
  // France
  { url: "https://www.campusfrance.org/en", country: "fr", category: "admission", label: "Campus France" },
  { url: "https://france-visas.gouv.fr/en/web/france-visas/student", country: "fr", category: "visa", label: "France-Visas" },
  // Sweden / Norway / Denmark / Finland
  { url: "https://www.migrationsverket.se/en/you-want-to-apply/studies.html", country: "se", category: "visa", label: "Migrationsverket" },
  { url: "https://www.udi.no/en/want-to-apply/studies/", country: "no", category: "visa", label: "UDI Norway" },
  { url: "https://www.nyidanmark.dk/en-GB/You-want-to-apply/Study", country: "dk", category: "visa", label: "New to Denmark" },
  { url: "https://migri.fi/en/studies", country: "fi", category: "visa", label: "Finnish Immigration Service" },
  // Others
  { url: "https://www.studyinjapan.go.jp/en/", country: "jp", category: "admission", label: "Study in Japan" },
  { url: "https://www.studyinkorea.go.kr/en/main.do", country: "kr", category: "admission", label: "Study in Korea" },
  { url: "https://educationmalaysia.gov.my/", country: "my", category: "visa", label: "EMGS Malaysia" },
  // International scholarship bodies
  { url: "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students", country: "intl", category: "scholarship", label: "Erasmus+" },
  { url: "https://www.scholars4dev.com/", country: "intl", category: "scholarship", label: "Scholars4Dev" },
];

export interface GradedSource extends CrawlSource {
  tier: TrustTier;
  score: number;
  accepted: boolean;
}

const R2_KEY = "data/sources/registry.json";

function grade(s: CrawlSource): GradedSource {
  const t = classifySource(s.url);
  // Only authoritative domains pass — gov/edu/official allowlist or reputable HTTPS.
  const accepted = t.tier === "official" || t.tier === "reputable";
  return { ...s, tier: t.tier, score: t.score, accepted };
}

/** Seed + R2-added + pinned sources, de-duplicated, with suppressed removed. */
export async function allSources(): Promise<CrawlSource[]> {
  const [extra, gov] = await Promise.all([getJson<CrawlSource[]>(R2_KEY).then((x) => x ?? []), loadGovernance()]);
  const byUrl = new Map<string, CrawlSource>();
  [...SEED_SOURCES, ...extra, ...gov.pinned].forEach((s) => byUrl.set(s.url, s));
  return [...byUrl.values()].filter((s) => !matches(s.url, gov.suppressed));
}

/** Accepted sources the AUTOMATION may use — quality-passed (or pinned) AND not
 *  blocked or paused by a human. This is the governance-aware crawl/watch set. */
export async function acceptedSources(): Promise<GradedSource[]> {
  const [list, gov] = await Promise.all([allSources(), loadGovernance()]);
  const pinned = new Set(gov.pinned.map((p) => p.url));
  return list
    .map((s) => {
      const g = grade(s);
      const isPinned = pinned.has(s.url);
      const accepted = !matches(s.url, gov.blocked) && !matches(s.url, gov.paused) && (g.accepted || isPinned);
      return { ...g, accepted };
    })
    .filter((s) => s.accepted);
}

export type SourceStatus = "active" | "paused" | "blocked" | "pinned";
export interface RegistrySourceView extends GradedSource {
  status: SourceStatus;
}

/** Full registry with governance status — for the admin governance dashboard. */
export async function registryView(): Promise<RegistrySourceView[]> {
  const [list, gov] = await Promise.all([allSources(), loadGovernance()]);
  const pinned = new Set(gov.pinned.map((p) => p.url));
  return list
    .map((s) => {
      const g = grade(s);
      let status: SourceStatus = "active";
      if (matches(s.url, gov.blocked)) status = "blocked";
      else if (matches(s.url, gov.paused)) status = "paused";
      else if (pinned.has(s.url)) status = "pinned";
      return { ...g, status };
    })
    .sort((a, b) => a.country.localeCompare(b.country) || a.label.localeCompare(b.label));
}

export interface SourceStats {
  total: number;
  accepted: number;
  official: number;
  reputable: number;
  rejected: number;
  byCategory: Record<SourceCategory, number>;
}

export async function sourceStats(): Promise<SourceStats> {
  const graded = (await allSources()).map(grade);
  const byCategory = { visa: 0, scholarship: 0, admission: 0, general: 0 } as Record<SourceCategory, number>;
  for (const s of graded) if (s.accepted) byCategory[s.category]++;
  return {
    total: graded.length,
    accepted: graded.filter((s) => s.accepted).length,
    official: graded.filter((s) => s.tier === "official").length,
    reputable: graded.filter((s) => s.tier === "reputable").length,
    rejected: graded.filter((s) => !s.accepted).length,
    byCategory,
  };
}

/** Bulk-add sources (auto-grown registry) — only accepted ones are stored. */
export async function addSourcesToR2(
  candidates: CrawlSource[]
): Promise<{ added: number; rejected: { url: string; reason: TrustTier }[] }> {
  const [existing, gov] = await Promise.all([getJson<CrawlSource[]>(R2_KEY).then((x) => x ?? []), loadGovernance()]);
  const known = new Set([...SEED_SOURCES, ...existing].map((s) => s.url));
  const accepted: CrawlSource[] = [];
  const rejected: { url: string; reason: TrustTier }[] = [];
  for (const c of candidates) {
    if (known.has(c.url)) continue;
    if (matches(c.url, gov.blocked)) continue; // never re-add a blocked source
    const g = grade(c);
    if (g.accepted) {
      accepted.push(c);
      known.add(c.url);
    } else {
      rejected.push({ url: c.url, reason: g.tier });
    }
  }
  if (accepted.length) await putJsonSafe(R2_KEY, [...existing, ...accepted]);
  return { added: accepted.length, rejected };
}
