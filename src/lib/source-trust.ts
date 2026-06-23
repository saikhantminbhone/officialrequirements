// ─────────────────────────────────────────────────────────────────────────
// Trusted-source auto-check (deterministic, no AI).
//
// Decides, from the URL alone, how authoritative a source is. Official
// government/education domains and a curated all-list of recognised official
// bodies score highest; plain HTTPS sites are "reputable"; blogs, forums and
// non-TLS pages are "low". The crawler uses this so figures from official
// sources are trusted automatically and anything off an unofficial page is
// flagged for a human — the "trust source auto check" with zero AI.
// ─────────────────────────────────────────────────────────────────────────

export type TrustTier = "official" | "reputable" | "unknown" | "low";

export interface TrustResult {
  tier: TrustTier;
  score: number; // 0–100
  host: string;
  reasons: string[];
}

// Government / official second-level TLD patterns (covers most countries).
const GOV_TLD = [
  ".gov",
  ".gov.uk",
  ".gob.es",
  ".go.kr",
  ".go.jp",
  ".gc.ca",
  ".govt.nz",
  ".gov.au",
  ".gov.my",
  ".gov.ae",
];
// Generic government / education second-level labels seen across many ccTLDs
// (e.g. *.gov.in, *.gob.mx, *.ac.uk, *.edu.au, *.go.th).
const GOV_LABELS = ["gov", "gob", "gouv", "govt", "go", "gv"];
const EDU_LABELS = ["edu", "ac"];

// Curated official bodies that don't sit on a gov/edu TLD but are authoritative.
const OFFICIAL_ALLOWLIST = [
  "europa.eu",
  "ec.europa.eu",
  "daad.de",
  "campusfrance.org",
  "study-in-germany.de",
  "make-it-in-germany.com",
  "studyinnorway.no",
  "studyinfinland.fi",
  "uni-assist.de",
  "ind.nl",
  "nuffic.nl",
  "migrationsverket.se",
  "udi.no",
  "nyidanmark.dk",
  "oeaw.ac.at",
  "bamf.de",
  "auswaertiges-amt.de",
  "gov.uk",
  "ukvi.homeoffice.gov.uk",
  "canada.ca",
  "ircc.canada.ca",
  "immi.homeaffairs.gov.au",
  "studyinjapan.go.jp",
  "emgs.com.my",
  "icp.gov.ae",
];

// Domains that should never be treated as authoritative for YMYL figures.
const LOW_TRUST = [
  "blogspot.",
  "wordpress.com",
  "medium.com",
  "quora.com",
  "reddit.com",
  "facebook.com",
  "youtube.com",
  "wikipedia.org",
  "forum",
  "blog.",
];

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function labels(host: string): string[] {
  return host.split(".");
}

export function classifySource(url: string): TrustResult {
  const host = hostnameOf(url);
  if (!host) return { tier: "low", score: 0, host: "", reasons: ["invalid-url"] };

  const reasons: string[] = [];
  const isHttps = url.toLowerCase().startsWith("https://");
  if (!isHttps) reasons.push("no-tls");

  const parts = labels(host);

  // Official: gov/edu TLD patterns, gov/edu labels, or curated allowlist.
  const matchesGovTld = GOV_TLD.some((s) => host.endsWith(s));
  const hasGovLabel = parts.some((p) => GOV_LABELS.includes(p));
  const hasEduLabel = parts.some((p) => EDU_LABELS.includes(p));
  const onAllowlist = OFFICIAL_ALLOWLIST.some((d) => host === d || host.endsWith(`.${d}`) || host.endsWith(d));
  const isLow = LOW_TRUST.some((d) => host.includes(d));

  if (isLow) {
    reasons.push("non-official-domain");
    return { tier: "low", score: 15, host, reasons };
  }

  if (matchesGovTld || hasGovLabel || onAllowlist) {
    reasons.push(matchesGovTld || hasGovLabel ? "government-domain" : "official-allowlist");
    return { tier: "official", score: isHttps ? 100 : 85, host, reasons };
  }
  if (hasEduLabel) {
    reasons.push("education-domain");
    return { tier: "official", score: isHttps ? 95 : 80, host, reasons };
  }

  // Reputable: plain HTTPS site, not flagged.
  if (isHttps) {
    reasons.push("https-only");
    return { tier: "reputable", score: 55, host, reasons };
  }

  reasons.push("unverified");
  return { tier: "unknown", score: 30, host, reasons };
}

/** Convenience: is this URL authoritative enough to trust a YMYL figure from? */
export function isTrustedSource(url: string): boolean {
  return classifySource(url).tier === "official";
}
