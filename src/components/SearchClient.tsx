"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { searchEntries, type SearchEntry } from "@/lib/search-index";

// Client-side search over the static index. Fetches /api/search once, then
// filters in-browser — instant, no server round-trip per keystroke.
export default function SearchClient({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/search")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (alive) setIndex(j.index as SearchEntry[]);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo(() => (index ? searchEntries(index, query, 60) : []), [index, query]);

  return (
    <div>
      <label htmlFor="site-search" className="sr-only">
        Search requirements
      </label>
      <input
        id="site-search"
        type="search"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search countries, visas, scholarships, programs…"
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base shadow-card outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
      />

      <div className="mt-5">
        {error && <p className="text-sm text-slate-500">Search is temporarily unavailable. Please try the menu above.</p>}
        {!error && !index && <p className="text-sm text-slate-500">Loading search…</p>}
        {!error && index && query.trim() && (
          <p className="mb-3 text-sm text-slate-500">
            {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query.trim()}&rdquo;
          </p>
        )}

        <ul className="divide-y divide-slate-100">
          {results.map((r) => (
            <li key={r.u}>
              <Link href={r.u} className="flex items-center justify-between gap-4 py-3 hover:bg-slate-50">
                <span className="font-medium text-slate-800">{r.t}</span>
                <span className="chip shrink-0">{r.k}</span>
              </Link>
            </li>
          ))}
        </ul>

        {!error && index && query.trim() && results.length === 0 && (
          <p className="text-sm text-slate-500">
            No matches. Try a country name (&ldquo;Germany&rdquo;), a nationality, &ldquo;MBA&rdquo;, or a scholarship name.
          </p>
        )}
      </div>
    </div>
  );
}
