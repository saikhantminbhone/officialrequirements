import type { RequirementRecord, ScholarshipRecord, RequirementItem } from "./types";
import { getJson, listKeys } from "@/lib/r2";
import { computeNoindex } from "@/lib/uniqueness";

import deTemplate from "./seed/germany-student-visa.template.json";
import gbTemplate from "./seed/tpl-gb.json";
import caTemplate from "./seed/tpl-ca.json";
import auTemplate from "./seed/tpl-au.json";
import nlTemplate from "./seed/tpl-nl.json";
import ieTemplate from "./seed/tpl-ie.json";
import usTemplate from "./seed/tpl-us.json";
import seTemplate from "./seed/tpl-se.json";
import frTemplate from "./seed/tpl-fr.json";
import nzTemplate from "./seed/tpl-nz.json";
import itTemplate from "./seed/tpl-it.json";
import esTemplate from "./seed/tpl-es.json";
import fiTemplate from "./seed/tpl-fi.json";
import noTemplate from "./seed/tpl-no.json";
import chTemplate from "./seed/tpl-ch.json";
import dkTemplate from "./seed/tpl-dk.json";
import atTemplate from "./seed/tpl-at.json";
import jpTemplate from "./seed/tpl-jp.json";
import krTemplate from "./seed/tpl-kr.json";
import beTemplate from "./seed/tpl-be.json";
import plTemplate from "./seed/tpl-pl.json";
import czTemplate from "./seed/tpl-cz.json";
import ptTemplate from "./seed/tpl-pt.json";
import myTemplate from "./seed/tpl-my.json";
import aeTemplate from "./seed/tpl-ae.json";
import nationalitiesSeed from "./seed/nationalities.json";
import destinationsSeed from "./seed/destinations.json";
import scholarshipsSeed from "./seed/scholarships.json";
import uniBase from "./seed/uni-base.json";
import uniSources from "./seed/uni-sources.json";
import uniPrograms from "./seed/uni-programs.json";

// ─────────────────────────────────────────────────────────────────────────
// The smart auto-expansion engine (deterministic, no AI).
// Pages are generated from a small per-destination template × a nationality
// list, instead of hand-writing one file per page. Add a nationality row or a
// destination template and a fully-formed, sourced page appears on next build.
// R2 records override/extend seed records by id, so the dataset grows without
// code changes.
// ─────────────────────────────────────────────────────────────────────────

type NationalityRow = { code: string; name: string; apsRequired: boolean };
type DestinationMeta = { name: string; currency: string; adjective: string; fundsLabel: string };

// All destination templates. Add an import + a row here to expand worldwide.
type VisaTemplate = Omit<
  RequirementRecord,
  "id" | "nationality" | "title" | "summary" | "status" | "changeLog"
>;
const TEMPLATES = [
  deTemplate,
  gbTemplate,
  caTemplate,
  auTemplate,
  nlTemplate,
  ieTemplate,
  usTemplate,
  seTemplate,
  frTemplate,
  nzTemplate,
  itTemplate,
  esTemplate,
  fiTemplate,
  noTemplate,
  chTemplate,
  dkTemplate,
  atTemplate,
  jpTemplate,
  krTemplate,
  beTemplate,
  plTemplate,
  czTemplate,
  ptTemplate,
  myTemplate,
  aeTemplate,
] as unknown as VisaTemplate[];

const destinations = destinationsSeed as unknown as Record<string, DestinationMeta>;

export function getDestinationMeta(code: string): DestinationMeta | undefined {
  return destinations[code];
}

export function getAllDestinations(): { code: string; meta: DestinationMeta }[] {
  return Object.entries(destinations)
    .filter(([code]) => code !== "_comment")
    .map(([code, meta]) => ({ code, meta }));
}

export function getNationalities(): NationalityRow[] {
  return (nationalitiesSeed as { rows: NationalityRow[] }).rows;
}

function fundsPhrase(t: VisaTemplate, dest?: DestinationMeta): string {
  const d = t.toolDefaults;
  if (d?.blockedAccountAmount) {
    return `${dest?.fundsLabel ?? "proof of funds"} of about ${d.blockedAccountAmount.toLocaleString("en-US")} ${d.blockedAccountCurrency}/year`;
  }
  return "proof of funds set by your admission document";
}

/** Build one student-visa record by merging a destination template with a nationality. */
function expandVisaRecord(nat: NationalityRow, t: VisaTemplate): RequirementRecord {
  const dest = destinations[t.destination];
  const destName = dest?.name ?? t.destination.toUpperCase();

  const requirements: RequirementItem[] = t.requirements.map((r) => {
    // Germany's APS requirement is the one truly nationality-dependent item.
    if (r.key === "aps-certificate") {
      return { ...r, required: nat.apsRequired, appliesIf: { apsRequired: nat.apsRequired } };
    }
    return r;
  });

  const apsNote = t.destination === "de" && nat.apsRequired ? ", and an APS certificate" : "";

  return {
    ...t,
    id: `visa-${nat.code}-${t.destination}-student-visa`,
    nationality: nat.code,
    title: `${capitalize(destName)} Student Visa Requirements for ${nat.name} Citizens`,
    summary: `What ${nat.name} citizens need for a ${dest?.adjective ?? ""} student visa: admission, ${fundsPhrase(t, dest)}, health insurance, language proof${apsNote}. Sourced from official ${dest?.adjective ?? ""} government pages and verified ${t.lastVerified}.`,
    requirements,
    status: "published",
    changeLog: [{ date: t.lastVerified, note: `Auto-expanded from the ${destName} student-visa template.` }],
  };
}

function capitalize(s: string): string {
  // "the UK" / "the Netherlands" stay lowercase-the; capitalize first real word otherwise.
  if (s.startsWith("the ")) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Every seed-expanded visa record (no R2). Memoized — the expansion is pure
 *  and deterministic, so we build it once per process instead of O(N) per page
 *  (which made a large matrix O(N²) across a static build). */
let _seedVisaCache: RequirementRecord[] | null = null;
function seedVisaRecords(): RequirementRecord[] {
  if (_seedVisaCache) return _seedVisaCache;
  const rows = getNationalities();
  const out: RequirementRecord[] = [];
  for (const nat of rows) {
    for (const t of TEMPLATES) {
      out.push(expandVisaRecord(nat, t));
    }
  }
  _seedVisaCache = out;
  return out;
}

// Destination-level override (approved crawl values apply to every nationality
// page of that destination). Written by the admin's apply-candidate action.
interface DestOverride {
  toolDefaults?: Record<string, number | string>;
  lastVerified?: string;
  note?: string;
  verification?: "human-verified" | "machine-compiled";
}

async function loadDestOverrides(prefix: string): Promise<Record<string, DestOverride>> {
  const map: Record<string, DestOverride> = {};
  const keys = await listKeys(prefix);
  for (const key of keys) {
    const dest = key.split("/").pop()?.replace(".json", "");
    const ov = await getJson<DestOverride>(key);
    if (dest && ov) map[dest] = ov;
  }
  return map;
}

function applyOverride(r: RequirementRecord, ov?: DestOverride): RequirementRecord {
  if (!ov) return r;
  return {
    ...r,
    toolDefaults: { ...r.toolDefaults, ...(ov.toolDefaults as RequirementRecord["toolDefaults"]) },
    lastVerified: ov.lastVerified ?? r.lastVerified,
    verification: ov.verification ?? r.verification,
    changeLog: ov.note ? [...r.changeLog, { date: ov.lastVerified ?? r.lastVerified, note: ov.note }] : r.changeLog,
  };
}

async function mergeR2Visa(seed: RequirementRecord[]): Promise<RequirementRecord[]> {
  const overrides = await loadDestOverrides("data/overrides/visa/");
  const byId = new Map<string, RequirementRecord>();
  seed.forEach((r) => byId.set(r.id, applyOverride(r, overrides[r.destination])));
  const keys = await listKeys("data/visa/");
  for (const key of keys) {
    const rec = await getJson<RequirementRecord>(key);
    if (rec) byId.set(rec.id, rec); // a specific R2 record still wins over the dest override
  }
  return [...byId.values()];
}

/** All published visa records: seed expansion merged with R2 records. */
export async function getVisaRecords(): Promise<RequirementRecord[]> {
  const merged = await mergeR2Visa(seedVisaRecords());
  return merged.filter((r) => r.status === "published");
}

export async function getVisaRecord(
  nationality: string,
  destination: string
): Promise<RequirementRecord | null> {
  const all = await getVisaRecords();
  return all.find((r) => r.nationality === nationality && r.destination === destination) ?? null;
}

export async function getScholarships(): Promise<ScholarshipRecord[]> {
  const byId = new Map<string, ScholarshipRecord>();
  (scholarshipsSeed as ScholarshipRecord[]).forEach((s) => byId.set(s.id, s));
  const keys = await listKeys("data/scholarship/");
  for (const key of keys) {
    const rec = await getJson<ScholarshipRecord>(key);
    if (rec) byId.set(rec.id, rec);
  }
  return [...byId.values()].filter((s) => s.status === "published");
}

export async function getScholarship(slug: string): Promise<ScholarshipRecord | null> {
  const all = await getScholarships();
  return all.find((s) => s.slug === slug) ?? null;
}

// ── University admission vertical (dest × program matrix) ──────────────────
type UniProgram = {
  slug: string;
  name: string;
  level: "bachelor" | "msc" | "mba" | "phd";
  needsGre: boolean;
  needsGmat: boolean;
  needsWorkExp: boolean;
  focus: string;
  prereq: { label: string; detail: string };
};
type UniSource = { englishNote: string; source: RequirementRecord["source"]; extraSources: RequirementRecord["source"][] };

export function getUniversityPrograms(): UniProgram[] {
  return (uniPrograms as { rows: UniProgram[] }).rows;
}

function expandUniversityRecord(destCode: string, src: UniSource, program: UniProgram): RequirementRecord {
  const dest = destinations[destCode];
  const destName = dest?.name ?? destCode.toUpperCase();
  const base = uniBase as { verifiedBy: string; lastVerified: string; requirements: RequirementItem[] };

  const requirements: RequirementItem[] = base.requirements.map((r) => {
    if (r.key === "english-proficiency") return { ...r, detail: `${r.detail} ${src.englishNote}` };
    // Replace the generic "prior qualification" with the program-specific prerequisite.
    if (r.key === "prior-qualification") {
      return { ...r, label: program.prereq.label, detail: program.prereq.detail };
    }
    return { ...r };
  });

  if (program.level === "phd") {
    requirements.push({ key: "research-proposal", label: "Research proposal & supervisor", detail: "A research proposal aligned with a prospective supervisor's group; admission usually hinges on this match rather than a fixed checklist.", required: true });
  }

  if (program.needsGmat) {
    requirements.push({ key: "gmat", label: "GMAT (or GRE) score", detail: "Most MBA programs require a competitive GMAT (or GRE) score; check the program's typical range.", required: true, affiliateTag: "english-test" });
  } else if (program.needsGre) {
    requirements.push({ key: "gre", label: "GRE score (often required)", detail: "Many quantitative Master's programs require or recommend the GRE — confirm on the program page.", required: false });
  }
  if (program.needsWorkExp) {
    requirements.push({ key: "work-experience", label: "Professional work experience", detail: "MBA programs typically expect 2+ years of relevant full-time work experience.", required: true });
  }

  return {
    id: `uni-${destCode}-${program.slug}`,
    vertical: "university",
    destination: destCode,
    category: `${program.level}-admission`,
    program,
    title: `${program.name} Admission Requirements in ${capitalize(destName)}`,
    summary: `${program.focus} To apply for a ${program.name} in ${destName} you'll need: ${program.prereq.label.toLowerCase()}, a grade/GPA threshold, English proof, transcripts and references${program.needsGmat ? ", a GMAT/GRE score" : program.needsGre ? ", often a GRE score" : ""}${program.needsWorkExp ? ", and professional work experience" : ""}. Sourced from official admission bodies and verified ${base.lastVerified}.`,
    requirements,
    source: src.source,
    extraSources: src.extraSources,
    lastVerified: base.lastVerified,
    verifiedBy: base.verifiedBy,
    status: "published",
    changeLog: [{ date: base.lastVerified, note: `Auto-expanded admission template for ${destName}.` }],
  };
}

let _seedUniCache: RequirementRecord[] | null = null;
function seedUniversityRecords(): RequirementRecord[] {
  if (_seedUniCache) return _seedUniCache;
  const sources = uniSources as unknown as Record<string, UniSource>;
  const out: RequirementRecord[] = [];
  for (const [destCode, src] of Object.entries(sources)) {
    for (const program of getUniversityPrograms()) {
      out.push(expandUniversityRecord(destCode, src, program));
    }
  }
  _seedUniCache = out;
  return out;
}

async function mergeR2University(seed: RequirementRecord[]): Promise<RequirementRecord[]> {
  const overrides = await loadDestOverrides("data/overrides/university/");
  const byId = new Map<string, RequirementRecord>();
  seed.forEach((r) => byId.set(r.id, applyOverride(r, overrides[r.destination])));
  const keys = await listKeys("data/university/");
  for (const key of keys) {
    const rec = await getJson<RequirementRecord>(key);
    if (rec) byId.set(rec.id, rec);
  }
  return [...byId.values()];
}

export async function getUniversityRecords(): Promise<RequirementRecord[]> {
  const merged = await mergeR2University(seedUniversityRecords());
  return merged.filter((r) => r.status === "published");
}

export async function getUniversityRecord(destination: string, programSlug: string): Promise<RequirementRecord | null> {
  const all = await getUniversityRecords();
  return all.find((r) => r.destination === destination && r.program?.slug === programSlug) ?? null;
}

/** Near-duplicate university pages to noindex (anti-thin), compared within destination. */
let _uniNoindexCache: Set<string> | null = null;
export async function getUniversityNoindexIds(): Promise<Set<string>> {
  if (_uniNoindexCache) return _uniNoindexCache;
  const all = await getUniversityRecords();
  _uniNoindexCache = computeNoindex(all, (r) => r.destination).noindex;
  return _uniNoindexCache;
}

/** All records (visa + university + scholarship), any status — admin + automation. */
export async function getAllRecordsForAdmin(): Promise<{
  visa: RequirementRecord[];
  university: RequirementRecord[];
  scholarships: ScholarshipRecord[];
}> {
  const visa = await mergeR2Visa(seedVisaRecords());
  const university = await mergeR2University(seedUniversityRecords());
  const byId = new Map<string, ScholarshipRecord>();
  (scholarshipsSeed as ScholarshipRecord[]).forEach((s) => byId.set(s.id, s));
  const keys = await listKeys("data/scholarship/");
  for (const key of keys) {
    const rec = await getJson<ScholarshipRecord>(key);
    if (rec) byId.set(rec.id, rec);
  }
  return { visa, university, scholarships: [...byId.values()] };
}

/** Days since a record was last verified — drives the freshness engine. */
export function daysSinceVerified(iso: string, now = new Date()): number {
  const then = new Date(iso).getTime();
  return Math.floor((now.getTime() - then) / (1000 * 60 * 60 * 24));
}
