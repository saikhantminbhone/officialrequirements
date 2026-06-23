import Link from "next/link";
import Logo from "@/components/Logo";
import HeaderSearch from "@/components/HeaderSearch";
import MobileNav from "@/components/MobileNav";

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
    <header className="sticky top-0 z-40 border-b border-slate-900/[0.06] bg-white/70 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/60">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="OfficialRequirements home" className="flex shrink-0 items-center">
          <Logo />
        </Link>

        {/* Full inline nav only when there's room (xl+); below that, the scroll row. */}
        <nav className="hidden items-center gap-8 whitespace-nowrap text-[13px] font-normal leading-none tracking-tight text-slate-600 xl:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap transition-colors hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <HeaderSearch />
          <Link
            href="/tools/eligibility"
            className="hidden items-center whitespace-nowrap rounded-full bg-brand-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-brand-700 sm:inline-flex"
          >
            Check eligibility
          </Link>
          <MobileNav items={NAV} />
        </div>
      </div>
    </header>
  );
}
