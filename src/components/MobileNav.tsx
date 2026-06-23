"use client";

import { useState } from "react";
import Link from "next/link";

type Item = { href: string; label: string };

// Apple-style mobile menu: a hamburger that opens a clean, frosted, full-width
// panel with the nav stacked vertically. Replaces the cramped scroll row.
export default function MobileNav({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          {/* Tap-away backdrop. */}
          <button aria-hidden tabIndex={-1} onClick={close} className="fixed inset-0 top-16 z-30 cursor-default bg-slate-900/40" />
          <div className="absolute inset-x-0 top-full z-40 border-b border-slate-200 bg-white shadow-xl">
            <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
              <Link href="/search" onClick={close} className="rounded-lg px-2 py-3 text-[15px] font-medium text-brand-700 hover:bg-slate-50">
                Search
              </Link>
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="rounded-lg px-2 py-3 text-[15px] text-slate-700 hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/tools/eligibility"
                onClick={close}
                className="mt-2 mb-1 inline-flex items-center justify-center rounded-full bg-brand-600 px-4 py-2.5 text-[15px] font-medium text-white hover:bg-brand-700"
              >
                Check eligibility
              </Link>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
