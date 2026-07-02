"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS: { label: string; items: { href: string; name: string }[] }[] = [
  { label: "Overview", items: [{ href: "/ops", name: "Dashboard" }] },
  {
    label: "Knowledge",
    items: [
      { href: "/ops/data", name: "Data freshness" },
      { href: "/ops/verify", name: "Verification queue" },
      { href: "/ops/sources", name: "Gaps & sources" },
      { href: "/ops/outcomes", name: "Outcomes" },
    ],
  },
  { label: "Intelligence", items: [{ href: "/ops/seo", name: "SEO & health" }] },
  { label: "System", items: [{ href: "/ops/ads", name: "Ads & affiliate" }] },
];

export default function OpsNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-6">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{g.label}</div>
          <div className="mt-2 space-y-0.5">
            {g.items.map((it) => {
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    active ? "bg-brand-50 font-medium text-brand-700" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {it.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
