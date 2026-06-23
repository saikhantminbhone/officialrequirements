import type { RequirementRecord, ScholarshipRecord } from "@/lib/req-data/types";

// ─────────────────────────────────────────────────────────────────────────
// Keyword ranking strategy (deterministic, no AI).
//
// Instead of a single fixed data title per page, we derive a keyword-optimised
// <title>, meta description, and a cluster of long-tail target queries from the
// record's own facts (funds, fee, processing, intakes) and the current year. A
// page that has a proof-of-funds figure leads with that query; one that doesn't
// leads with documents/processing — so similar pages don't share identical
// titles and each targets the query its data can actually answer.
// ─────────────────────────────────────────────────────────────────────────

function cap(s: string): string {
  if (s.startsWith("the ")) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export interface KeywordOpts {
  destName: string;
  nationalityName?: string;
  adjective?: string;
  year?: number;
}

function facts(record: RequirementRecord) {
  const d = record.toolDefaults ?? {};
  const fundsAmt = d.blockedAccountAmount;
  const fundsCur = d.blockedAccountCurrency;
  const funds = fundsAmt && fundsCur ? `${fundsAmt.toLocaleString("en-US")} ${fundsCur}` : null;
  const fee = d.visaFee && fundsCur ? `${d.visaFee.toLocaleString("en-US")} ${fundsCur}` : null;
  const weeks = d.processingWeeks ?? null;
  return { funds, fee, weeks };
}

/** Keyword-optimised page <title>. Leads with the strongest fact the page holds. */
export function visaSeoTitle(record: RequirementRecord, opts: KeywordOpts): string {
  const year = opts.year ?? new Date().getFullYear();
  const dest = cap(opts.destName);
  const nat = opts.nationalityName ? `${opts.nationalityName} Citizens` : "International Students";
  const { funds, weeks } = facts(record);

  let hook = "Requirements & Documents";
  if (funds) hook = `Proof of Funds & Requirements`;
  else if (weeks) hook = `Requirements, Fees & Processing Time`;

  return `${dest} Student Visa for ${nat} (${year}) — ${hook}`;
}

/** Long-tail-rich meta description built from whatever facts the record holds. */
export function visaSeoDescription(record: RequirementRecord, opts: KeywordOpts): string {
  const year = opts.year ?? new Date().getFullYear();
  const dest = opts.destName;
  const nat = opts.nationalityName ? `${opts.nationalityName} citizens` : "international students";
  const adj = opts.adjective ?? "";
  const { funds, fee, weeks } = facts(record);

  const bits: string[] = [];
  if (funds) bits.push(`proof of funds about ${funds}`);
  if (fee) bits.push(`visa fee ${fee}`);
  if (weeks) bits.push(`~${weeks}-week processing`);
  bits.push("health insurance, language tests and the full document checklist");

  return `${cap(dest)} student visa requirements for ${nat} in ${year}: ${bits.join(", ")} — each figure sourced from official ${adj} government pages and date-verified.`;
}

/** Target query cluster — long-tail phrases this page can genuinely answer. */
export function visaTargetKeywords(record: RequirementRecord, opts: KeywordOpts): string[] {
  const year = opts.year ?? new Date().getFullYear();
  const dest = opts.destName.replace(/^the /, "");
  const nat = opts.nationalityName;
  const { funds, fee, weeks } = facts(record);

  const out = [
    `${dest} student visa requirements ${year}`,
    nat ? `${dest} student visa for ${nat} citizens` : `${dest} student visa for international students`,
    `${dest} student visa documents checklist`,
  ];
  if (funds) {
    out.push(`how much money for ${dest} student visa`);
    out.push(`${dest} student visa proof of funds ${year}`);
  }
  if (weeks) out.push(`${dest} student visa processing time`);
  if (fee) out.push(`${dest} student visa fee`);
  // De-duplicate while preserving order.
  return [...new Set(out)];
}

// ── University admission keyword strategy ──────────────────────────────────
const LEVEL_WORD: Record<string, string> = { bachelor: "Bachelor's", msc: "Master's", mba: "MBA", phd: "PhD" };

export function uniSeoTitle(record: RequirementRecord, opts: KeywordOpts): string {
  const year = opts.year ?? new Date().getFullYear();
  const dest = cap(opts.destName);
  const program = record.program?.name ?? "Degree";
  return `${program} in ${dest} (${year}) — Admission Requirements & GPA`;
}

export function uniSeoDescription(record: RequirementRecord, opts: KeywordOpts): string {
  const year = opts.year ?? new Date().getFullYear();
  const dest = opts.destName;
  const program = record.program?.name ?? "this program";
  const hasGmat = record.requirements.some((r) => r.key === "gmat");
  const hasGre = record.requirements.some((r) => r.key === "gre");
  const test = hasGmat ? "GMAT/GRE, " : hasGre ? "GRE (often), " : "";
  return `${year} admission requirements for a ${program} in ${cap(dest)}: entry grades and GPA, English score (IELTS/TOEFL/PTE), ${test}transcripts, references and the full application checklist — sourced from official admission bodies and date-verified.`;
}

export function uniTargetKeywords(record: RequirementRecord, opts: KeywordOpts): string[] {
  const year = opts.year ?? new Date().getFullYear();
  const dest = opts.destName.replace(/^the /, "");
  const program = record.program?.name ?? "degree";
  const level = LEVEL_WORD[record.program?.level ?? ""] ?? "degree";
  const out = [
    `${program} in ${dest} requirements`,
    `${dest} ${level} admission requirements ${year}`,
    `${dest} university English language requirements`,
    `how to apply for a ${program} in ${dest}`,
    `${dest} ${level} GPA requirements`,
  ];
  if (record.requirements.some((r) => r.key === "gmat")) out.push(`${program} ${dest} GMAT score`);
  return [...new Set(out)];
}

// ── Scholarship keyword strategy ───────────────────────────────────────────
export function scholarshipSeoTitle(s: ScholarshipRecord, year = new Date().getFullYear()): string {
  return `${s.name} ${year} — Eligibility, Benefits & Deadlines`;
}

export function scholarshipSeoDescription(s: ScholarshipRecord, year = new Date().getFullYear()): string {
  const covers = s.benefits.slice(0, 3).join(", ");
  return `${s.name} by ${s.provider} (${year}): who is eligible, what it covers${covers ? ` (${covers})` : ""}, application deadlines and how to apply — checked against the official source and date-verified.`;
}

export function scholarshipTargetKeywords(s: ScholarshipRecord, year = new Date().getFullYear()): string[] {
  return [
    `${s.name} eligibility`,
    `${s.name} requirements ${year}`,
    `${s.name} deadline`,
    `how to apply for ${s.name}`,
    `${s.name} benefits`,
  ];
}

// ── Destination hub keyword strategy ───────────────────────────────────────
export function hubSeoTitle(destName: string, year = new Date().getFullYear()): string {
  return `Study in ${cap(destName)} (${year}) — Student Visa, Costs & Scholarships`;
}

export function hubSeoDescription(destName: string, fundsLabel: string, year = new Date().getFullYear()): string {
  return `Everything for studying in ${cap(destName)} in ${year}: student-visa requirements by nationality, the ${fundsLabel}, tuition and living costs, scholarships and a working application timeline — each figure sourced from official ${destName} government pages and date-verified.`;
}

export function hubTargetKeywords(destName: string, year = new Date().getFullYear()): string[] {
  const d = destName.replace(/^the /, "");
  return [
    `study in ${d} requirements`,
    `${d} student visa`,
    `cost of studying in ${d} ${year}`,
    `${d} scholarships for international students`,
    `how to study in ${d}`,
  ];
}
