import type { Metadata } from "next";
import { getVisaRecords } from "@/lib/req-data";
import ToolPlayground from "@/components/tools/ToolPlayground";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Application timeline planner",
  description: "Work backwards from your intake date to dated milestones: test booking, APS, blocked account, visa appointment.",
  alternates: { canonical: "/tools/timeline" },
};

export default async function TimelinePage() {
  const records = await getVisaRecords();
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Application timeline planner</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Enter when your programme starts and get a backward-planned schedule so nothing is left too
        late.
      </p>
      <div className="mt-6">
        <ToolPlayground records={records} tool="timeline" />
      </div>
    </div>
  );
}
