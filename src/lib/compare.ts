import type { RequirementRecord } from "@/lib/req-data/types";
import { getVisaRecords, getAllDestinations } from "@/lib/req-data";
import { getFxRates, convert } from "@/lib/fx";
import type { Faq } from "@/lib/seo";

// Multi-factor destination comparison for student visas. The computed delta
// table is exactly the AI-resistant, hard-to-one-line value the blueprint wants
// from comparison pages (§4.2) — incumbents don't build these.

export type DestPair = { a: string; b: string };

/** Unique, ordered destination pairs (a < b) so each comparison exists once. */
export function destinationPairs(): DestPair[] {
  const codes = getAllDestinations().map((d) => d.code).sort();
  const pairs: DestPair[] = [];
  for (let i = 0; i < codes.length; i++) {
    for (let j = i + 1; j < codes.length; j++) {
      pairs.push({ a: codes[i], b: codes[j] });
    }
  }
  return pairs;
}

/** One representative visa record per destination (defaults are destination-level). */
export async function representativeByDestination(): Promise<Map<string, RequirementRecord>> {
  const all = await getVisaRecords();
  const map = new Map<string, RequirementRecord>();
  for (const r of all) {
    if (!map.has(r.destination)) map.set(r.destination, r);
  }
  return map;
}

export interface CompareRow {
  label: string;
  a: string;
  b: string;
  /** "a" | "b" | null — which side is cheaper/faster, only when comparable. */
  better: "a" | "b" | null;
  betterMeaning?: string;
}

function money(v?: number, cur?: string): string {
  return v != null ? `${v.toLocaleString("en-US")} ${cur ?? ""}`.trim() : "—";
}

export function buildComparison(a: RequirementRecord, b: RequirementRecord): {
  rows: CompareRow[];
  onlyA: string[];
  onlyB: string[];
} {
  const da = a.toolDefaults ?? {};
  const db = b.toolDefaults ?? {};
  const sameCur = da.blockedAccountCurrency && da.blockedAccountCurrency === db.blockedAccountCurrency;

  const cmp = (x?: number, y?: number, lowerIsBetter = true): "a" | "b" | null => {
    if (!sameCur || x == null || y == null || x === y) return null;
    const aWins = lowerIsBetter ? x < y : x > y;
    return aWins ? "a" : "b";
  };

  const rows: CompareRow[] = [
    {
      label: "Proof of funds (per year)",
      a: money(da.blockedAccountAmount, da.blockedAccountCurrency),
      b: money(db.blockedAccountAmount, db.blockedAccountCurrency),
      better: cmp(da.blockedAccountAmount, db.blockedAccountAmount),
      betterMeaning: "lower required funds",
    },
    {
      label: "Living cost (per month)",
      a: money(da.livingCostPerMonth, da.blockedAccountCurrency),
      b: money(db.livingCostPerMonth, db.blockedAccountCurrency),
      better: cmp(da.livingCostPerMonth, db.livingCostPerMonth),
      betterMeaning: "lower living cost",
    },
    {
      label: "Visa fee",
      a: money(da.visaFee, da.blockedAccountCurrency),
      b: money(db.visaFee, db.blockedAccountCurrency),
      better: cmp(da.visaFee, db.visaFee),
      betterMeaning: "lower visa fee",
    },
    {
      label: "Typical processing time",
      a: da.processingWeeks ? `~${da.processingWeeks} weeks` : "—",
      b: db.processingWeeks ? `~${db.processingWeeks} weeks` : "—",
      better: cmp(da.processingWeeks, db.processingWeeks),
      betterMeaning: "faster processing",
    },
    {
      label: "Main intakes",
      a: (da.intakeMonths ?? []).map(monthName).join(", ") || "—",
      b: (db.intakeMonths ?? []).map(monthName).join(", ") || "—",
      better: null,
    },
    {
      label: "Required documents",
      a: String(a.requirements.filter((r) => r.required).length),
      b: String(b.requirements.filter((r) => r.required).length),
      better: null,
    },
  ];

  const labelsA = new Set(a.requirements.map((r) => r.label));
  const labelsB = new Set(b.requirements.map((r) => r.label));
  const onlyA = [...labelsA].filter((l) => !labelsB.has(l));
  const onlyB = [...labelsB].filter((l) => !labelsA.has(l));

  return { rows, onlyA, onlyB };
}

function monthName(m: number): string {
  return ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m] ?? String(m);
}

// Computed verdict + FAQ for a comparison page. Normalises proof-of-funds to EUR
// (so cross-currency comparisons are real), and compares processing time and
// document load — turning a thin table into a substantive, unique answer.
export async function compareInsights(
  a: RequirementRecord,
  b: RequirementRecord,
  aName: string,
  bName: string
): Promise<{ verdict: string[]; faqs: Faq[] }> {
  const fx = await getFxRates();
  const toEur = (rec: RequirementRecord): number | null => {
    const d = rec.toolDefaults;
    if (!d?.blockedAccountAmount || !d.blockedAccountCurrency) return null;
    const v = convert(d.blockedAccountAmount, d.blockedAccountCurrency, "EUR", fx.rates);
    return v == null ? null : Math.round(v);
  };
  const aEur = toEur(a);
  const bEur = toEur(b);
  const aProc = a.toolDefaults?.processingWeeks ?? null;
  const bProc = b.toolDefaults?.processingWeeks ?? null;
  const aDocs = a.requirements.filter((r) => r.required).length;
  const bDocs = b.requirements.filter((r) => r.required).length;
  const eur = (n: number | null) => (n == null ? "n/a" : `€${n.toLocaleString("en-US")}`);

  const verdict: string[] = [];
  if (aEur != null && bEur != null) {
    if (aEur === bEur) verdict.push(`Both require about the same proof of funds (~${eur(aEur)}/year).`);
    else {
      const [lo, hi, loN, hiN] = aEur < bEur ? [aEur, bEur, aName, bName] : [bEur, aEur, bName, aName];
      verdict.push(`${loN} needs less money up front — about ${eur(lo)}/year versus ${eur(hi)} for ${hiN} (≈ ${eur(hi - lo)} less).`);
    }
  } else if (aEur != null || bEur != null) {
    const fixedName = aEur != null ? aName : bName;
    const otherName = aEur != null ? bName : aName;
    verdict.push(`${fixedName} publishes a fixed proof-of-funds figure (${eur(aEur ?? bEur)}/year), while ${otherName} sets it via your admission document.`);
  }
  if (aProc != null && bProc != null && aProc !== bProc) {
    const [fast, fastN, slow, slowN] = aProc < bProc ? [aProc, aName, bProc, bName] : [bProc, bName, aProc, aName];
    verdict.push(`${fastN} is typically faster to process (~${fast} weeks vs ~${slow} for ${slowN}).`);
  }
  if (aDocs !== bDocs) {
    const [few, fewN] = aDocs < bDocs ? [aDocs, aName] : [bDocs, bName];
    verdict.push(`${fewN} asks for fewer required documents (${few}).`);
  }

  const faqs: Faq[] = [];
  if (aEur != null && bEur != null) {
    const cheaper = aEur <= bEur ? aName : bName;
    faqs.push({
      question: `Is it cheaper to study in ${aName} or ${bName}?`,
      answer: `By proof of funds, ${cheaper} is cheaper — ${eur(Math.min(aEur, bEur))}/year versus ${eur(Math.max(aEur, bEur))} (compared at ECB rates, ${fx.updatedAt}). Tuition and living costs vary too — see each country's full guide.`,
    });
  }
  if (aProc != null && bProc != null) {
    const faster = aProc <= bProc ? aName : bName;
    faqs.push({
      question: `Which student visa is faster, ${aName} or ${bName}?`,
      answer: `${faster} typically processes faster (~${Math.min(aProc, bProc)} weeks vs ~${Math.max(aProc, bProc)}). Embassy appointment availability is often the real bottleneck in both.`,
    });
  }
  faqs.push({
    question: `Should I study in ${aName} or ${bName}?`,
    answer: `It depends on your budget, course and goals. ${verdict.join(" ")} Use each country's full requirements guide and the eligibility tools to decide.`,
  });

  return { verdict, faqs };
}
