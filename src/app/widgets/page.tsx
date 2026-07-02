import type { Metadata } from "next";
import Link from "next/link";
import { robotsFor } from "@/lib/page-policy";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

export const metadata: Metadata = {
  title: "Free Embeddable Widgets — Student Visa Data for Your Site",
  description:
    "Embed a live, always-current student-visa proof-of-funds table on your website or blog — free, one line of code, official figures updated automatically.",
  alternates: { canonical: "/widgets" },
  robots: robotsFor({ index: true, reason: "ok" }),
};

// The distribution page for the embed. Education bloggers, consultants and
// student communities get live data for free; we get the attribution link.
export default function WidgetsPage() {
  const scriptSnippet = `<script src="${SITE}/widget.js" data-limit="10" async></script>`;
  const iframeSnippet = `<iframe src="${SITE}/embed/funds?limit=10"
  title="Student visa proof of funds by country"
  style="width:100%;max-width:520px;height:430px;border:0;border-radius:12px" loading="lazy"></iframe>
<p>Source: <a href="${SITE}/reports/cheapest-student-visa-proof-of-funds">Student visa proof
of funds data — OfficialRequirements</a></p>`;

  return (
    <div className="mx-auto max-w-3xl">
      <span className="section-kicker">Free widgets</span>
      <h1 className="mt-3 text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-4xl">
        Put live student-visa data on your site
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">
        A live table of the cheapest student-visa proof-of-funds requirements, computed from official
        government figures and converted at ECB rates — updated automatically, free forever. Paste one
        line of code; the numbers stay current without you touching anything.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
        <iframe
          src="/embed/funds?limit=8"
          title="Student visa proof of funds by country — preview"
          className="h-[370px] w-full border-0"
          loading="lazy"
        />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-800">Option 1 — one-line script (recommended)</h2>
        <p className="mt-2 text-slate-600">
          Sizes itself and stays up to date. Change <code className="rounded bg-slate-100 px-1">data-limit</code> (3–25) for more or fewer countries.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">{scriptSnippet}</pre>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800">Option 2 — plain iframe</h2>
        <p className="mt-2 text-slate-600">For sites that don&apos;t allow scripts. Keep the source line — it&apos;s the license condition.</p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">{iframeSnippet}</pre>
      </section>

      <section className="mt-8 rounded-2xl border border-brand-100 bg-brand-50 p-5 text-sm text-slate-700">
        <div className="font-semibold text-slate-900">License</div>
        Free for any website, including commercial ones, under one condition: the visible
        &ldquo;Source: OfficialRequirements&rdquo; link stays intact. That link is how the data keeps
        being maintained. Want a different dataset as a widget (visa fees, processing times, a specific
        destination)? <Link href="/about" className="font-medium text-brand-700 hover:underline">Tell us</Link> — if
        it&apos;s in <Link href="/data" className="font-medium text-brand-700 hover:underline">our open data</Link>, we can ship it.
      </section>
    </div>
  );
}
