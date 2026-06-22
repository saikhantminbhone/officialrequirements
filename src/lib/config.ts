import type { AffiliateTag } from "@/lib/req-data/types";

// ─────────────────────────────────────────────────────────────────────────
// Runtime ad + affiliate config. Lives at config/runtime.json in R2 and is
// fetched at load by <AdSlot/> and <AffiliateBlock/>. The admin edits it and
// changes take effect within ~60s WITHOUT a rebuild (the OfficialSalary trick).
// ─────────────────────────────────────────────────────────────────────────

export type AdNetwork = "adsense" | "journey" | "raptive" | "none";

export interface AdSlotConfig {
  id: string; // "in-content-1", "sticky-rail", "mobile-anchor"
  enabled: boolean;
  network: AdNetwork;
  /** Page types where this slot may render. Tools are never included. */
  pageTypes: PageType[];
}

export type PageType = "leaf" | "hub" | "tool" | "trust" | "home";

export interface AffiliateOffer {
  id: string;
  tag: AffiliateTag;
  brand: string;
  headline: string;
  description: string;
  ctaLabel: string;
  url: string; // affiliate link
  disclosure: string;
  enabled: boolean;
  /** Sort weight — admin reorders by EPC. Lower = higher. */
  order: number;
  /** Optional A/B variant label. */
  variant?: string;
}

export interface LeadGenConfig {
  enabled: boolean;
  headline: string;
  description: string;
  ctaLabel: string;
  formUrl: string;
}

export interface RuntimeConfig {
  network: AdNetwork; // global default network
  adsenseClientId?: string;
  adSlots: AdSlotConfig[];
  affiliates: AffiliateOffer[];
  leadGen: LeadGenConfig;
  updatedAt: string;
}

export const RUNTIME_CONFIG_KEY = "config/runtime.json";

// Sensible defaults so the site works before the admin touches anything.
export const defaultRuntimeConfig: RuntimeConfig = {
  network: "adsense",
  adsenseClientId: "",
  adSlots: [
    { id: "in-content-1", enabled: true, network: "adsense", pageTypes: ["leaf", "hub"] },
    { id: "in-content-2", enabled: true, network: "adsense", pageTypes: ["leaf"] },
    { id: "sticky-rail", enabled: true, network: "adsense", pageTypes: ["leaf"] },
    { id: "mobile-anchor", enabled: true, network: "adsense", pageTypes: ["leaf", "hub"] },
  ],
  affiliates: [
    {
      id: "off-blocked-fintiba",
      tag: "blocked-account",
      brand: "Fintiba",
      headline: "Open your German blocked account",
      description: "Most German student-visa applicants open a blocked account to prove funds. Fintiba is BaFin-regulated and accepted by German embassies.",
      ctaLabel: "Open a blocked account",
      url: "https://example.com/aff/fintiba",
      disclosure: "We may earn a commission if you sign up — at no extra cost to you. This does not affect what we list.",
      enabled: true,
      order: 1,
    },
    {
      id: "off-blocked-expatrio",
      tag: "blocked-account",
      brand: "Expatrio",
      headline: "Blocked account + insurance bundle",
      description: "Expatrio bundles a blocked account with health insurance — convenient for German student-visa proof of funds.",
      ctaLabel: "See Expatrio bundle",
      url: "https://example.com/aff/expatrio",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 2,
    },
    {
      id: "off-insurance-safetywing",
      tag: "insurance",
      brand: "SafetyWing",
      headline: "Student & travel health insurance",
      description: "Health insurance valid in Germany covering the gap before statutory enrolment — required for the visa.",
      ctaLabel: "Get a quote",
      url: "https://example.com/aff/safetywing",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 1,
    },
    {
      id: "off-english-duolingo",
      tag: "english-test",
      brand: "Duolingo English Test",
      headline: "Take the Duolingo English Test",
      description: "Cheaper and faster than IELTS, accepted by many German universities. Check your programme accepts it first.",
      ctaLabel: "Book the test",
      url: "https://example.com/aff/duolingo",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 1,
    },
    {
      id: "off-transfer-wise",
      tag: "money-transfer",
      brand: "Wise",
      headline: "Transfer tuition & funds with low FX fees",
      description: "Send proof-of-funds or tuition to Germany at the real exchange rate instead of losing money to bank markups.",
      ctaLabel: "Send money with Wise",
      url: "https://example.com/aff/wise",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 1,
    },
    {
      id: "off-esim-airalo",
      tag: "esim",
      brand: "Airalo",
      headline: "Get an eSIM before you land",
      description: "A working number and data the moment you arrive — useful for Anmeldung and opening a local bank account.",
      ctaLabel: "Browse eSIMs",
      url: "https://example.com/aff/airalo",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 1,
    },
    {
      id: "off-housing-housinganywhere",
      tag: "accommodation",
      brand: "HousingAnywhere",
      headline: "Find student accommodation",
      description: "Book mid-term student housing before arrival — consulates often ask for proof of accommodation.",
      ctaLabel: "Search housing",
      url: "https://example.com/aff/housinganywhere",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 1,
    },
    {
      id: "off-housing-uniplaces",
      tag: "accommodation",
      brand: "Uniplaces",
      headline: "Verified student housing",
      description: "Book verified student rooms and studios in major European study cities before you arrive.",
      ctaLabel: "Browse Uniplaces",
      url: "https://example.com/aff/uniplaces",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 2,
    },
    {
      id: "off-insurance-cigna",
      tag: "insurance",
      brand: "Cigna Global",
      headline: "International student health insurance",
      description: "Flexible international health cover accepted for many student-visa applications.",
      ctaLabel: "Get a Cigna quote",
      url: "https://example.com/aff/cigna",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 2,
    },
    {
      id: "off-insurance-drwalter",
      tag: "insurance",
      brand: "DR-WALTER",
      headline: "Visa-compliant student insurance",
      description: "EDUCARE24 and other plans designed to meet German/EU student-visa insurance rules.",
      ctaLabel: "See DR-WALTER plans",
      url: "https://example.com/aff/dr-walter",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 3,
    },
    {
      id: "off-english-ielts",
      tag: "english-test",
      brand: "IELTS",
      headline: "Book your IELTS test",
      description: "The most widely accepted English test for student visas and university admission.",
      ctaLabel: "Book IELTS",
      url: "https://example.com/aff/ielts",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 2,
    },
    {
      id: "off-english-pte",
      tag: "english-test",
      brand: "PTE Academic",
      headline: "Take PTE Academic",
      description: "Fast, computer-based English test with quick results, accepted by many universities.",
      ctaLabel: "Book PTE",
      url: "https://example.com/aff/pte",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 3,
    },
    {
      id: "off-transfer-remitly",
      tag: "money-transfer",
      brand: "Remitly",
      headline: "Send money home or abroad",
      description: "Competitive transfers for tuition and living funds, with first-transfer offers.",
      ctaLabel: "Send with Remitly",
      url: "https://example.com/aff/remitly",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 2,
    },
    {
      id: "off-esim-holafly",
      tag: "esim",
      brand: "Holafly",
      headline: "Unlimited-data eSIM",
      description: "An unlimited-data eSIM for your arrival country — set up before you fly.",
      ctaLabel: "Get a Holafly eSIM",
      url: "https://example.com/aff/holafly",
      disclosure: "Affiliate link — we may earn a commission at no extra cost to you.",
      enabled: true,
      order: 2,
    },
  ],
  leadGen: {
    enabled: true,
    headline: "Want an agency to handle your application?",
    description: "Get matched with a vetted study-abroad consultant for your destination. Free, no obligation.",
    ctaLabel: "Get matched →",
    formUrl: "https://example.com/leads",
  },
  updatedAt: "2026-06-12",
};

/** Offers for a given affiliate tag, enabled and ordered. */
export function offersForTag(config: RuntimeConfig, tag: AffiliateTag): AffiliateOffer[] {
  return config.affiliates
    .filter((o) => o.enabled && o.tag === tag)
    .sort((a, b) => a.order - b.order);
}
