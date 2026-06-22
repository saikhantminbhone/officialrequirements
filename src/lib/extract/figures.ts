// ─────────────────────────────────────────────────────────────────────────
// Deterministic figure extraction (no AI). Finds money amounts, units and fees
// in free text, and maps them to record fields by nearby keywords. Output is
// always a *candidate* with a context snippet and a confidence score — never an
// auto-published value (requirements are YMYL → human verifies first).
// ─────────────────────────────────────────────────────────────────────────

export const CURRENCY_CODES = [
  "EUR", "GBP", "USD", "CAD", "AUD", "NZD", "SEK", "NOK", "DKK", "CHF",
  "PLN", "CZK", "JPY", "KRW", "MYR", "AED",
];

const SYMBOL_TO_CODE: Record<string, string> = {
  "€": "EUR", "£": "GBP", "$": "USD", "¥": "JPY", "₩": "KRW", "Kč": "CZK", "zł": "PLN",
};

export type Unit = "year" | "month" | "once" | "unknown";

export interface MoneyHit {
  amount: number;
  currency: string | null;
  unit: Unit;
  context: string; // surrounding snippet
  index: number;
}

/** Parse a localized number string ("11,904", "10.179,85", "1 062") to a number. */
export function parseAmount(raw: string): number | null {
  let s = raw.replace(/[\s ]/g, "");
  // Decide decimal separator: if the last separator is followed by exactly 2 digits, it's decimal.
  const lastSep = Math.max(s.lastIndexOf(","), s.lastIndexOf("."));
  if (lastSep !== -1) {
    const tail = s.slice(lastSep + 1);
    if (tail.length === 2 && /^\d{2}$/.test(tail)) {
      // decimal — strip other separators, normalize decimal to '.'
      s = s.slice(0, lastSep).replace(/[.,]/g, "") + "." + tail;
    } else {
      // all separators are thousands
      s = s.replace(/[.,]/g, "");
    }
  }
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function unitNear(text: string): Unit {
  const t = text.toLowerCase();
  // Month takes precedence (a figure stated per-month is the binding unit).
  if (/month|monthly|p\.?m\.?\b/.test(t)) return "month";
  if (/year|annum|annual|yearly|p\.?a\.?\b/.test(t)) return "year";
  return "unknown";
}

const NUM = String.raw`(?:\d{1,3}(?:[.,\s ]\d{3})+|\d+)(?:[.,]\d{1,2})?`;

/** All money amounts in the text, with currency, inferred unit, and context. */
export function findMoney(text: string): MoneyHit[] {
  const hits: MoneyHit[] = [];
  const seen = new Set<string>();

  // 1) symbol-prefixed: €11,904  £1,171  $20,000
  const reSym = new RegExp(String.raw`([€£$¥₩])\s?(${NUM})`, "g");
  // 2) code-suffixed: 11904 EUR / 89,112 DKK
  const reCodeSuf = new RegExp(String.raw`(${NUM})\s?(${CURRENCY_CODES.join("|")})\b`, "gi");
  // 3) code-prefixed: EUR 11,904 / CHF 21,000 / Kč 120,000
  const reCodePre = new RegExp(String.raw`(${CURRENCY_CODES.join("|")}|Kč|zł)\s?(${NUM})`, "gi");
  // 4) loose pairing for JSON-style "amount: 22895 ... currency: CAD" (and reverse),
  //    where the number and currency are separate fields a few chars apart.
  const reLooseSuf = new RegExp(String.raw`(${NUM})[^\d€£$¥₩]{1,18}?\b(${CURRENCY_CODES.join("|")})\b`, "gi");
  const reLoosePre = new RegExp(String.raw`\b(${CURRENCY_CODES.join("|")})\b[^\d€£$¥₩]{1,18}?(${NUM})`, "gi");

  const push = (amount: number | null, currency: string | null, idx: number) => {
    if (amount == null) return;
    const ctx = text.slice(Math.max(0, idx - 70), idx + 70).replace(/\s+/g, " ").trim();
    const key = `${amount}|${currency}`; // dedup by value+currency regardless of which pattern found it
    if (seen.has(key)) return;
    seen.add(key);
    hits.push({ amount, currency, unit: unitNear(ctx), context: ctx, index: idx });
  };

  let m: RegExpExecArray | null;
  while ((m = reSym.exec(text))) push(parseAmount(m[2]), SYMBOL_TO_CODE[m[1]] ?? null, m.index);
  while ((m = reCodeSuf.exec(text))) push(parseAmount(m[1]), m[2].toUpperCase(), m.index);
  while ((m = reCodePre.exec(text))) push(parseAmount(m[2]), (SYMBOL_TO_CODE[m[1]] ?? m[1]).toUpperCase(), m.index);
  while ((m = reLooseSuf.exec(text))) push(parseAmount(m[1]), m[2].toUpperCase(), m.index);
  while ((m = reLoosePre.exec(text))) push(parseAmount(m[2]), m[1].toUpperCase(), m.index);

  return hits.sort((a, b) => a.index - b.index);
}

// Keyword groups that anchor a money figure to a record field.
const FIELD_KEYWORDS: Record<string, string[]> = {
  "proof-of-funds": [
    "proof of funds", "means of subsistence", "maintenance", "financial means", "sufficient funds",
    "blocked account", "financial resources", "income requirement", "funds requirement",
    "financial capacity", "show money", "living costs", "subsistence", "GIC",
  ],
  visaFee: ["visa fee", "application fee", "permit fee", "processing fee", "fee of"],
};

export interface FieldCandidate {
  field: "blockedAccountAmount" | "visaFee" | "processingWeeks";
  value: number;
  currency: string | null;
  unit: Unit;
  context: string;
  confidence: "high" | "medium" | "low";
}

function confidenceFor(hasKeyword: boolean, hasUnit: boolean): FieldCandidate["confidence"] {
  if (hasKeyword && hasUnit) return "high";
  if (hasKeyword || hasUnit) return "medium";
  return "low";
}

/** Map money hits to candidate record fields using nearby keywords. */
export function candidatesFromText(text: string): FieldCandidate[] {
  const out: FieldCandidate[] = [];
  const money = findMoney(text);
  const lower = text.toLowerCase();

  for (const hit of money) {
    const windowStart = Math.max(0, hit.index - 120);
    const window = lower.slice(windowStart, hit.index + 120);

    if (FIELD_KEYWORDS["proof-of-funds"].some((k) => window.includes(k.toLowerCase()))) {
      out.push({
        field: "blockedAccountAmount",
        value: hit.unit === "month" ? Math.round(hit.amount * 12) : hit.amount,
        currency: hit.currency,
        unit: hit.unit,
        context: hit.context,
        confidence: confidenceFor(true, hit.unit !== "unknown"),
      });
    } else if (FIELD_KEYWORDS.visaFee.some((k) => window.includes(k.toLowerCase()))) {
      out.push({
        field: "visaFee",
        value: hit.amount,
        currency: hit.currency,
        unit: "once",
        context: hit.context,
        confidence: confidenceFor(true, false),
      });
    }
  }

  // Processing time: "processing time ... N weeks/months"
  const proc = /processing[^.]{0,40}?(\d{1,3})\s*(weeks?|months?|working days?|days?)/i.exec(text);
  if (proc) {
    const n = Number(proc[1]);
    const unit = proc[2].toLowerCase();
    const weeks = unit.startsWith("month") ? n * 4 : unit.includes("day") ? Math.round(n / 5) : n;
    out.push({ field: "processingWeeks", value: weeks, currency: null, unit: "unknown", context: proc[0], confidence: "medium" });
  }

  // De-duplicate by field+value, keep highest confidence.
  const best = new Map<string, FieldCandidate>();
  const rank = { high: 3, medium: 2, low: 1 };
  for (const c of out) {
    const key = `${c.field}`;
    const prev = best.get(key);
    if (!prev || rank[c.confidence] > rank[prev.confidence]) best.set(key, c);
  }
  return [...best.values()];
}
