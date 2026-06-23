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
        <>
          <div className="mt-3 text-xs text-slate-400">
            Last run {new Date(report.ranAt).toLocaleString()} · {report.totals.gaps} gaps detected ·
            render service {report.renderServiceConfigured ? "configured" : "not set"}
          </div>
          {/* Auto trust + quality roll-up (deterministic grading). */}
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <Badge tone="green">{report.totals.readyToApprove ?? 0} ready to approve</Badge>
            <Badge tone="amber">{report.totals.needsReview ?? 0} need review</Badge>
            <Badge tone="red">{report.totals.rejected ?? 0} rejected</Badge>
            <Badge tone="slate">{report.totals.fromOfficialSource ?? 0} official sources</Badge>
            {(report.totals.fromUntrustedSource ?? 0) > 0 && (
              <Badge tone="red">{report.totals.fromUntrustedSource} untrusted</Badge>
            )}
          </div>
        </>
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
        <div className="flex items-center gap-2">
          {item.sourceTrust && (
            <Badge tone={item.sourceTrust.tier === "official" ? "green" : item.sourceTrust.tier === "low" ? "red" : "slate"}>
              {item.sourceTrust.tier} source · {item.sourceTrust.score}
            </Badge>
          )}
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{item.kind} · {item.method}</span>
        </div>
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

  const isReject = c.recommendation === "reject";
  const isReady = c.recommendation === "ready-to-approve";

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
          className={`rounded border px-2 py-1 text-xs font-medium disabled:opacity-50 ${
            isReject
              ? "border-red-300 text-red-700 hover:bg-red-50"
              : "border-brand-300 text-brand-700 hover:bg-brand-50"
          }`}
        >
          {state === "done" ? "Applied ✓" : state === "saving" ? "Saving…" : state === "error" ? "Retry" : isReject ? "Approve anyway" : "Approve & apply"}
        </button>
      </div>
      {/* Auto grades (deterministic): quality + recommended action. */}
      <div className="mt-1.5 flex flex-wrap gap-2">
        <Badge tone={isReady ? "green" : c.recommendation === "needs-review" ? "amber" : "red"}>
          {c.recommendation.replace(/-/g, " ")}
        </Badge>
        <Badge tone={c.quality === "pass" ? "green" : c.quality === "review" ? "amber" : "red"}>
          quality: {c.quality}
        </Badge>
      </div>
      <div className="mt-1 text-xs text-slate-400">…{c.context}…</div>
    </li>
  );
}

function Badge({ tone, children }: { tone: "green" | "amber" | "red" | "slate"; children: React.ReactNode }) {
  const cls = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  }[tone];
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}
