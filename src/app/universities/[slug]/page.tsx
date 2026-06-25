import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UNIVERSITIES, getUniversity, universitiesForDestination } from "@/lib/universities";
import { getDestinationMeta } from "@/lib/req-data";
import { SourceCite } from "@/components/SourceCite";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import ArticleHeader from "@/components/ArticleHeader";
import KeyFacts from "@/components/KeyFacts";
import HowToApply from "@/components/HowToApply";
import RelatedSearches from "@/components/RelatedSearches";
import OutcomeTracker from "@/components/OutcomeTracker";
import { outcomesForUniversity } from "@/lib/outcomes";
import { breadcrumbLd, speakableLd } from "@/lib/seo";
import { robotsFor } from "@/lib/page-policy";

// ISR so approved community outcomes refresh without a redeploy.
export const revalidate = 3600;
export const dynamicParams = false;

type Params = { slug: string };
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";
const YEAR = new Date().getFullYear();

export function generateStaticParams(): Params[] {
  return UNIVERSITIES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const u = getUniversity(slug);
  if (!u) return {};
  const path = `/universities/${u.slug}`;
  const title = `${u.name} Admission Requirements (${YEAR}) — Programs, English & Checklist`;
  const description = `${u.name} (${u.city}) admission requirements ${YEAR}: entry bar, English requirement, programs offered, application checklist and timeline — explained, with the official source.`;
  const ogImage = `/api/og?title=${encodeURIComponent(u.name)}&tag=${encodeURIComponent("Admission requirements")}`;
  return {
    title: { absolute: title },
    description,
    keywords: [
      `${u.name} admission requirements`,
      `${u.name} English requirement`,
      `${u.name} masters requirements ${YEAR}`,
      `how to apply to ${u.name}`,
    ],
    alternates: { canonical: path },
    robots: robotsFor({ index: true, reason: "ok" }),
    openGraph: { title, description, url: path, images: [ogImage] },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

export default async function UniversityNamedPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const u = getUniversity(slug);
  if (!u) notFound();
  const path = `/universities/${u.slug}`;
  const dest = getDestinationMeta(u.destination);
  const siblings = universitiesForDestination(u.destination).filter((x) => x.slug !== u.slug);
  const { records: outcomeRecords, summary: outcomeSummary } = await outcomesForUniversity(u.slug);

  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollegeOrUniversity",
            name: u.name,
            address: { "@type": "PostalAddress", addressLocality: u.city, addressCountry: u.destination.toUpperCase() },
            url: u.source.url,
            description: u.summary,
          },
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${u.name} admission requirements`,
            description: u.summary,
            dateModified: u.lastVerified,
            mainEntityOfPage: `${SITE}${path}`,
          },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Universities", path: "/universities" },
            { name: u.name, path },
          ]),
          speakableLd(["h1", "[data-speakable]"]),
        ]}
      />

      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link> ·{" "}
        <Link href="/universities" className="hover:text-brand-700">Universities</Link> ·{" "}
        <Link href={`/study/${u.destination}`} className="hover:text-brand-700">Study in {dest?.name}</Link>
      </nav>

      <div className="mt-3">
        <ArticleHeader kicker={`${u.city} · ${dest?.name ?? u.destination.toUpperCase()}`} title={`${u.name} — admission requirements`} summary={u.summary}>
          <SourceCite source={{ ...u.source, type: "university" }} lastVerified={u.lastVerified} />
        </ArticleHeader>
      </div>

      <KeyFacts facts={u.facts} />

      <AdSlot id="in-content-1" pageType="leaf" />

      <section className="prose-content mt-8">
        <h2>What makes {u.name} distinctive</h2>
        <ul>
          {u.distinctive.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800">Application checklist</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {u.checklist.map((c) => (
            <li key={c} className="flex gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <HowToApply steps={u.timeline.map((t) => ({ title: t.step, detail: t.when }))} destinationName={u.name} />

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800">Programs &amp; requirements</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {u.programs.map((p) => (
            <Link
              key={p.name}
              href={p.programSlug ? `/university/${u.destination}/${p.programSlug}` : `/study/${u.destination}`}
              className="card-link"
            >
              <div className="font-medium text-slate-900">{p.name}</div>
              <div className="mt-1 text-sm text-slate-500">Entry requirements & documents →</div>
            </Link>
          ))}
        </div>
      </section>

      {siblings.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-800">Other universities in {dest?.name}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {siblings.map((s) => (
              <Link key={s.slug} href={`/universities/${s.slug}`} className="card-link">
                <div className="font-medium text-slate-900">{s.name}</div>
                <div className="mt-1 text-sm text-slate-500">{s.city}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <OutcomeTracker
        title={`${u.name} — applicant outcomes`}
        summary={outcomeSummary}
        records={outcomeRecords}
        shareHref="/share-outcome"
      />

      <p className="mt-8 text-xs text-slate-400">
        Last verified {u.lastVerified}. Each programme sets its own exact thresholds and they change —
        always confirm on the official university page before applying.
      </p>

      <RelatedSearches
        keywords={[
          `${u.name} admission requirements`,
          `${u.name} English requirement`,
          `${u.name} masters ${YEAR}`,
          `how to apply to ${u.name}`,
        ]}
      />
    </article>
  );
}
