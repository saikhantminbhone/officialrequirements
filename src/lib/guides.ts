// ─────────────────────────────────────────────────────────────────────────
// In-depth guide articles. These are the "explain, don't just aggregate"
// content that builds topical authority — the answer to "why rank us instead of
// the embassy page": because we explain, contextualise and warn. Authored,
// evergreen, and grounded; specifics that vary are deferred to official sources.
// ─────────────────────────────────────────────────────────────────────────

import { LONGTAIL_GUIDES } from "./guides-longtail";

export interface GuideSection {
  heading: string;
  body: string[]; // paragraphs
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string; // SEO <title>
  h1: string;
  description: string;
  /** Optional destination this guide is about (for internal linking). */
  destination?: string;
  /** Related affiliate intent, if any. */
  affiliateTag?: "blocked-account" | "money-transfer" | "insurance";
  updated: string; // ISO date
  intro: string;
  sections: GuideSection[];
  faqs: { question: string; answer: string }[];
  keywords: string[];
}

const UPDATED = "2026-06-20";

const CORE_GUIDES: Guide[] = [
  {
    slug: "germany-student-visa-rejection-reasons",
    title: "Germany Student Visa Rejection Reasons (2026) — and How to Avoid Them",
    h1: "Why German student visas get refused — and how to avoid it",
    description:
      "The real reasons German student-visa applications are refused — weak finances, doubts about intent, incomplete files — explained, with how to fix each before you apply.",
    destination: "de",
    affiliateTag: "blocked-account",
    updated: UPDATED,
    intro:
      "Most German student-visa refusals come down to a handful of avoidable problems, not bad luck. Understanding why the consulate says no — and what it's really worried about — lets you build an application that pre-empts every objection. Here is what actually drives refusals and how to neutralise each one.",
    sections: [
      {
        heading: "Insufficient or poorly-evidenced funds",
        body: [
          "The single most common reason. Germany wants certainty you can support yourself, usually via a blocked account funded to the annual minimum. Refusals happen not only when the amount is short, but when the money's source or history looks unconvincing — a large deposit appearing days before the application is a classic red flag.",
          "Fund the account to the full annual figure, keep the balance stable, and be ready to document where the money came from (savings, a sponsor, a loan sanction). If you're sponsored, include the sponsor's relationship proof and their own financial evidence.",
        ],
      },
      {
        heading: "Doubts about your intent to study (and return)",
        body: [
          "Consular officers assess whether study is your genuine purpose. A study plan that doesn't fit your background, an unexplained change of field, or a course that looks like a route to work rather than education invites suspicion.",
          "Address this head-on in your motivation letter: explain why this exact course and university, how it builds on your record, and what you'll do afterwards. Consistency across every document matters more than polish.",
        ],
      },
      {
        heading: "Incomplete or inconsistent documents",
        body: [
          "Missing certified translations, a passport expiring mid-course, name spellings that differ between documents, or an APS certificate that isn't ready yet will stall or sink an application.",
          "Build a checklist from the official source, get translations done early, and verify that every personal detail matches your passport exactly before you book the appointment.",
        ],
      },
      {
        heading: "Language ability that doesn't match the course",
        body: [
          "If your course is taught in German you'll need a recognised certificate (TestDaF, DSH); English-taught programmes need IELTS/TOEFL/PTE at the level the university sets. A mismatch between your proof and the language of instruction is an easy refusal.",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I reapply after a German student visa refusal?",
        answer:
          "Yes. The refusal letter states the reason — fix that specific issue (most often finances or an incomplete file), strengthen the rest, and reapply. In some cases a formal remonstration (appeal) is possible within the stated deadline.",
      },
      {
        question: "What is the most common reason for German student-visa refusal?",
        answer:
          "Under-evidenced finances — either the blocked account isn't funded to the required annual amount, or the source/history of the money isn't convincing.",
      },
    ],
    keywords: [
      "germany student visa rejection reasons",
      "german student visa refused what to do",
      "germany student visa reapply after refusal",
      "germany student visa requirements",
    ],
  },
  {
    slug: "germany-blocked-account-guide",
    title: "Germany Blocked Account Guide (2026) — How It Works & How Much",
    h1: "The German blocked account, explained",
    description:
      "What a German blocked account (Sperrkonto) is, how much you must deposit, which providers German embassies accept, and the exact steps to open and fund one for your student visa.",
    destination: "de",
    affiliateTag: "blocked-account",
    updated: UPDATED,
    intro:
      "A blocked account (Sperrkonto) is how most international students prove they can fund a year of living costs in Germany. The money is yours — it's just 'blocked' so you can only withdraw a set amount each month after you arrive. Here's how it works end to end.",
    sections: [
      {
        heading: "What it is and why it's required",
        body: [
          "The blocked account holds roughly one year of living costs, released to you in equal monthly instalments once you're in Germany. It satisfies the proof-of-funds rule without requiring you to hand money to anyone — you keep it, you just can't spend it all at once.",
          "Confirm the current annual figure and monthly release amount on the official source linked on the Germany pages, as they are revised periodically.",
        ],
      },
      {
        heading: "Which providers embassies accept",
        body: [
          "German missions accept blocked accounts from recognised, BaFin-aware providers. The well-known options bundle the account with the paperwork embassies expect, which is why most applicants use a provider rather than a traditional bank.",
        ],
        bullets: [
          "Choose a provider explicitly accepted by your German mission.",
          "Some bundle health insurance with the blocked account — convenient, but check the cover meets the visa rule.",
          "Keep the opening confirmation and funding receipt for your visa file.",
        ],
      },
      {
        heading: "Steps to open and fund it",
        body: [
          "Open the account online, transfer the annual minimum (use a low-FX transfer method to avoid losing money to bank margins), receive the confirmation, and include it in your application. After arrival, you activate monthly withdrawals once you have a German address and local bank account.",
        ],
      },
    ],
    faqs: [
      {
        question: "How much money goes into a German blocked account?",
        answer:
          "About one year of living costs, released monthly after you arrive. Confirm the exact current annual amount on the official source — it changes periodically.",
      },
      {
        question: "Can I get the blocked-account money back if my visa is refused?",
        answer:
          "Yes — providers refund the balance (minus any fees) if your visa is refused or you cancel. Keep your provider's refund policy on hand.",
      },
    ],
    keywords: [
      "germany blocked account guide",
      "sperrkonto how much 2026",
      "german blocked account providers",
      "germany proof of funds blocked account",
    ],
  },
  {
    slug: "germany-aps-certificate-guide",
    title: "Germany APS Certificate Guide (2026) — Who Needs It & How to Apply",
    h1: "The APS certificate for Germany, explained",
    description:
      "What the APS certificate is, which nationalities need it before a German student visa, how the process works, and how to avoid the timing mistake that delays applications.",
    destination: "de",
    updated: UPDATED,
    intro:
      "The APS (Akademische Prüfstelle) certificate verifies that your prior qualifications are genuine and sufficient. For applicants from certain countries it's mandatory before you can even lodge a German student-visa application — and the most common mistake is starting it too late.",
    sections: [
      {
        heading: "Who needs an APS certificate",
        body: [
          "APS is required for nationals of specific countries (for example India, China, Vietnam and others — the list changes, so confirm yours on the official source). If your nationality is on the list, the visa cannot proceed without the certificate.",
        ],
      },
      {
        heading: "How the process works",
        body: [
          "You submit your academic documents to the APS office serving your country, pay the fee, and — depending on the country — may attend an interview. Once verified, you receive the certificate, which you then include in your university and visa applications.",
        ],
        bullets: [
          "Start as early as possible — verification can take several weeks.",
          "Do not book the visa appointment until the APS certificate is in hand.",
          "Keep digital and certified copies for both the university and the consulate.",
        ],
      },
    ],
    faqs: [
      {
        question: "How long does the APS certificate take?",
        answer:
          "Often several weeks, depending on your country's APS office and whether an interview is required. Treat it as the first step, well ahead of the visa appointment.",
      },
      {
        question: "Do all students need APS for Germany?",
        answer:
          "No — only nationals of the countries on the APS list. Check whether your nationality requires it before applying.",
      },
    ],
    keywords: [
      "germany aps certificate guide",
      "aps certificate germany who needs it",
      "aps germany process time 2026",
      "germany student visa aps requirement",
    ],
  },
  {
    slug: "proof-of-funds-for-student-visa-explained",
    title: "Proof of Funds for a Student Visa (2026) — How It Really Works",
    h1: "Proof of funds, explained for every destination",
    description:
      "What proof of funds means for a student visa, how the amount, source and holding period are judged, and the mistakes that get applications refused — across all major destinations.",
    affiliateTag: "money-transfer",
    updated: UPDATED,
    intro:
      "Proof of funds is the make-or-break part of almost every student-visa application, and it's about far more than a balance. Authorities judge the amount, where the money came from, and how long it has been held. Here's how it actually works and how to get it right anywhere.",
    sections: [
      {
        heading: "Amount: living costs, and sometimes more",
        body: [
          "Countries express the requirement differently — a fixed annual figure, a monthly multiple, a blocked account, or an amount tied to your admission document. Some require tuition and return travel on top of living costs. Always confirm exactly what your destination's figure must cover.",
        ],
      },
      {
        heading: "Source and history matter as much as the amount",
        body: [
          "Many countries require the money to have been held for a set period (often around 28 days) and to be traceable to a legitimate source. Large, unexplained deposits just before applying are a red flag. If you're sponsored, you'll usually need the sponsor's evidence and proof of your relationship.",
        ],
      },
      {
        heading: "How to present it cleanly",
        body: [
          "Build the balance early, keep it stable, and assemble statements covering the required history plus any sponsor letters, scholarship confirmations or loan sanctions. When moving money across borders, use a low-FX method and keep every receipt — a clean money trail is itself part of the evidence.",
        ],
      },
    ],
    faqs: [
      {
        question: "How long must I hold proof-of-funds money before applying?",
        answer:
          "It varies by country — many require the balance to have been held for a set period (commonly around 28 days). Check your destination's exact rule and don't move large sums in just before applying.",
      },
      {
        question: "Does proof of funds include tuition?",
        answer:
          "Sometimes. Some countries require tuition and return travel on top of the living-cost figure; others count only living costs. Confirm what your destination's figure must cover.",
      },
    ],
    keywords: [
      "proof of funds for student visa",
      "how much bank balance for student visa",
      "student visa proof of funds explained",
      "student visa funds holding period",
    ],
  },
  {
    slug: "document-translation-and-apostille-for-student-visas",
    title: "Document Translation & Apostille for Student Visas (2026)",
    h1: "Certified translation and apostille, explained",
    description:
      "When student-visa and admission documents need certified translation or an apostille/legalisation, who can do it, and how to avoid the delays that catch applicants out.",
    updated: UPDATED,
    intro:
      "Transcripts, certificates and police records often need certified translation and sometimes an apostille or legalisation before a university or consulate will accept them. Getting this wrong — or leaving it late — is a quiet but common cause of delays. Here's what you actually need.",
    sections: [
      {
        heading: "Certified translation vs. apostille",
        body: [
          "A certified translation is an accurate translation by an accepted translator, with a statement of accuracy. An apostille (or legalisation, for non-Hague-Convention countries) is an official stamp that authenticates the original document for use abroad. Many applications need both, on different documents.",
        ],
      },
      {
        heading: "What usually needs each",
        body: ["Requirements vary by destination, but commonly:"],
        bullets: [
          "Academic transcripts and degree certificates: certified translation, sometimes credential evaluation.",
          "Police/criminal-record certificates: often apostille/legalisation plus translation.",
          "Birth/marriage certificates (for dependants): often apostille plus translation.",
        ],
      },
      {
        heading: "Avoid the timing trap",
        body: [
          "Apostille and legalisation are issued by government authorities and can take weeks, and translators add time. Order certified copies in multiples (each application needs originals), and start the moment you have your documents — not when the deadline looms.",
        ],
      },
    ],
    faqs: [
      {
        question: "Do I always need an apostille for student-visa documents?",
        answer:
          "No — it depends on the destination and the document. Some accept certified translations alone; others require apostille/legalisation on certain documents. Check each destination's rule.",
      },
      {
        question: "Who can do a certified translation?",
        answer:
          "A translator or agency accepted by the destination authority or university — not just any translator. Confirm the accepted standard before paying.",
      },
    ],
    keywords: [
      "document translation for student visa",
      "apostille for student visa documents",
      "certified translation transcripts study abroad",
      "student visa document legalisation",
    ],
  },
];

// Long-tail batch (kept in its own module so authored content scales without
// bloating this file). New-domain strategy: guides earn rankings first.
export const GUIDES: Guide[] = [...CORE_GUIDES, ...LONGTAIL_GUIDES];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function guidesForDestination(code: string): Guide[] {
  return GUIDES.filter((g) => g.destination === code);
}
