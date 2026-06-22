import type { Metadata } from "next";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Editorial & corrections policy",
  description: "How OfficialRequirements sources, verifies, dates and corrects requirements — and how monetization stays independent of what we publish.",
  alternates: { canonical: "/editorial-policy" },
};

export default function EditorialPolicyPage() {
  return (
    <article className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">Editorial &amp; corrections policy</h1>

      <h2 className="mt-6 text-xl font-semibold text-slate-800">Publishing principles</h2>
      <p className="mt-2 text-slate-600" data-speakable>
        We publish requirements only when they are sourced to a primary official authority, verified
        by a named person, and dated. Nothing is auto-published from a scraper. Records that can no
        longer be verified are unpublished rather than left to mislead.
      </p>

      <h2 className="mt-6 text-xl font-semibold text-slate-800">Corrections policy</h2>
      <p className="mt-2 text-slate-600">
        If a requirement is wrong or out of date, we fix the record and update its verification date
        and changelog. To report an error, contact us with the page URL and the official source
        showing the correct information. We aim to review reports within a few days; YMYL corrections
        are prioritized.
      </p>

      <h2 className="mt-6 text-xl font-semibold text-slate-800">Independence of monetization</h2>
      <p className="mt-2 text-slate-600">
        Some links are affiliate links and are clearly disclosed at the point of use. Affiliate
        relationships never change which requirements we list, which sources we cite, or the order in
        which facts are presented. We do not charge &ldquo;official&rdquo; fees and we do not process
        applications. We are not affiliated with any government or university.
      </p>

      <h2 className="mt-6 text-xl font-semibold text-slate-800">How guides are produced</h2>
      <p className="mt-2 text-slate-600">
        Each requirement is compiled from primary official sources, explained in full, and
        human-verified before publish. See{" "}
        <a href="/about" className="text-brand-600 hover:underline">about us</a> and our{" "}
        <a href="/methodology" className="text-brand-600 hover:underline">methodology</a>.
      </p>
    </article>
  );
}
