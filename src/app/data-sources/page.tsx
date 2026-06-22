import type { Metadata } from "next";
import { getVisaRecords, getScholarships } from "@/lib/req-data";
import { SourceCite } from "@/components/SourceCite";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Data sources",
  description: "Every requirement on OfficialRequirements links to a primary official source: embassies, government portals, universities and scholarship bodies.",
  alternates: { canonical: "/data-sources" },
};

export default async function DataSourcesPage() {
  const [visa, scholarships] = await Promise.all([getVisaRecords(), getScholarships()]);
  const sources = new Map<string, { name: string; url: string; type: string }>();
  [...visa].forEach((r) => {
    [r.source, ...(r.extraSources ?? [])].forEach((s) => sources.set(s.url, s));
  });
  scholarships.forEach((s) => sources.set(s.source.url, s.source));

  return (
    <article className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">Data sources</h1>
      <p className="mt-3 text-slate-600" data-speakable>
        We cite only primary, official sources — embassies and consulates, government immigration
        portals, university admissions pages, and scholarship bodies such as DAAD and the European
        Commission. We never present aggregators or other blogs as authority. Every requirement page
        links its source and shows the date we last verified it.
      </p>

      <p className="mt-3 text-sm text-slate-500">
        Coverage is expanding worldwide. Current destinations include Germany, the UK, Canada,
        Australia, the Netherlands, Ireland and the USA, with more added as each is sourced and
        verified. A scheduled, deterministic watcher checks these source pages for changes and flags
        any that move for human re-verification.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-slate-800">Primary sources currently cited</h2>
      <div className="mt-4 space-y-3">
        {[...sources.values()].map((s) => (
          <SourceCite key={s.url} source={s as never} />
        ))}
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Spotted something out of date? Our{" "}
        <a href="/editorial-policy" className="text-brand-600 hover:underline">corrections policy</a>{" "}
        explains how we fix it.
      </p>
    </article>
  );
}
