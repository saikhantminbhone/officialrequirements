import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getDestinationMeta } from "@/lib/req-data";
import { destinationPairs, representativeByDestination, buildComparison, compareInsights } from "@/lib/compare";
import { SourceCite } from "@/components/SourceCite";
import AdSlot from "@/components/AdSlot";
import LeadGenBlock from "@/components/LeadGenBlock";
import JsonLd from "@/components/JsonLd";
import FaqSection from "@/components/FaqSection";
import { breadcrumbLd, faqPageLd } from "@/lib/seo";
import { robotsFor } from "@/lib/page-policy";

// ISR (see visa page note) — small prerender seed, rest generated on demand.
export const dynamicParams = true;
export const revalidate = 86400;

const PRERENDER_SEED = 20;

type Params = { a: string; b: string };

export async function generateStaticParams(): Promise<Params[]> {
  return destinationPairs().slice(0, PRERENDER_SEED);
}

function capitalize(s: string): string {
  if (s.startsWith("the ")) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { a: ca, b: cb } = await params;
  const a = getDestinationMeta(ca);
  const b = getDestinationMeta(cb);
  if (!a || !b) return {};
  const path = `/compare/study/${ca}/${cb}`;
  const title = `Study in ${capitalize(a.name)} vs ${capitalize(b.name)} — student visa compared`;
  const description = `Side-by-side student-visa comparison of ${a.name} and ${b.name}: proof of funds, living costs, visa fee, processing time, intakes and document requirements. Sourced and verified.`;
  const ogImage = `/api/og?title=${encodeURIComponent(`${capitalize(a.name)} vs ${capitalize(b.name)}`)}&tag=${encodeURIComponent("Student visa compared")}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: robotsFor({ index: true, reason: "ok" }),
    openGraph: { title, description, url: path, images: [ogImage] },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

export default async function ComparePage({ params }: { params: Promise<Params> }) {
  const { a, b } = await params;
  // Canonicalize: one comparison per pair (a < b). Redirect reverse/same order.
  if (a === b) notFound();
  if (a > b) redirect(`/compare/study/${b}/${a}`);

  const aMeta = getDestinationMeta(a);
  const bMeta = getDestinationMeta(b);
  if (!aMeta || !bMeta) notFound();

  const reps = await representativeByDestination();
  const aRec = reps.get(a);
  const bRec = reps.get(b);
  if (!aRec || !bRec) notFound();

  const { rows, onlyA, onlyB } = buildComparison(aRec, bRec);
  const path = `/compare/study/${a}/${b}`;
  const aName = capitalize(aMeta.name);
  const bName = capitalize(bMeta.name);
  const { verdict, faqs } = await compareInsights(aRec, bRec, aName, bName);

  return (
    <article>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            { name: `${aName} vs ${bName}`, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `Study in ${aName} vs ${bName}: student visa compared`,
            dateModified: aRec.lastVerified,
            mainEntityOfPage: `${process.env.NEXT_PUBLIC_SITE_URL || ""}${path}`,
          },
          faqPageLd(faqs),
        ]}
      />

      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link> ·{" "}
        <Link href="/compare" className="hover:text-brand-700">Compare</Link>
      </nav>

      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Study in {aName} vs {bName}: student visa compared
      </h1>
      <p className="mt-2 text-slate-600" data-speakable>
        A side-by-side look at the student-visa requirements for {aMeta.name} and {bMeta.name} — the
        funds you must show, living costs, fees, processing time and document load. Figures are
        sourced from each country&apos;s official pages and date-verified.
      </p>

      <AdSlot id="in-content-1" pageType="leaf" />

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="py-3 pr-4 font-medium text-slate-500">Factor</th>
              <th className="py-3 pr-4 font-semibold text-slate-800">{aName}</th>
              <th className="py-3 font-semibold text-slate-800">{bName}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-slate-100">
                <td className="py-3 pr-4 text-slate-600">{r.label}</td>
                <td className={`py-3 pr-4 ${r.better === "a" ? "font-semibold text-trust-green" : "text-slate-800"}`}>
                  {r.a}
                  {r.better === "a" && <span className="ml-1 text-xs">✓ {r.betterMeaning}</span>}
                </td>
                <td className={`py-3 ${r.better === "b" ? "font-semibold text-trust-green" : "text-slate-800"}`}>
                  {r.b}
                  {r.better === "b" && <span className="ml-1 text-xs">✓ {r.betterMeaning}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Funds are shown in each country&apos;s own currency, so &ldquo;lower&rdquo; is only marked when
        currencies match. Always confirm current figures on the official sources below.
      </p>

      {verdict.length > 0 && (
        <section className="mt-6 rounded-lg border border-brand-100 bg-brand-50 p-4">
          <h2 className="font-semibold text-brand-700">Verdict: {aName} vs {bName}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700" data-speakable>
            {verdict.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-400">
            Money figures normalised to euros at ECB rates for comparison; official requirements are
            set in each country&apos;s own currency.
          </p>
        </section>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Unique to {aName}</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
            {onlyA.length ? onlyA.map((l) => <li key={l}>{l}</li>) : <li>No unique items</li>}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Unique to {bName}</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
            {onlyB.length ? onlyB.map((l) => <li key={l}>{l}</li>) : <li>No unique items</li>}
          </ul>
        </div>
      </div>

      <LeadGenBlock />

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href={`/study/${a}`} className="rounded-md border border-brand-200 px-4 py-2 text-brand-700 hover:bg-brand-50">
          Full {aName} requirements
        </Link>
        <Link href={`/study/${b}`} className="rounded-md border border-brand-200 px-4 py-2 text-brand-700 hover:bg-brand-50">
          Full {bName} requirements
        </Link>
      </div>

      <FaqSection faqs={faqs} />

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-800">Official sources</h2>
        <div className="mt-3 space-y-2">
          <SourceCite source={aRec.source} lastVerified={aRec.lastVerified} />
          <SourceCite source={bRec.source} lastVerified={bRec.lastVerified} />
        </div>
      </section>
    </article>
  );
}
