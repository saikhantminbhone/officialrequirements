"use client";

import { useMemo, useState } from "react";
import type { ScholarshipRecord } from "@/lib/req-data/types";
import { checkScholarship, type Answers } from "@/lib/eligibility/checker";
import LeadGenBlock from "@/components/LeadGenBlock";
import AffiliateBlock from "@/components/AffiliateBlock";

// Scholarship eligibility checker. 4–8 questions → personalized result + red
// flags. AI Overviews can't reproduce this interactive, per-user output.
export default function EligibilityTool({ record }: { record: ScholarshipRecord }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => checkScholarship(record, answers), [record, answers]);

  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-800">Am I eligible for {record.name}?</h2>
      <p className="mt-1 text-sm text-slate-500">Answer a few questions for a personalized read. Informational only.</p>

      <div className="mt-4 space-y-4 no-print">
        {record.eligibility.map((rule) => (
          <div key={rule.key}>
            <div className="text-sm font-medium text-slate-700">{rule.question}</div>
            {rule.op === "gte" || rule.op === "lte" ? (
              <input
                type="number"
                className="mt-1 w-40 rounded border border-slate-300 px-2 py-1"
                onChange={(e) => setAnswers((a) => ({ ...a, [rule.field]: Number(e.target.value) }))}
              />
            ) : (
              <div className="mt-1 flex gap-3 text-sm">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={rule.key}
                    onChange={() =>
                      setAnswers((a) => ({
                        ...a,
                        [rule.field]: rule.op === "eq" ? (rule.value as string | number | boolean) : true,
                      }))
                    }
                  />
                  Yes
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name={rule.key}
                    onChange={() =>
                      setAnswers((a) => ({
                        ...a,
                        [rule.field]: rule.op === "eq" ? !(rule.value as boolean) : false,
                      }))
                    }
                  />
                  No
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setSubmitted(true)}
        className="mt-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 no-print"
      >
        Check eligibility
      </button>

      {submitted && (
        <div className="mt-5">
          <div
            className={`rounded-lg p-4 ${
              result.eligible ? "bg-green-50 border border-trust-green/30" : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="font-semibold text-slate-800">
              {result.eligible
                ? result.hasWarnings
                  ? "Likely eligible — with a couple of things to check"
                  : "You appear to meet the core eligibility criteria"
                : "You may not meet the core criteria yet"}
            </div>
            {result.failedHard.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm text-red-700">
                {result.failedHard.map((r) => (
                  <li key={r.rule.key}>{r.rule.failMessage}</li>
                ))}
              </ul>
            )}
            {result.warnings.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-sm text-trust-amber">
                {result.warnings.map((r) => (
                  <li key={r.rule.key}>{r.rule.failMessage}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Conversion surfaces gated behind the result. */}
          {result.eligible && <AffiliateBlock tag="english-test" max={1} />}
          <LeadGenBlock />

          <p className="mt-3 text-xs text-slate-400">
            This is an automated guide, not an eligibility decision. Confirm everything on the
            official source linked on this page.
          </p>
        </div>
      )}
    </section>
  );
}
