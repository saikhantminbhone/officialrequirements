"use client";

import { useState } from "react";

// Manual triggers for the deterministic maintenance jobs. The same routines run
// automatically on the Vercel Cron schedule — these just let the operator run
// them on demand.
type Job = "maintain" | "watch" | "factcheck" | "indexnow";

export default function MaintenancePanel() {
  const [busy, setBusy] = useState<"" | Job>("");
  const [msg, setMsg] = useState<string>("");

  async function run(job: Job, qs = "") {
    setBusy(job);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/maintain?job=${job}${qs}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "failed");
      setMsg(
        job === "maintain"
          ? `Freshness pass done: ${json.totals.reVerifyQueue} to re-verify, ${json.totals.autoUnpublished} auto-unpublished.`
          : job === "watch"
          ? `Source watch done: ${json.totals.changed} changed, ${json.totals.unreachable} unreachable of ${json.totals.sources}.`
          : job === "indexnow"
          ? json.ok
            ? `IndexNow: submitted ${json.submitted} URL(s) (${json.scope}). HTTP ${json.status}.`
            : `IndexNow failed: ${json.error || "check INDEXNOW_KEY + site URL"}`
          : `Fact-check done: ${json.totals.corroborated} corroborated, ${json.totals.promoted} promoted, ${json.totals.conflicts} conflicts of ${json.totals.checked}.`
      );
    } catch (e) {
      setMsg(`Failed: ${e instanceof Error ? e.message : "error"}`);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="font-semibold text-slate-700">Self-maintaining jobs (deterministic, no AI)</div>
      <p className="mt-1 text-sm text-slate-500">
        These run automatically on schedule (daily freshness pass, weekly source watch). Run on
        demand here.
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          onClick={() => run("maintain")}
          disabled={busy !== ""}
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy === "maintain" ? "Running…" : "Run freshness pass"}
        </button>
        <button
          onClick={() => run("watch")}
          disabled={busy !== ""}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {busy === "watch" ? "Checking sources…" : "Run source watch"}
        </button>
        <button
          onClick={() => run("factcheck")}
          disabled={busy !== ""}
          className="rounded-md border border-brand-300 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
        >
          {busy === "factcheck" ? "Cross-checking sources…" : "Run cross-source fact-check"}
        </button>
        <button
          onClick={() => run("indexnow", "&scope=all")}
          disabled={busy !== ""}
          className="rounded-md border border-brand-300 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
        >
          {busy === "indexnow" ? "Submitting…" : "Submit all to IndexNow (Bing)"}
        </button>
      </div>
      {msg && <p className="mt-3 text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
