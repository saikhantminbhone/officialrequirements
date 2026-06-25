import type { FieldCandidate } from "./figures";

// Local copy of the localized-number parser (kept import-free so this module is
// unit-testable in isolation under the bare node test runner).
function parseAmount(raw: string): number | null {
  let s = raw.replace(/[\s ]/g, "");
  const lastSep = Math.max(s.lastIndexOf(","), s.lastIndexOf("."));
  if (lastSep !== -1) {
    const tail = s.slice(lastSep + 1);
    if (tail.length === 2 && /^\d{2}$/.test(tail)) s = s.slice(0, lastSep).replace(/[.,]/g, "") + "." + tail;
    else s = s.replace(/[.,]/g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// ─────────────────────────────────────────────────────────────────────────
// Per-source extraction rules (deterministic, no AI).
//
// The generic extractor only detects a money figure when a currency symbol/code
// sits next to the number. But official pages often write "you must show 11,904
// euros" or just a bare number beside "proof of funds". For known official
// domains we know the currency, so this pass catches those amounts too —
// materially improving reliability on the highest-traffic sources.
// ─────────────────────────────────────────────────────────────────────────

export interface SourceRule {
  id: string;
  domains: string[];
  currencyDefault: string;
}

export const SOURCE_RULES: SourceRule[] = [
  { id: "de", domains: ["auswaertiges-amt.de", "make-it-in-germany.com", "study-in-germany.de", "bamf.de", "uni-assist.de"], currencyDefault: "EUR" },
  { id: "gb", domains: ["gov.uk", "ukvi.homeoffice.gov.uk"], currencyDefault: "GBP" },
  { id: "ca", domains: ["canada.ca", "cic.gc.ca", "ircc.canada.ca"], currencyDefault: "CAD" },
  { id: "au", domains: ["homeaffairs.gov.au", "immi.homeaffairs.gov.au"], currencyDefault: "AUD" },
  { id: "nz", domains: ["immigration.govt.nz"], currencyDefault: "NZD" },
  { id: "ie", domains: ["irishimmigration.ie", "inis.gov.ie"], currencyDefault: "EUR" },
  { id: "nl", domains: ["ind.nl", "nuffic.nl"], currencyDefault: "EUR" },
  { id: "fr", domains: ["campusfrance.org", "france-visas.gouv.fr"], currencyDefault: "EUR" },
  { id: "se", domains: ["migrationsverket.se"], currencyDefault: "SEK" },
  { id: "no", domains: ["udi.no"], currencyDefault: "NOK" },
  { id: "dk", domains: ["nyidanmark.dk"], currencyDefault: "DKK" },
];

export function ruleForUrl(url: string): SourceRule | undefined {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
  return SOURCE_RULES.find((r) => r.domains.some((d) => host === d || host.endsWith(`.${d}`) || host.endsWith(d)));
}

const FUNDS_KW = [
  "proof of funds", "blocked account", "means of subsistence", "financial means", "maintenance",
  "sufficient funds", "financial resources", "living costs", "subsistence", "show that you have",
  "funds requirement", "financial capacity",
];
const FEE_KW = ["visa fee", "application fee", "permit fee", "processing fee", "fee is", "fee of"];

const NUM = String.raw`(?:\d{1,3}(?:[.,\s ]\d{3})+|\d{3,})(?:[.,]\d{1,2})?`;

function unitNear(s: string): "year" | "month" | "once" | "unknown" {
  const t = s.toLowerCase();
  if (/month|monthly|per month|p\.?m\.?\b/.test(t)) return "month";
  if (/year|annum|annual|yearly|per year|p\.?a\.?\b/.test(t)) return "year";
  return "unknown";
}

/** Find the first plausible bare number within a window of a keyword. */
function numberNear(text: string, at: number, min: number): { value: number; unitCtx: string } | null {
  const seg = text.slice(at, at + 220); // look forward from the keyword
  const m = new RegExp(NUM).exec(seg);
  if (!m) return null;
  const value = parseAmount(m[0]);
  if (value == null || value < min) return null;
  return { value, unitCtx: seg.slice(0, (m.index ?? 0) + m[0].length + 24) };
}

/** Currency-aware candidates from a known official source (bare-number aware). */
export function candidatesFromRule(text: string, rule: SourceRule): FieldCandidate[] {
  const lower = text.toLowerCase();
  const out: FieldCandidate[] = [];

  for (const kw of FUNDS_KW) {
    let i = lower.indexOf(kw);
    while (i !== -1) {
      const near = numberNear(text, i, 1000);
      if (near) {
        const unit = unitNear(near.unitCtx);
        out.push({
          field: "blockedAccountAmount",
          value: unit === "month" ? Math.round(near.value * 12) : near.value,
          currency: rule.currencyDefault,
          unit,
          context: text.slice(Math.max(0, i - 10), i + 90).replace(/\s+/g, " ").trim(),
          confidence: unit !== "unknown" ? "high" : "medium",
        });
        break; // first solid hit per keyword is enough
      }
      i = lower.indexOf(kw, i + kw.length);
    }
  }

  for (const kw of FEE_KW) {
    const i = lower.indexOf(kw);
    if (i === -1) continue;
    const near = numberNear(text, i, 1);
    if (near && near.value <= 100000) {
      out.push({
        field: "visaFee",
        value: near.value,
        currency: rule.currencyDefault,
        unit: "once",
        context: text.slice(Math.max(0, i - 10), i + 60).replace(/\s+/g, " ").trim(),
        confidence: "medium",
      });
      break;
    }
  }

  return out;
}
