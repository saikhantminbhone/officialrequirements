import type { Metadata } from "next";
import Link from "next/link";
import { UNIVERSITIES } from "@/lib/universities";
import { getDestinationMeta } from "@/lib/req-data";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: "University admission requirements by institution" },
  description:
    "Admission requirements for named universities — entry bar, English requirement, programs, checklist and timeline for each, explained with the official source.",
  alternates: { canonical: "/universities" },
};

export default function UniversitiesIndex() {
  // Group by destination for a country-cluster structure.
  const byDest = new Map<string, typeof UNIVERSITIES>();
  for (const u of UNIVERSITIES) {
    const arr = byDest.get(u.destination) ?? [];
    arr.push(u);
    byDest.set(u.destination, arr);
  }

  return (
    <div>
      <JsonLd data={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Universities", path: "/universities" }])]} />
      <span className="section-kicker">Universities</span>
      <h1 className="mt-2 text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-[2.4rem]">
        University admission requirements
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">
        Requirements by named institution — what each university actually asks for, its English bar, the
        programs it offers, and a working application timeline.
      </p>

      <div className="mt-8 space-y-10">
        {[...byDest.entries()].map(([code, unis]) => (
          <section key={code}>
            <h2 className="text-lg font-semibold text-slate-800">{getDestinationMeta(code)?.name ?? code.toUpperCase()}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {unis.map((u) => (
                <Link key={u.slug} href={`/universities/${u.slug}`} className="card-link">
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{u.city} · {u.type === "public" ? "Public" : "Private"}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
