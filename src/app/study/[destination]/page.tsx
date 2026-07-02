import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getVisaRecords, getScholarships, getDestinationMeta, getAllDestinations } from "@/lib/req-data";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import KeyFacts from "@/components/KeyFacts";
import FaqSection from "@/components/FaqSection";
import VisaOverview from "@/components/VisaOverview";
import DistinctiveNote from "@/components/DistinctiveNote";
import RelatedSearches from "@/components/RelatedSearches";
import SubscribeAlert from "@/components/SubscribeAlert";
import SmartLinks from "@/components/SmartLinks";
import { universitiesForDestination } from "@/lib/universities";
import { buildVisaOverview } from "@/lib/destination-overview";
import { hubSeoTitle, hubSeoDescription, hubTargetKeywords } from "@/lib/keywords";
import { breadcrumbLd, buildVisaFaqs, faqPageLd } from "@/lib/seo";
import { robotsFor } from "@/lib/page-policy";

export const dynamic = "force-static";
export const dynamicParams = false;

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Params = { destination: string };

export async function generateStaticParams(): Promise<Params[]> {
  return getAllDestinations().map((d) => ({ destination: d.code }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { destination } = await params;
  const dest = getDestinationMeta(destination);
  if (!dest) return {};
  return {
    title: { absolute: hubSeoTitle(dest.name) },
    description: hubSeoDescription(dest.name, dest.fundsLabel),
    keywords: hubTargetKeywords(dest.name),
    alternates: { canonical: `/study/${destination}` },
    robots: robotsFor({ index: true, reason: "ok" }),
    openGraph: {
      title: hubSeoTitle(dest.name),
      description: hubSeoDescription(dest.name, dest.fundsLabel),
      // Without an explicit url, og:url falls back to metadataBase (the homepage).
      url: `/study/${destination}`,
      images: [`/api/og?title=${encodeURIComponent(`Study in ${dest.name}`)}&tag=${encodeURIComponent("Destination guide")}`],
    },
  };
}

function capitalize(s: string): string {
  if (s.startsWith("the ")) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function DestinationHub({ params }: { params: Promise<Params> }) {
  const { destination } = await params;
  const dest = getDestinationMeta(destination);
  if (!dest) notFound();

  const [visa, scholarships] = await Promise.all([getVisaRecords(), getScholarships()]);
  const forDest = visa.filter((r) => r.destination === destination);
  const relevantScholarships = scholarships.filter(
    (s) => s.destination === destination || s.destination === "multiple"
  );

  // Destination-level key facts + FAQ from a representative record.
  const rep = forDest[0];
  const d = rep?.toolDefaults ?? {};
  const cur = d.blockedAccountCurrency ?? "";
  const facts: { label: string; value: string }[] = [];
  if (d.blockedAccountAmount) facts.push({ label: `${dest.fundsLabel} (per year)`, value: `${d.blockedAccountAmount.toLocaleString("en-US")} ${cur}` });
  if (d.livingCostPerMonth) facts.push({ label: "Living cost (per month)", value: `${d.livingCostPerMonth.toLocaleString("en-US")} ${cur}` });
  if (d.visaFee) facts.push({ label: "Visa fee", value: `${d.visaFee.toLocaleString("en-US")} ${cur}` });
  if (d.processingWeeks) facts.push({ label: "Typical processing", value: `~${d.processingWeeks} weeks` });
  if (d.intakeMonths?.length) facts.push({ label: "Main intakes", value: d.intakeMonths.map((m) => MONTHS[m]).join(", ") });
  facts.push({ label: "Nationalities covered", value: String(forDest.length) });
  const faqs = rep ? buildVisaFaqs(rep) : [];

  return (
    <div>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: `Study in ${dest.name}`, path: `/study/${destination}` },
          ]),
          ...(faqs.length ? [faqPageLd(faqs)] : []),
        ]}
      />

      <span className="section-kicker">Destination guide</span>
      <h1 className="mt-2 text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-[2.6rem] sm:leading-[1.1]">Study in {capitalize(dest.name)}</h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600" data-speakable>
        Student-visa requirements for {capitalize(dest.name)} by nationality, the {dest.fundsLabel},
        funding routes, and a working timeline — sourced from official {dest.adjective} government
        pages and date-verified.
      </p>

      <KeyFacts facts={facts} />

      {rep && (
        <VisaOverview
          title={`Understanding the ${dest.name} student visa`}
          sections={buildVisaOverview(
            { ...rep, nationality: undefined },
            { name: dest.name, adjective: dest.adjective, fundsLabel: dest.fundsLabel }
          )}
        />
      )}

      <DistinctiveNote code={destination} name={dest.name} />

      <AdSlot id="in-content-1" pageType="hub" />

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-800">Student visa by nationality</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {forDest.map((r) => (
            <Link
              key={r.id}
              href={`/${r.nationality}/${r.destination}/student-visa`}
              className="rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div className="font-medium text-slate-800">{r.title}</div>
              <div className="mt-1 text-sm text-slate-500">Verified {r.lastVerified}</div>
            </Link>
          ))}
        </div>
      </section>

      {relevantScholarships.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-800">Funding & scholarships</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relevantScholarships.map((s) => (
              <Link
                key={s.id}
                href={`/scholarships/${s.slug}`}
                className="rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/40"
              >
                <div className="font-medium text-slate-800">{s.name}</div>
                <div className="mt-1 text-sm text-slate-500">{s.provider}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-800">Plan it</h2>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/tools/cost" className="rounded-md border border-brand-200 px-4 py-2 text-brand-700 hover:bg-brand-50">Cost calculator</Link>
          <Link href="/tools/timeline" className="rounded-md border border-brand-200 px-4 py-2 text-brand-700 hover:bg-brand-50">Timeline planner</Link>
          <Link href="/tools/checklist" className="rounded-md border border-brand-200 px-4 py-2 text-brand-700 hover:bg-brand-50">Document checklist</Link>
        </div>
      </section>

      {universitiesForDestination(destination).length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-800">Universities in {capitalize(dest.name)}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {universitiesForDestination(destination).map((u) => (
              <Link key={u.slug} href={`/universities/${u.slug}`} className="card-link">
                <div className="font-medium text-slate-900">{u.name}</div>
                <div className="mt-1 text-sm text-slate-500">{u.city} · admission requirements</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <FaqSection faqs={faqs} />

      <SmartLinks pathFilter={`/${destination}/`} title={`Trending ${dest.name} searches`} max={6} />

      <div className="mt-10">
        <SubscribeAlert destination={destination} destinationName={dest.name} />
      </div>

      <RelatedSearches keywords={hubTargetKeywords(dest.name)} />
    </div>
  );
}
