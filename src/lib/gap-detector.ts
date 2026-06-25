import type { RequirementRecord } from "@/lib/req-data/types";
import { getVisaRecords, getUniversityRecords, daysSinceVerified } from "@/lib/req-data";

// ─────────────────────────────────────────────────────────────────────────
// Gap detector (deterministic). The "intelligence" that decides what to crawl:
// it scans every record and flags what's missing, incomplete or stale, so the
// crawler knows exactly which sources to re-fetch and which fields to fill.
// ─────────────────────────────────────────────────────────────────────────

// Destinations that legitimately have no single fixed proof-of-funds figure
// (it's set by the admission document), so a missing amount is NOT a gap.
const NO_FIXED_FUNDS = new Set(["us", "my", "ae"]);

const STALE_DAYS = 120;
// Core requirement categories expected per vertical. Visa and admission have
// genuinely different cores — proof-of-funds/insurance are visa concerns, not
// admission ones, so applying them to university records produced false gaps.
const CORE_BY_VERTICAL: Record<"visa" | "university", string[]> = {
  visa: ["admission", "proof-of-funds", "insurance", "language", "passport"],
  university: ["prior-qualification", "language", "transcripts"],
};

export interface Gap {
  recordId: string;
  vertical: "visa" | "university";
  destination: string;
  title: string;
  sourceUrl: string | null;
  missing: string[]; // field/category names
  stale: boolean;
  ageDays: number;
}

function categoryOf(key: string): string {
  if (/admission|offer|cas|coe|loa|i20|pre-enrol|emgs|etudes/.test(key)) return "admission";
  if (key.includes("proof-of-funds")) return "proof-of-funds";
  if (key.includes("insurance") || key === "oshc" || key === "ihs") return "insurance";
  if (key.includes("language") || key.includes("english")) return "language";
  if (key.includes("passport")) return "passport";
  return key;
}

function gapsForRecord(r: RequirementRecord, vertical: "visa" | "university"): Gap | null {
  const missing: string[] = [];

  if (!r.source?.url) missing.push("source");
  if (vertical === "visa" && !r.toolDefaults?.blockedAccountAmount && !NO_FIXED_FUNDS.has(r.destination)) {
    missing.push("blockedAccountAmount");
  }
  if (vertical === "visa" && !r.toolDefaults?.visaFee) missing.push("visaFee");

  const presentCats = new Set(r.requirements.map((req) => categoryOf(req.key)));
  for (const cat of CORE_BY_VERTICAL[vertical]) {
    if (vertical === "visa" && cat === "proof-of-funds" && NO_FIXED_FUNDS.has(r.destination)) continue;
    if (!presentCats.has(cat)) missing.push(`requirement:${cat}`);
  }

  const ageDays = daysSinceVerified(r.lastVerified);
  const stale = ageDays > STALE_DAYS;

  if (missing.length === 0 && !stale) return null;
  return {
    recordId: r.id,
    vertical,
    destination: r.destination,
    title: r.title,
    sourceUrl: r.source?.url ?? null,
    missing,
    stale,
    ageDays,
  };
}

export interface GapReport {
  ranAt: string;
  totals: { records: number; withGaps: number; stale: number; missingFields: number };
  gaps: Gap[];
}

export async function detectGaps(): Promise<GapReport> {
  const [visa, university] = await Promise.all([getVisaRecords(), getUniversityRecords()]);

  // Deduplicate visa by destination (the requirement gaps are destination-level,
  // so we crawl one source per destination rather than once per nationality).
  const visaByDest = new Map<string, RequirementRecord>();
  for (const r of visa) if (!visaByDest.has(r.destination)) visaByDest.set(r.destination, r);

  const gaps: Gap[] = [];
  for (const r of visaByDest.values()) {
    const g = gapsForRecord(r, "visa");
    if (g) gaps.push(g);
  }
  const uniByDest = new Map<string, RequirementRecord>();
  for (const r of university) if (!uniByDest.has(r.destination)) uniByDest.set(r.destination, r);
  for (const r of uniByDest.values()) {
    const g = gapsForRecord(r, "university");
    if (g) gaps.push(g);
  }

  gaps.sort((a, b) => b.missing.length + (b.stale ? 1 : 0) - (a.missing.length + (a.stale ? 1 : 0)));

  return {
    ranAt: new Date().toISOString(),
    totals: {
      records: visaByDest.size + uniByDest.size,
      withGaps: gaps.length,
      stale: gaps.filter((g) => g.stale).length,
      missingFields: gaps.reduce((s, g) => s + g.missing.length, 0),
    },
    gaps,
  };
}
