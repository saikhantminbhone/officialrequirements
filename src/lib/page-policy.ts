import type { RequirementRecord, ScholarshipRecord } from "@/lib/req-data/types";
import { daysSinceVerified } from "@/lib/req-data";

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
const PRIORITY_NATIONALITIES = new Set(["mm", "in", "cn", "ng", "vn", "pk", "bd", "np", "ph", "lk", "id"]);
const PRIORITY_DESTINATIONS = new Set(["de", "gb", "ca", "au", "us", "nl", "ie", "fr", "se", "it"]);

export interface IndexDecision {
  index: boolean;
  reason: string;
}

export function visaIndexDecision(record: RequirementRecord): IndexDecision {
  if (record.status !== "published") return { index: false, reason: "not published" };
  if (daysSinceVerified(record.lastVerified) > STALE_DAYS) {
    return { index: false, reason: "stale: re-verify before indexing" };
  }
  const required = record.requirements.filter((r) => r.required).length;
  // Needs real substance: enough required items + computed tool value (always present).
  if (required < 3) return { index: false, reason: "thin: too few requirement items" };

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
