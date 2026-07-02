import Link from "next/link";
import Logo from "@/components/Logo";

const COLS = [
  {
    title: "Verticals",
    links: [
      { href: "/study/de", label: "Student visas" },
      { href: "/university", label: "Admission requirements" },
      { href: "/scholarships", label: "Scholarships" },
      { href: "/compare", label: "Compare destinations" },
      { href: "/guides", label: "Guides" },
      { href: "/universities", label: "Universities" },
      { href: "/outcomes", label: "Outcomes tracker" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/tools/eligibility", label: "Eligibility checker" },
      { href: "/tools/cost", label: "Cost calculator" },
      { href: "/tools/timeline", label: "Timeline planner" },
      { href: "/tools/checklist", label: "Document checklist" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/methodology", label: "How we verify" },
      { href: "/data-sources", label: "Data sources" },
      { href: "/data", label: "Open data" },
      { href: "/widgets", label: "Free widgets" },
      { href: "/editorial-policy", label: "Editorial policy" },
      { href: "/changelog", label: "Changelog" },
      { href: "/about", label: "About us" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="surface-ink mt-20">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="text-lg font-semibold tracking-tight text-white">OfficialRequirements</div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
              Independent, sourced, freshness-tracked study-abroad requirements. Not a government or
              university site — every figure links to its official source.
            </p>
            <Link href="/search" className="mt-5 inline-flex text-sm font-medium text-brand-300 hover:text-white">
              Search all requirements →
            </Link>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{col.title}</div>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-slate-300 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 border-t border-white/10 pt-6 text-xs leading-5 text-slate-500">
          Independent informational resource. Not affiliated with any government or university.
          Always verify requirements with the official source. Some links are affiliate links,
          clearly disclosed; they never change what we list. © {new Date().getFullYear()} OfficialRequirements.
        </p>
      </div>
    </footer>
  );
}
