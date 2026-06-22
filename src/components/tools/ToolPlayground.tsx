"use client";

import { useState } from "react";
import type { RequirementRecord } from "@/lib/req-data/types";
import ChecklistTool from "./ChecklistTool";
import CostTool from "./CostTool";
import TimelineTool from "./TimelineTool";

type ToolName = "checklist" | "cost" | "timeline";

// Standalone tool page: pick a nationality → destination record, then run the
// chosen tool. Records are passed from the server (already expanded from seed/R2).
export default function ToolPlayground({
  records,
  tool,
}: {
  records: RequirementRecord[];
  tool: ToolName;
}) {
  const [id, setId] = useState(records[0]?.id ?? "");
  const record = records.find((r) => r.id === id) ?? records[0];

  if (!record) return <p className="text-slate-500">No records available yet.</p>;

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        Choose your scenario
        <select
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="mt-1 block w-full max-w-md rounded border border-slate-300 px-2 py-2"
        >
          {records.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-6">
        {tool === "checklist" && <ChecklistTool record={record} />}
        {tool === "cost" && <CostTool record={record} />}
        {tool === "timeline" && <TimelineTool record={record} />}
      </div>
    </div>
  );
}
