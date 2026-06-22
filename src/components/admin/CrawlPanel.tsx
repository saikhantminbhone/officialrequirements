"use client";

import { useState } from "react";
import type { CrawlReport, ReviewItem, ReviewCandidate } from "@/lib/crawl";

// Admin panel for the self-healing crawler: run a gap-scan + crawl, review the
// extracted candidates, and apply approved values (the only human-in-the-loop
// step that changes YMYL data).
export default function CrawlPanel({ initial }: { initial: CrawlReport | null }) {
  const [report, setReport] = useState<CrawlReport | null>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function runCrawl() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/maintain?job=crawl", { method: "POST" });
      const json = await res.json();
      if (json.items) setReport(json as CrawlReport);
      setMsg(`Crawled ${json.totals?.crawled ?? 0} sources · ${json.totals?.candidates ?? 0} candidates · ${json.totals?.unreachable ?? 0} unreachable.`);
    } catch {
      setMsg("Crawl failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-700">Self-healing crawler (deterministic, no AI)</div>
          <p className="text-sm text-slate-500">
            Finds gaps, crawls each official source (HTML, JSON API, or JS/SPA via embedded data), and
            extracts candidate values for you to approve. Nothing publishes automatically.
          </p>
        </div>
        <button
          onClick={runCrawl}
          disabled={busy}
          className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? "Crawling…" : "Run gap-scan + crawl"}
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-slate-600">{msg}</p>}

      {report && (
        <div className="mt-3 text-xs text-slate-400">
          Last run {new Date(report.ranAt).toLocaleString()} · {report.totals.gaps} gaps detected ·
          render service {report.renderServiceConfigured ? "configured" : "not set"}
        </div>
      )}

      {report?.items?.length ? (
        <div className="mt-4 space-y-3">
          {report.items.map((item) => (
            <CrawlItem key={item.recordId} item={item} />
          ))}
        </div>
      ) : report ? (
        <p className="mt-3 text-sm text-trust-green">No gaps with extractable candidates — dataset is complete and current.</p>
      ) : null}
    </div>
  );
}

function CrawlItem({ item }: { item: ReviewItem }) {
  return (
    <div className="rounded border border-slate-100 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium text-slate-800">{item.title}</div>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{item.kind} · {item.method}</span>
      </div>
      <div className="mt-1 text-xs text-slate-500">
        {item.sourceUrl && (
          <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline break-all">{item.sourceUrl}</a>
        )}
        {item.missing.length > 0 && <span className="ml-2 text-trust-amber">missing: {item.missing.join(", ")}</span>}
        {item.stale && <span className="ml-2 text-red-600">stale {item.ageDays}d</span>}
      </div>
      {item.note && <div className="mt-1 text-xs text-slate-400">{item.note}</div>}

      {item.candidates.length > 0 && (
        <ul className="mt-2 space-y-2">
          {item.candidates.map((c, i) => (
            <Candidate key={i} item={item} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Candidate({ item, c }: { item: ReviewItem; c: ReviewCandidate }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const tone = c.status === "matches" ? "text-trust-green" : c.status === "differs" ? "text-trust-amber" : "text-brand-700";

  async function apply() {
    setState("saving");
    const res = await fetch("/api/admin/apply-candidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vertical: item.vertical, destination: item.destination, field: c.field, value: c.value, currency: c.currency }),
    });
    setState(res.ok ? "done" : "error");
  }

  return (
    <li className="rounded bg-slate-50 p-2 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-medium text-slate-700">{c.field}</span>{" "}
          <span className="font-bold text-slate-900">{c.value.toLocaleString("en-US")} {c.currency ?? ""}</span>{" "}
          <span className="text-xs text-slate-400">({c.unit})</span>{" "}
          <span className={`text-xs ${tone}`}>· {c.status}{c.current != null ? ` (current ${c.current.toLocaleString("en-US")})` : ""}</span>{" "}
          <span className="text-xs text-slate-400">· {c.confidence} confidence</span>
        </div>
        <button
          onClick={apply}
          disabled={state === "saving" || state === "done"}
          className="rounded border border-brand-300 px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
        >
          {state === "done" ? "Applied ✓" : state === "saving" ? "Saving…" : state === "error" ? "Retry" : "Approve & apply"}
        </button>
      </div>
      <div className="mt-1 text-xs text-slate-400">…{c.context}…</div>
    </li>
  );
}
