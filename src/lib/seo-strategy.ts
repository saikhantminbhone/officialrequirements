import type { RequirementRecord } from "@/lib/req-data/types";
import { daysSinceVerified } from "@/lib/req-data";
import { pageQualityScore, PRIORITY_NATIONALITIES, PRIORITY_DESTINATIONS } from "@/lib/page-policy";

// ─────────────────────────────────────────────────────────────────────────
// SEO ranking strategy (deterministic, no AI).
//
// Two legitimate, white-hat levers that compound:
//   1. Opportunity scoring — which pages deserve to be pushed. A page ranks on
//      content quality × search demand × freshness. We compute that score and
//      use it to decide what to feature and where to point internal links.
//   2. Internal-link sculpting — concentrate internal PageRank on the highest-
//      opportunity pages instead of linking arbitrarily, so authority flows to
//      the pages most able to convert it into rankings.
//
// No tricks, no cloaking, no doorway pages — just prioritisation. Rankings are
// earned by content + authority + relevance; this maximises all three, but no
// system can *guarantee* outranking every competitor for every query.
// ─────────────────────────────────────────────────────────────────────────

/** Search-demand proxy (0–100) from the curated priority cohorts. */
export function demandScore(record: RequirementRecord): number {
  const natHot = record.nationality ? PRIORITY_NATIONALITIES.has(record.nationality) : true; // uni pages: no nationality
  const destHot = PRIORITY_DESTINATIONS.has(record.destination);
  if (natHot && destHot) return 100;
  if (destHot) return 70;
  if (natHot) return 50;
  return 30;
}

/** Freshness multiplier (0–1): recently verified pages rank better and are safer to push. */
export function freshnessFactor(record: RequirementRecord): number {
  const age = daysSinceVerified(record.lastVerified);
  if (age <= 30) return 1;
  if (age <= 90) return 0.9;
  if (age <= 180) return 0.75;
  return 0.5;
}

/**
 * Composite opportunity score (0–100): quality × demand × freshness.
 * Higher = more worth featuring and pointing internal links at.
 */
export function opportunityScore(record: RequirementRecord): number {
  const quality = pageQualityScore(record); // 0–100
  const demand = demandScore(record); // 0–100
  const fresh = freshnessFactor(record); // 0–1
  // Weighted: content quality and demand matter most; freshness gates the total.
  return Math.round((quality * 0.55 + demand * 0.45) * fresh);
}

/**
 * Internal-link sculpting: given candidate related records, order them so the
 * highest-opportunity (most relevant + rankable) pages are linked first. Same
 * destination beats cross-destination; ties broken by opportunity score.
 */
export function rankInternalLinks(current: RequirementRecord, candidates: RequirementRecord[]): RequirementRecord[] {
  return candidates
    .filter((r) => r.id !== current.id)
    .map((r) => ({
      r,
      sameDest: r.destination === current.destination ? 1 : 0,
      score: opportunityScore(r),
    }))
    .sort((a, b) => b.sameDest - a.sameDest || b.score - a.score)
    .map((x) => x.r);
}
