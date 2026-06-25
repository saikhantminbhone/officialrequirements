import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDES, getGuide } from "@/lib/guides";
import { getDestinationMeta } from "@/lib/req-data";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import FaqSection from "@/components/FaqSection";
import ArticleHeader from "@/components/ArticleHeader";
import RelatedSearches from "@/components/RelatedSearches";
import AffiliateBlock from "@/components/AffiliateBlock";
import { breadcrumbLd, faqPageLd, speakableLd } from "@/lib/seo";
import { robotsFor } from "@/lib/page-policy";

export const dynamic = "force-static";
export const dynamicParams = false;

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  const path = `/guides/${g.slug}`;
  const ogImage = `/api/og?title=${encodeURIComponent(g.h1)}&tag=${encodeURIComponent("Study-abroad guide")}`;
  return {
    title: { absolute: g.title },
    description: g.description,
    keywords: g.keywords,
    alternates: { canonical: path },
    robots: robotsFor({ index: true, reason: "ok" }),
    openGraph: { title: g.title, description: g.description, url: path, images: [ogImage], type: "article" },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();
  const path = `/guides/${g.slug}`;
  const dest = g.destination ? getDestinationMeta(g.destination) : undefined;
  const related = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 4);

  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: g.h1,
            description: g.description,
            dateModified: g.updated,
            datePublished: g.updated,
            mainEntityOfPage: `${SITE}${path}`,
            isAccessibleForFree: true,
          },
          faqPageLd(g.faqs),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: g.h1, path },
          ]),
          speakableLd(["h1", "[data-speakable]"]),
        ]}
      />

      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link> ·{" "}
        <Link href="/guides" className="hover:text-brand-700">Guides</Link>
      </nav>

      <div className="mt-3">
        <ArticleHeader kicker="In-depth guide" title={g.h1} summary={g.intro}>
          <p className="text-xs text-slate-400">Updated {g.updated}</p>
        </ArticleHeader>
      </div>

      <AdSlot id="in-content-1" pageType="leaf" />

      <div className="prose-content mt-8">
        {g.sections.map((s) => (
          <section key={s.heading} className="mt-8">
            <h2>{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {s.bullets && (
              <ul>
                {s.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {g.affiliateTag && (
        <div className="mt-8">
          <AffiliateBlock tag={g.affiliateTag} max={2} />
        </div>
      )}

      <FaqSection faqs={g.faqs} />

      {dest && (
        <div className="mt-8 rounded-2xl border border-brand-100 bg-brand-50 p-5 text-sm">
          <div className="section-kicker">Keep going</div>
          <p className="mt-1.5 text-slate-700">
            See the full{" "}
            <Link href={`/study/${g.destination}`} className="font-medium text-brand-700 hover:underline">
              Study in {dest.name} guide
            </Link>{" "}
            with visa requirements by nationality, costs and scholarships.
          </p>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-800">More guides</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {related.map((r) => (
            <Link key={r.slug} href={`/guides/${r.slug}`} className="card-link">
              <div className="font-medium text-slate-900">{r.h1}</div>
              <div className="mt-1 text-sm text-slate-500 line-clamp-2">{r.description}</div>
            </Link>
          ))}
        </div>
      </section>

      <RelatedSearches keywords={g.keywords} />
    </article>
  );
}
