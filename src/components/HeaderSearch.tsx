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
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
          placeholder="Search countries, visas, scholarships…"
          aria-label="Search requirements"
          className="w-44 rounded-full border border-transparent bg-slate-100 py-2 pl-9 pr-3 text-[13px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100 md:w-64 lg:w-72"
        />
      </div>
    </form>
  );
}
