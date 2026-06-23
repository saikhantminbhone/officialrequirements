import type { RequirementRecord, ScholarshipRecord } from "@/lib/req-data/types";
import { daysSinceVerified } from "@/lib/req-data";
import { classifySource } from "@/lib/source-trust";

// ─────────────────────────────────────────────────────────────────────────
// Anti-bloat / index policy. Post-2025 core updates punish scaled thin content,
// so a page only earns `index` if it carries genuine unique value. Mirrors
// OfficialSalary's index-policy + quality-gate (kept lightweight, no scraping).
// A safety floor never lets us accidentally deindex a healthy young site.
// ─────────────────────────────────────────────────────────────────────────

const STALE_DAYS = 180; // unverifiable-for-too-long records shouldn't rank

// ── Launch-batch gating (anti scaled-content) ──────────────────────────────
// The blueprint is explicit: don't mass-dump pages, launch a disciplined core,
// measure impressions, then scale. So we index only high-value origin×destination
// pairs at first; the long-tail (e.g. Uzbekistan→Czechia) is noindex,follow until
// it's promoted — either by being human-verified, or by adding its codes here as
// real demand shows up. This keeps the indexed footprint defensible, not spammy.
export const PRIORITY_NATIONALITIES = new Set(["mm", "in", "cn", "ng", "vn", "pk", "bd", "np", "ph", "lk", "id"]);
export const PRIORITY_DESTINATIONS = new Set(["de", "gb", "ca", "au", "us", "nl", "ie", "fr", "se", "it"]);

export interface IndexDecision {
  index: boolean;
  reason: string;
}

// ── Deterministic page-quality score (0–100) ───────────────────────────────
// A composite of completeness, source authority and verification — the gate
// that decides whether a page is substantive enough to compete in search.
export function pageQualityScore(record: RequirementRecord): number {
  const d = record.toolDefaults ?? {};
  let score = 0;
  // Computed facts (each is a unique, rankable data point).
  if (d.blockedAccountAmount) score += 18;
  if (d.visaFee) score += 12;
  if (d.processingWeeks) score += 12;
  if (d.livingCostPerMonth) score += 8;
  if (d.intakeMonths?.length) score += 6;
  // Requirement depth.
  const required = record.requirements.filter((r) => r.required).length;
  score += Math.min(20, required * 4);
  // Source authority.
  const tier = record.source?.url ? classifySource(record.source.url).tier : "low";
  if (tier === "official") score += 16;
  else if (tier === "reputable") score += 6;
  // Independent corroboration / human check.
  if (record.verification === "human-verified") score += 8;
  else if (record.verification === "auto-corroborated") score += 6;
  return Math.min(100, score);
}

const MIN_QUALITY = 45; // below this a page is too thin/low-authority to rank

export function visaIndexDecision(record: RequirementRecord): IndexDecision {
  if (record.status !== "published") return { index: false, reason: "not published" };
  if (daysSinceVerified(record.lastVerified) > STALE_DAYS) {
    return { index: false, reason: "stale: re-verify before indexing" };
  }
  const required = record.requirements.filter((r) => r.required).length;
  // Needs real substance: enough required items + computed tool value (always present).
  if (required < 3) return { index: false, reason: "thin: too few requirement items" };

  // Quality gate: never rank a page whose source isn't authoritative (YMYL) or
  // whose composite quality is too low.
  const sourceTier = record.source?.url ? classifySource(record.source.url).tier : "low";
  if (sourceTier === "low" || sourceTier === "unknown") {
    return { index: false, reason: "source not authoritative (non-official)" };
  }
  if (pageQualityScore(record) < MIN_QUALITY) {
    return { index: false, reason: "below quality threshold" };
  }

  // Launch batch: index the high-value core, plus anything whose figures have
  // been corroborated across sources or verified by a person (those have earned
  // the right to index regardless of batch). University pages have no
  // nationality — they're always in-batch.
  const isVisa = Boolean(record.nationality);
  const trusted = record.verification === "human-verified" || record.verification === "auto-corroborated";
  if (isVisa && !trusted) {
    const inBatch =
      PRIORITY_NATIONALITIES.has(record.nationality!) && PRIORITY_DESTINATIONS.has(record.destination);
    if (!inBatch) return { index: false, reason: "long-tail: held out of launch batch until corroborated/verified" };
  }
  return { index: true, reason: "ok" };
}

export function scholarshipIndexDecision(record: ScholarshipRecord): IndexDecision {
  if (record.status !== "published") return { index: false, reason: "not published" };
  if (daysSinceVerified(record.lastVerified) > STALE_DAYS) {
    return { index: false, reason: "stale: re-verify before indexing" };
  }
  if (record.eligibility.length < 2) return { index: false, reason: "thin: too few eligibility rules" };
  return { index: true, reason: "ok" };
}

/** Next.js Metadata.robots value for a decision. noindex pages still follow links.
 *  Indexable pages also request the largest SERP + AI snippet/preview sizes. */
export function robotsFor(decision: IndexDecision) {
  if (!decision.index) return { index: false, follow: true };
  return {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large" as const,
    "max-video-preview": -1,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" as const },
  };
}
