import { getVisaRecords, getUniversityRecords, getScholarships, getAllDestinations } from "@/lib/req-data";

// ─────────────────────────────────────────────────────────────────────────
// Static search index. Built from the same data layer and served as a cached
// JSON document (no database, no search server) — the client fetches it once
// and filters in-browser. Lightweight and fully static, in keeping with the
// no-backend architecture.
// ─────────────────────────────────────────────────────────────────────────

export interface SearchEntry {
  t: string; // title
  u: string; // url
  k: string; // kind label
}

function capitalize(s: string): string {
  if (s.startsWith("the ")) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const [visa, university, scholarships] = await Promise.all([
    getVisaRecords(),
    getUniversityRecords(),
    getScholarships(),
  ]);
  const destinations = getAllDestinations();

  const entries: SearchEntry[] = [];

  // Curated top-level + tools + trust pages.
  entries.push(
    { t: "Scholarship eligibility checker", u: "/tools/eligibility", k: "Tool" },
    { t: "Cost calculator", u: "/tools/cost", k: "Tool" },
    { t: "Timeline planner", u: "/tools/timeline", k: "Tool" },
    { t: "Document checklist", u: "/tools/checklist", k: "Tool" },
    { t: "Compare study destinations", u: "/compare", k: "Compare" },
    { t: "Data reports & rankings", u: "/reports", k: "Reports" },
    { t: "Cheapest proof of funds by country", u: "/reports/cheapest-student-visa-proof-of-funds", k: "Report" },
    { t: "Total first-year cost by country", u: "/reports/student-visa-total-cost-by-country", k: "Report" },
    { t: "Fastest student-visa processing", u: "/reports/fastest-student-visa-processing", k: "Report" },
    { t: "How we verify (methodology)", u: "/methodology", k: "About" },
  );

  for (const { code, meta } of destinations) {
    entries.push({ t: `Study in ${capitalize(meta.name)}`, u: `/study/${code}`, k: "Destination" });
  }
  for (const r of visa) {
    if (r.nationality) entries.push({ t: r.title, u: `/${r.nationality}/${r.destination}/student-visa`, k: "Student visa" });
  }
  for (const r of university) {
    if (r.program) entries.push({ t: r.title, u: `/university/${r.destination}/${r.program.slug}`, k: "Admission" });
  }
  for (const s of scholarships) {
    entries.push({ t: `${s.name} — eligibility`, u: `/scholarships/${s.slug}`, k: "Scholarship" });
  }

  return entries;
}

/** Token match: every query word must appear somewhere in the title or kind. */
export function searchEntries(index: SearchEntry[], query: string, limit = 50): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { e: SearchEntry; score: number }[] = [];
  for (const e of index) {
    const hay = `${e.t} ${e.k}`.toLowerCase();
    if (!tokens.every((tok) => hay.includes(tok))) continue;
    // Light ranking: earlier match + exact-phrase bonus.
    let score = hay.indexOf(tokens[0]);
    if (hay.includes(q)) score -= 100;
    scored.push({ e, score });
  }
  return scored.sort((a, b) => a.score - b.score).slice(0, limit).map((s) => s.e);
}
