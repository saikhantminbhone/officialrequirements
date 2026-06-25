"use client";

import { useState } from "react";
import type { RegistrySourceView } from "@/lib/sources";
import type { SourceAction } from "@/lib/governance";

// Per-source governance controls. Automation keeps running; these let a human
// block / pause / resume / delete / pin (override) a source. Optimistic UI.
export default function SourceGovernance({ source }: { source: RegistrySourceView }) {
  const [status, setStatus] = useState(source.status);
  const [busy, setBusy] = useState(false);
  const [gone, setGone] = useState(false);

  async function act(action: SourceAction) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, url: source.url, country: source.country, category: source.category, label: source.label }),
      });
      if (res.ok) {
        if (action === "suppress") setGone(true);
        else if (action === "block") setStatus("blocked");
        else if (action === "pause") setStatus("paused");
        else if (action === "pin") setStatus("pinned");
        else if (action === "unblock" || action === "resume" || action === "unpin") setStatus("active");
      }
    } finally {
      setBusy(false);
    }
  }

  if (gone) return <span className="text-xs text-slate-400">Deleted</span>;

  const btn = "rounded border px-2 py-1 text-xs font-medium disabled:opacity-50";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <StatusBadge status={status} />
      {status === "blocked" ? (
        <button onClick={() => act("unblock")} disabled={busy} className={`${btn} border-slate-300 text-slate-700 hover:bg-slate-50`}>Unblock</button>
      ) : (
        <button onClick={() => act("block")} disabled={busy} className={`${btn} border-red-300 text-red-700 hover:bg-red-50`}>Block</button>
      )}
      {status === "paused" ? (
        <button onClick={() => act("resume")} disabled={busy} className={`${btn} border-emerald-300 text-emerald-700 hover:bg-emerald-50`}>Resume</button>
      ) : (
        <button onClick={() => act("pause")} disabled={busy} className={`${btn} border-amber-300 text-amber-700 hover:bg-amber-50`}>Pause</button>
      )}
      {status === "pinned" ? (
        <button onClick={() => act("unpin")} disabled={busy} className={`${btn} border-slate-300 text-slate-700 hover:bg-slate-50`}>Unpin</button>
      ) : (
        <button onClick={() => act("pin")} disabled={busy} className={`${btn} border-brand-300 text-brand-700 hover:bg-brand-50`}>Pin</button>
      )}
      <button onClick={() => act("suppress")} disabled={busy} className={`${btn} border-slate-300 text-slate-500 hover:bg-slate-50`}>Delete</button>
    </div>
  );
}

function StatusBadge({ status }: { status: RegistrySourceView["status"] }) {
  const map = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paused: "bg-amber-50 text-amber-700 border-amber-200",
    blocked: "bg-red-50 text-red-700 border-red-200",
    pinned: "bg-brand-50 text-brand-700 border-brand-200",
  }[status];
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${map}`}>{status}</span>;
}
