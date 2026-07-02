import type { RequirementRecord, ScholarshipRecord } from "@/lib/req-data/types";
import { getDestinationMeta } from "@/lib/req-data";

// Friendly destination name for FAQ phrasing ("the UK" → "UK" so "a UK student visa" reads right).
function getDestinationMetaName(code: string): string {
  const n = getDestinationMeta(code)?.name ?? code.toUpperCase();
  return n.startsWith("the ") ? n.slice(4) : n;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

const ORG_ID = `${SITE}/#organization`;
const SITE_ID = `${SITE}/#website`;

// Author/reviewer for E-E-A-T. A named, credentialed human author is the
// strongest signal for YMYL — set AUTHOR_NAME / AUTHOR_URL / AUTHOR_BIO in env
// to use a real person; otherwise we fall back to the editorial-team org. This
// keeps the name out of the codebase while letting the operator restore it.
export const AUTHOR_NAME = process.env.AUTHOR_NAME || "";
export const AUTHOR_URL = process.env.AUTHOR_URL || SITE;
export const AUTHOR_BIO =
  process.env.AUTHOR_BIO ||
  "Compiles study-abroad requirements from primary official government and university sources, with human verification before publish.";
export const hasNamedAuthor = Boolean(AUTHOR_NAME);

const AUTHOR = hasNamedAuthor
  ? { "@type": "Person", name: AUTHOR_NAME, url: AUTHOR_URL, description: AUTHOR_BIO }
  : { "@type": "Organization", name: "OfficialRequirements Editorial Team", url: SITE, description: AUTHOR_BIO };

/** The Person/Organization author node, for pages that build their own Article LD (e.g. guides). */
export function authorLd() {
  return AUTHOR;
}

// ── Global, site-wide structured data (rendered once in the root layout) ──
// Organization + WebSite + DataCatalog, with publishingPrinciples and a
// correctionsPolicy — the E-E-A-T + GEO signals OfficialSalary ships globally.
export function globalLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": ORG_ID,
      name: "OfficialRequirements",
      url: SITE,
      description:
        "Independent, sourced, freshness-tracked study-abroad requirements (student visa, scholarship, university admission).",
      publishingPrinciples: `${SITE}/editorial-policy`,
      correctionsPolicy: `${SITE}/editorial-policy`,
      knowsAbout: ["student visa requirements", "scholarship eligibility", "university admission requirements", "study abroad"],
      slogan: "Not a government site. Sourced, dated, and honest.",
      ...(hasNamedAuthor ? { founder: AUTHOR } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": SITE_ID,
      name: "OfficialRequirements",
      url: SITE,
      publisher: { "@id": ORG_ID },
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE}/scholarships?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "DataCatalog",
      name: "OfficialRequirements requirements dataset",
      url: SITE,
      publisher: { "@id": ORG_ID },
      description:
        "Structured, primary-sourced, date-verified records of student-visa, scholarship, and admission requirements by nationality and destination.",
      isAccessibleForFree: true,
    },
  ];
}

/** Speakable selectors — lets voice/AI surfaces read the key answer aloud. */
export function speakableLd(cssSelectors: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: { "@type": "SpeakableSpecification", cssSelector: cssSelectors },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

// Shared FAQ builder — the SAME Q&As are rendered visibly on the page AND
// emitted as FAQPage schema, so the structured data matches visible content
// (Google's requirement) and targets "People Also Ask" + FAQ rich results.
export interface Faq {
  question: string;
  answer: string;
}

/** Reusable FAQPage JSON-LD from a Faq[] (so visible FAQ + schema stay in sync). */
export function faqPageLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function buildVisaFaqs(record: RequirementRecord): Faq[] {
  const destName = getDestinationMetaName(record.destination);
  const d = record.toolDefaults;
  const faqs: Faq[] = [];

  if (d?.blockedAccountAmount && d.blockedAccountCurrency) {
    faqs.push({
      question: `How much proof of funds do I need for a ${destName} student visa?`,
      answer: `You need to show about ${d.blockedAccountAmount.toLocaleString("en-US")} ${d.blockedAccountCurrency} for the year. This is the official ${destName} figure; banks add a margin, so confirm the exact amount with the source linked on this page.`,
    });
  } else {
    faqs.push({
      question: `How much money do I need for a ${destName} student visa?`,
      answer: `${destName} has no single fixed figure — you must show enough to cover the tuition and living costs stated on your admission document. Check the official source on this page.`,
    });
  }

  if (d?.processingWeeks) {
    faqs.push({
      question: `How long does a ${destName} student visa take to process?`,
      answer: `Typically around ${d.processingWeeks} weeks once you've submitted a complete application, though embassy appointment availability is often the real bottleneck. Apply as early as you can.`,
    });
  }

  const requiredLabels = record.requirements.filter((r) => r.required).map((r) => r.label);
  faqs.push({
    question: `What documents do I need for a ${destName} student visa?`,
    answer: `The core documents are: ${requiredLabels.slice(0, 8).join(", ")}. Each is explained in full on this page with how to obtain it and common mistakes to avoid.`,
  });

  const insurance = record.requirements.find((r) => r.key.includes("insurance") || r.key === "oshc" || r.key === "ihs");
  if (insurance) {
    faqs.push({ question: `Do I need health insurance for a ${destName} student visa?`, answer: insurance.detail });
  }

  if (record.destination === "de") {
    const aps = record.requirements.find((r) => r.key === "aps-certificate");
    if (aps?.required) {
      faqs.push({ question: "Do I need an APS certificate for the German student visa?", answer: aps.detail });
    }
  }

  if (d?.visaFee) {
    faqs.push({
      question: `How much is the ${destName} student visa fee?`,
      answer: `The visa/permit fee is around ${d.visaFee.toLocaleString("en-US")} ${d.blockedAccountCurrency ?? ""}. Other costs (insurance, proof of funds, tests) are separate — use the cost calculator on this page.`,
    });
  }

  // When to apply — universally useful and honest (no hard date claims).
  faqs.push({
    question: `When should I apply for a ${destName} student visa?`,
    answer: `Start as early as your documents allow — typically as soon as you have your admission confirmation and can show the required funds. ${d?.processingWeeks ? `Processing takes roughly ${d.processingWeeks} weeks once submitted, but ` : "Processing time varies, and "}appointment availability is often the real bottleneck in peak season, so book the earliest slot you can.`,
  });

  // Working while studying — framed honestly because caps vary and change.
  faqs.push({
    question: `Can I work on a ${destName} student visa?`,
    answer: `Most student destinations allow a limited number of working hours during term and more during official holidays, but the exact cap (and whether it applies to your visa) changes periodically. Confirm the current ${destName} work allowance on the official source linked on this page before relying on any income.`,
  });

  // What if refused — reduces anxiety, adds genuine help.
  faqs.push({
    question: `What happens if my ${destName} student visa is refused?`,
    answer: `A refusal letter states the reason — most often under-evidenced finances, an incomplete document set, or doubts about your intent to study. You can usually correct the issue and reapply, and in some countries appeal. Read the stated reason carefully, fix that specific point, and strengthen the rest of the file before trying again.`,
  });

  return faqs;
}

export function visaPageLd(record: RequirementRecord, path: string) {
  const faqs = buildVisaFaqs(record).map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  }));

  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: record.title,
      description: record.summary,
      author: AUTHOR,
      publisher: { "@id": ORG_ID },
      dateModified: record.lastVerified,
      datePublished: record.lastVerified,
      mainEntityOfPage: `${SITE}${path}`,
      isAccessibleForFree: true,
    },
    {
      // Dataset schema — the requirement set is structured, sourced data. This
      // is the type AI engines and Google's dataset surfaces cite.
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: record.title,
      description: record.summary,
      url: `${SITE}${path}`,
      dateModified: record.lastVerified,
      isAccessibleForFree: true,
      creator: { "@id": ORG_ID },
      citation: [record.source, ...(record.extraSources ?? [])].map((s) => ({
        "@type": "CreativeWork",
        name: s.name,
        url: s.url,
      })),
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: record.title,
      step: record.requirements
        .filter((r) => r.required)
        .map((r, i) => ({ "@type": "HowToStep", position: i + 1, name: r.label, text: r.detail })),
    },
    speakableLd(["h1", "[data-speakable]"]),
  ];
}

export function buildUniversityFaqs(record: RequirementRecord): Faq[] {
  const destName = getDestinationMetaName(record.destination);
  const program = record.program?.name ?? "this program";
  const faqs: Faq[] = [];

  const lang = record.requirements.find((r) => r.key === "english-proficiency");
  faqs.push({
    question: `What English score do I need for a ${program} in ${destName}?`,
    answer: lang?.detail ?? "Requirements vary by university — check the specific program page.",
  });

  const grade = record.requirements.find((r) => r.key === "minimum-grade" || r.key === "prior-qualification");
  if (grade) faqs.push({ question: `What grades do I need for a ${program} in ${destName}?`, answer: grade.detail });

  const test = record.requirements.find((r) => r.key === "gre" || r.key === "gmat");
  if (test) faqs.push({ question: `Do I need the ${test.key.toUpperCase()} for a ${program} in ${destName}?`, answer: test.detail });

  const required = record.requirements.filter((r) => r.required).map((r) => r.label);
  faqs.push({
    question: `What documents do I need to apply for a ${program} in ${destName}?`,
    answer: `You'll typically need: ${required.slice(0, 8).join(", ")}. Each is explained in full on this page.`,
  });

  if (record.requirements.some((r) => r.key === "work-experience")) {
    faqs.push({ question: `How much work experience do I need for an MBA in ${destName}?`, answer: "Most MBA programs expect two or more years of relevant full-time work experience." });
  }
  return faqs;
}

export function buildScholarshipFaqs(record: ScholarshipRecord): Faq[] {
  const faqs: Faq[] = [];
  faqs.push({
    question: `Who is eligible for the ${record.name}?`,
    answer: `${record.summary} Use the eligibility checker on this page for a personalized read.`,
  });
  if (record.benefits.length) {
    faqs.push({ question: `What does the ${record.name} cover?`, answer: `It typically covers: ${record.benefits.join("; ")}.` });
  }
  if (record.deadlines.length) {
    faqs.push({ question: `What is the deadline for the ${record.name}?`, answer: record.deadlines.map((d) => `${d.intake}: ${d.date}`).join("; ") + ". Always confirm the exact date on the official source." });
  }
  const hard = record.eligibility.filter((e) => !e.soft).slice(0, 3);
  if (hard.length) {
    faqs.push({ question: `What are the main requirements for the ${record.name}?`, answer: hard.map((e) => e.failMessage).join(" ") });
  }
  return faqs;
}

export function universityPageLd(record: RequirementRecord, path: string) {
  const faqs = buildUniversityFaqs(record).map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  }));
  return [
    {
      "@context": "https://schema.org",
      "@type": "EducationalOccupationalProgram",
      name: record.program?.name ?? record.title,
      description: record.summary,
      educationalProgramMode: "full-time",
      programType: record.program?.level ?? "degree",
      provider: { "@id": ORG_ID },
      url: `${SITE}${path}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: record.title,
      description: record.summary,
      author: AUTHOR,
      publisher: { "@id": ORG_ID },
      dateModified: record.lastVerified,
      mainEntityOfPage: `${SITE}${path}`,
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs },
    speakableLd(["h1", "[data-speakable]"]),
  ];
}

export function scholarshipPageLd(record: ScholarshipRecord, path: string) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${record.name} — eligibility & requirements`,
      description: record.summary,
      author: AUTHOR,
      publisher: { "@id": ORG_ID },
      dateModified: record.lastVerified,
      mainEntityOfPage: `${SITE}${path}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: buildScholarshipFaqs(record).map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
    speakableLd(["h1", "[data-speakable]"]),
  ];
}

