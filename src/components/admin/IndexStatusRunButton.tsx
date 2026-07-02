"use client";

import { useState } from "react";

export default function IndexStatusRunButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function run() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/maintain?job=index-status", { method: "POST" });
      const json = await res.json();
      setMsg(
        json.connected
          ? `Checked ${json.totals?.checkedThisRun ?? 0} URLs. Reload to see the latest.`
          : `Not connected: ${json.error || "check setup"}`
      );
    } catch {
      setMsg("Sweep failed.");
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
        {busy ? "Sweeping…" : "Check index coverage now"}
      </button>
      {msg && <span className="ml-3 text-sm text-slate-600">{msg}</span>}
    </div>
  );
}
