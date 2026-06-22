import type { Metadata } from "next";
import { getVisaRecords } from "@/lib/req-data";
import ToolPlayground from "@/components/tools/ToolPlayground";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Cost & proof-of-funds calculator",
  description: "Work out the blocked-account minimum and your real first-year cost for a German student visa.",
  alternates: { canonical: "/tools/cost" },
};

export default async function CostPage() {
  const records = await getVisaRecords();
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Cost & proof-of-funds calculator</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Get the exact figure you must show, plus a transparent breakdown of living costs, insurance
        and fees for your destination city.
      </p>
      <div className="mt-6">
        <ToolPlayground records={records} tool="cost" />
      </div>
    </div>
  );
}
