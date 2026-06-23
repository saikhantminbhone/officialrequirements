import { test } from "node:test";
import assert from "node:assert/strict";
import { visaSeoTitle, visaSeoDescription, visaTargetKeywords } from "../src/lib/keywords.ts";
import type { RequirementRecord } from "../src/lib/req-data/types.ts";

// keywords.ts has no runtime dependencies (type-only import), so it runs under
// the bare-node strip-types harness. The ranking strategy in seo-strategy.ts and
// page-policy.ts depends on the data layer and is covered by typecheck + build.

function rec(over: Partial<RequirementRecord> = {}): RequirementRecord {
  return {
    id: "visa-in-de-student-visa",
    vertical: "visa",
    nationality: "in",
    destination: "de",
    category: "student-visa",
    title: "Germany Student Visa Requirements for Indian Citizens",
    summary: "x",
    requirements: [
      { key: "admission-letter", label: "Admission", detail: "d", required: true },
      { key: "proof-of-funds", label: "Funds", detail: "d", required: true },
      { key: "insurance", label: "Insurance", detail: "d", required: true },
    ],
    toolDefaults: { blockedAccountAmount: 11904, blockedAccountCurrency: "EUR", visaFee: 75, processingWeeks: 8, intakeMonths: [4, 10] },
    source: { name: "Auswärtiges Amt", url: "https://www.auswaertiges-amt.de/x", type: "government" },
    lastVerified: new Date().toISOString().slice(0, 10),
    verifiedBy: "OfficialRequirements System",
    status: "published",
    changeLog: [],
    ...over,
  } as RequirementRecord;
}

const opts = { destName: "Germany", nationalityName: "Indian", adjective: "German", year: 2026 };

test("keywords: title is keyword-rich, includes year + leads with funds", () => {
  const t = visaSeoTitle(rec(), opts);
  assert.match(t, /Germany Student Visa/);
  assert.match(t, /2026/);
  assert.match(t, /Proof of Funds/);
  assert.match(t, /Indian Citizens/);
});

test("keywords: a page without funds gets a DIFFERENT title (not a fixed template)", () => {
  const withFunds = visaSeoTitle(rec(), opts);
  const noFunds = visaSeoTitle(rec({ toolDefaults: { processingWeeks: 8 } }), opts);
  assert.notEqual(withFunds, noFunds);
  assert.match(noFunds, /Processing Time/);
});

test("keywords: description packs long-tail facts", () => {
  const d = visaSeoDescription(rec(), opts);
  assert.match(d, /proof of funds about 11,904 EUR/);
  assert.match(d, /~8-week processing/);
});

test("keywords: target cluster includes high-intent long-tail queries, de-duplicated", () => {
  const k = visaTargetKeywords(rec(), opts);
  assert.ok(k.includes("how much money for Germany student visa"));
  assert.ok(k.includes("Germany student visa processing time"));
  assert.equal(new Set(k).size, k.length);
});

test("keywords: 'the UK' is normalised in query phrases", () => {
  const k = visaTargetKeywords(rec({ destination: "gb" }), { ...opts, destName: "the UK" });
  assert.ok(k.some((q) => q.startsWith("UK student visa requirements")));
});
