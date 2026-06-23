// ─────────────────────────────────────────────────────────────────────────
// Pure trend scoring/filtering (no imports → unit-testable in isolation).
// The harvesting/IO lives in trends.ts which re-uses these.
// ─────────────────────────────────────────────────────────────────────────

export type TrendIntent = "visa" | "scholarship" | "admission" | "cost" | "general";

export interface TrendKeyword {
  query: string;
  seed: string;
  intent: TrendIntent;
  score: number;
}

const TOPIC_TERMS = [
  "student visa", "study visa", "visa", "study abroad", "study in", "scholarship",
  "university", "admission", "tuition", "proof of funds", "ielts", "toefl",
  "requirements", "intake", "blocked account", "permit", "international student",
];

const INTENT_TERMS: { intent: TrendIntent; terms: string[] }[] = [
  { intent: "scholarship", terms: ["scholarship", "funding", "grant", "fully funded"] },
  { intent: "admission", terms: ["admission", "university", "gpa", "ielts", "toefl", "gre", "gmat", "apply"] },
  { intent: "cost", terms: ["cost", "tuition", "fee", "proof of funds", "blocked account", "expenses", "cheap"] },
  { intent: "visa", terms: ["visa", "permit", "study permit"] },
];

export function isRelevant(q: string): boolean {
  const s = q.toLowerCase();
  return TOPIC_TERMS.some((t) => s.includes(t));
}

export function classifyIntent(q: string): TrendIntent {
  const s = q.toLowerCase();
  for (const { intent, terms } of INTENT_TERMS) {
    if (terms.some((t) => s.includes(t))) return intent;
  }
  return "general";
}

// Higher = more worth pursuing. Rewards specific, intent-rich, fresh long-tail.
export function scoreTrend(q: string, year: number): number {
  const s = q.toLowerCase();
  let score = 0;
  const words = s.split(/\s+/).filter(Boolean).length;
  score += Math.min(20, words * 3);
  if (s.includes(String(year)) || s.includes(String(year + 1))) score += 10;
  if (/(requirements|proof of funds|how much|how to|checklist|documents)/.test(s)) score += 12;
  if (/(cost|fee|tuition|cheap|funded|scholarship)/.test(s)) score += 6;
  if (classifyIntent(q) !== "general") score += 6;
  if (words <= 2) score -= 6;
  return score;
}

export function rankTrends(
  harvested: { seed: string; suggestions: string[] }[],
  year: number,
  limit = 60
): { keywords: TrendKeyword[]; totals: { harvested: number; relevant: number } } {
  const seen = new Set<string>();
  const out: TrendKeyword[] = [];
  let harvestedCount = 0;

  for (const { seed, suggestions } of harvested) {
    for (const raw of suggestions) {
      harvestedCount++;
      const q = raw.trim().toLowerCase();
      if (!q || seen.has(q) || !isRelevant(q)) continue;
      seen.add(q);
      out.push({ query: raw.trim(), seed, intent: classifyIntent(q), score: scoreTrend(q, year) });
    }
  }
  out.sort((a, b) => b.score - a.score);
  return { keywords: out.slice(0, limit), totals: { harvested: harvestedCount, relevant: out.length } };
}
