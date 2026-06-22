import Link from "next/link";
import type { Metadata } from "next";
import { getVisaRecords, getScholarships, getAllDestinations, getNationalities, getDestinationMeta } from "@/lib/req-data";
import { destinationMetrics, eur } from "@/lib/reports";
import FaqSection from "@/components/FaqSection";
import JsonLd from "@/components/JsonLd";
import { faqPageLd } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  description:
    "Sourced, dated, and freshness-tracked study-abroad requirements — student visas, scholarships and university admission — with free checkers, document checklists and cost calculators. Every figure links to its official source.",
};

function capitalize(s: string): string {
  if (s.startsWith("the ")) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const HOME_FAQS = [
  {
    question: "Is OfficialRequirements an official government website?",
    answer:
      "No. We are an independent reference that compiles study-abroad requirements from primary official sources and links every figure back to the government or university page it came from. Always confirm the final detail on the official source before you act.",
  },
  {
    question: "How current is the information?",
    answer:
      "Every record carries a 'last verified' date and a source link, and a freshness pipeline re-checks figures and flags anything that may have changed. You always see when a page was last checked, so you can judge how much to trust it.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Yes. All requirement pages, checklists, the eligibility checker, the cost calculator and the timeline planner are free. We may earn a commission from some clearly-disclosed affiliate links, which never changes what we list.",
  },
  {
    question: "What does it cover?",
    answer:
      "Three things: student-visa requirements by nationality and destination, university admission requirements by program and country, and scholarship eligibility — each with the documents you need and how to obtain them.",
  },
];

export default async function HomePage() {
  const [visa, scholarships] = await Promise.all([getVisaRecords(), getScholarships()]);
  const destinations = getAllDestinations();
  const nationalityCount = getNationalities().length;

  // Real, computed proof-of-funds ranking — gives the home page genuine data,
  // not just navigation. Cheapest first.
  const { rows } = await destinationMetrics();
  const ranked = rows.filter((r) => r.proofEur != null).sort((a, b) => a.proofEur! - b.proofEur!);
  const cheapest = ranked.slice(0, 6);

  const facts = [
    { label: "Student-visa guides", value: visa.length.toLocaleString("en-US") },
    { label: "Study destinations", value: String(destinations.length) },
    { label: "Nationalities covered", value: String(nationalityCount) },
    { label: "Scholarships tracked", value: String(scholarships.length) },
  ];

  // A real, sourced record powers the hero preview card (not a mockup).
  const sample = visa.find((r) => r.destination === "de" && r.toolDefaults?.blockedAccountAmount) ?? visa[0];
  const sd = sample?.toolDefaults ?? {};
  const sampleMeta = sample ? getDestinationMeta(sample.destination) : undefined;
  const money = (v?: number, cur?: string) => (v ? `${v.toLocaleString("en-US")} ${cur ?? ""}`.trim() : "—");
  const previewRows = sample
    ? [
        { k: sampleMeta?.fundsLabel ?? "Proof of funds", v: money(sd.blockedAccountAmount, sd.blockedAccountCurrency) + (sd.blockedAccountAmount ? "/yr" : "") },
        { k: "Living cost", v: sd.livingCostPerMonth ? `${money(sd.livingCostPerMonth, sd.blockedAccountCurrency)}/mo` : "—" },
        { k: "Visa fee", v: money(sd.visaFee, sd.blockedAccountCurrency) },
        { k: "Processing", v: sd.processingWeeks ? `~${sd.processingWeeks} weeks` : "—" },
      ]
    : [];

  return (
    <>
      <JsonLd data={[faqPageLd(HOME_FAQS)]} />
      <div className="space-y-16">

      {/* ── Hero (dark premium, full-bleed, two-column) ──────────────────── */}
      <section className="full-bleed surface-ink relative -mt-10 overflow-hidden bg-ink-radial">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <span className="eyebrow-onink">Visa · Scholarship · Admission</span>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.06] tracking-tighter2 text-white sm:text-[3.1rem]">
              Study-abroad requirements you can{" "}
              <span className="bg-gradient-to-r from-brand-300 to-brand-400 bg-clip-text text-transparent">
                actually trust
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              Sourced, dated and freshness-tracked requirements for student visas, scholarships and
              university admission — with free checkers, checklists and cost calculators. Every claim
              links to its official source.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tools/eligibility" className="btn-onink">
                Check scholarship eligibility
              </Link>
              <Link href="/study/de" className="btn-ghost-onink">
                Browse destinations
              </Link>
            </div>
          </div>

          {/* Live preview card — real figures from a published record. */}
          {sample && (
            <div className="rounded-2xl border border-white/10 bg-ink-800 p-5 shadow-xl shadow-black/20 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Live example</div>
                  <div className="mt-0.5 text-base font-semibold text-white">
                    {sampleMeta?.name ?? sample.destination.toUpperCase()} · Student visa
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Verified
                </span>
              </div>
              <dl className="mt-5 space-y-0">
                {previewRows.map((r) => (
                  <div key={r.k} className="flex items-baseline justify-between gap-4 border-b border-white/[0.07] py-2.5 last:border-0">
                    <dt className="text-sm text-slate-400">{r.k}</dt>
                    <dd className="text-sm font-semibold text-white">{r.v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>Source: {sample.source?.name ?? "official"}</span>
                <span>Verified {sample.lastVerified}</span>
              </div>
              <Link
                href={`/${sample.nationality}/${sample.destination}/student-visa`}
                className="mt-4 inline-flex text-sm font-semibold text-brand-300 hover:text-white"
              >
                See the full requirements →
              </Link>
            </div>
          )}
        </div>

          <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">{f.label}</dt>
                <dd className="mt-1.5 text-3xl font-semibold tracking-tight text-white">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="section-title">How OfficialRequirements works</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          Three steps from &ldquo;where do I even start&rdquo; to a complete, verified application plan.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "1",
              t: "Find your exact requirements",
              d: "Pick your nationality and destination. We assemble the precise document set, funds figure, insurance rule and timeline for your case — not a generic checklist.",
            },
            {
              n: "2",
              t: "Understand every item",
              d: "Each requirement is explained in full: what it is, why it's asked for, how to obtain it, and the mistakes that cause refusals. No jargon, no guessing.",
            },
            {
              n: "3",
              t: "Plan with free tools",
              d: "Use the eligibility checker, cost calculator and timeline planner to turn the requirements into a dated, costed action plan you can actually follow.",
            },
          ].map((s) => (
            <div key={s.n} className="card p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{s.t}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Destination hubs ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Study-destination hubs</h2>
            <p className="mt-2 text-slate-600">Visa requirements by nationality, funds, scholarships and costs for each country.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map(({ code, meta }) => (
            <Link key={code} href={`/study/${code}`} className="card-link">
              <div className="font-semibold text-slate-900">Study in {capitalize(meta.name)}</div>
              <div className="mt-1 text-sm text-slate-500">Visa by nationality · {meta.fundsLabel}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Live data band — cheapest proof of funds ─────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        <span className="section-kicker">From our data</span>
        <h2 className="mt-2 section-title">Cheapest countries by proof of funds</h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          The money you must show is the make-or-break number of any student visa. Here are the lowest, computed
          from official figures and converted to a common currency at ECB reference rates.
        </p>
        <ol className="mt-5 divide-y divide-slate-100">
          {cheapest.map((r, i) => (
            <li key={r.code} className="flex items-center justify-between gap-4 py-2.5">
              <span className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {i + 1}
                </span>
                <Link href={`/study/${r.code}`} className="font-medium text-slate-800 hover:text-brand-700">
                  {capitalize(r.name)}
                </Link>
              </span>
              <span className="text-sm font-semibold text-slate-900">≈ {eur(r.proofEur)}/yr</span>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <Link href="/reports/cheapest-student-visa-proof-of-funds" className="btn-secondary">Full ranking →</Link>
          <Link href="/reports/student-visa-total-cost-by-country" className="btn-secondary">Total cost by country →</Link>
        </div>
      </section>

      {/* ── Verticals: admission + scholarships ──────────────────────────── */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900">University admission requirements</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Bachelor&apos;s, Master&apos;s, MBA and PhD entry requirements by country — GPA and grade thresholds,
            English scores, GRE/GMAT, transcripts, references and the full document checklist for each program type.
          </p>
          <Link href="/university" className="btn-secondary mt-4">Browse admission requirements →</Link>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900">Scholarship eligibility</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Check whether you qualify for major scholarships before you spend hours applying — with a free,
            instant eligibility checker and a clear breakdown of what each award covers and its deadlines.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {scholarships.slice(0, 4).map((s) => (
              <Link key={s.id} href={`/scholarships/${s.slug}`} className="text-sm font-medium text-brand-700 hover:underline">
                {s.name} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust ────────────────────────────────────────────────────────── */}
      <section className="surface-ink overflow-hidden rounded-3xl bg-ink-radial p-8 sm:p-12">
        <span className="eyebrow-onink">Why trust this</span>
        <h2 className="mt-3 text-2xl font-semibold tracking-tighter2 text-white sm:text-[28px]">
          Why you can trust these numbers
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {[
            { i: "①", t: "Primary sources only", d: "Every figure traces to an official government or university page — linked on the page, never paraphrased from a forum or another blog." },
            { i: "②", t: "Dated & freshness-tracked", d: "Each record shows when it was last verified, and an automated pipeline re-checks figures and flags drift before it misleads anyone." },
            { i: "③", t: "Honest about certainty", d: "We label whether a figure is machine-compiled, corroborated by multiple sources, or human-verified — so you know how much weight it carries." },
          ].map((c) => (
            <div key={c.t}>
              <div className="text-xl text-brand-300">{c.i}</div>
              <h3 className="mt-2 font-semibold text-white">{c.t}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-400">{c.d}</p>
            </div>
          ))}
        </div>
        <Link href="/methodology" className="mt-9 inline-flex text-sm font-semibold text-brand-300 hover:text-white">
          Read our full methodology →
        </Link>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <FaqSection faqs={HOME_FAQS} heading="Common questions" />
      </div>
    </>
  );
}
