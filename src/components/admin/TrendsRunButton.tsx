"use client";

import { useState } from "react";

export default function TrendsRunButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function run() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/maintain?job=trends", { method: "POST" });
      const json = await res.json();
      setMsg(json.keywords ? `Harvested ${json.totals?.relevant ?? 0} on-topic trends. Reload to see them.` : "No trends returned.");
    } catch {
      setMsg("Harvest failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        onClick={run}
        disabled={busy}
        className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Harvesting…" : "Harvest trending keywords"}
      </button>
      {msg && <span className="ml-3 text-sm text-slate-600">{msg}</span>}
    </div>
  );
}
