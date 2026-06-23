import type { Metadata } from "next";
import { AUTHOR_NAME, AUTHOR_URL, AUTHOR_BIO, hasNamedAuthor } from "@/lib/seo";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: hasNamedAuthor ? `About — ${AUTHOR_NAME}` : "About OfficialRequirements",
  description: "How OfficialRequirements compiles study-abroad requirements from primary official sources, with verification dates and an honest, independent approach.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";
  const ld = hasNamedAuthor
    ? { "@context": "https://schema.org", "@type": "Person", name: AUTHOR_NAME, url: AUTHOR_URL, description: AUTHOR_BIO, worksFor: { "@type": "Organization", name: "OfficialRequirements", url: site } }
    : { "@context": "https://schema.org", "@type": "Organization", name: "OfficialRequirements", url: site, description: AUTHOR_BIO };

  return (
    <article className="prose-tight max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 className="text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-[2.4rem]">{hasNamedAuthor ? `About ${AUTHOR_NAME}` : "About OfficialRequirements"}</h1>

      {hasNamedAuthor && (
        <p className="mt-3 text-slate-600" data-speakable>
          {AUTHOR_BIO}{" "}
          <a href={AUTHOR_URL} className="text-brand-600 hover:underline" rel="me">More about the author</a>.
        </p>
      )}

      <p className="mt-3 text-slate-600" data-speakable>
        OfficialRequirements is an independent resource for study-abroad requirements — student visas,
        scholarships and university admission. Every requirement is compiled from primary official
        sources, dated with the day it was last touched, and linked back to the government or
        institutional page it came from.
      </p>
      <p className="mt-3 text-slate-600">
        We are honest about provenance: figures compiled but not yet checked by a person are labelled
        &ldquo;compiled, pending verification&rdquo; — only entries a human has confirmed against the
        official source show as verified. Nothing is published from an automated scrape without that
        human step.
      </p>
      <p className="mt-3 text-slate-600">
        We are not affiliated with any government or university. Some links are affiliate links,
        clearly disclosed, and they never change which requirements we list or which sources we cite.
        See our <a href="/methodology" className="text-brand-600 hover:underline">methodology</a> and{" "}
        <a href="/editorial-policy" className="text-brand-600 hover:underline">editorial policy</a>.
      </p>
    </article>
  );
}
