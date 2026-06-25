import { test } from "node:test";
import assert from "node:assert/strict";
import { ruleForUrl, candidatesFromRule } from "../src/lib/extract/rules.ts";

test("ruleForUrl matches known official domains", () => {
  assert.equal(ruleForUrl("https://www.auswaertiges-amt.de/en/visa")?.currencyDefault, "EUR");
  assert.equal(ruleForUrl("https://www.gov.uk/student-visa")?.currencyDefault, "GBP");
  assert.equal(ruleForUrl("https://ircc.canada.ca/x")?.currencyDefault, "CAD");
  assert.equal(ruleForUrl("https://random-blog.com/visa"), undefined);
});

test("rule catches a bare-number funds amount with no currency code", () => {
  const rule = ruleForUrl("https://www.auswaertiges-amt.de/x")!;
  const text = "International students must show proof of funds of 11904 per year in a blocked account.";
  const cands = candidatesFromRule(text, rule);
  const funds = cands.find((c) => c.field === "blockedAccountAmount");
  assert.ok(funds, "should extract a funds candidate");
  assert.equal(funds!.value, 11904);
  assert.equal(funds!.currency, "EUR"); // applied from the source's known currency
  assert.equal(funds!.confidence, "high"); // keyword + per-year unit
});

test("rule converts a monthly funds figure to yearly", () => {
  const rule = ruleForUrl("https://migrationsverket.se/x")!;
  const text = "You need means of subsistence of 8568 per month for your studies.";
  const funds = candidatesFromRule(text, rule).find((c) => c.field === "blockedAccountAmount");
  assert.ok(funds);
  assert.equal(funds!.value, 8568 * 12);
  assert.equal(funds!.currency, "SEK");
});

test("rule extracts a visa fee with the source currency", () => {
  const rule = ruleForUrl("https://www.gov.uk/student-visa")!;
  const text = "The student visa application fee is 524 for applications made outside the UK.";
  const fee = candidatesFromRule(text, rule).find((c) => c.field === "visaFee");
  assert.ok(fee);
  assert.equal(fee!.value, 524);
  assert.equal(fee!.currency, "GBP");
});
