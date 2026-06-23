// ─────────────────────────────────────────────────────────────────────────
// Keyword opportunity engine (deterministic, no AI).
//
// Reads real Search Console query rows and finds the highest-ROI ranking moves:
//   • "striking-distance" — queries ranking ~5–20 with real impressions. Small
//     content/link pushes here move them onto page 1, where the clicks are.
//   • "ctr-gap" — queries already ranking top-5 but earning fewer clicks than
//     their position should (a title/description optimisation, not a ranking one).
// It scores each by *expected extra clicks*, so you work the biggest wins first.
// This is the "better algorithm for ranking" — driven by your own data, not guesses.
// ─────────────────────────────────────────────────────────────────────────

export interface QueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number; // 0–1
  position: number;
}

export type OpportunityKind = "striking-distance" | "ctr-gap" | "rising";

export interface KeywordOpportunity {
  query: string;
  position: number;
  impressions: number;
  clicks: number;
  kind: OpportunityKind;
  potentialClicks: number; // estimated extra clicks if optimised
  action: string;
}

// Approximate organic CTR by rank position (industry-average curve). Used only
// to estimate upside — deterministic and transparent, no model.
const CTR_BY_POS: Record<number, number> = {
  1: 0.28, 2: 0.15, 3: 0.1, 4: 0.07, 5: 0.05,
  6: 0.04, 7: 0.03, 8: 0.025, 9: 0.02, 10: 0.018,
};
export function expectedCtr(position: number): number {
  const p = Math.round(position);
  if (p <= 0) return CTR_BY_POS[1];
  if (p <= 10) return CTR_BY_POS[p] ?? 0.018;
  if (p <= 20) return 0.01;
  return 0.004;
}

const MIN_IMPRESSIONS = 20; // ignore noise

export function computeOpportunities(rows: QueryRow[], limit = 40): KeywordOpportunity[] {
  const out: KeywordOpportunity[] = [];

  for (const r of rows) {
    if (r.impressions < MIN_IMPRESSIONS) continue;

    // Striking distance: ranking 5–20, not yet on page 1's top. Estimate the
    // clicks gained by moving to position ~3.
    if (r.position >= 4.5 && r.position <= 20.5) {
      const potential = Math.max(0, (expectedCtr(3) - r.ctr) * r.impressions);
      out.push({
        query: r.query,
        position: round1(r.position),
        impressions: r.impressions,
        clicks: r.clicks,
        kind: "striking-distance",
        potentialClicks: Math.round(potential),
        action: "Strengthen this page for the query (add a matching H2/FAQ, internal links) to push onto page 1.",
      });
      continue;
    }

    // CTR gap: already top-5 but under-clicking vs what the position should earn
    // → a title/meta-description rewrite, not a ranking problem.
    if (r.position < 4.5 && r.ctr < expectedCtr(r.position) * 0.7) {
      const potential = Math.max(0, (expectedCtr(r.position) - r.ctr) * r.impressions);
      out.push({
        query: r.query,
        position: round1(r.position),
        impressions: r.impressions,
        clicks: r.clicks,
        kind: "ctr-gap",
        potentialClicks: Math.round(potential),
        action: "Rewrite the title/meta description to match this query and lift CTR.",
      });
    }
  }

  return out.sort((a, b) => b.potentialClicks - a.potentialClicks).slice(0, limit);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
