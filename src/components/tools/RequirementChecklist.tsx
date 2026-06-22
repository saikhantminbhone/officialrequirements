"use client";

import { useState } from "react";
import type { RequirementRecord } from "@/lib/req-data/types";
import AffiliateBlock from "@/components/AffiliateBlock";

// Lean, printable checklist for admission requirements (no visa-specific
// toggles). The server already rendered the full requirement text; this adds
// interactivity + intent-peak affiliate offers.
export default function RequirementChecklist({ record }: { record: RequirementRecord }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const items = record.requirements;
  const completed = items.filter((e) => done[e.key]).length;

  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-800">Your application checklist</h2>
      <p className="mt-1 text-sm text-slate-500">Tick items off as you prepare them. Print or save when done.</p>

      <div className="mt-4 h-2 w-full rounded bg-slate-100">
        <div className="h-2 rounded bg-trust-green transition-all" style={{ width: `${items.length ? (completed / items.length) * 100 : 0}%` }} />
      </div>
      <div className="mt-1 text-xs text-slate-500">{completed} / {items.length} ready</div>

      <ul className="mt-4 space-y-3">
        {items.map((e) => (
          <li key={e.key}>
            <label className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
              <input type="checkbox" className="mt-1" checked={Boolean(done[e.key])} onChange={(ev) => setDone((d) => ({ ...d, [e.key]: ev.target.checked }))} />
              <span>
                <span className="font-medium text-slate-800">
                  {e.label}{" "}
                  {e.required ? <span className="text-xs font-normal text-red-600">(required)</span> : <span className="text-xs font-normal text-slate-400">(if applicable)</span>}
                </span>
                <span className="block text-sm text-slate-600">{e.detail}</span>
              </span>
            </label>
            {e.affiliateTag && <AffiliateBlock tag={e.affiliateTag} max={1} />}
          </li>
        ))}
      </ul>

      <button onClick={() => window.print()} className="mt-4 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 no-print">
        Print / save checklist
      </button>
    </section>
  );
}
