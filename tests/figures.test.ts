import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount, findMoney, candidatesFromText } from "../src/lib/extract/figures.ts";

test("parseAmount: thousands and decimals", () => {
  assert.equal(parseAmount("11,904"), 11904);
  assert.equal(parseAmount("22895"), 22895);
  assert.equal(parseAmount("10.179,85"), 10179.85);
  assert.equal(parseAmount("1 062"), 1062);
});

test("findMoney: detects symbol, code-suffix and loose JSON pairing", () => {
  assert.equal(findMoney("show €11,904 per year")[0].amount, 11904);
  assert.equal(findMoney("127,872 SEK per month")[0].currency, "SEK");
  const loose = findMoney('"amount": 22895, "currency": "CAD"')[0];
  assert.equal(loose.amount, 22895);
  assert.equal(loose.currency, "CAD");
});

test("candidatesFromText: maps a funds amount to blockedAccountAmount with unit", () => {
  const c = candidatesFromText("proof of funds of €11,904 per year")[0];
  assert.equal(c.field, "blockedAccountAmount");
  assert.equal(c.value, 11904);
  assert.equal(c.currency, "EUR");
  assert.equal(c.unit, "year");
});

test("candidatesFromText: annualises a per-month funds figure", () => {
  const c = candidatesFromText("maintenance financial means of 1,062 EUR per month")[0];
  assert.equal(c.field, "blockedAccountAmount");
  assert.equal(c.value, 12744); // 1062 * 12
});

test("candidatesFromText: extracts a visa fee near the fee keyword", () => {
  const cands = candidatesFromText("The visa fee is £524 for the application.");
  const fee = cands.find((c) => c.field === "visaFee");
  assert.ok(fee, "should find a visa fee candidate");
  assert.equal(fee.value, 524);
});
