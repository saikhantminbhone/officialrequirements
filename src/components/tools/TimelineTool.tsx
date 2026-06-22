"use client";

import { useMemo, useState } from "react";
import type { RequirementRecord } from "@/lib/req-data/types";
import { planTimeline } from "@/lib/eligibility/timeline";
import { formatDate } from "@/components/SourceCite";
import AffiliateBlock from "@/components/AffiliateBlock";

export default function TimelineTool({ record }: { record: RequirementRecord }) {
  const apsDefault = record.requirements.find((r) => r.key === "aps-certificate")?.required ?? false;
  const defaultIntake = new Date();
  defaultIntake.setMonth(defaultIntake.getMonth() + 9);
  const [intakeDate, setIntakeDate] = useState(defaultIntake.toISOString().slice(0, 10));
  const [apsRequired, setApsRequired] = useState(apsDefault);

  const milestones = useMemo(
    () => planTimeline(record, { intakeDate, apsRequired }),
    [record, intakeDate, apsRequired]
  );

  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-800">Timeline planner</h2>
      <p className="mt-1 text-sm text-slate-500">Works backwards from your intake date to dated milestones.</p>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm no-print">
        <label>
          Programme starts
          <input
            type="date"
            value={intakeDate}
            onChange={(e) => setIntakeDate(e.target.value)}
            className="ml-2 rounded border border-slate-300 px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={apsRequired} onChange={(e) => setApsRequired(e.target.checked)} />
          APS required
        </label>
      </div>

      <ol className="mt-5 space-y-3">
        {milestones.map((m) => (
          <li key={m.key} className="flex items-start gap-3">
            <span className="mt-1 inline-block w-28 shrink-0 rounded bg-brand-50 px-2 py-1 text-center text-xs font-medium text-brand-700">
              {formatDate(m.date)}
            </span>
            <span>
              <span className="font-medium text-slate-800">{m.label}</span>
              <span className="block text-sm text-slate-600">{m.detail}</span>
            </span>
          </li>
        ))}
      </ol>

      {/* Booking the English test is the first dated action — offer it here. */}
      <AffiliateBlock tag="english-test" max={1} />

      <p className="mt-3 text-xs text-slate-400">
        Indicative schedule. Embassy appointment availability varies widely — start earlier if you can.
      </p>
    </section>
  );
}
