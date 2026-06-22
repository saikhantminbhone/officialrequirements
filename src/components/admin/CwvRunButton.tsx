"use client";

import { useState } from "react";

export default function CwvRunButton() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function run() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/maintain?job=cwv", { method: "POST" });
      const json = await res.json();
      setMsg(json.connected ? "Core Web Vitals synced. Reload to see them." : `Not available: ${json.error || "check setup"}`);
    } catch {
      setMsg("Sync failed.");
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
        {busy ? "Syncing…" : "Sync Core Web Vitals"}
      </button>
      {msg && <span className="ml-3 text-sm text-slate-600">{msg}</span>}
    </div>
  );
}
