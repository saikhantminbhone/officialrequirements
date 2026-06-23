import { test } from "node:test";
import assert from "node:assert/strict";
import { computeOpportunities, expectedCtr, type QueryRow } from "../src/lib/keyword-opportunities.ts";

test("expectedCtr decreases with worse position", () => {
  assert.ok(expectedCtr(1) > expectedCtr(3));
  assert.ok(expectedCtr(3) > expectedCtr(8));
  assert.ok(expectedCtr(8) > expectedCtr(15));
  assert.ok(expectedCtr(15) > expectedCtr(40));
});

test("a query ranking ~8 with impressions is a striking-distance opportunity", () => {
  const rows: QueryRow[] = [{ query: "germany student visa proof of funds", clicks: 2, impressions: 800, ctr: 0.0025, position: 8.4 }];
  const ops = computeOpportunities(rows);
  assert.equal(ops.length, 1);
  assert.equal(ops[0].kind, "striking-distance");
  assert.ok(ops[0].potentialClicks > 0);
});

test("a top-3 query with poor CTR is a ctr-gap opportunity", () => {
  const rows: QueryRow[] = [{ query: "uk student visa fee", clicks: 5, impressions: 2000, ctr: 0.0025, position: 2.2 }];
  const ops = computeOpportunities(rows);
  assert.equal(ops[0].kind, "ctr-gap");
});

test("low-impression noise is ignored", () => {
  const rows: QueryRow[] = [{ query: "x", clicks: 0, impressions: 5, ctr: 0, position: 9 }];
  assert.equal(computeOpportunities(rows).length, 0);
});

test("opportunities are sorted by potential clicks, highest first", () => {
  const rows: QueryRow[] = [
    { query: "small", clicks: 0, impressions: 100, ctr: 0.001, position: 9 },
    { query: "big", clicks: 0, impressions: 5000, ctr: 0.001, position: 9 },
  ];
  const ops = computeOpportunities(rows);
  assert.equal(ops[0].query, "big");
});
