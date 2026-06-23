import { test } from "node:test";
import assert from "node:assert/strict";
import { isRelevant, classifyIntent, scoreTrend, rankTrends } from "../src/lib/trends-score.ts";

test("isRelevant keeps on-topic queries and drops noise", () => {
  assert.equal(isRelevant("germany student visa proof of funds"), true);
  assert.equal(isRelevant("canada study permit 2026"), true);
  assert.equal(isRelevant("best pizza near me"), false);
});

test("classifyIntent buckets queries", () => {
  assert.equal(classifyIntent("daad scholarship fully funded"), "scholarship");
  assert.equal(classifyIntent("germany student visa requirements"), "visa");
  assert.equal(classifyIntent("msc admission ielts germany"), "admission");
  assert.equal(classifyIntent("cost of studying in germany"), "cost");
});

test("scoreTrend rewards specific, fresh, high-intent long-tail", () => {
  const head = scoreTrend("student visa", 2026);
  const longTail = scoreTrend("germany student visa proof of funds 2026 requirements", 2026);
  assert.ok(longTail > head);
});

test("rankTrends filters, de-duplicates and sorts by score", () => {
  const harvested = [
    { seed: "germany student visa", suggestions: [
      "germany student visa",
      "germany student visa requirements 2026",
      "best coffee berlin",
      "germany student visa requirements 2026", // dup
    ] },
  ];
  const { keywords, totals } = rankTrends(harvested, 2026);
  const queries = keywords.map((k) => k.query.toLowerCase());
  assert.ok(!queries.includes("best coffee berlin")); // off-topic dropped
  assert.equal(new Set(queries).size, queries.length); // de-duped
  assert.equal(keywords[0].query.toLowerCase(), "germany student visa requirements 2026"); // best first
  assert.ok(totals.relevant >= 2);
});
