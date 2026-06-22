import type { Metadata } from "next";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "How we source & verify requirements",
  description: "Our methodology: primary sources only, visible verification dates, human-verify-before-publish, and unpublishing stale records.",
  alternates: { canonical: "/methodology" },
};

export default function MethodologyPage() {
  return (
    <article className="prose-tight max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">How we source and verify requirements</h1>
      <p className="mt-3 text-slate-600">
        Immigration and admissions are high-stakes. Wrong information costs people money, time and
        opportunities — so we treat the dataset behind this site as the product, not an afterthought.
        Here is exactly how it works.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-slate-800">Primary sources only</h2>
      <p className="mt-2 text-slate-600">
        Every requirement record links to an official source — an embassy or consulate page, a
        government immigration portal, a university admissions page, or a scholarship body such as
        DAAD. We do not cite aggregators or other blogs as authority. The source link appears on the
        page so you can confirm for yourself.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-slate-800">Visible verification dates</h2>
      <p className="mt-2 text-slate-600">
        Each record carries a <em>last verified</em> date, rendered on the page. If you can&apos;t see
        when something was checked, you can&apos;t trust it. We can.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-slate-800">Human-verify-before-publish</h2>
      <p className="mt-2 text-slate-600">
        We monitor key source pages for changes, but nothing is auto-published. A person re-checks the
        official source and updates the record before it goes live. Records that can no longer be
        verified are unpublished rather than left to mislead.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-slate-800">Independent and honestly monetized</h2>
      <p className="mt-2 text-slate-600">
        We are not affiliated with any government or university, and we say so on every page. Some
        links are affiliate links — clearly disclosed — and they never change which requirements we
        list or which sources we cite. We do not charge &ldquo;official&rdquo; fees or process
        applications.
      </p>
    </article>
  );
}
