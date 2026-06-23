import type { Metadata } from "next";
import { getVisaRecords } from "@/lib/req-data";
import ToolPlayground from "@/components/tools/ToolPlayground";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Document checklist generator",
  description: "Generate a printable, trackable student-visa document checklist for your nationality and destination.",
  alternates: { canonical: "/tools/checklist" },
};

export default async function ChecklistPage() {
  const records = await getVisaRecords();
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-[2.4rem]">Document checklist generator</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Pick your route and get a printable checklist with every document, what it&apos;s for, and a
        link to the official source.
      </p>
      <div className="mt-6">
        <ToolPlayground records={records} tool="checklist" />
      </div>
    </div>
  );
}
