import type { RequirementRecord } from "@/lib/req-data/types";

// ─────────────────────────────────────────────────────────────────────────
// Uniqueness engine (deterministic, no AI) — the anti-thin-content backstop.
// Post-2025 core updates punish scaled near-duplicate pages. This computes a
// word-shingle fingerprint per page and, within a group, keeps the first
// (canonical) page and marks any page too similar to an already-kept one as
// noindex. Mirrors OfficialSalary's shingle-Jaccard uniqueness engine.
//
// Note: visa pages are intentionally NOT collapsed across nationalities — each
// targets a distinct search intent and carries a unique home-currency figure +
// nationality-specific items (e.g. APS), so they are genuinely differentiated.
// This engine guards the verticals where templating could create true dupes.
// ─────────────────────────────────────────────────────────────────────────

const SIMILARITY_THRESHOLD = 0.9; // ≥ this vs an existing canonical ⇒ noindex
const SHINGLE_K = 3;

function fingerprint(record: RequirementRecord): Set<string> {
  const text = [
    record.title,
    record.summary,
    ...record.requirements.flatMap((r) => [r.label, r.detail]),
  ]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const shingles = new Set<string>();
  for (let i = 0; i + SHINGLE_K <= text.length; i++) {
    shingles.add(text.slice(i, i + SHINGLE_K).join(" "));
  }
  return shingles;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export interface UniquenessResult {
  noindex: Set<string>;
  pairs: { id: string; similarTo: string; score: number }[];
}

/**
 * Returns the set of record ids to noindex as near-duplicates, grouped by keyFn
 * (compare only within a group — e.g. same destination).
 */
export function computeNoindex(records: RequirementRecord[], keyFn: (r: RequirementRecord) => string): UniquenessResult {
  const groups = new Map<string, RequirementRecord[]>();
  for (const r of records) {
    const k = keyFn(r);
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(r);
  }

  const noindex = new Set<string>();
  const pairs: UniquenessResult["pairs"] = [];

  for (const group of groups.values()) {
    const kept: { id: string; fp: Set<string> }[] = [];
    for (const r of group) {
      const fp = fingerprint(r);
      let best = { id: "", score: 0 };
      for (const k of kept) {
        const s = jaccard(fp, k.fp);
        if (s > best.score) best = { id: k.id, score: s };
      }
      if (best.score >= SIMILARITY_THRESHOLD) {
        noindex.add(r.id);
        pairs.push({ id: r.id, similarTo: best.id, score: Number(best.score.toFixed(3)) });
      } else {
        kept.push({ id: r.id, fp });
      }
    }
  }

  return { noindex, pairs };
}
