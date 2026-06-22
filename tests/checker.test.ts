import { test } from "node:test";
import assert from "node:assert/strict";
import { checkEligibility } from "../src/lib/eligibility/checker.ts";

const rules = [
  { key: "degree", question: "Bachelor?", field: "hasBachelor", op: "truthy", failMessage: "Need a Bachelor's." },
  { key: "exp", question: "Years?", field: "workYears", op: "gte", value: 2, failMessage: "Need 2+ years." },
  { key: "recent", question: "Recent?", field: "recent", op: "truthy", soft: true, failMessage: "Should be recent." },
] as never;

test("checkEligibility: all pass → eligible, no warnings", () => {
  const r = checkEligibility(rules, { hasBachelor: true, workYears: 3, recent: true });
  assert.equal(r.eligible, true);
  assert.equal(r.hasWarnings, false);
  assert.equal(r.failedHard.length, 0);
});

test("checkEligibility: hard rule fails → not eligible", () => {
  const r = checkEligibility(rules, { hasBachelor: false, workYears: 3, recent: true });
  assert.equal(r.eligible, false);
  assert.equal(r.failedHard.length, 1);
  assert.equal(r.failedHard[0].rule.key, "degree");
});

test("checkEligibility: gte boundary respected", () => {
  assert.equal(checkEligibility(rules, { hasBachelor: true, workYears: 2, recent: true }).eligible, true);
  assert.equal(checkEligibility(rules, { hasBachelor: true, workYears: 1, recent: true }).eligible, false);
});

test("checkEligibility: soft rule failure is a warning, not disqualifying", () => {
  const r = checkEligibility(rules, { hasBachelor: true, workYears: 3, recent: false });
  assert.equal(r.eligible, true);
  assert.equal(r.hasWarnings, true);
  assert.equal(r.warnings[0].rule.key, "recent");
});
