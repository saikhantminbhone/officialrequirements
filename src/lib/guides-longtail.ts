import type { Guide } from "./guides";

// ─────────────────────────────────────────────────────────────────────────
// Long-tail guide batch (July 2026). Strategy: a new domain earns rankings
// through deep, specific guides on low-competition queries first; the
// programmatic matrix harvests traffic later, once authority exists. Each
// guide targets a question people actually type, defers volatile figures to
// official sources, and internally links into the programmatic pages.
// ─────────────────────────────────────────────────────────────────────────

const UPDATED = "2026-07-02";

export const LONGTAIL_GUIDES: Guide[] = [
  {
    slug: "uk-student-visa-28-day-rule",
    title: "UK Student Visa 28-Day Rule (2026) — Maintenance Funds Explained",
    h1: "The UK 28-day rule, explained — how to evidence maintenance funds",
    description:
      "How the UK Student visa 28-day funds rule actually works: how much to show in and outside London, how the balance is checked, and the timing mistakes that cause refusals.",
    destination: "gb",
    affiliateTag: "money-transfer",
    updated: UPDATED,
    intro:
      "More UK Student visa refusals trace back to the 28-day maintenance rule than to any other single requirement. The rule itself is mechanical — which is good news, because mechanical rules can be satisfied exactly. Here is what the Home Office actually checks, with the traps that catch applicants who have enough money but present it wrongly.",
    sections: [
      {
        heading: "How much you must show",
        body: [
          "The maintenance requirement is a fixed monthly amount for up to nine months, plus any first-year tuition you have not already paid. Since 11 November 2025 the published rates are £1,529 per month for study in London and £1,171 per month outside London — so a one-year London Master's means showing £13,761 plus outstanding fees. Always confirm the current rate on GOV.UK before you rely on it; the Home Office revises these figures periodically.",
          "Money already paid to the university (fees or a housing deposit up to the permitted cap) counts against the total, provided your CAS records it. Getting your CAS updated before you apply is far easier than arguing about it after a refusal.",
        ],
      },
      {
        heading: "What the 28-day rule actually requires",
        body: [
          "The full required amount must sit in an acceptable account for 28 consecutive days, and the closing balance of your evidence must date no more than 31 days before your visa application. If the balance dips below the threshold for even one day inside that window — by a single pound — the application falls to be refused on maintenance.",
          "The safest pattern is simple: move the entire amount into one account, leave it completely untouched for a clear month, then apply promptly once your statement shows the 28-day history. Do not pay any bills from that account during the window.",
        ],
      },
      {
        heading: "Whose money it can be, and in what form",
        body: [
          "Funds can be yours, your parents' (with a consent letter and proof of relationship), or your legal guardian's. Cash in a bank or building society account is the standard evidence; shares, property, cryptocurrency and business accounts do not count. If the account is in another currency, the conversion is done at the official rate on the date of application — leave a margin for exchange-rate movement, or a small currency dip can silently push you under the threshold.",
          "If money must cross borders — from a sponsor at home to your account, or to the university — the transfer route matters for both cost and evidence. A traceable transfer with a clear sender creates exactly the paper trail a caseworker wants to see; informal channels create exactly the doubts that lead to credibility questions.",
        ],
      },
      {
        heading: "The exemptions people miss",
        body: [
          "You do not need to show maintenance at all if you have held a UK visa for 12 months or more at the point of application, or if you are applying from inside the UK in certain categories, or if you are a national of (or applying in) a country on the differential evidence list — though the Home Office can still request the evidence, so you should hold it anyway.",
          "Fully funded scholarship holders evidence their funding with the sponsor's letter instead of bank statements. The letter must confirm the sponsorship covers fees and living costs, and its dates must span your course.",
        ],
      },
    ],
    faqs: [
      {
        question: "How much money do I need for a UK student visa in 2026?",
        answer:
          "Since 11 November 2025: £1,529 per month for London study or £1,171 per month outside London, for up to 9 months, plus any unpaid first-year tuition. Confirm the current figure on GOV.UK — it is revised periodically.",
      },
      {
        question: "What happens if my balance drops below the requirement for one day?",
        answer:
          "The 28-day rule fails and the application falls to be refused on maintenance, regardless of how much money you have on the other 27 days. Keep the account untouched for the whole window.",
      },
      {
        question: "Can I use my parents' bank account for the UK 28-day rule?",
        answer:
          "Yes — with a letter of consent from them, proof of the relationship (e.g. birth certificate), and the same 28-day history on their account.",
      },
      {
        question: "Does money paid to the university count towards maintenance?",
        answer:
          "Yes. Tuition already paid, and accommodation payments to the sponsor up to the permitted cap, are deducted from what you must show — provided the CAS records the payment.",
      },
    ],
    keywords: [
      "uk student visa 28 day rule",
      "uk student visa maintenance funds 2026",
      "how much bank balance for uk student visa",
      "uk student visa financial requirements",
      "28 day bank statement rule uk visa",
    ],
  },
  {
    slug: "canada-study-permit-proof-of-funds",
    title: "Canada Study Permit Proof of Funds (2026) — Amounts, GIC & Evidence",
    h1: "Proof of funds for a Canada study permit, explained",
    description:
      "What IRCC actually accepts as proof of funds in 2026 — the cost-of-living amount, how the GIC works now that SDS has ended, and the evidence patterns that avoid refusal.",
    destination: "ca",
    affiliateTag: "money-transfer",
    updated: UPDATED,
    intro:
      "Canada publishes an exact cost-of-living figure a study-permit applicant must show on top of first-year tuition and travel — and refuses applications that document it poorly. With the SDS fast-track gone, everyone now applies through the same stream, and the officer's discretion over your financial evidence matters more than ever. Here is how the requirement works and how to evidence it convincingly.",
    sections: [
      {
        heading: "The numbers: cost of living plus tuition plus travel",
        body: [
          "Outside Quebec, a single applicant must show the IRCC cost-of-living amount — CAD 22,895 as of the September 2025 update — in addition to first-year tuition and travel costs. Quebec sets its own, slightly higher figure. IRCC revises these amounts periodically, so verify the current number on canada.ca before finalising your file.",
          "The amount scales with family size, so a spouse or children joining you raises the requirement substantially. Budget realistically: the published figure is a floor for approval, not an estimate of comfortable living costs in Toronto or Vancouver.",
        ],
      },
      {
        heading: "The GIC after SDS: still the strongest single document",
        body: [
          "The Student Direct Stream and its mandatory GIC ended in late 2024, but a Guaranteed Investment Certificate from a participating Canadian bank remains one of the cleanest proofs of funds you can submit: the money is already in Canada, in your name, released to you monthly after arrival. Officers know exactly what it is and what it guarantees.",
          "Alternatives IRCC accepts include a Canadian account in your name, a confirmed education loan, four months of bank statements, a convertible bank draft, proof that tuition and housing are paid, sponsor letters, or scholarship funding. You can combine sources — the total is what counts, but each source must be individually credible.",
        ],
      },
      {
        heading: "What gets financial evidence rejected",
        body: [
          "The classic failure is a large, recent, unexplained deposit. Four months of statements exist precisely to show the money's history; a balance that appeared last week signals borrowed window-dressing. If a genuine event explains a big deposit — sale of property, a maturing fixed deposit, an education loan disbursement — document that event explicitly.",
          "Sponsored funds fail when the sponsor's own capacity is undocumented. A parent's sponsorship letter needs the parent's bank history and income evidence, plus proof of relationship. And if funds move from a sponsor's account to yours across a border, use a traceable transfer — the receipt is itself evidence, and wire-transfer exchange margins are worth comparing before you move five figures.",
        ],
      },
      {
        heading: "Provincial attestation letters and the current caps",
        body: [
          "Most applicants now also need a provincial or territorial attestation letter (PAL/TAL) under Canada's study-permit caps, obtained via the institution after acceptance. It is a separate requirement from proof of funds, but the two interact: a complete financial file with a valid PAL is what a fast, clean approval looks like in the cap era.",
          "Check whether your institution and program are PAL-exempt (graduate research programs and some categories are) rather than assuming either way.",
        ],
      },
    ],
    faqs: [
      {
        question: "How much money do I need for a Canada study permit in 2026?",
        answer:
          "The IRCC cost-of-living amount (CAD 22,895 outside Quebec, per the September 2025 update) plus your first-year tuition and travel costs. The figure rises with family size and is revised periodically — confirm on canada.ca.",
      },
      {
        question: "Is a GIC still required for a Canada study permit?",
        answer:
          "No — the GIC was mandatory only under SDS, which ended in November 2024. It remains an accepted and very strong form of proof, but bank statements, loans, sponsorships and other evidence are also accepted.",
      },
      {
        question: "Can I show my parents' money for a Canada study permit?",
        answer:
          "Yes. Include a letter from them stating they are providing the money, proof of relationship, and their own bank history and income evidence so the officer can see the funds are genuinely available.",
      },
      {
        question: "Why do study permits get refused on financial grounds?",
        answer:
          "Most commonly: unexplained recent deposits, insufficient history (no four-month view), sponsors without documented capacity, or totals that ignore first-year tuition and travel on top of the cost-of-living amount.",
      },
    ],
    keywords: [
      "canada study permit proof of funds 2026",
      "gic canada student visa",
      "how much bank balance for canada study permit",
      "ircc proof of financial support",
      "canada student visa refused proof of funds",
    ],
  },
  {
    slug: "australia-genuine-student-requirement",
    title: "Australia Genuine Student (GS) Requirement (2026) — How to Answer It",
    h1: "Australia's Genuine Student requirement, explained",
    description:
      "What the Genuine Student (GS) requirement replaced, what the questions really assess, and how to write answers that survive scrutiny — plus the financial capacity rules behind them.",
    destination: "au",
    updated: UPDATED,
    intro:
      "Since March 2024, every Australian student-visa applicant answers the Genuine Student (GS) questions — the replacement for the old GTE statement. Most refusals under GS are not about bad answers so much as answers that contradict the rest of the file. Understanding what the decision-maker is weighing lets you write responses that hold together.",
    sections: [
      {
        heading: "What GS replaced, and what actually changed",
        body: [
          "The old Genuine Temporary Entrant essay asked you to argue you would leave Australia. GS instead asks a set of targeted questions: your current circumstances, why this course and this provider, what the course does for you, and anything else you want considered. The shift is deliberate — Australia now accepts that a genuine student may later seek post-study pathways, but still tests whether study is your real purpose now.",
          "In practice the officer cross-checks your answers against your history: course choice versus academic and work background, gaps, previous visa refusals anywhere, and your ties at home. An MBA after a decade in an unrelated field with no career logic stated is the kind of mismatch that sinks files.",
        ],
      },
      {
        heading: "Writing answers that hold together",
        body: [
          "Be specific and factual. Name the skills the course delivers and connect them to a concrete plan — a role, an industry, a family business, a market at home or abroad where the qualification has value. Generic praise for Australia's education system reads as filler; a two-line career logic reads as genuine.",
          "Address weaknesses yourself rather than hoping they pass unnoticed. A study gap, a change of field, or an earlier refusal is far less damaging when you explain it in one honest paragraph than when the officer finds it unexplained.",
        ],
      },
      {
        heading: "The financial capacity behind the GS assessment",
        body: [
          "Financial capacity is assessed alongside GS: you must show funds covering the published living-cost amount (AUD 29,710 per year for a single applicant at the current setting), plus first-year tuition and travel, or evidence of qualifying annual income. Confirm the current figures on the Department of Home Affairs site — they are indexed and change.",
          "Officers look for genuine access to the money, not just a balance: history, source, and the sponsor's relationship to you all matter. Recently deposited, round-figure sums with no story are treated exactly as sceptically in Sydney as in London or Ottawa.",
        ],
      },
      {
        heading: "English, health and the rest of the file",
        body: [
          "GS does not stand alone. English scores must meet the current threshold for your visa and course level, health insurance (OSHC) must span your stay, and your documents must be internally consistent — the same dates, the same course, the same funding story everywhere. Contradictions between your GS answers, your financial documents and your admission file are the most preventable refusal cause in the current system.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is the Genuine Student requirement for Australia?",
        answer:
          "A set of targeted questions (replacing the GTE statement in March 2024) assessing whether study is your genuine purpose: your circumstances, why this course and provider, what it does for you, and your history — cross-checked against your whole file.",
      },
      {
        question: "How much money do I need for an Australian student visa?",
        answer:
          "Funds covering the published annual living cost (AUD 29,710 for a single applicant at the current setting) plus first-year tuition and travel, or qualifying income evidence. The figure is indexed — check Home Affairs for the current amount.",
      },
      {
        question: "Does wanting to work in Australia after study fail the GS test?",
        answer:
          "Not by itself. The current framework accepts that genuine students may pursue post-study pathways. What fails is evidence that study is a pretext — course choices with no logic, contradictory answers, or files built around work rather than study.",
      },
      {
        question: "What are common GS refusal reasons?",
        answer:
          "Course choice inconsistent with background, unexplained gaps or refusal history, generic copied answers, and financial evidence that doesn't show genuine access to funds.",
      },
    ],
    keywords: [
      "genuine student requirement australia",
      "gs requirement student visa australia",
      "australia student visa gs questions answers",
      "australia student visa financial requirements 2026",
      "gte vs gs australia",
    ],
  },
  {
    slug: "us-f1-visa-interview-guide",
    title: "F-1 Visa Interview (2026) — Questions, Preparation & Refusal Reasons",
    h1: "The US F-1 visa interview, explained — what officers actually assess",
    description:
      "How the F-1 interview really works: the three things consular officers assess in two minutes, the questions behind the questions, and why 214(b) refusals happen.",
    destination: "us",
    updated: UPDATED,
    intro:
      "The F-1 interview is short — often under three minutes — and decided on the officer's overall impression, not a checklist. That brevity is exactly why preparation matters: every answer has to carry weight. Here is what the officer is actually assessing, and how to prepare answers that are yours rather than a coach's script.",
    sections: [
      {
        heading: "The three questions behind every question",
        body: [
          "Everything an officer asks maps to three assessments: Are you a genuine student (can you explain your program and why it fits you)? Can you pay (without unauthorized work)? And do you intend to comply with your visa (under INA 214(b), you must overcome the presumption of immigrant intent)? Whatever the surface question — 'Why this university?', 'Who is sponsoring you?', 'What does your father do?' — answer the underlying one.",
          "Officers read your file before you speak. Your I-20, DS-160 and academic history are in front of them; your answers must match those documents exactly. The interview tests consistency and credibility, not new information.",
        ],
      },
      {
        heading: "Money questions: precise beats big",
        body: [
          "Know your numbers cold: total first-year cost on the I-20, who pays, and where that money is. 'My father sponsors me; his business generates about X annually and we have Y in savings, shown in the documents' is a complete answer. Vague answers about 'sufficient funds' invite follow-ups; inconsistency between your answer and the I-20 figures invites refusal.",
          "If a loan funds you, know the sanctioned amount and lender. If a relative abroad contributes, be ready to explain why they would and how the money reaches you. Bring evidence you can produce in seconds, not folders you fumble through.",
        ],
      },
      {
        heading: "The 214(b) question: ties and plans",
        body: [
          "Most F-1 refusals cite 214(b) — failure to overcome the presumption of immigrant intent. You counter it with a coherent story, not a plea: what the degree gives you, and what you plan to do with it, expressed with the kind of specificity that suggests you have actually thought about your own life. Family, career prospects, or a defined opportunity at home all help; a memorized 'I will definitely return' does not.",
          "A prior refusal is not fatal. What matters is whether something in your situation or presentation has materially changed — new admission, clearer funding, better-articulated plans. Reapplying with an identical file usually produces an identical result.",
        ],
      },
      {
        heading: "Practical mechanics",
        body: [
          "Pay the SEVIS I-901 fee before the interview and bring the receipt. Answer in English, briefly, and to the question asked — officers can extend the conversation if they want more. Dress neatly, hand over documents only when asked, and if you don't understand a question, say so rather than guessing.",
          "Appointment backlogs vary enormously by post and season; check the published wait times and book the moment you have your I-20. An early interview slot is worth more than another week of rehearsal.",
        ],
      },
    ],
    faqs: [
      {
        question: "How long is the F-1 visa interview?",
        answer:
          "Usually two to four minutes. The officer has your file already — the interview tests credibility and consistency, which is why short, precise answers matter.",
      },
      {
        question: "What is a 214(b) refusal?",
        answer:
          "A refusal under INA section 214(b): you didn't overcome the legal presumption of immigrant intent. It isn't a permanent bar — you can reapply, but you should change something material (funding clarity, plans, presentation) first.",
      },
      {
        question: "What documents should I bring to the F-1 interview?",
        answer:
          "Passport, I-20, DS-160 confirmation, SEVIS fee receipt, admission letter, financial evidence matching the I-20 amount, and academic records/test scores. Have them ordered so you can produce any one in seconds.",
      },
      {
        question: "Can I mention wanting to work in the US after graduation?",
        answer:
          "You can acknowledge OPT/practical training as part of the educational path, but your overall story must show nonimmigrant intent — a plan in which the degree serves goals beyond simply staying in the US.",
      },
    ],
    keywords: [
      "f1 visa interview questions and answers",
      "f1 visa interview preparation 2026",
      "214b refusal f1 student visa",
      "f1 visa interview tips",
      "us student visa interview questions",
    ],
  },
  {
    slug: "ielts-vs-toefl-vs-pte",
    title: "IELTS vs TOEFL vs PTE (2026) — Which Test for Your Student Visa?",
    h1: "IELTS vs TOEFL vs PTE — choosing the right English test",
    description:
      "Which English test to take for study abroad: where each is accepted for visas (not just admission), score equivalences, format differences, and how to decide in five minutes.",
    updated: UPDATED,
    intro:
      "The right English test is the one your destination's visa authority and your university both accept — after that, it's about which format suits you and how fast you need a result. People lose months retaking the wrong test for the right score. Here is the decision, laid out in order.",
    sections: [
      {
        heading: "Acceptance is a visa question, not just an admission question",
        body: [
          "Universities accept a broad menu of tests, but visa authorities are stricter, and the two lists are not identical. The UK's Student visa requires a Secure English Language Test (SELT) for some course levels — and a test that satisfies a university may not satisfy UKVI. Australia lists accepted tests with minimum scores for the visa itself. The US has no visa-level English test requirement (the university's admission decision carries it). Germany, the Netherlands and most of Europe likewise leave English evidence to the institution.",
          "So check in this order: does your target visa require a specific test type, and does your university accept the one you plan to take, at your program's required score? Two web pages settle it — check both before booking anything.",
        ],
      },
      {
        heading: "Format and experience differences that actually matter",
        body: [
          "IELTS offers paper or computer testing and a face-to-face speaking interview — better if you talk more fluently to a human than to a microphone. TOEFL iBT is fully computer-based with recorded speaking, and its academic-lecture listening suits people comfortable with North American campus English. PTE Academic is fully computer-scored, which removes examiner subjectivity and typically returns results fastest — often within two days.",
          "Score equivalences are approximate: IELTS 6.5 corresponds roughly to TOEFL 79–93 and PTE 58–65, but every university publishes its own conversion, and per-section minimums trip up more applicants than overall scores. A 6.5 overall with a 5.5 in writing fails a requirement of '6.5 with no band below 6.0'.",
        ],
      },
      {
        heading: "Cost, speed and retake strategy",
        body: [
          "Prices vary by country but all three tests cost roughly US$200–260 per attempt. PTE usually returns results in about two days, computer IELTS in one to five, TOEFL in around four to eight. If a visa deadline is close, result speed can decide the choice by itself.",
          "One-skill retakes now exist (IELTS One Skill Retake; TOEFL offers section retesting in many markets) — enormously useful when a single section missed the minimum. Verify your university accepts the retake format before relying on it, and always confirm score validity: two years is the standard for all three tests.",
        ],
      },
      {
        heading: "How to decide in five minutes",
        body: [
          "First, eliminate tests your visa route or university doesn't accept at your level. Second, if more than one survives, pick by format: human speaking interview → IELTS; fastest results or fully objective scoring → PTE; academic-lecture comfort → TOEFL. Third, book with enough margin for one retake before your admission or visa deadline — that margin, not the test brand, is what saves applications.",
        ],
      },
    ],
    faqs: [
      {
        question: "Which English test is easiest?",
        answer:
          "None is systematically easier — they measure the same skills with different formats. Score differences for the same person usually come from format fit: face-to-face vs recorded speaking, typing vs handwriting, and question style.",
      },
      {
        question: "Do all universities accept PTE?",
        answer:
          "Acceptance is now wide across the UK, Australia, Canada and increasingly the US and Europe, but not universal — and visa-level acceptance can differ from university acceptance. Check both for your specific program and route.",
      },
      {
        question: "What IELTS score equals TOEFL 90?",
        answer:
          "Roughly IELTS 6.5–7.0, but institutions publish their own equivalence tables and set per-section minimums — always use your university's table, not a generic one.",
      },
      {
        question: "How long are IELTS, TOEFL and PTE scores valid?",
        answer:
          "Two years from the test date, for all three. Time your test so the score is still valid on the date your visa application is decided, not just when you apply to universities.",
      },
    ],
    keywords: [
      "ielts vs toefl vs pte which is better",
      "which english test for student visa",
      "pte accepted universities visa",
      "ielts toefl pte score comparison",
      "english test for study abroad 2026",
    ],
  },
  {
    slug: "sponsor-letter-for-student-visa",
    title: "Sponsor Letter for a Student Visa (2026) — Format, Evidence & Mistakes",
    h1: "Sponsored funds for a student visa — how to evidence them properly",
    description:
      "How to document a sponsor for any student visa: what the letter must say, the financial evidence behind it, relationship proof, and the patterns that trigger refusals.",
    affiliateTag: "money-transfer",
    updated: UPDATED,
    intro:
      "Most student-visa money is family money, and most financially-refused applications with enough funds fail on documentation: the sponsor's letter says too little, the sponsor's own finances are missing, or the money's journey to the applicant can't be traced. The fix is a standard evidence bundle that works, with local variations, for nearly every destination.",
    sections: [
      {
        heading: "What a sponsor letter must actually contain",
        body: [
          "A usable sponsorship letter states, at minimum: the sponsor's full name and relationship to you, what they are funding (tuition, living costs, or both) and for how long, the approximate amount committed, the source of their funds in one sentence, and their signature with date and contact details. One page is enough; vagueness is the enemy, not brevity.",
          "Attach identity evidence for the sponsor and proof of the relationship claimed — birth certificates for parents, marriage certificates where relevant, family-registry extracts where your country issues them. Officers refuse what they cannot verify.",
        ],
      },
      {
        heading: "The sponsor's own evidence carries the weight",
        body: [
          "The letter is a promise; the sponsor's financial documents are the proof. Bank statements over several months (not a single-day balance letter), income evidence — salary slips, an employment letter, business registration and tax filings for the self-employed — and documentation for any large recent deposits in the sponsor's own account. A sponsor whose account history can't support the promised amount undermines the whole file.",
          "Destination-specific formats sit on top of this: the UK requires funds in your or your parents' account under the 28-day rule (a cousin's sponsorship doesn't count for maintenance); Germany channels family money into a blocked account in your name; the US wants sponsor evidence consistent with the I-20 figures. The underlying logic — committed sponsor, documented capacity, traceable money — is identical everywhere.",
        ],
      },
      {
        heading: "Moving the money: traceability is evidence",
        body: [
          "When sponsored funds cross a border — into your account, a blocked account, or a university's — the transfer method becomes part of your evidence. Bank-to-bank or reputable specialist transfers produce receipts naming sender, recipient, amount and date; those receipts answer the 'source of funds' question before it's asked. Informal value-transfer channels produce nothing an officer can verify, and cash deposits into your account shortly before applying are the single most damaging pattern in financial evidence.",
          "Cost matters too at these amounts: exchange-rate margins on ordinary bank wires often run several percent, which is real money on a year's tuition. Compare the effective rate, not the advertised fee — then keep every receipt.",
        ],
      },
      {
        heading: "Patterns that trigger refusals",
        body: [
          "The recurring failures: round-figure deposits appearing days before application with no explanation; sponsors outside the accepted relationship categories for that destination; letters promising amounts the sponsor's statements can't show; income evidence that contradicts tax records; and inconsistencies between the sponsorship story told in the letter, the visa form and the interview. Every one of these is preventable with an afternoon of document assembly.",
          "If your funding situation is genuinely complicated — mixed sources, a family business, land sale proceeds — explain it in a short cover note with documents for each step. Officers refuse confusion, not complexity.",
        ],
      },
    ],
    faqs: [
      {
        question: "Who can sponsor a student visa?",
        answer:
          "It depends on the destination. Parents are accepted everywhere; some destinations (like the UK for maintenance funds) restrict it to you, your parents or legal guardian, while others accept wider family or third parties with stronger relationship evidence. Check the specific rule before building the file around an uncle or cousin.",
      },
      {
        question: "What documents does a sponsor need to provide?",
        answer:
          "A signed sponsorship letter, identity document, proof of relationship, several months of bank statements, and income evidence (salary slips and employer letter, or business/tax records if self-employed). Large recent deposits in the sponsor's account need their own explanation.",
      },
      {
        question: "Can a large deposit before applying cause refusal?",
        answer:
          "Yes — an unexplained recent deposit is the most common financial red flag across all destinations. If the deposit has a genuine source (asset sale, loan disbursement, maturing deposit), document that source explicitly.",
      },
      {
        question: "Is a sponsorship letter alone enough?",
        answer:
          "No. The letter states the commitment; the sponsor's bank and income evidence proves the capacity; relationship documents prove the connection. All three parts are needed for the sponsorship to carry weight.",
      },
    ],
    keywords: [
      "sponsor letter for student visa sample requirements",
      "financial sponsorship letter student visa",
      "parents sponsoring student visa documents",
      "proof of funds sponsor student visa",
      "sponsored funds visa refusal reasons",
    ],
  },
];
