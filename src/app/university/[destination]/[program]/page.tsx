import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getUniversityRecords, getUniversityRecord, getUniversityNoindexIds, getDestinationMeta } from "@/lib/req-data";
import { SourceCite, formatDate } from "@/components/SourceCite";
import AdSlot from "@/components/AdSlot";
import RequirementChecklist from "@/components/tools/RequirementChecklist";
import RequirementDetail from "@/components/RequirementDetail";
import DataTrustLine from "@/components/DataTrustLine";
import RelatedLinks from "@/components/RelatedLinks";
import JsonLd from "@/components/JsonLd";
import FaqSection from "@/components/FaqSection";
import ArticleHeader from "@/components/ArticleHeader";
import VisaOverview from "@/components/VisaOverview";
import RelatedSearches from "@/components/RelatedSearches";
import { buildUniversityOverview } from "@/lib/destination-overview";
import { uniSeoTitle, uniSeoDescription, uniTargetKeywords } from "@/lib/keywords";
import { universityPageLd, buildUniversityFaqs, breadcrumbLd } from "@/lib/seo";
import { visaIndexDecision, robotsFor } from "@/lib/page-policy";

// ISR (see visa page note) — small prerender seed, rest generated on demand.
export const dynamicParams = true;
export const revalidate = 86400;

const PRERENDER_SEED = 18;

type Params = { destination: string; program: string };

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getUniversityRecords();
  return all.slice(0, PRERENDER_SEED).map((r) => ({ destination: r.destination, program: r.program!.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { destination, program } = await params;
  const r = await getUniversityRecord(destination, program);
  if (!r) return {};
  const path = `/university/${destination}/${program}`;
  const destMeta = getDestinationMeta(r.destination);
  const kwOpts = { destName: destMeta?.name ?? r.destination.toUpperCase(), adjective: destMeta?.adjective };
  const seoTitle = uniSeoTitle(r, kwOpts);
  const seoDescription = uniSeoDescription(r, kwOpts);
  const ogImage = `/api/og?title=${encodeURIComponent(r.title)}&tag=${encodeURIComponent("Admission requirements")}`;
  // Anti-thin: noindex if the page is a near-duplicate of a canonical, or fails the base policy.
  const noindexIds = await getUniversityNoindexIds();
  const decision = noindexIds.has(r.id) ? { index: false, follow: true } : robotsFor(visaIndexDecision(r));
  return {
    title: { absolute: seoTitle },
    description: seoDescription,
    keywords: uniTargetKeywords(r, kwOpts),
    alternates: { canonical: path },
    robots: decision,
    openGraph: { title: seoTitle, description: seoDescription, url: path, images: [ogImage] },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

export default async function UniversityPage({ params }: { params: Promise<Params> }) {
  const { destination, program } = await params;
  const r = await getUniversityRecord(destination, program);
  if (!r) notFound();

  const dest = getDestinationMeta(r.destination);
  const path = `/university/${destination}/${program}`;
  const required = r.requirements.filter((x) => x.required);
  const conditional = r.requirements.filter((x) => !x.required);
  const targetKeywords = uniTargetKeywords(r, { destName: dest?.name ?? r.destination.toUpperCase(), adjective: dest?.adjective });

  const all = await getUniversityRecords();
  const related = all
    .filter((x) => x.destination === r.destination && x.id !== r.id)
    .slice(0, 8)
    .map((x) => ({ label: x.title, href: `/university/${x.destination}/${x.program?.slug}` }));

  return (
    <article>
      <JsonLd
        data={[
          ...universityPageLd(r, path),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "University admission", path: "/university" },
            { name: r.title, path },
          ]),
        ]}
      />

      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link> ·{" "}
        <Link href="/university" className="hover:text-brand-700">University admission</Link> ·{" "}
        <Link href={`/study/${r.destination}`} className="hover:text-brand-700">Study in {dest?.name}</Link>
      </nav>

      <div className="mt-3">
        <ArticleHeader kicker="University admission" title={r.title} summary={r.summary}>
          <SourceCite source={r.source} lastVerified={r.lastVerified} />
          <DataTrustLine verifiedBy={r.verifiedBy} lastVerified={r.lastVerified} verification={r.verification} />
        </ArticleHeader>
      </div>

      <AdSlot id="in-content-1" pageType="leaf" />

      <VisaOverview
        title={`Understanding ${r.program?.name ?? "admission"} in ${dest?.name ?? "this country"}`}
        sections={buildUniversityOverview(r, {
          name: dest?.name ?? r.destination.toUpperCase(),
          adjective: dest?.adjective ?? "",
          fundsLabel: dest?.fundsLabel ?? "proof of funds",
        })}
      />

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800">What you need</h2>
        <ul className="mt-3 space-y-3">
          {required.map((x) => (
            <RequirementDetail key={x.key} item={x} />
          ))}
        </ul>
      </section>

      {conditional.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800">Sometimes required</h2>
          <ul className="mt-3 space-y-3">
            {conditional.map((x) => (
              <RequirementDetail key={x.key} item={x} />
            ))}
          </ul>
        </section>
      )}

      <AdSlot id="in-content-2" pageType="leaf" />

      <div className="mt-10">
        <RequirementChecklist record={r} />
      </div>

      {r.extraSources && r.extraSources.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-800">Official sources</h2>
          <div className="mt-3 space-y-2">
            {r.extraSources.map((s) => (
              <SourceCite key={s.url} source={s} />
            ))}
          </div>
        </section>
      )}

      <FaqSection faqs={buildUniversityFaqs(r)} />

      <RelatedLinks title={`Other programs in ${dest?.name ?? "this country"}`} links={related} />

      <RelatedSearches keywords={targetKeywords} />

      <p className="mt-8 text-xs text-slate-400">
        Last verified {formatDate(r.lastVerified)} by {r.verifiedBy}. Each university sets its own exact
        thresholds — always confirm on the official program page before applying.
      </p>
    </article>
  );
}
