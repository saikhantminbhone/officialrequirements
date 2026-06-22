import type { Metadata } from "next";
import Link from "next/link";
import { getUniversityRecords, getDestinationMeta } from "@/lib/req-data";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "University admission requirements by program & country",
  description: "Admission requirements for Bachelor's, Master's, MBA and PhD programs across Germany, the UK, Canada, Australia and more — GPA, English scores, GRE/GMAT, documents. Sourced and verified.",
  alternates: { canonical: "/university" },
};

function capitalize(s: string): string {
  if (s.startsWith("the ")) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function UniversityHub() {
  const records = await getUniversityRecords();

  // Group by destination.
  const byDest = new Map<string, typeof records>();
  records.forEach((r) => {
    const arr = byDest.get(r.destination) ?? [];
    arr.push(r);
    byDest.set(r.destination, arr);
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">University admission requirements</h1>
      <p className="mt-2 max-w-2xl text-slate-600" data-speakable>
        What each program actually asks for — prior qualification, grade/GPA threshold, English
        scores, GRE/GMAT, and the full document checklist — by country and degree. Sourced from
        official admission bodies and date-verified.
      </p>

      <AdSlot id="in-content-1" pageType="hub" />

      <div className="mt-6 space-y-8">
        {[...byDest.entries()].map(([dest, items]) => {
          const meta = getDestinationMeta(dest);
          return (
            <section key={dest}>
              <h2 className="text-xl font-semibold text-slate-800">Study in {capitalize(meta?.name ?? dest)}</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r) => (
                  <Link
                    key={r.id}
                    href={`/university/${r.destination}/${r.program?.slug}`}
                    className="rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <div className="font-medium text-slate-800">{r.program?.name}</div>
                    <div className="mt-1 text-sm text-slate-500">Verified {r.lastVerified}</div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
