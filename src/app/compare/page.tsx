import type { Metadata } from "next";
import Link from "next/link";
import { getDestinationMeta } from "@/lib/req-data";
import { destinationPairs } from "@/lib/compare";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Compare study destinations — student visa side by side",
  description: "Side-by-side student-visa comparisons between study destinations: proof of funds, living costs, fees, processing time and document requirements.",
  alternates: { canonical: "/compare" },
};

function capitalize(s: string): string {
  if (s.startsWith("the ")) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function CompareHub() {
  const pairs = destinationPairs();
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-[2.4rem]">Compare study destinations</h1>
      <p className="mt-2 max-w-2xl text-slate-600" data-speakable>
        Multi-factor, side-by-side student-visa comparisons — the funds you must show, living costs,
        fees, processing time and document load — sourced and date-verified.
      </p>

      <AdSlot id="in-content-1" pageType="hub" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pairs.map(({ a, b }) => {
          const am = getDestinationMeta(a);
          const bm = getDestinationMeta(b);
          if (!am || !bm) return null;
          return (
            <Link
              key={`${a}-${b}`}
              href={`/compare/study/${a}/${b}`}
              className="rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div className="font-medium text-slate-800">
                {capitalize(am.name)} vs {capitalize(bm.name)}
              </div>
              <div className="mt-1 text-sm text-slate-500">Student visa compared</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
