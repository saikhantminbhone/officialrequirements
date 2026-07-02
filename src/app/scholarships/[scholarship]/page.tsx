import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getScholarships, getScholarship } from "@/lib/req-data";
import { SourceCite, formatDate } from "@/components/SourceCite";
import EligibilityTool from "@/components/tools/EligibilityTool";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import DataTrustLine from "@/components/DataTrustLine";
import FaqSection from "@/components/FaqSection";
import ArticleHeader from "@/components/ArticleHeader";
import VisaOverview from "@/components/VisaOverview";
import RelatedSearches from "@/components/RelatedSearches";
import { buildScholarshipOverview } from "@/lib/destination-overview";
import { scholarshipSeoTitle, scholarshipSeoDescription, scholarshipTargetKeywords } from "@/lib/keywords";
import { scholarshipPageLd, buildScholarshipFaqs, breadcrumbLd } from "@/lib/seo";
import { scholarshipIndexDecision, robotsFor } from "@/lib/page-policy";

export const dynamic = "force-static";
export const dynamicParams = false;

type Params = { scholarship: string };

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getScholarships();
  return all.map((s) => ({ scholarship: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { scholarship } = await params;
  const s = await getScholarship(scholarship);
  if (!s) return {};
  const ogImage = `/api/og?title=${encodeURIComponent(s.name)}&tag=${encodeURIComponent("Scholarship eligibility")}`;
  const seoTitle = scholarshipSeoTitle(s);
  const seoDescription = scholarshipSeoDescription(s);
  return {
    title: { absolute: seoTitle },
    description: seoDescription,
    keywords: scholarshipTargetKeywords(s),
    alternates: { canonical: `/scholarships/${s.slug}` },
    robots: robotsFor(scholarshipIndexDecision(s)),
    openGraph: { title: seoTitle, description: seoDescription, url: `/scholarships/${s.slug}`, images: [ogImage] },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

export default async function ScholarshipPage({ params }: { params: Promise<Params> }) {
  const { scholarship } = await params;
  const s = await getScholarship(scholarship);
  if (!s) notFound();
  const path = `/scholarships/${s.slug}`;

  return (
    <article>
      <JsonLd
        data={[
          ...scholarshipPageLd(s, path),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Scholarships", path: "/scholarships" },
            { name: s.name, path },
          ]),
        ]}
      />

      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link> ·{" "}
        <Link href="/scholarships" className="hover:text-brand-700">Scholarships</Link>
      </nav>

      <div className="mt-3">
        <ArticleHeader kicker="Scholarship" title={s.name} summary={s.summary}>
          <SourceCite source={s.source} lastVerified={s.lastVerified} />
          <DataTrustLine verifiedBy={s.verifiedBy} lastVerified={s.lastVerified} verification={s.verification} />
        </ArticleHeader>
      </div>

      <AdSlot id="in-content-1" pageType="leaf" />

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">What it covers</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
            {s.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Deadlines</h2>
          <ul className="mt-2 text-sm text-slate-600">
            {s.deadlines.map((d) => (
              <li key={d.date}>
                <span className="font-medium">{d.intake}:</span> {formatDate(d.date)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <VisaOverview title={`About the ${s.name}`} sections={buildScholarshipOverview(s)} />

      <div className="mt-10">
        <EligibilityTool record={s} />
      </div>

      <FaqSection faqs={buildScholarshipFaqs(s)} />

      <RelatedSearches keywords={scholarshipTargetKeywords(s)} />

      <p className="mt-8 text-xs text-slate-400">
        Last verified {formatDate(s.lastVerified)} by {s.verifiedBy}. Eligibility rules change —
        confirm on the official source above.
      </p>
    </article>
  );
}
