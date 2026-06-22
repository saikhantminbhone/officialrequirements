"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Compact header search. On submit it routes to /search?q=… where the full
// client-side search runs against the static index. A plain link is shown on
// the smallest screens so search is always one tap away.
export default function HeaderSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search");
      }}
      className="hidden sm:block"
    >
      <div className="relative">
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="m17 17-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          aria-label="Search requirements"
          className="w-36 rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-2 text-sm outline-none transition focus:w-56 focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
        />
      </div>
    </form>
  );
}
