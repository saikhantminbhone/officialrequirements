import { test } from "node:test";
import assert from "node:assert/strict";
import { generateChecklist, affiliateTagsFor } from "../src/lib/eligibility/checklist.ts";

const record = {
  requirements: [
    { key: "admission-letter", label: "Admission", detail: "x", required: true },
    { key: "proof-of-funds", label: "Funds", detail: "x", required: true, affiliateTag: "blocked-account" },
    { key: "aps-certificate", label: "APS", detail: "x", required: false, appliesIf: { apsRequired: true } },
    { key: "tuition-transfer", label: "Transfer", detail: "x", required: false, affiliateTag: "money-transfer" },
    { key: "health-insurance", label: "Insurance", detail: "x", required: true, affiliateTag: "insurance" },
  ],
} as never;

test("generateChecklist: drops tuition-transfer unless transferring funds", () => {
  const off = generateChecklist(record, { transferringFunds: false });
  const on = generateChecklist(record, { transferringFunds: true });
  assert.ok(!off.some((e) => e.key === "tuition-transfer"));
  assert.ok(on.some((e) => e.key === "tuition-transfer"));
});

test("generateChecklist: APS only when appliesIf matches", () => {
  const without = generateChecklist(record, { apsRequired: false });
  const withAps = generateChecklist(record, { apsRequired: true });
  assert.ok(!without.some((e) => e.key === "aps-certificate"));
  assert.ok(withAps.some((e) => e.key === "aps-certificate" && e.required === true));
});

test("affiliateTagsFor: returns unique tags in appearance order", () => {
  const entries = generateChecklist(record, { transferringFunds: true, apsRequired: true });
  const tags = affiliateTagsFor(entries);
  assert.deepEqual(tags, ["blocked-account", "money-transfer", "insurance"]);
});
