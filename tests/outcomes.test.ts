import { test } from "node:test";
import assert from "node:assert/strict";
import { validateOutcome, summarize, type OutcomeRecord } from "../src/lib/outcomes-core.ts";

const YEAR = new Date().getFullYear();

test("validate: accepts a clean admission outcome and sanitizes it", () => {
  const v = validateOutcome({ type: "admission", destination: "DE", result: "accepted", year: YEAR, gpa: 3.6, ielts: 7, program: "MSc CS" });
  assert.equal(v.ok, true);
  assert.equal(v.clean?.destination, "de"); // lowercased
  assert.equal(v.clean?.gpa, 3.6);
});

test("validate: honeypot is rejected as spam", () => {
  const v = validateOutcome({ type: "admission", destination: "de", result: "accepted", year: YEAR, website: "http://spam" });
  assert.equal(v.ok, false);
  assert.ok(v.errors.includes("spam"));
});

test("validate: bad country, result, year and out-of-range numbers are rejected", () => {
  assert.equal(validateOutcome({ type: "admission", destination: "germany", result: "accepted", year: YEAR }).ok, false);
  assert.equal(validateOutcome({ type: "admission", destination: "de", result: "yes" as never, year: YEAR }).ok, false);
  assert.equal(validateOutcome({ type: "admission", destination: "de", result: "accepted", year: 1990 }).ok, false);
  assert.equal(validateOutcome({ type: "admission", destination: "de", result: "accepted", year: YEAR, ielts: 12 }).ok, false);
});

test("validate: notes with links are rejected", () => {
  const v = validateOutcome({ type: "visa", destination: "de", result: "approved", year: YEAR, note: "see http://x.com" });
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => e.includes("links")));
});

test("summarize: computes acceptance rate and medians", () => {
  const recs = [
    { result: "accepted", gpa: 3.8, ielts: 7.5 },
    { result: "accepted", gpa: 3.4, ielts: 7.0 },
    { result: "rejected", gpa: 3.0, ielts: 6.5 },
  ].map((r, i) => ({ id: String(i), type: "admission", destination: "de", year: YEAR, status: "approved", ...r })) as OutcomeRecord[];
  const s = summarize(recs);
  assert.equal(s.total, 3);
  assert.equal(s.acceptanceRate, 67); // 2 of 3 decided accepted
  assert.equal(s.medianGpa, 3.4);
  assert.equal(s.medianIelts, 7.0);
});

test("summarize: empty set yields nulls, not errors", () => {
  const s = summarize([]);
  assert.equal(s.total, 0);
  assert.equal(s.acceptanceRate, null);
});
