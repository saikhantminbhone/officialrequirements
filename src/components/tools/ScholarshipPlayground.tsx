"use client";

import { useState } from "react";
import type { ScholarshipRecord } from "@/lib/req-data/types";
import EligibilityTool from "./EligibilityTool";

export default function ScholarshipPlayground({ records }: { records: ScholarshipRecord[] }) {
  const [id, setId] = useState(records[0]?.id ?? "");
  const record = records.find((r) => r.id === id) ?? records[0];
  if (!record) return <p className="text-slate-500">No scholarships available yet.</p>;

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        Choose a scholarship
        <select
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="mt-1 block w-full max-w-md rounded border border-slate-300 px-2 py-2"
        >
          {records.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-6">
        <EligibilityTool record={record} />
      </div>
    </div>
  );
}
