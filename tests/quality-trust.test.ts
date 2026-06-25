import { test } from "node:test";
import assert from "node:assert/strict";
import { classifySource, isTrustedSource } from "../src/lib/source-trust.ts";
import { checkQuality, recommend, autoApplyDecision } from "../src/lib/quality.ts";

// ── Trusted-source auto-check ──────────────────────────────────────────────
test("source-trust: government domains are official", () => {
  assert.equal(classifySource("https://www.gov.uk/student-visa").tier, "official");
  assert.equal(classifySource("https://ircc.canada.ca/foo").tier, "official");
  assert.equal(classifySource("https://www.bamf.de/x").tier, "official");
  assert.equal(classifySource("https://study.go.kr").tier, "official");
});

test("source-trust: allowlisted official bodies are official", () => {
  assert.equal(classifySource("https://www.daad.de/en").tier, "official");
  assert.equal(classifySource("https://ec.europa.eu/x").tier, "official");
});

test("source-trust: education domains are official", () => {
  assert.equal(classifySource("https://www.ox.ac.uk/admissions").tier, "official");
});

test("source-trust: blogs/forums are low trust", () => {
  assert.equal(classifySource("https://someguy.blogspot.com/visa").tier, "low");
  assert.equal(classifySource("https://reddit.com/r/germany").tier, "low");
  assert.equal(isTrustedSource("https://medium.com/@x/visa"), false);
});

test("source-trust: plain https site is reputable, not official", () => {
  assert.equal(classifySource("https://example.com/visa").tier, "reputable");
  assert.equal(isTrustedSource("https://example.com/visa"), false);
});

test("source-trust: missing TLS downgrades the score", () => {
  const https = classifySource("https://www.gov.uk/x");
  const http = classifySource("http://www.gov.uk/x");
  assert.ok(http.score < https.score);
  assert.equal(http.tier, "official"); // still official, just lower score
});

// ── Quality / plausibility check ───────────────────────────────────────────
test("quality: a sound figure from a clean extraction passes", () => {
  const r = checkQuality({ field: "blockedAccountAmount", value: 11904, currency: "EUR", confidence: "high", status: "matches" });
  assert.equal(r.grade, "pass");
});

test("quality: a year mistaken for a fee is rejected", () => {
  const r = checkQuality({ field: "visaFee", value: 2026, currency: "EUR", confidence: "high" });
  assert.equal(r.grade, "reject");
});

test("quality: out-of-range processing weeks is rejected", () => {
  assert.equal(checkQuality({ field: "processingWeeks", value: 500, currency: null, confidence: "high" }).grade, "reject");
  assert.equal(checkQuality({ field: "processingWeeks", value: 6, currency: null, confidence: "high" }).grade, "pass");
});

test("quality: missing currency or low confidence needs review, not pass", () => {
  assert.equal(checkQuality({ field: "visaFee", value: 75, currency: null, confidence: "high" }).grade, "review");
  assert.equal(checkQuality({ field: "visaFee", value: 75, currency: "EUR", confidence: "low" }).grade, "review");
});

test("quality: an unknown field always needs a human", () => {
  assert.equal(checkQuality({ field: "mysteryField", value: 5, currency: "EUR", confidence: "high" }).grade, "review");
});

// ── Combined recommendation ────────────────────────────────────────────────
test("recommend: official + pass + matches is ready to approve", () => {
  assert.equal(recommend({ trustTier: "official", quality: "pass", status: "matches" }), "ready-to-approve");
});

test("recommend: low-trust source is always rejected", () => {
  assert.equal(recommend({ trustTier: "low", quality: "pass", status: "matches" }), "reject");
});

test("recommend: a new value from an official source needs review", () => {
  assert.equal(recommend({ trustTier: "official", quality: "pass", status: "new" }), "needs-review");
});

// ── Safe auto-apply gate ───────────────────────────────────────────────────
test("autoApply: fills a gap from an official source", () => {
  assert.equal(autoApplyDecision({ trustTier: "official", quality: "pass", status: "new", value: 11904, current: null }).apply, true);
});

test("autoApply: small correction applies, large change needs a human", () => {
  assert.equal(autoApplyDecision({ trustTier: "official", quality: "pass", status: "differs", value: 12500, current: 11904 }).apply, true);
  assert.equal(autoApplyDecision({ trustTier: "official", quality: "pass", status: "differs", value: 30000, current: 11904 }).apply, false);
});

test("autoApply: never from non-official sources or failing quality", () => {
  assert.equal(autoApplyDecision({ trustTier: "reputable", quality: "pass", status: "new", value: 100, current: null }).apply, false);
  assert.equal(autoApplyDecision({ trustTier: "official", quality: "reject", status: "new", value: 100, current: null }).apply, false);
});

test("autoApply: a matching value is not re-applied", () => {
  assert.equal(autoApplyDecision({ trustTier: "official", quality: "pass", status: "matches", value: 11904, current: 11904 }).apply, false);
});
