import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getVisaRecords, getVisaRecord, getDestinationMeta, getAllDestinations, getNationalities } from "@/lib/req-data";
import { SourceCite, formatDate } from "@/components/SourceCite";
import AdSlot from "@/components/AdSlot";
import ChecklistTool from "@/components/tools/ChecklistTool";
import CostTool from "@/components/tools/CostTool";
import TimelineTool from "@/components/tools/TimelineTool";
import JsonLd from "@/components/JsonLd";
import DataTrustLine from "@/components/DataTrustLine";
import RelatedLinks from "@/components/RelatedLinks";
import RequirementDetail from "@/components/RequirementDetail";
import FaqSection from "@/components/FaqSection";
import KeyFacts from "@/components/KeyFacts";
import HowToApply from "@/components/HowToApply";
import ArticleHeader from "@/components/ArticleHeader";
import VisaOverview from "@/components/VisaOverview";
import RelatedSearches from "@/components/RelatedSearches";
import { buildVisaOverview } from "@/lib/destination-overview";
import { visaSeoTitle, visaSeoDescription, visaTargetKeywords } from "@/lib/keywords";
import { rankInternalLinks } from "@/lib/seo-strategy";
import { visaPageLd, buildVisaFaqs, breadcrumbLd } from "@/lib/seo";
import { visaIndexDecision, robotsFor } from "@/lib/page-policy";
import { getFxRates, convert, formatMoney, NATIONALITY_CURRENCY } from "@/lib/fx";
import { destinationMetrics, eur } from "@/lib/reports";

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ISR: prerender a seed of high-value pages at build, generate the rest of the
// large matrix on first request and cache them (revalidated daily). This is the
// blueprint's build-ceiling mitigation (§11) and the right architecture for a
// matrix that keeps growing — every page is still fully static once cached.
export const dynamicParams = true;
export const revalidate = 86400;

const PRERENDER_SEED = 30; // pages baked at build; remainder are ISR on-demand

type Params = { nationality: string; destination: string };

export async function generateStaticParams(): Promise<Params[]> {
  const records = await getVisaRecords();
  return records.slice(0, PRERENDER_SEED).map((r) => ({ nationality: r.nationality!, destination: r.destination }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { nationality, destination } = await params;
  const record = await getVisaRecord(nationality, destination);
  if (!record) return {};
  const path = `/${nationality}/${destination}/student-visa`;
  const destMeta = getDestinationMeta(record.destination);
  const natName = getNationalities().find((n) => n.code === record.nationality)?.name;
  const kwOpts = { destName: destMeta?.name ?? record.destination.toUpperCase(), nationalityName: natName, adjective: destMeta?.adjective };
  const seoTitle = visaSeoTitle(record, kwOpts);
  const seoDescription = visaSeoDescription(record, kwOpts);
  const ogImage = `/api/og?title=${encodeURIComponent(record.title)}&tag=${encodeURIComponent("Student visa requirements")}`;
  return {
    // Keyword-optimised title (absolute = bypass the brand template so length stays SERP-friendly).
    title: { absolute: seoTitle },
    description: seoDescription,
    keywords: visaTargetKeywords(record, kwOpts),
    alternates: { canonical: path },
    robots: robotsFor(visaIndexDecision(record)),
    openGraph: { title: seoTitle, description: seoDescription, url: path, images: [ogImage] },
    twitter: { card: "summary_large_image", images: [ogImage] },
  };
}

export default async function VisaPage({ params }: { params: Promise<Params> }) {
  const { nationality, destination } = await params;
  const record = await getVisaRecord(nationality, destination);
  if (!record) notFound();

  const dest = getDestinationMeta(record.destination);
  const path = `/${nationality}/${destination}/student-visa`;
  const hubPath = `/study/${record.destination}`;
  const required = record.requirements.filter((r) => r.required);
  const conditional = record.requirements.filter((r) => !r.required);

  // Long-tail keyword cluster for the visible "related searches" block.
  const natName = getNationalities().find((n) => n.code === record.nationality)?.name;
  const targetKeywords = visaTargetKeywords(record, {
    destName: dest?.name ?? record.destination.toUpperCase(),
    nationalityName: natName,
    adjective: dest?.adjective,
  });

  // Home-currency conversion of the proof-of-funds — unique computed value per
  // nationality page (anti-thin), and genuinely useful to the applicant.
  const homeCurrency = NATIONALITY_CURRENCY[record.nationality ?? ""];
  const fundsAmount = record.toolDefaults?.blockedAccountAmount;
  const fundsCurrency = record.toolDefaults?.blockedAccountCurrency;
  let homeFunds: { value: string; updatedAt: string } | null = null;
  if (homeCurrency && fundsAmount && fundsCurrency && homeCurrency !== fundsCurrency) {
    const rates = await getFxRates();
    const converted = convert(fundsAmount, fundsCurrency, homeCurrency, rates.rates);
    if (converted) homeFunds = { value: formatMoney(converted, homeCurrency), updatedAt: rates.updatedAt };
  }

  // Hub-and-spoke + internal-link sculpting: link other nationalities for the
  // same destination, ordered so the highest-opportunity pages get the links.
  const all = await getVisaRecords();
  const related = rankInternalLinks(
    record,
    all.filter((r) => r.destination === record.destination)
  )
    .slice(0, 8)
    .map((r) => ({ label: r.title, href: `/${r.nationality}/${r.destination}/student-visa` }));

  // Cross-vertical links — distribute authority across the whole topic cluster
  // (hub, comparisons, scholarships, admission, reports) and deepen crawl paths.
  const otherDests = getAllDestinations().map((d) => d.code).filter((c) => c !== record.destination).slice(0, 3);
  const crossLinks = [
    { label: `Study in ${dest?.name ?? "this country"} — full guide`, href: `/study/${record.destination}` },
    ...otherDests.map((c) => {
      const [a, b] = [record.destination, c].sort();
      return { label: `Compare ${getDestinationMeta(a)?.name} vs ${getDestinationMeta(b)?.name}`, href: `/compare/study/${a}/${b}` };
    }),
    { label: `University admission requirements in ${dest?.name ?? "this country"}`, href: `/university/${record.destination}/msc-computer-science` },
    { label: "Scholarships & eligibility", href: "/scholarships" },
    { label: "Cheapest countries by proof of funds", href: "/reports/cheapest-student-visa-proof-of-funds" },
  ];

  const faqs = buildVisaFaqs(record);

  // "Key facts at a glance" box (computed, scannable, featured-snippet friendly).
  const d = record.toolDefaults ?? {};
  const cur = d.blockedAccountCurrency ?? "";
  const facts: { label: string; value: string }[] = [];
  if (fundsAmount && fundsCurrency) facts.push({ label: `${dest?.fundsLabel ?? "Proof of funds"} (per year)`, value: `${fundsAmount.toLocaleString("en-US")} ${fundsCurrency}` });
  if (homeFunds) facts.push({ label: "In your home currency", value: `≈ ${homeFunds.value}` });
  if (d.livingCostPerMonth) facts.push({ label: "Living cost (per month)", value: `${d.livingCostPerMonth.toLocaleString("en-US")} ${cur}` });
  if (d.visaFee) facts.push({ label: "Visa fee", value: `${d.visaFee.toLocaleString("en-US")} ${cur}` });
  if (d.processingWeeks) facts.push({ label: "Typical processing", value: `~${d.processingWeeks} weeks` });
  if (d.intakeMonths?.length) facts.push({ label: "Main intakes", value: d.intakeMonths.map((m) => MONTHS[m]).join(", ") });
  facts.push({ label: "Required documents", value: String(required.length) });

  // Visible "How to apply" steps (the required docs in order = the procedure).
  const steps = required.map((r) => ({ title: r.label, detail: r.detail }));

  // Data-driven "how this destination compares" — rank by proof of funds in EUR.
  const { rows: metricRows, fxUpdatedAt } = await destinationMetrics();
  const ranked = metricRows.filter((r) => r.proofEur != null).sort((a, b) => a.proofEur! - b.proofEur!);
  const myIdx = ranked.findIndex((r) => r.code === record.destination);
  const cheapest = ranked[0];
  const priciest = ranked[ranked.length - 1];

  return (
    <article>
      <JsonLd
        data={[
          ...visaPageLd(record, path),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: dest?.name ?? "Destination", path: hubPath },
            { name: record.title, path },
          ]),
        ]}
      />

      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-700">Home</Link> ·{" "}
        <Link href={hubPath} className="hover:text-brand-700">Study in {dest?.name}</Link>
      </nav>

      <div className="mt-3">
        <ArticleHeader kicker="Student visa" title={record.title} summary={record.summary}>
          <SourceCite source={record.source} lastVerified={record.lastVerified} />
          <DataTrustLine verifiedBy={record.verifiedBy} lastVerified={record.lastVerified} verification={record.verification} />
        </ArticleHeader>
      </div>

      {homeFunds && fundsAmount && fundsCurrency && (
        <div className="mt-5 rounded-lg border border-brand-100 bg-brand-50 p-4">
          <div className="text-sm text-slate-600">Proof of funds in your currency</div>
          <div className="mt-1 text-2xl font-bold text-brand-700">≈ {homeFunds.value}</div>
          <div className="mt-1 text-sm text-slate-500">
            The official requirement is {formatMoney(fundsAmount, fundsCurrency)} per year for {dest?.name}.
            That&apos;s roughly {homeFunds.value} for {record.nationality?.toUpperCase()} applicants at
            ECB reference rates ({homeFunds.updatedAt}). Banks add a margin — confirm the exact amount
            in {fundsCurrency} with the official source.
          </div>
        </div>
      )}

      <KeyFacts facts={facts} />

      {myIdx >= 0 && cheapest && priciest && (
        <section className="mt-6 prose-tight">
          <h2 className="text-xl font-semibold text-slate-800">How {dest?.name} compares</h2>
          <p className="mt-2 text-slate-600">
            Among the {ranked.length} study destinations we track, {dest?.name} ranks{" "}
            <strong>#{myIdx + 1} from cheapest</strong> by the proof-of-funds you must show
            (≈ {eur(ranked[myIdx].proofEur)}/year at ECB rates, {fxUpdatedAt}). The lowest is{" "}
            <Link href={`/study/${cheapest.code}`} className="text-brand-600 hover:underline">{cheapest.name}</Link>{" "}
            (≈ {eur(cheapest.proofEur)}) and the highest is{" "}
            <Link href={`/study/${priciest.code}`} className="text-brand-600 hover:underline">{priciest.name}</Link>{" "}
            (≈ {eur(priciest.proofEur)}). See the full{" "}
            <Link href="/reports/cheapest-student-visa-proof-of-funds" className="text-brand-600 hover:underline">cheapest-proof-of-funds ranking</Link>{" "}
            or <Link href="/reports/student-visa-total-cost-by-country" className="text-brand-600 hover:underline">total first-year cost by country</Link>.
          </p>
        </section>
      )}

      <AdSlot id="in-content-1" pageType="leaf" />

      {/* Long-form, unique overview — substantial server-rendered content. */}
      <VisaOverview
        title={`Understanding the ${dest?.name ?? "student"} student visa`}
        sections={buildVisaOverview(record, {
          name: dest?.name ?? record.destination.toUpperCase(),
          adjective: dest?.adjective ?? "",
          fundsLabel: dest?.fundsLabel ?? "proof of funds",
        })}
      />

      {/* Server-rendered requirement text — real content for Google (anti-thin-page). */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800">Required documents</h2>
        <ul className="mt-3 space-y-3">
          {required.map((r) => (
            <RequirementDetail key={r.key} item={r} />
          ))}
        </ul>
      </section>

      {conditional.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800">Sometimes required</h2>
          <ul className="mt-3 space-y-3">
            {conditional.map((r) => (
              <RequirementDetail key={r.key} item={r} />
            ))}
          </ul>
        </section>
      )}

      <HowToApply steps={steps} destinationName={dest?.name ?? "this destination"} />

      <AdSlot id="in-content-2" pageType="leaf" />

      {/* The interactive tools — the AI-resistant, computed value per page. */}
      <div className="mt-10 space-y-8">
        <ChecklistTool record={record} />
        <CostTool record={record} />
        <TimelineTool record={record} />
      </div>

      {record.extraSources && record.extraSources.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-800">Official sources</h2>
          <div className="mt-3 space-y-2">
            {record.extraSources.map((s) => (
              <SourceCite key={s.url} source={s} />
            ))}
          </div>
        </section>
      )}

      <FaqSection faqs={faqs} />

      <RelatedLinks title={`Other student-visa guides for ${dest?.name ?? "this destination"}`} links={related} />
      <RelatedLinks title="Explore more" links={crossLinks} />

      <RelatedSearches keywords={targetKeywords} />

      <p className="mt-8 text-xs text-slate-400">
        Last verified {formatDate(record.lastVerified)} by {record.verifiedBy}. Requirements change —
        always confirm with the official source above before acting.
      </p>
    </article>
  );
}
