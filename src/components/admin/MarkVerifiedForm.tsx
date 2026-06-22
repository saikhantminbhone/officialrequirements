"use client";

import { useState } from "react";

// Operator confirms a destination's figures against the official source → flips
// the public label from "compiled, pending verification" to "verified by a
// person". This is the human-in-the-loop that makes the trust line honest.
export default function MarkVerifiedForm({ destinations }: { destinations: { code: string; name: string }[] }) {
  const [vertical, setVertical] = useState("visa");
  const [destination, setDestination] = useState(destinations[0]?.code ?? "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vertical, destination }),
    });
    const json = await res.json();
    setMsg(res.ok ? `Marked ${destination} (${vertical}) verified on ${json.verifiedOn}. Rebuild to publish.` : `Failed: ${json.error}`);
    setBusy(false);
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="font-semibold text-slate-700">Mark a destination human-verified</div>
      <p className="mt-1 text-sm text-slate-500">
        After you check the figures against the official source, confirm here. Until then, pages
        honestly show &ldquo;compiled, pending verification&rdquo;.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <select value={vertical} onChange={(e) => setVertical(e.target.value)} className="rounded border border-slate-300 px-2 py-1">
          <option value="visa">Visa</option>
          <option value="university">University</option>
        </select>
        <select value={destination} onChange={(e) => setDestination(e.target.value)} className="rounded border border-slate-300 px-2 py-1">
          {destinations.map((d) => (
            <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
          ))}
        </select>
        <button onClick={submit} disabled={busy} className="rounded-md bg-trust-green px-3 py-1.5 font-medium text-white hover:opacity-90 disabled:opacity-50">
          {busy ? "Saving…" : "Mark verified"}
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
