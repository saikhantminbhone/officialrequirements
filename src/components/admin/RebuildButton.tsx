"use client";

import { useState } from "react";

export default function RebuildButton() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  async function rebuild() {
    setState("busy");
    const res = await fetch("/api/admin/rebuild", { method: "POST" });
    setState(res.ok ? "done" : "error");
  }
  return (
    <div>
      <button
        onClick={rebuild}
        disabled={state === "busy"}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {state === "busy" ? "Triggering…" : "Rebuild site"}
      </button>
      {state === "done" && <span className="ml-3 text-sm text-trust-green">Deploy triggered.</span>}
      {state === "error" && <span className="ml-3 text-sm text-red-600">Failed — check VERCEL_DEPLOY_HOOK_URL.</span>}
    </div>
  );
}
