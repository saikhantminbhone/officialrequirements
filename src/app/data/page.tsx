import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { robotsFor } from "@/lib/page-policy";
import { buildOpenData } from "@/lib/open-data";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Open Data — Student Visa Requirements Dataset (Free, CC BY 4.0)",
  description:
    "Download the full student-visa requirements dataset — proof of funds, fees, processing times by nationality and destination — free under CC BY 4.0. JSON and CSV, sourced from official government pages.",
  alternates: { canonical: "/data" },
  robots: robotsFor({ index: true, reason: "ok" }),
};

// Dataset landing page. schema.org/Dataset markup makes it eligible for
// Google Dataset Search — a discovery channel with almost zero competition
// in this niche, and every reuse carries an attribution link.
export default async function OpenDataPage() {
  const { rows, generatedAt } = await buildOpenData();
  const destinations = new Set(rows.map((r) => r.destination)).size;
  const nationalities = new Set(rows.map((r) => r.nationality)).size;

  const datasetLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Student visa requirements by nationality and destination",
    description:
      "Proof-of-funds amounts, visa fees, living costs, processing times and intake months for student visas, by applicant nationality and destination country. Every figure carries its official government source URL and a last-verified date.",
    url: `${SITE}/data`,
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    creator: { "@id": `${SITE}/#organization` },
    dateModified: generatedAt.slice(0, 10),
    keywords: ["student visa", "proof of funds", "visa fees", "study abroad", "international students"],
    distribution: [
      { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE}/api/data/requirements` },
      { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${SITE}/api/data/requirements.csv` },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl">
      <JsonLd data={[datasetLd]} />
      <span className="section-kicker">Open data</span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-4xl">
        The student-visa requirements dataset, free to use
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">
        Everything behind this site&apos;s pages — proof-of-funds amounts, visa fees, living costs,
        processing times and intakes for {rows.length.toLocaleString("en-US")} nationality×destination
        pairs across {destinations} destinations and {nationalities} nationalities — as machine-readable
        data. Every row carries its official source URL and last-verified date, so you can audit any figure.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a href="/api/data/requirements" className="card-link">
          <div className="text-lg font-semibold text-slate-900">JSON</div>
          <div className="mt-1 text-sm text-slate-500">Full dataset with metadata — for apps, research and analysis.</div>
        </a>
        <a href="/api/data/requirements.csv" className="card-link">
          <div className="text-lg font-semibold text-slate-900">CSV</div>
          <div className="mt-1 text-sm text-slate-500">Spreadsheet-ready — opens straight in Excel or Google Sheets.</div>
        </a>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-800">License: CC BY 4.0</h2>
        <p className="mt-2 leading-relaxed text-slate-600">
          Use it in articles, research, apps or products — including commercially. The single condition is
          attribution: link to <span className="font-medium text-slate-800">officialrequirements.com</span> wherever
          you use the data. Journalists: happy to help with custom cuts or checks of the numbers —
          see <Link href="/methodology" className="font-medium text-brand-700 hover:underline">our methodology</Link> for
          how figures are compiled and verified.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800">Freshness and caveats</h2>
        <p className="mt-2 leading-relaxed text-slate-600">
          The dataset is regenerated daily from the live records. Each row&apos;s <code className="rounded bg-slate-100 px-1">verification</code> field
          is honest about provenance: <em>machine-compiled</em> (from the official source, not yet independently
          checked), <em>auto-corroborated</em> (confirmed across two or more official sources) or{" "}
          <em>human-verified</em>. Always confirm the final figure on the linked official source before acting
          on it — requirements change.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-brand-100 bg-brand-50 p-5 text-sm text-slate-700">
        Prefer it rendered? The same data powers our{" "}
        <Link href="/widgets" className="font-medium text-brand-700 hover:underline">free embeddable widgets</Link> and
        the <Link href="/reports/study-abroad-index" className="font-medium text-brand-700 hover:underline">Study Abroad Index</Link>.
      </section>
    </div>
  );
}
