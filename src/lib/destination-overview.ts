import type { RequirementRecord, ScholarshipRecord } from "@/lib/req-data/types";

// ─────────────────────────────────────────────────────────────────────────
// Deterministic long-form page content. Builds several paragraphs of genuinely
// useful, UNIQUE narrative per student-visa page from the structured data we
// already hold (figures, intakes, requirement set). It deliberately does NOT
// invent country-specific legal rules (work-hour caps, validity periods) that
// vary and change — those are framed as "check the official source", keeping the
// page honest for a YMYL topic while still being rich and helpful.
// ─────────────────────────────────────────────────────────────────────────

const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export interface OverviewSection {
  heading: string;
  paragraphs: string[];
}

interface Meta {
  name: string;
  adjective: string;
  fundsLabel: string;
}

function n(value: number): string {
  return value.toLocaleString("en-US");
}

function articleName(name: string): string {
  // "the UK" → "the UK"; "Germany" → "Germany". Used mid-sentence.
  return name;
}

export function buildVisaOverview(record: RequirementRecord, meta: Meta): OverviewSection[] {
  const name = articleName(meta.name);
  const nat = record.nationality ? record.nationality.toUpperCase() : "international";
  const d = record.toolDefaults ?? {};
  const requiredCount = record.requirements.filter((r) => r.required).length;
  const conditionalCount = record.requirements.length - requiredCount;
  const sections: OverviewSection[] = [];

  // 1. What this visa is / who it's for.
  const intro: string[] = [];
  intro.push(
    `A student visa (or study permit/residence permit, depending on the country) is the legal authorisation that lets ${record.nationality ? `${nat} citizens` : "international students"} live in ${name} for the length of an approved course. It is granted against a confirmed place at a recognised institution and proof that you can support yourself while you study — so the application is really about assembling and evidencing a specific set of documents rather than passing an exam.`
  );
  intro.push(
    `This page brings those documents together for ${name}: ${requiredCount} core requirements that almost every applicant must meet${conditionalCount > 0 ? `, plus ${conditionalCount} that apply only in certain situations` : ""}. Each one below is explained in full — what it is, why it's asked for, how to obtain it, and the mistakes that most often cause delays or refusals. Every figure is dated and linked to its official ${meta.adjective} source so you can verify it yourself before you act.`
  );
  sections.push({ heading: `Who needs a ${meta.adjective} student visa, and what it covers`, paragraphs: intro });

  // 2. Proof of funds — the make-or-break item.
  const funds: string[] = [];
  if (d.blockedAccountAmount && d.blockedAccountCurrency) {
    funds.push(
      `For ${name}, the headline ${meta.fundsLabel} is about ${n(d.blockedAccountAmount)} ${d.blockedAccountCurrency} for one year. This is the single most important number in the whole application: insufficient or poorly-evidenced funds is the most common reason student visas are refused, so it is worth getting exactly right rather than approximately right.`
    );
    funds.push(
      `Authorities care not just about the amount but about how the money is held and for how long. Many require the balance to have been in an eligible account for a set period before you apply, and to be traceable to a legitimate source. Large, unexplained deposits made just before applying are a classic red flag. If you are sponsored, you will usually need the sponsor's own financial evidence and proof of your relationship as well.`
    );
    if (d.livingCostPerMonth) {
      funds.push(
        `As a sanity check, the figure works out at roughly ${n(Math.round(d.blockedAccountAmount / 12))} ${d.blockedAccountCurrency} per month — close to the ${n(d.livingCostPerMonth)} ${d.blockedAccountCurrency}/month living cost the same source quotes. High-cost cities can run above this, and consulates may ask for more than the published minimum, so budget with a margin.`
      );
    }
  } else {
    funds.push(
      `${name} does not publish a single fixed proof-of-funds figure. Instead you must show enough to cover the tuition and living costs stated on your admission document for the period of study. Build and evidence that balance early, keep it stable, and make sure it is traceable to a legitimate source — under-evidenced finances are the most common reason student visas are refused.`
    );
  }
  sections.push({ heading: "How the money requirement actually works", paragraphs: funds });

  // 3. Timing — processing + intakes.
  const timing: string[] = [];
  if (d.processingWeeks) {
    timing.push(
      `Once you submit a complete application, ${name} typically takes around ${d.processingWeeks} weeks to decide it. In practice the real bottleneck is often appointment availability rather than the decision itself — visa-centre and embassy slots in peak season fill up months ahead, so the calendar, not the paperwork, is what catches most applicants out.`
    );
  } else {
    timing.push(
      `Processing times for ${name} vary by season and by where you apply, and embassy appointment availability is frequently the real constraint. Treat the application as something to start months ahead, not weeks.`
    );
  }
  if (d.intakeMonths?.length) {
    const months = d.intakeMonths.map((m) => MONTHS[m]).filter(Boolean);
    timing.push(
      `The main intake${months.length > 1 ? "s" : ""} for ${name} ${months.length > 1 ? "are" : "is"} ${months.join(" and ")}. Work backwards from your intended start date: secure admission first, then the funds and insurance, then book the visa appointment as soon as you are eligible. Leaving any step late tends to cascade into the next one.`
    );
  }
  sections.push({ heading: "Timing: when to start and how long it takes", paragraphs: timing });

  // 4. Costs.
  const costs: string[] = [];
  const cur = d.blockedAccountCurrency ?? "";
  const bits: string[] = [];
  if (d.visaFee) bits.push(`the visa/permit fee itself (around ${n(d.visaFee)} ${cur})`);
  if (d.blockedAccountAmount) bits.push(`the proof-of-funds you must show (about ${n(d.blockedAccountAmount)} ${cur}, which you keep — it is not a fee)`);
  if (d.insurancePerMonth) bits.push(`health insurance (roughly ${n(d.insurancePerMonth)} ${cur}/month)`);
  if (bits.length) {
    costs.push(
      `Budget for several separate costs, not just one. For ${name} these include ${bits.join("; ")}, on top of one-off costs like language tests, document translation, and travel. The interactive cost calculator further down this page totals these for your situation.`
    );
  } else {
    costs.push(
      `The visa is only one line in your budget. Plan for the application/permit fee, health insurance, language testing, document translation and the funds you must show — the cost calculator on this page brings these together for you.`
    );
  }
  costs.push(
    `Where you can choose how to pay — moving tuition or proof-of-funds money across borders, for example — the method matters: bank wires often lose 3–5% to exchange-rate margins and fees that a specialist transfer can avoid. Whatever route you use, keep every receipt; a clean, traceable money trail is itself part of the evidence.`
  );
  sections.push({ heading: "What it costs, beyond the visa fee", paragraphs: costs });

  // 5. Working + after arrival (honest, non-fabricated).
  const after: string[] = [];
  after.push(
    `Most study destinations let students work a limited number of hours during term and more during official holidays, but the exact cap, and whether it applies to your specific visa, changes from country to country and is revised fairly often. Rather than rely on a number that may be out of date, confirm the current work allowance for ${name} on the official source linked on this page before you count on any income.`
  );
  after.push(
    `Arrival is not the finish line. Many countries require you to complete steps after you land — registering your address, collecting a residence card, activating health cover, or enrolling formally — within a set window. Build these into your plan so your legal status stays valid from day one.`
  );
  sections.push({ heading: "Working during study, and what happens after you arrive", paragraphs: after });

  return sections;
}

// ─────────────────────────────────────────────────────────────────────────
// University admission overview.
// ─────────────────────────────────────────────────────────────────────────

const LEVEL_LABEL: Record<string, string> = {
  bachelor: "Bachelor's",
  msc: "Master's",
  mba: "MBA",
  phd: "PhD",
};

export function buildUniversityOverview(record: RequirementRecord, meta: Meta): OverviewSection[] {
  const name = meta.name;
  const level = record.program?.level ?? "msc";
  const levelLabel = LEVEL_LABEL[level] ?? "degree";
  const programName = record.program?.name ?? "this program";
  const has = (key: string) => record.requirements.some((r) => r.key === key);
  const sections: OverviewSection[] = [];

  // 1. About admission to this level here.
  const intro: string[] = [];
  intro.push(
    `Admission to a ${programName} in ${name} is decided by the university, not by a single national rulebook — so the requirements below are the common core that almost every ${meta.adjective} institution asks for, with the exact thresholds set on each program's own page. Getting in is about evidencing four things: that you hold the right prior qualification, that your grades clear the bar, that you can study in the language of instruction, and that your application stands out on its own merits.`
  );
  if (level === "phd") {
    intro.push(
      `A PhD is the exception to the checklist mindset: admission hinges far more on finding a supervisor whose research aligns with yours, and on a fundable, feasible proposal, than on ticking documents. Treat supervisor contact as the first and most important step.`
    );
  } else if (level === "mba") {
    intro.push(
      `For an MBA the cohort itself is part of the product, so admissions weigh your professional track record — leadership, progression and impact — alongside academics and test scores. Your essays are where a list of jobs becomes a convincing case.`
    );
  } else {
    intro.push(
      `Meeting the minimum is necessary but rarely sufficient at selective programs: a strong statement of purpose and well-chosen references are often what separate similar applicants, so treat them as core, not paperwork.`
    );
  }
  sections.push({ heading: `How admission to a ${levelLabel} in ${name} works`, paragraphs: intro });

  // 2. Grades & credential recognition.
  const grades: string[] = [];
  grades.push(
    `Two things are checked here: that your previous qualification is recognised as equivalent to the ${meta.adjective} standard, and that your grade clears the program's threshold. For non-local degrees, equivalence is often assessed formally (a credential evaluation), which can take weeks — so start it early rather than at deadline time.`
  );
  grades.push(
    `Grade thresholds are quoted on each program page in the local scale. Convert your own grades to that scale to check where you stand, but remember the university's own conversion is the one that counts — an unofficial converter that flatters your average can give false confidence.`
  );
  sections.push({ heading: "Qualifications, grades and credential recognition", paragraphs: grades });

  // 3. Language.
  const lang: string[] = [];
  lang.push(
    `English-taught programs require a recognised test (IELTS, TOEFL, PTE or Duolingo); programs taught in the local language require a local-language certificate instead. The required test and the minimum overall and per-section scores are set by the program — a common trap is clearing the overall score but missing a single section minimum.`
  );
  lang.push(
    `Book the test early: seats fill up and results can take up to two weeks to arrive. If your prior education was conducted in English, some universities waive the test entirely — always ask before paying for one.`
  );
  sections.push({ heading: "Proving you can study in the language", paragraphs: lang });

  // 4. Tests (conditional).
  if (has("gmat") || has("gre")) {
    const t: string[] = [];
    if (has("gmat")) {
      t.push(
        `Most ${name} MBA programs expect a competitive GMAT (or GRE) score. Check the program's published score range and aim for it; a strong score can offset a borderline academic record, and some programs waive the test for applicants with strong results or substantial experience — but only confirm a waiver in writing.`
      );
    } else {
      t.push(
        `Many quantitative Master's programs in ${name} require or recommend the GRE. Confirm whether it's required, recommended or waived for your specific program, and if you'll submit one, book early enough that the official score report reaches the program before its deadline.`
      );
    }
    sections.push({ heading: "Admission tests (GRE / GMAT)", paragraphs: t });
  }

  // 5. Documents + timeline.
  const docs: string[] = [];
  docs.push(
    `Beyond grades and language, you'll assemble official transcripts and certificates (often with certified translations), a statement of purpose tailored to this exact program, one to three references from people who know your work, and an up-to-date CV. Each is explained in full below, with how to prepare it and the mistakes that weaken an application.`
  );
  docs.push(
    `Work backwards from the program deadline. References and credential evaluations depend on other people and institutions, so request them first; the statement of purpose is the piece most worth your own time. Once admitted, your offer letter is also the document that unlocks the next stage — the student visa — so an early admission gives the whole downstream process room to breathe.`
  );
  sections.push({ heading: "Documents to prepare, and how to time them", paragraphs: docs });

  return sections;
}

// ─────────────────────────────────────────────────────────────────────────
// Scholarship overview.
// ─────────────────────────────────────────────────────────────────────────

export function buildScholarshipOverview(record: ScholarshipRecord): OverviewSection[] {
  const sections: OverviewSection[] = [];
  const hardRules = record.eligibility.filter((e) => !e.soft);

  // 1. What it is / who funds it.
  const intro: string[] = [];
  intro.push(
    `The ${record.name} is offered by ${record.provider}. ${record.summary} Scholarships like this are competitive and rule-bound: meeting every published eligibility criterion is what gets your application read, and missing even one usually means an automatic rejection regardless of how strong the rest of your profile is.`
  );
  intro.push(
    `Use the eligibility checker on this page for a quick, personalised read of whether you qualify before you invest hours in the application — then confirm the fine print on the official source, since awarding bodies revise criteria and amounts between cycles.`
  );
  sections.push({ heading: `About the ${record.name}`, paragraphs: intro });

  // 2. What it covers.
  if (record.benefits.length) {
    const cov: string[] = [];
    cov.push(
      `This award typically covers: ${record.benefits.join("; ")}. Read the value carefully — "full" funding can still leave gaps (visa fees, travel, or a partner/family), while a partial award may need topping up from savings or part-time work to satisfy a visa's proof-of-funds rule.`
    );
    sections.push({ heading: "What the scholarship covers", paragraphs: cov });
  }

  // 3. Eligibility.
  if (hardRules.length) {
    const elig: string[] = [];
    elig.push(
      `The main requirements are strict gates rather than guidelines: ${hardRules
        .slice(0, 5)
        .map((e) => e.failMessage.replace(/\.$/, ""))
        .join("; ")}. Check each against your own situation honestly before applying — the checker on this page does exactly this and flags where you may fall short.`
    );
    sections.push({ heading: "Who is eligible", paragraphs: elig });
  }

  // 4. Deadlines + applying.
  const apply: string[] = [];
  if (record.deadlines.length) {
    apply.push(
      `Key dates: ${record.deadlines.map((d) => `${d.intake} — ${d.date}`).join("; ")}. Always confirm the exact deadline on the official source, as cycles shift year to year and some awards close early once funds are committed.`
    );
  }
  apply.push(
    `Strong applications are specific and evidenced: tie your goals to what the scholarship is actually for, supply every requested document in the right format, and give referees plenty of notice. A late or incomplete submission is the most avoidable reason good candidates miss out.`
  );
  sections.push({ heading: "Deadlines and how to apply well", paragraphs: apply });

  return sections;
}
