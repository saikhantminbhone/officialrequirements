"use client";

import { useMemo, useState } from "react";
import type { RequirementRecord } from "@/lib/req-data/types";
import { calculateCost, type CostInput } from "@/lib/eligibility/cost";
import AffiliateBlock from "@/components/AffiliateBlock";

export default function CostTool({ record }: { record: RequirementRecord }) {
  const [input, setInput] = useState<CostInput>({
    months: 12,
    city: "default",
    includeInsurance: true,
    includeVisaFee: true,
    oneTimeSetupFees: 150,
  });

  const result = useMemo(() => calculateCost(record, input), [record, input]);
  const fmt = (n: number) => `${n.toLocaleString("en-GB")} ${result.currency}`;
  const showCities = record.destination === "de"; // city multipliers are Germany-specific
  const fundsLabel = record.toolDefaults?.blockedAccountAmount ? "Proof-of-funds minimum to show" : "Proof of funds";

  return (
    <section className="rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-800">Cost & proof-of-funds calculator</h2>
      <p className="mt-1 text-sm text-slate-500">
        Estimates the funds you must show and your real first-year outlay.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 no-print">
        <label className="text-sm">
          Coverage months
          <input
            type="number"
            min={1}
            max={24}
            value={input.months}
            onChange={(e) => setInput((s) => ({ ...s, months: Number(e.target.value) }))}
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
          />
        </label>
        {showCities && (
          <label className="text-sm">
            City
            <select
              value={input.city}
              onChange={(e) => setInput((s) => ({ ...s, city: e.target.value as CostInput["city"] }))}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1"
            >
              <option value="default">National average</option>
              <option value="munich">Munich</option>
              <option value="berlin">Berlin</option>
              <option value="cologne">Cologne</option>
            </select>
          </label>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={input.includeInsurance}
            onChange={(e) => setInput((s) => ({ ...s, includeInsurance: e.target.checked }))}
          />
          Include health insurance
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={input.includeVisaFee}
            onChange={(e) => setInput((s) => ({ ...s, includeVisaFee: e.target.checked }))}
          />
          Include visa fee
        </label>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">{fundsLabel}</span>
          <span className="text-lg font-bold text-brand-700">
            {result.blockedAccountMinimum !== null ? fmt(result.blockedAccountMinimum) : "Set by your I-20 / admission"}
          </span>
        </div>
        <hr className="my-3 border-slate-200" />
        <ul className="space-y-1 text-sm">
          {result.lines.map((l) => (
            <li key={l.label} className="flex items-center justify-between">
              <span className="text-slate-600">
                {l.label}
                {l.note && <span className="ml-1 text-xs text-slate-400">({l.note})</span>}
              </span>
              <span className="font-medium text-slate-800">{fmt(l.amount)}</span>
            </li>
          ))}
        </ul>
        <hr className="my-3 border-slate-200" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">Estimated total outlay</span>
          <span className="text-lg font-bold text-slate-900">{fmt(result.total)}</span>
        </div>
      </div>

      {/* Intent peaks under the number. Blocked-account offers are Germany-specific. */}
      {showCities && <AffiliateBlock tag="blocked-account" max={2} />}
      <AffiliateBlock tag="money-transfer" max={1} />

      <p className="mt-3 text-xs text-slate-400">
        Estimate only. The official blocked-account minimum is set by the German authorities and
        changes periodically — confirm the current figure on the source linked above.
      </p>
    </section>
  );
}
