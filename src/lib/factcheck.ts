import type { RequirementRecord } from "@/lib/req-data/types";
import { getVisaRecords } from "@/lib/req-data";
import { extractFromSource } from "@/lib/extract/source";
import { getFxRates, convert } from "@/lib/fx";
import { getJson, putJsonSafe, r2Configured } from "@/lib/r2";
import { isTrustedSource } from "@/lib/source-trust";

// ─────────────────────────────────────────────────────────────────────────
// Cross-source fact-check engine (deterministic, no AI). This is the safe form
// of "auto-verify" for YMYL data: it crawls the primary source AND the extra
// official sources for each destination, extracts the proof-of-funds figure
// from each, and CORROBORATES — it only upgrades a record's trust when 2+
// independent official sources AGREE with the stored value. Disagreements are
// flagged for a human, never auto-applied. A human-verified record is never
// downgraded.
// ─────────────────────────────────────────────────────────────────────────

const TOLERANCE = 0.03; // 3% — currency rounding / minor source differences

export interface FactCheckItem {
  destination: string;
  title: string;
  storedValue: number | null;
  storedCurrency: string | null;
  sourcesChecked: number;
  agree: number; // official sources whose extracted figure matches the stored value
  conflicts: { url: string; found: number; currency: string | null }[];
  outcome: "corroborated" | "single-source" | "conflict" | "no-figure" | "unreachable";
}

export interface FactCheckReport {
  ranAt: string;
  totals: { checked: number; corroborated: number; conflicts: number; promoted: number };
  items: FactCheckItem[];
}

function approxEqual(a: number, b: number): boolean {
  if (a <= 0 || b <= 0) return false;
  return Math.abs(a - b) <= Math.max(1, a * TOLERANCE);
}

export async function runFactCheck(limit = 20): Promise<FactCheckReport> {
  const all = await getVisaRecords();
  const fx = await getFxRates();

  // One representative record per destination (figures are destination-level).
  const byDest = new Map<string, RequirementRecord>();
  for (const r of all) if (!byDest.has(r.destination)) byDest.set(r.destination, r);
  const targets = [...byDest.values()].slice(0, limit);

  const items: FactCheckItem[] = [];
  let corroborated = 0;
  let conflicts = 0;
  let promoted = 0;

  for (const rec of targets) {
    const stored = rec.toolDefaults?.blockedAccountAmount ?? null;
    const storedCur = rec.toolDefaults?.blockedAccountCurrency ?? null;
    const urls = [rec.source, ...(rec.extraSources ?? [])].map((s) => s.url);

    let agree = 0;
    let sourcesWithFigure = 0;
    let unreachable = 0;
    const conflictList: FactCheckItem["conflicts"] = [];

    if (stored != null && storedCur) {
      for (const url of urls) {
        // Only official sources may corroborate a YMYL figure (trust auto-check).
        if (!isTrustedSource(url)) continue;
        const res = await extractFromSource(url);
        if (res.kind === "unreachable") {
          unreachable++;
          continue;
        }
        const cand = res.candidates.find((c) => c.field === "blockedAccountAmount");
        if (!cand) continue;
        sourcesWithFigure++;
        // Normalise the found figure to the stored currency for comparison.
        let found = cand.value;
        if (cand.currency && cand.currency !== storedCur) {
          const conv = convert(cand.value, cand.currency, storedCur, fx.rates);
          if (conv != null) found = conv;
        }
        if (approxEqual(found, stored)) agree++;
        else conflictList.push({ url, found: Math.round(found), currency: cand.currency });
      }
    }

    let outcome: FactCheckItem["outcome"];
    if (stored == null) outcome = "no-figure";
    else if (sourcesWithFigure === 0 && unreachable === urls.length) outcome = "unreachable";
    else if (conflictList.length > 0) outcome = "conflict";
    else if (agree >= 2) outcome = "corroborated";
    else outcome = "single-source";

    if (outcome === "corroborated") corroborated++;
    if (outcome === "conflict") conflicts++;

    // Promote to auto-corroborated ONLY when 2+ official sources agree AND the
    // record isn't already human-verified (humans outrank the machine).
    if (outcome === "corroborated" && rec.verification !== "human-verified" && r2Configured) {
      const key = `data/overrides/visa/${rec.destination}.json`;
      const existing = (await getJson<Record<string, unknown>>(key)) ?? {};
      await putJsonSafe(key, {
        ...existing,
        verification: "auto-corroborated",
        lastVerified: new Date().toISOString().slice(0, 10),
        note: `Cross-checked: ${agree} independent official sources agree on ${stored} ${storedCur}.`,
      });
      promoted++;
    }

    items.push({
      destination: rec.destination,
      title: rec.title,
      storedValue: stored,
      storedCurrency: storedCur,
      sourcesChecked: urls.length,
      agree,
      conflicts: conflictList,
      outcome,
    });
  }

  const report: FactCheckReport = {
    ranAt: new Date().toISOString(),
    totals: { checked: targets.length, corroborated, conflicts, promoted },
    items,
  };
  await putJsonSafe("seo/factcheck-report.json", report);
  return report;
}
