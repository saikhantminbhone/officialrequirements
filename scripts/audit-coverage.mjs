// Data coverage audit — checks every requirement record is complete, sourced,
// and fully covered by the rich-detail knowledge base. Run: node scripts/audit-coverage.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED = join(__dirname, "../src/lib/req-data/seed");
const read = (f) => JSON.parse(readFileSync(join(SEED, f), "utf-8"));

// Replicate topicForKey from src/lib/requirement-guides.ts to verify every
// requirement key has rich detail content.
function topicForKey(key) {
  const k = key.toLowerCase();
  if (k.includes("proof-of-funds")) return "proof-of-funds";
  if (["admission-letter","loa","cas","coe","i20","offer-of-place","pre-enrolment","emgs-approval","admission"].some((x)=>k.includes(x))) return "admission";
  if (k.includes("pal")) return "pal";
  if (k.includes("mvv")) return "mvv";
  if (k.includes("etudes")) return "etudes";
  if (k.includes("aps")) return "aps";
  if (k.includes("atas")) return "atas";
  if (k.includes("tb-test")) return "tb-test";
  if (k === "gs" || k.includes("genuine-student") || k.includes("gte")) return "genuine-student";
  if (k.includes("language") || k.includes("english-proficiency")) return "language-proof";
  if (k.includes("passport")) return "passport";
  if (k.includes("insurance")||k.includes("ihs")||k.includes("oshc")) return "health-insurance";
  if (k.includes("medical")||k.includes("health-exam")||k.includes("xray")||k.includes("fitness")) return "medical";
  if (k.includes("transfer")) return "money-transfer";
  if (k.includes("connectivity")||k.includes("esim")) return "esim";
  if (k.includes("accommodation")||k.includes("housing")) return "accommodation";
  if (k.includes("tuition-paid")) return "tuition-paid";
  if (k.includes("biometrics")) return "biometrics";
  if (k.includes("gre")||k.includes("gmat")) return "admission-test";
  if (k.includes("work-experience")) return "work-experience";
  if (k.includes("research-proposal")) return "research-proposal";
  if (k.includes("criminal")||k.includes("police")) return "police-record";
  if (k.includes("sevis")) return "sevis";
  if (k.includes("ds160")) return "ds160";
  if (k.includes("emirates-id")) return "emirates-id";
  if (k.includes("onward-travel")) return "onward-travel";
  if (k.includes("prior-qualification")) return "prior-qualification";
  if (k.includes("minimum-grade")) return "minimum-grade";
  if (k.includes("transcripts")) return "transcripts";
  if (k.includes("motivation")) return "motivation-letter";
  if (k.includes("recommendation")) return "recommendation-letters";
  if (k === "cv") return "cv";
  if (k.includes("application-fee")) return "application-fee";
  return null;
}

// Every requirement record should cover these core categories.
const CORE = {
  admission: (k) => topicForKey(k) === "admission",
  funds: (k) => k.includes("proof-of-funds"),
  insurance: (k) => topicForKey(k) === "health-insurance",
  language: (k) => topicForKey(k) === "language-proof",
  passport: (k) => k.includes("passport"),
};

const templates = readdirSync(SEED).filter((f) => f.startsWith("tpl-") || f === "germany-student-visa.template.json");
const dests = read("destinations.json");

let problems = 0;
const rows = [];
const uncoveredKeys = new Set();

for (const file of templates.sort()) {
  const t = read(file);
  const keys = t.requirements.map((r) => r.key);
  const missingCore = Object.entries(CORE).filter(([, fn]) => !keys.some(fn)).map(([c]) => c);
  const noGuide = keys.filter((k) => topicForKey(k) === null);
  noGuide.forEach((k) => uncoveredKeys.add(k));
  const sources = 1 + (t.extraSources?.length || 0);
  const shortDetails = t.requirements.filter((r) => (r.detail || "").length < 40).map((r) => r.key);
  const ok = missingCore.length === 0 && noGuide.length === 0;
  if (!ok) problems++;
  rows.push({
    dest: t.destination,
    name: dests[t.destination]?.name || t.destination,
    reqs: keys.length,
    sources,
    sourceType: t.source?.type,
    lastVerified: t.lastVerified,
    missingCore: missingCore.join(",") || "-",
    noGuide: noGuide.join(",") || "-",
    shortDetails: shortDetails.join(",") || "-",
  });
}

console.log("\n=== VISA TEMPLATE COVERAGE ===");
console.log("dest | name | reqs | srcs | type | verified | missing-core | no-rich-detail");
for (const r of rows) {
  console.log(`${r.dest.padEnd(4)} | ${String(r.name).padEnd(15)} | ${String(r.reqs).padStart(2)} | ${r.sources} | ${String(r.sourceType).padEnd(11)} | ${r.lastVerified} | ${r.missingCore.padEnd(12)} | ${r.noGuide}`);
}

// University coverage
const uniBase = read("uni-base.json");
const uniKeys = uniBase.requirements.map((r) => r.key).concat(["gre", "gmat", "work-experience", "research-proposal"]);
const uniNoGuide = uniKeys.filter((k) => topicForKey(k) === null);
uniNoGuide.forEach((k) => uncoveredKeys.add(k));

console.log("\n=== UNIVERSITY COVERAGE ===");
console.log(`uni-base requirement keys: ${uniBase.requirements.map((r) => r.key).join(", ")}`);
console.log(`no-rich-detail: ${uniNoGuide.join(", ") || "-"}`);

console.log("\n=== SUMMARY ===");
console.log(`Visa templates: ${rows.length}`);
console.log(`Templates with gaps: ${problems}`);
console.log(`Single-source templates: ${rows.filter((r) => r.sources === 1).map((r) => r.dest).join(", ") || "none"}`);
console.log(`Requirement keys with NO rich detail: ${[...uncoveredKeys].join(", ") || "none"}`);
console.log(`Government-typed primary sources: ${rows.filter((r) => r.sourceType === "government").length}/${rows.length}`);
process.exit(problems > 0 || uncoveredKeys.size > 0 ? 1 : 0);
