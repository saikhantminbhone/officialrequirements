import Link from "next/link";
import Logo from "@/components/Logo";
import HeaderSearch from "@/components/HeaderSearch";

const NAV = [
  { href: "/study/de", label: "Study abroad" },
  { href: "/university", label: "Admissions" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/compare", label: "Compare" },
  { href: "/reports", label: "Reports" },
  { href: "/methodology", label: "How we verify" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" aria-label="OfficialRequirements home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <HeaderSearch />
          <Link
            href="/tools/eligibility"
            className="hidden items-center rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 lg:inline-flex"
          >
            Check eligibility
          </Link>
        </div>
      </div>

      {/* Scrollable nav on small screens so every section stays reachable. */}
      <nav className="flex gap-4 overflow-x-auto border-t border-slate-100 px-4 py-2 text-sm font-medium text-slate-600 md:hidden">
        <Link href="/search" className="whitespace-nowrap font-semibold text-brand-700">
          Search
        </Link>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap hover:text-brand-700">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
