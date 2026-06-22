"use client";

import { useMemo, useState } from "react";
import type { RequirementRecord } from "@/lib/req-data/types";
import { generateChecklist, type ChecklistInput } from "@/lib/eligibility/checklist";
import AffiliateBlock from "@/components/AffiliateBlock";

// Interactive, trackable, printable document checklist. The server already
// rendered the full requirement text (anti-thin-page); this adds interactivity
// and surfaces affiliate offers at each intent peak.
export default function ChecklistTool({ record }: { record: RequirementRecord }) {
  const apsDefault = record.requirements.find((r) => r.key === "aps-certificate")?.required ?? false;
  const [input, setInput] = useState<ChecklistInput>({
    apsRequired: apsDefault,
    programmeLanguage: "english",
    transferringFunds: true,
  });
  const [done, setDone] = useState<Record<string, boolean>>({});

  const entries = useMemo(() => generateChecklist(record, input), [record, input]);
  const completed = entries.filter((e) => done[e.key]).length;

  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-800">Your document checklist</h2>
      <p className="mt-1 text-sm text-slate-500">
        Tick items off as you collect them. Print or save when done.
      </p>

      <div className="mt-4 flex flex-wrap gap-4 text-sm no-print">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={input.transferringFunds}
            onChange={(e) => setInput((s) => ({ ...s, transferringFunds: e.target.checked }))}
          />
          I&apos;ll transfer funds from abroad
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={input.apsRequired}
            onChange={(e) => setInput((s) => ({ ...s, apsRequired: e.target.checked }))}
          />
          APS certificate required for me
        </label>
      </div>

      <div className="mt-4 h-2 w-full rounded bg-slate-100">
        <div
          className="h-2 rounded bg-trust-green transition-all"
          style={{ width: `${entries.length ? (completed / entries.length) * 100 : 0}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-slate-500">{completed} / {entries.length} collected</div>

      <ul className="mt-4 space-y-3">
        {entries.map((e) => (
          <li key={e.key}>
            <label className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
              <input
                type="checkbox"
                className="mt-1"
                checked={Boolean(done[e.key])}
                onChange={(ev) => setDone((d) => ({ ...d, [e.key]: ev.target.checked }))}
              />
              <span>
                <span className="font-medium text-slate-800">
                  {e.label}{" "}
                  {e.required ? (
                    <span className="text-xs font-normal text-red-600">(required)</span>
                  ) : (
                    <span className="text-xs font-normal text-slate-400">(if applicable)</span>
                  )}
                </span>
                <span className="block text-sm text-slate-600">{e.detail}</span>
              </span>
            </label>
            {/* Affiliate offer at the intent peak, right after the relevant item. */}
            {e.affiliateTag && <AffiliateBlock tag={e.affiliateTag} max={1} />}
          </li>
        ))}
      </ul>

      <button
        onClick={() => window.print()}
        className="mt-4 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 no-print"
      >
        Print / save checklist
      </button>
    </section>
  );
}
