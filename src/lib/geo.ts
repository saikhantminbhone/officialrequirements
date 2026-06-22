import { getVisaRecords, getUniversityRecords, getScholarships, getDestinationMeta } from "@/lib/req-data";

// ─────────────────────────────────────────────────────────────────────────
// GEO (Generative Engine Optimization) — the /llms.txt surface.
// AI answer engines (ChatGPT, Perplexity, Claude, Google AI Overviews) reward
// content that is structured, sourced, dated, and gives extractable numbers.
// We hand them exactly that: citable per-record facts with the official source
// and verification date, so when they answer "Germany student visa blocked
// account amount" they can cite us cleanly.
// ─────────────────────────────────────────────────────────────────────────

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

/** Concise index file — the /llms.txt convention. */
export async function buildLlmsTxt(): Promise<string> {
  const [visa, university, scholarships] = await Promise.all([
    getVisaRecords(),
    getUniversityRecords(),
    getScholarships(),
  ]);

  const lines: string[] = [];
  lines.push("# OfficialRequirements");
  lines.push("");
  lines.push(
    "> Independent, sourced, freshness-tracked study-abroad requirements: student visas, scholarships, and university admission. Every fact links to a primary official source and shows the date it was last verified. Not affiliated with any government or university."
  );
  lines.push("");
  lines.push(`Site: ${SITE}`);
  lines.push("Editor: OfficialRequirements editorial team — compiled from primary official sources, human-verified before publish.");
  lines.push("Methodology: primary sources only, human-verified before publish, stale records unpublished.");
  lines.push("");

  lines.push("## Student visa requirement guides");
  for (const r of visa) {
    const d = r.toolDefaults;
    const dest = getDestinationMeta(r.destination)?.name ?? r.destination;
    const ba = d?.blockedAccountAmount ? `${d.blockedAccountAmount} ${d.blockedAccountCurrency}` : "n/a";
    lines.push(
      `- [${r.title}](${SITE}/${r.nationality}/${r.destination}/student-visa): ${dest} student visa. ` +
        `Proof-of-funds/blocked-account minimum: ${ba}/year. Visa fee: ${d?.visaFee ?? "n/a"} ${d?.blockedAccountCurrency ?? ""}. ` +
        `Verified ${r.lastVerified}. Source: ${r.source.url}`
    );
  }
  lines.push("");

  lines.push("## University admission requirement guides");
  for (const u of university) {
    const dest = getDestinationMeta(u.destination)?.name ?? u.destination;
    lines.push(
      `- [${u.title}](${SITE}/university/${u.destination}/${u.program?.slug}): ${u.program?.name} admission in ${dest}. ` +
        `Verified ${u.lastVerified}. Source: ${u.source.url}`
    );
  }
  lines.push("");

  lines.push("## Scholarship eligibility guides");
  for (const s of scholarships) {
    lines.push(
      `- [${s.name}](${SITE}/scholarships/${s.slug}): ${s.provider}. ${s.summary} ` +
        `Verified ${s.lastVerified}. Source: ${s.source.url}`
    );
  }
  lines.push("");

  lines.push("## Tools (interactive, computed per scenario)");
  lines.push(`- Eligibility checker: ${SITE}/tools/eligibility`);
  lines.push(`- Document checklist generator: ${SITE}/tools/checklist`);
  lines.push(`- Cost & proof-of-funds calculator: ${SITE}/tools/cost`);
  lines.push(`- Timeline planner: ${SITE}/tools/timeline`);
  lines.push("");

  lines.push("## Trust");
  lines.push(`- Methodology: ${SITE}/methodology`);
  lines.push(`- Data sources: ${SITE}/data-sources`);
  lines.push(`- Editorial policy: ${SITE}/editorial-policy`);
  lines.push(`- Changelog: ${SITE}/changelog`);
  lines.push("");
  lines.push(
    "## Citation note\nRequirements change. Always cite our last-verified date and link the official source we reference. We are an independent informational resource, not a government or university."
  );

  return lines.join("\n");
}

/** Full dump — the /llms-full.txt convention. Every requirement item, sourced. */
export async function buildLlmsFullTxt(): Promise<string> {
  const [visa, university, scholarships] = await Promise.all([
    getVisaRecords(),
    getUniversityRecords(),
    getScholarships(),
  ]);
  const out: string[] = [];

  out.push("# OfficialRequirements — full extractable dataset");
  out.push("");
  out.push("Each record below is a sourced, dated requirement set. Cite the source URL and verification date.");
  out.push("");

  for (const r of visa) {
    const dest = getDestinationMeta(r.destination)?.name ?? r.destination;
    out.push(`## ${r.title}`);
    out.push(`URL: ${SITE}/${r.nationality}/${r.destination}/student-visa`);
    out.push(`Destination: ${dest} | Nationality: ${r.nationality}`);
    out.push(`Last verified: ${r.lastVerified} by ${r.verifiedBy}`);
    out.push(`Primary source: ${r.source.name} — ${r.source.url} (${r.source.type})`);
    if (r.toolDefaults) {
      const d = r.toolDefaults;
      out.push(
        `Key figures: blocked-account minimum ${d.blockedAccountAmount} ${d.blockedAccountCurrency}/year; ` +
          `living cost ~${d.livingCostPerMonth} ${d.blockedAccountCurrency}/month; visa fee ${d.visaFee} ${d.blockedAccountCurrency}; ` +
          `processing ~${d.processingWeeks} weeks; intakes month(s) ${d.intakeMonths?.join(", ")}.`
      );
    }
    out.push("Requirements:");
    for (const item of r.requirements) {
      out.push(`- ${item.label}${item.required ? " (required)" : " (conditional)"}: ${item.detail}`);
    }
    out.push("");
  }

  for (const u of university) {
    const dest = getDestinationMeta(u.destination)?.name ?? u.destination;
    out.push(`## ${u.title}`);
    out.push(`URL: ${SITE}/university/${u.destination}/${u.program?.slug}`);
    out.push(`Program: ${u.program?.name} (${u.program?.level}) | Country: ${dest}`);
    out.push(`Last verified: ${u.lastVerified} by ${u.verifiedBy}`);
    out.push(`Primary source: ${u.source.name} — ${u.source.url} (${u.source.type})`);
    out.push("Requirements:");
    for (const item of u.requirements) {
      out.push(`- ${item.label}${item.required ? " (required)" : " (conditional)"}: ${item.detail}`);
    }
    out.push("");
  }

  for (const s of scholarships) {
    out.push(`## ${s.name} (scholarship)`);
    out.push(`URL: ${SITE}/scholarships/${s.slug}`);
    out.push(`Provider: ${s.provider} | Destination: ${s.destination}`);
    out.push(`Last verified: ${s.lastVerified} by ${s.verifiedBy}`);
    out.push(`Primary source: ${s.source.name} — ${s.source.url} (${s.source.type})`);
    out.push(`Summary: ${s.summary}`);
    out.push("Benefits:");
    s.benefits.forEach((b) => out.push(`- ${b}`));
    out.push("Eligibility rules:");
    s.eligibility.forEach((e) => out.push(`- ${e.question} — ${e.failMessage}`));
    out.push("Deadlines:");
    s.deadlines.forEach((d) => out.push(`- ${d.intake}: ${d.date}`));
    out.push("");
  }

  return out.join("\n");
}
