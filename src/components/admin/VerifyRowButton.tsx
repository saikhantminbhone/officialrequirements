"use client";

import { useState } from "react";

// One-click "I checked this destination against its official source" action for
// the verification queue. Same endpoint as MarkVerifiedForm, per-row UX.
export default function VerifyRowButton({ destination }: { destination: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function verify() {
    setState("busy");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vertical: "visa", destination }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") return <span className="text-xs font-medium text-trust-green">✓ verified — rebuild to publish</span>;
  return (
    <button
      onClick={verify}
      disabled={state === "busy"}
      className="rounded-md bg-trust-green px-2.5 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
      title="Confirm you checked every figure against the official source"
    >
      {state === "busy" ? "Saving…" : state === "error" ? "Retry" : "Mark verified"}
    </button>
  );
}
