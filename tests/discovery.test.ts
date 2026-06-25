import { test } from "node:test";
import assert from "node:assert/strict";
import { extractLinks, isRelevant, inferCategory } from "../src/lib/discovery-core.ts";

const HTML = `
  <a href="/en/student-visa">Student visa requirements</a>
  <a href="https://www.daad.de/scholarships">Scholarships</a>
  <a href="mailto:x@y.com">email</a>
  <a href="#top">top</a>
  <a href="https://www.gov.uk/contact">Contact us</a>
  <a href="/en/student-visa">dup</a>
`;

test("extractLinks resolves relative URLs, drops mailto/anchor, de-dupes", () => {
  const links = extractLinks(HTML, "https://www.gov.uk/study");
  const urls = links.map((l) => l.url);
  assert.ok(urls.includes("https://www.gov.uk/en/student-visa"));
  assert.ok(urls.includes("https://www.daad.de/scholarships"));
  assert.ok(!urls.some((u) => u.startsWith("mailto:")));
  assert.ok(!urls.some((u) => u.includes("#")));
  assert.equal(new Set(urls).size, urls.length); // de-duped
});

test("isRelevant keeps on-topic links, drops generic ones", () => {
  assert.equal(isRelevant({ url: "https://x.gov/student-visa", anchor: "Student visa" }), true);
  assert.equal(isRelevant({ url: "https://x.gov/contact", anchor: "Contact us" }), false);
});

test("inferCategory buckets by url/anchor", () => {
  assert.equal(inferCategory({ url: "https://x/scholarships", anchor: "Funding" }), "scholarship");
  assert.equal(inferCategory({ url: "https://x/student-visa", anchor: "" }), "visa");
  assert.equal(inferCategory({ url: "https://x/admission", anchor: "Apply" }), "admission");
});
