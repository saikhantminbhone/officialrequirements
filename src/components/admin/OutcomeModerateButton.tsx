"use client";

import { useState } from "react";

export default function OutcomeModerateButton({ id }: { id: string }) {
  const [state, setState] = useState<"idle" | "saving" | "approved" | "rejected" | "error">("idle");

  async function act(action: "approve" | "reject") {
    setState("saving");
    const res = await fetch("/api/admin/outcomes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setState(res.ok ? (action === "approve" ? "approved" : "rejected") : "error");
  }

  if (state === "approved") return <span className="text-xs font-medium text-trust-green">Approved ✓</span>;
  if (state === "rejected") return <span className="text-xs font-medium text-slate-400">Rejected</span>;

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act("approve")}
        disabled={state === "saving"}
        className="rounded border border-emerald-300 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => act("reject")}
        disabled={state === "saving"}
        className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
