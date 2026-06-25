// ─────────────────────────────────────────────────────────────────────────
// Source auto-discovery — pure core (no IO, unit-testable).
//
// Extracts outbound links from a trusted page, then judges each candidate by
// relevance and infers its category. The IO orchestrator (discovery.ts) adds the
// trust gate and writes accepted sources. Discovery only ever follows links from
// already-trusted official seeds and keeps only on-topic ones.
// ─────────────────────────────────────────────────────────────────────────

export type DiscoveryCategory = "visa" | "scholarship" | "admission" | "general";

export interface DiscoveredLink {
  url: string;
  anchor: string;
}

const TOPIC_KEYWORDS = [
  "visa", "permit", "immigration", "student", "study", "studies", "scholarship",
  "funding", "grant", "bursary", "admission", "apply", "application", "requirements",
  "international", "tuition", "funds", "residence", "enrol", "university", "programme", "program",
];

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Extract absolute, http(s) links (with anchor text) from HTML, de-duplicated. */
export function extractLinks(html: string, baseUrl: string): DiscoveredLink[] {
  const out: DiscoveredLink[] = [];
  const seen = new Set<string>();
  const re = /<a\b[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(raw)) continue;
    let abs: string;
    try {
      abs = new URL(raw, baseUrl).href.split("#")[0];
    } catch {
      continue;
    }
    if (!/^https?:\/\//i.test(abs) || seen.has(abs)) continue;
    seen.add(abs);
    out.push({ url: abs, anchor: stripTags(m[2]).slice(0, 120) });
  }
  return out;
}

/** Is this link on-topic for study-abroad requirements? */
export function isRelevant(link: DiscoveredLink): boolean {
  const hay = `${link.url} ${link.anchor}`.toLowerCase();
  return TOPIC_KEYWORDS.some((k) => hay.includes(k));
}

/** Infer the source category from the URL/anchor. */
export function inferCategory(link: DiscoveredLink): DiscoveryCategory {
  const hay = `${link.url} ${link.anchor}`.toLowerCase();
  if (/scholarship|funding|grant|bursary/.test(hay)) return "scholarship";
  if (/visa|permit|immigration|residence/.test(hay)) return "visa";
  if (/admission|apply|application|requirements|university|programme|program|study|studies/.test(hay)) return "admission";
  return "general";
}
