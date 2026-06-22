import { test } from "node:test";
import assert from "node:assert/strict";
import { planTimeline } from "../src/lib/eligibility/timeline.ts";

const record = { toolDefaults: { processingWeeks: 8 } } as never;

test("planTimeline: milestones are sorted earliest-first and dated before intake", () => {
  const intake = "2027-01-04";
  const ms = planTimeline(record, { intakeDate: intake, apsRequired: false });
  assert.ok(ms.length >= 6);
  for (let i = 1; i < ms.length; i++) {
    assert.ok(ms[i - 1].date <= ms[i].date, "milestones must be chronological");
  }
  // Every milestone falls before the intake date.
  assert.ok(ms.every((m) => m.date < intake));
  // The last milestone is arrival.
  assert.equal(ms[ms.length - 1].key, "arrival");
});

test("planTimeline: APS step appears only when required", () => {
  const without = planTimeline(record, { intakeDate: "2027-01-04", apsRequired: false });
  const withAps = planTimeline(record, { intakeDate: "2027-01-04", apsRequired: true });
  assert.ok(!without.some((m) => m.key === "aps"));
  assert.ok(withAps.some((m) => m.key === "aps"));
  assert.equal(withAps.length, without.length + 1);
});

test("planTimeline: the English test is the earliest milestone", () => {
  const ms = planTimeline(record, { intakeDate: "2027-09-01", apsRequired: false });
  assert.equal(ms[0].key, "english-test");
});
