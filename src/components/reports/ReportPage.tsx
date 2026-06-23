import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import LeadGenBlock from "@/components/LeadGenBlock";
import JsonLd from "@/components/JsonLd";
import RelatedSearches from "@/components/RelatedSearches";
import { breadcrumbLd } from "@/lib/seo";

// Shared shell for the computed /reports pages: lede, ranked table, insight,
// methodology, sources and internal links — substantive (anti-thin) by design.
export default function ReportPage({
  slug,
  title,
  lede,
  insight,
  headers,
  rows,
  fxUpdatedAt,
  rankItems,
  keywords,
}: {
  slug: string;
  title: string;
  lede: string;
  insight: React.ReactNode;
  headers: string[];
  rows: React.ReactNode[][];
  fxUpdatedAt: string;
  rankItems: string[];
  keywords?: string[];
}) {
  const path = `/reports/${slug}`;
  return (
    <article>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Reports", path: "/reports" },
            { name: title, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: title,
            itemListElement: rankItems.map((name, i) => ({ "@type": "ListItem", position: i + 1, name })),
          },
        ]}
      />

      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link> ·{" "}
        <Link href="/reports" className="hover:text-brand-700">Reports</Link>
      </nav>

      <span className="section-kicker mt-3 block">Data report</span>
      <h1 className="mt-2 text-3xl font-semibold leading-[1.12] tracking-tighter2 text-slate-900 sm:text-[2.5rem]">{title}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600" data-speakable>{lede}</p>

      <AdSlot id="in-content-1" pageType="leaf" />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 shadow-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                {cells.map((c, j) => (
                  <td key={j} className={`px-4 py-3 ${j === 0 ? "font-semibold text-slate-800" : "text-slate-700"}`}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 p-5 text-sm text-slate-700">
        <div className="section-kicker">What the numbers say</div>
        <div className="mt-1.5 leading-6">{insight}</div>
      </div>

      <LeadGenBlock />

      <section className="mt-8 text-sm text-slate-600">
        <h2 className="text-lg font-semibold text-slate-800">Methodology</h2>
        <p className="mt-2">
          Figures come from our sourced student-visa records (each linked to an official government
          page and date-verified). Amounts are converted to euros at European Central Bank reference
          rates (updated {fxUpdatedAt}) for comparability; banks add a margin and official figures are
          set in each country&apos;s own currency. The USA has no single fixed proof-of-funds figure —
          it&apos;s set by your school&apos;s I-20 — so it&apos;s excluded from money rankings.
        </p>
        <p className="mt-2">
          See the full requirements and official sources on each{" "}
          <Link href="/compare" className="text-brand-600 hover:underline">comparison</Link> and
          destination page. Requirements change — always confirm with the official source.
        </p>
      </section>

      {keywords && keywords.length > 0 && <RelatedSearches keywords={keywords} />}
    </article>
  );
}
