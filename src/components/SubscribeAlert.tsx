"use client";

import { useState } from "react";

// "Email me when this changes" — the retention loop. Visa rules drift; being
// the site that tells you when they do is a reason to subscribe AND to return.
export default function SubscribeAlert({ destination, destinationName }: { destination: string; destinationName: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("busy");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, destination }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <span className="font-semibold">You&apos;re on the list.</span> We&apos;ll email you when an official source
        behind the {destinationName} requirements changes.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
      <div className="section-kicker">Requirements change</div>
      <p className="mt-1.5 text-sm text-slate-700">
        Funds figures, fees and rules for {destinationName} get revised. Get one short email when an
        official source behind this page changes — nothing else, ever.
      </p>
      <form onSubmit={submit} className="mt-3 flex flex-wrap gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          aria-label="Email address for change alerts"
        />
        {/* Honeypot — hidden from humans, filled by naive bots. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button
          type="submit"
          disabled={state === "busy"}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {state === "busy" ? "Adding…" : "Alert me on changes"}
        </button>
      </form>
      {state === "error" && <p className="mt-2 text-sm text-red-600">Couldn&apos;t subscribe — try again.</p>}
    </div>
  );
}
