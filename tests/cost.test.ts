import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateCost } from "../src/lib/eligibility/cost.ts";

const germany = {
  toolDefaults: {
    blockedAccountAmount: 11904,
    blockedAccountCurrency: "EUR",
    livingCostPerMonth: 992,
    visaFee: 75,
    insurancePerMonth: 120,
  },
} as never;

const usa = {
  toolDefaults: { blockedAccountCurrency: "USD", livingCostPerMonth: 1800, visaFee: 185, insurancePerMonth: 150 },
} as never;

test("calculateCost: full first-year total (Germany)", () => {
  const r = calculateCost(germany, { months: 12, city: "default", includeInsurance: true, includeVisaFee: true, oneTimeSetupFees: 150 });
  assert.equal(r.currency, "EUR");
  // 992*12 + 120*12 + 75 + 150
  assert.equal(r.total, 11904 + 1440 + 75 + 150);
  assert.equal(r.blockedAccountMinimum, 11904);
});

test("calculateCost: city multiplier raises living cost (Munich)", () => {
  const base = calculateCost(germany, { months: 12, city: "default", includeInsurance: false, includeVisaFee: false });
  const munich = calculateCost(germany, { months: 12, city: "munich", includeInsurance: false, includeVisaFee: false });
  assert.ok(munich.total > base.total, "Munich should cost more than the national average");
  // 992 * 1.25 = 1240/month
  assert.equal(munich.lines[0].amount, 1240 * 12);
});

test("calculateCost: excluding insurance/fee changes the total", () => {
  const withAll = calculateCost(germany, { months: 12, city: "default", includeInsurance: true, includeVisaFee: true });
  const minimal = calculateCost(germany, { months: 12, city: "default", includeInsurance: false, includeVisaFee: false });
  assert.equal(withAll.total - minimal.total, 1440 + 75);
});

test("calculateCost: no fixed proof figure (USA) yields null minimum", () => {
  const r = calculateCost(usa, { months: 12, city: "default", includeInsurance: true, includeVisaFee: true });
  assert.equal(r.blockedAccountMinimum, null);
  assert.ok(r.total > 0);
});

test("calculateCost: partial months scale the minimum", () => {
  const r = calculateCost(germany, { months: 6, city: "default", includeInsurance: false, includeVisaFee: false });
  assert.equal(r.blockedAccountMinimum, Math.round((11904 / 12) * 6));
});
