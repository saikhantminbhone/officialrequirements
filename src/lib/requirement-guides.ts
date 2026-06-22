// ─────────────────────────────────────────────────────────────────────────
// Requirement knowledge base — the rich, full-detail content rendered under
// each requirement so every page is genuinely informative (not a thin list).
// Keyed by a normalized "topic"; each requirement item is mapped to a topic by
// its key. Content is destination-agnostic and reusable, and is server-rendered
// inside <details> so it's real, crawlable text for SEO and AI engines.
// ─────────────────────────────────────────────────────────────────────────

export interface RequirementGuide {
  whatItIs: string;
  why: string;
  howToGet: string[];
  tips: string[];
  mistakes: string[];
}

/** Map a requirement item key to a guide topic. */
export function topicForKey(key: string): string | null {
  const k = key.toLowerCase();
  if (k.includes("proof-of-funds")) return "proof-of-funds";
  if (["admission-letter", "loa", "cas", "coe", "i20", "offer-of-place", "pre-enrolment", "emgs-approval", "admission"].some((x) => k.includes(x))) return "admission";
  if (k.includes("pal")) return "pal";
  if (k.includes("mvv")) return "mvv";
  if (k.includes("etudes")) return "etudes";
  if (k.includes("aps")) return "aps";
  if (k.includes("atas")) return "atas";
  if (k.includes("tb-test")) return "tb-test";
  if (k === "gs" || k.includes("genuine-student") || k.includes("gte")) return "genuine-student";
  if (k.includes("language") || k.includes("english-proficiency")) return "language-proof";
  if (k.includes("passport")) return "passport";
  if (k.includes("insurance") || k.includes("ihs") || k.includes("oshc")) return "health-insurance";
  if (k.includes("medical") || k.includes("health-exam") || k.includes("xray") || k.includes("fitness")) return "medical";
  if (k.includes("transfer")) return "money-transfer";
  if (k.includes("connectivity") || k.includes("esim")) return "esim";
  if (k.includes("accommodation") || k.includes("housing")) return "accommodation";
  if (k.includes("tuition-paid")) return "tuition-paid";
  if (k.includes("biometrics")) return "biometrics";
  if (k.includes("gre") || k.includes("gmat")) return "admission-test";
  if (k.includes("work-experience")) return "work-experience";
  if (k.includes("research-proposal")) return "research-proposal";
  if (k.includes("criminal") || k.includes("police")) return "police-record";
  if (k.includes("sevis")) return "sevis";
  if (k.includes("ds160")) return "ds160";
  if (k.includes("emirates-id")) return "emirates-id";
  if (k.includes("onward-travel")) return "onward-travel";
  if (k.includes("prior-qualification")) return "prior-qualification";
  if (k.includes("minimum-grade")) return "minimum-grade";
  if (k.includes("transcripts")) return "transcripts";
  if (k.includes("motivation")) return "motivation-letter";
  if (k.includes("recommendation")) return "recommendation-letters";
  if (k === "cv") return "cv";
  if (k.includes("application-fee")) return "application-fee";
  return null;
}

export function guideForKey(key: string): RequirementGuide | null {
  const topic = topicForKey(key);
  return topic ? GUIDES[topic] ?? null : null;
}

const GUIDES: Record<string, RequirementGuide> = {
  "proof-of-funds": {
    whatItIs:
      "Evidence that you can pay for your living costs (and sometimes tuition) for the period of study, without needing to work illegally or rely on public funds. Depending on the country this is a fixed annual figure, a monthly multiple, a blocked/escrow account, or a flexible amount tied to your admission document.",
    why: "It is the single most common reason student visas are refused. Immigration authorities want certainty that you can support yourself, so the rules on amount, source and how long the money has been held are strict and enforced.",
    howToGet: [
      "Confirm the exact figure and what it must cover (living only, or living + tuition + travel) on the official source linked on this page.",
      "Build the balance in an eligible account well ahead of time — many countries require funds to have been held for a set number of days (e.g. 28).",
      "Gather statements covering the required history, plus any sponsor letters, scholarship confirmations or loan-sanction documents.",
      "If a blocked/escrow account is required (e.g. Germany), open it with a recognised provider and fund it to the annual minimum.",
    ],
    tips: [
      "Keep the balance stable — large, unexplained deposits just before applying are a red flag.",
      "If you're sponsored, include the sponsor's relationship proof, ID and their own financial evidence.",
      "Budget above the minimum for high-cost cities; consulates can ask for more than the headline figure.",
    ],
    mistakes: [
      "Showing the money for too short a period, or moving it in just before the application.",
      "Forgetting that tuition and return travel may be required on top of the living-cost figure.",
      "Using an account type or currency the authority does not accept.",
    ],
  },
  admission: {
    whatItIs:
      "An official acceptance, enrolment confirmation or sponsorship document from a recognised institution. Different countries call it different things (CAS in the UK, I-20 in the USA, CoE in Australia/Japan, LOA in Canada, Notification of Admission in Sweden), but it is the document that proves a real place on an approved course.",
    why: "The student visa exists only to let you take up a confirmed place. Without an admission document from an institution licensed to host international students, there is nothing for the visa to be granted against.",
    howToGet: [
      "Apply to the institution and meet its academic and English requirements.",
      "Accept the offer and pay any required deposit so the institution issues the official visa document.",
      "Check that the institution is on the official register of approved/licensed sponsors for international students.",
    ],
    tips: [
      "Apply early — the admission document is the bottleneck for everything that follows (funds, insurance, appointment).",
      "Verify every personal detail on it matches your passport exactly.",
    ],
    mistakes: [
      "Applying to an institution not authorised to enrol international students.",
      "Leaving admission so late that there's no time for the visa to be processed before the intake.",
    ],
  },
  "health-insurance": {
    whatItIs:
      "Medical cover valid in the destination country for your stay. This may be a mandatory national scheme, a recognised private student plan, an immigration health surcharge (UK), or compulsory cover like OSHC (Australia).",
    why: "Healthcare abroad is expensive and most countries refuse a student visa unless you can show you won't become a burden on their health system. It is a hard requirement, not a recommendation.",
    howToGet: [
      "Check whether your destination requires a national scheme, an approved private plan, or a surcharge paid with the application.",
      "Buy cover for the gap before enrolment, then switch to statutory/student cover if required after arrival.",
      "Keep the policy document and proof of payment for the visa file.",
    ],
    tips: [
      "Make sure the coverage level (and any no-co-payment rule, e.g. Spain) matches the visa requirement exactly.",
      "Buy travel/incoming cover that starts on your travel date so there's no gap.",
    ],
    mistakes: [
      "Buying a plan that doesn't meet the country's minimum coverage or duration rules.",
      "Assuming arrival-day cover is enough when continuous cover is required.",
    ],
  },
  "language-proof": {
    whatItIs:
      "Evidence you can study in the language of instruction — usually an English test (IELTS, TOEFL, PTE, Duolingo) for English-taught programmes, or a local-language certificate (TestDaF, DELF, TOPIK, JLPT, etc.) for programmes taught in the local language.",
    why: "Universities and immigration authorities both want assurance you can follow the course and function day to day. The required test and score are set by the programme, and the visa often relies on the same evidence.",
    howToGet: [
      "Confirm which tests your programme accepts and the minimum overall and per-section scores.",
      "Book the test early — seats fill up and results can take up to two weeks.",
      "Sit the test (or a re-sit if needed) so a valid score is ready before admission deadlines.",
    ],
    tips: [
      "Check the score validity window — most tests are valid for two years.",
      "Some universities waive the test if your prior education was in English; ask before paying.",
      "The Duolingo English Test is cheaper and faster, but confirm your university accepts it.",
    ],
    mistakes: [
      "Meeting the overall score but missing a per-section minimum.",
      "Booking too late, so results arrive after the admission or visa deadline.",
    ],
  },
  passport: {
    whatItIs:
      "A valid travel document covering your intended stay. Many countries also require validity for a buffer beyond your course end date (commonly six months) and blank pages for the visa.",
    why: "The visa is issued into your passport and your identity is verified against it. An expiring or damaged passport will stop the application.",
    howToGet: [
      "Check your passport's expiry against the destination's validity rule and renew early if needed.",
      "Make sure there are enough blank visa pages.",
      "Keep the biographic-page details consistent with every other document you submit.",
    ],
    tips: ["Renew well ahead — passport renewals in some countries take weeks or months.", "Carry certified copies and keep a scan in the cloud."],
    mistakes: ["Applying with a passport that expires during the course.", "Name spelling mismatches between passport and admission documents."],
  },
  "money-transfer": {
    whatItIs:
      "Moving tuition, deposits or proof-of-funds money across borders. Bank wires often carry poor exchange rates and high fees; specialist providers move money at the real rate for less.",
    why: "International students lose meaningful amounts to FX margins and wire fees. Choosing the right method keeps more of your money and creates a clean, traceable paper trail for the visa.",
    howToGet: [
      "Compare your bank's all-in rate against a specialist provider before sending.",
      "Send from an account in your name so the transfer is traceable for the visa file.",
      "Keep transfer receipts as evidence of how funds reached the destination.",
    ],
    tips: ["Avoid cash deposits that can't be traced to a source.", "Lock in rates early for large tuition payments if the provider allows it."],
    mistakes: ["Losing 3–5% to bank FX margins unnecessarily.", "Using third-party accounts that complicate the funds trail."],
  },
  esim: {
    whatItIs: "A digital SIM you can install before you fly, giving you a working number and mobile data the moment you land.",
    why: "You'll need connectivity immediately for airport transfers, city registration, opening a bank account and contacting your university — before you can arrange a local SIM.",
    howToGet: ["Check your phone supports eSIM.", "Buy a plan for your destination before departure.", "Activate it on arrival and switch to a local plan later if cheaper."],
    tips: ["Keep your home number active for OTPs from your bank during setup."],
    mistakes: ["Landing with no connectivity and no way to verify accounts or call your accommodation."],
  },
  accommodation: {
    whatItIs: "Where you will live in the destination. Some consulates require proof of accommodation (a tenancy agreement or dorm confirmation) as part of the visa file.",
    why: "It demonstrates you've planned your stay, and in several countries it's a documented visa requirement. Student housing is also genuinely scarce in many cities.",
    howToGet: ["Apply for university dorms early, or book verified private student housing.", "Get a signed tenancy agreement or dorm confirmation for the visa file.", "Budget for a deposit plus first month's rent."],
    tips: ["Book before arrival in scarce markets (Netherlands, Ireland, major capitals).", "Beware rental scams asking for money before any contract."],
    mistakes: ["Leaving housing until arrival in a tight market.", "Paying deposits without a verifiable contract."],
  },
  aps: {
    whatItIs: "An Academic Evaluation Centre (APS) certificate verifies that your prior qualifications are genuine and sufficient. It's mandatory for applicants from certain countries (e.g. India, China, Vietnam, Pakistan) before a German student visa.",
    why: "Germany uses APS to pre-check credentials and cut fraud. Without it, nationals of affected countries cannot lodge the visa application.",
    howToGet: ["Check whether your nationality requires APS for Germany.", "Submit your documents to the APS office serving your country and pay the fee.", "Attend an interview if required and collect the certificate."],
    tips: ["Start APS early — it can take several weeks and is a prerequisite for the visa."],
    mistakes: ["Booking the visa appointment before the APS certificate is ready."],
  },
  medical: {
    whatItIs: "A medical examination, chest X-ray or fitness test required by some countries depending on your nationality and length of stay.",
    why: "Destinations screen for public-health risks (e.g. tuberculosis) before granting longer stays. Skipping it where required will stall the visa or residency.",
    howToGet: ["Check if your nationality/stay length triggers the requirement.", "Book with a panel physician or clinic approved by the destination authority.", "Carry the sealed results to your appointment or arrival."],
    tips: ["Use only approved clinics — results from non-approved providers are rejected."],
    mistakes: ["Using a non-approved clinic, or scheduling too late for the result to be ready."],
  },
  biometrics: {
    whatItIs: "Fingerprints and a photo collected at a Visa Application Centre as part of the application.",
    why: "Biometrics tie the application to your identity and are mandatory for most applicants in countries like Canada and the UK.",
    howToGet: ["Pay the biometrics fee with the application.", "Book an appointment at an official Visa Application Centre.", "Attend in person with your passport and confirmation letter."],
    tips: ["Book the biometrics slot as soon as you submit — availability varies."],
    mistakes: ["Forgetting biometrics are separate from the online application and have their own appointment."],
  },
  "admission-test": {
    whatItIs: "A standardised graduate admission test — the GRE for many quantitative Master's programmes, or the GMAT (or GRE) for MBAs.",
    why: "Selective programmes use these scores to compare applicants from different education systems. Where required or recommended, a competitive score strengthens admission.",
    howToGet: ["Check whether your target programme requires, recommends, or waives the test.", "Prepare and book a test date so the score is ready before the deadline.", "Send the official score report to your programmes."],
    tips: ["Many programmes publish a typical score range — aim for it.", "Some waive the test for strong academic records or work experience."],
    mistakes: ["Assuming a waiver without confirming it in writing.", "Booking too late to report scores before deadlines."],
  },
  "work-experience": {
    whatItIs: "Relevant professional experience, typically expected for MBA admission (often two or more years of full-time work).",
    why: "MBA cohorts are built around peer learning, so admissions weigh the quality and length of your work record alongside academics.",
    howToGet: ["Document your roles, dates and responsibilities.", "Gather references who can speak to your impact.", "Frame your experience around leadership and goals in your essays."],
    tips: ["Quality and progression matter more than raw years."],
    mistakes: ["Listing duties without demonstrating impact or growth."],
  },
  "research-proposal": {
    whatItIs: "A proposal outlining the research you intend to pursue for a PhD, usually paired with a prospective supervisor who agrees to take you on.",
    why: "PhD admission hinges on supervisor fit and a fundable, feasible project far more than a fixed checklist.",
    howToGet: ["Identify supervisors whose work aligns with your interests.", "Draft a focused proposal (problem, method, contribution, feasibility).", "Contact supervisors early to secure interest before formally applying."],
    tips: ["A confirmed supervisor and funding source dramatically improve your odds."],
    mistakes: ["Sending generic proposals with no supervisor contact."],
  },
  "police-record": {
    whatItIs: "A criminal-record or police-clearance certificate, often legalised/apostilled, required for longer stays in several countries.",
    why: "Destinations screen for serious criminal history before granting residence. Where required, the visa cannot proceed without it.",
    howToGet: ["Request the certificate from the issuing authority in your country (and any country you've lived in long-term).", "Get it apostilled/legalised if required.", "Provide a certified translation if it's not in an accepted language."],
    tips: ["Start early — issuance plus apostille can take weeks."],
    mistakes: ["Forgetting apostille/legalisation, or missing a country you lived in."],
  },
  sevis: {
    whatItIs: "The I-901 SEVIS fee (USD 350 for F-1) funds the U.S. system that tracks international students. It must be paid before your visa interview.",
    why: "Your F/M visa cannot be issued until the SEVIS fee is paid and linked to your I-20 record.",
    howToGet: ["Get your I-20 from your SEVP-certified school.", "Pay the I-901 fee online using the SEVIS ID on your I-20.", "Keep the payment receipt for your interview."],
    tips: ["Pay at least a few days before the interview so the system updates."],
    mistakes: ["Arriving at the interview without proof of the SEVIS payment."],
  },
  ds160: {
    whatItIs: "The DS-160 is the U.S. online nonimmigrant visa application; you complete it, pay the visa fee, and attend an embassy interview.",
    why: "It's the formal visa application for the USA — the interview and decision are based on it plus your I-20 and funds.",
    howToGet: ["Complete the DS-160 accurately and print the confirmation.", "Pay the visa application fee and book an interview.", "Attend with your I-20, SEVIS receipt, funds evidence and academic documents."],
    tips: ["Answer consistently with your I-20 and funds evidence."],
    mistakes: ["Inconsistencies between the DS-160, I-20 and financial documents."],
  },
  "emirates-id": {
    whatItIs: "The Emirates ID is the UAE national identity card; international students register for it as part of obtaining residency.",
    why: "It's central to legal residence in the UAE and needed for many everyday services.",
    howToGet: ["Complete the medical fitness test.", "Apply for the Emirates ID alongside the residence visa.", "Provide biometrics at the registration centre."],
    tips: ["Your university usually coordinates these residency steps — follow their timeline."],
    mistakes: ["Missing residency deadlines after arrival."],
  },
  "onward-travel": {
    whatItIs: "Evidence you can leave the country at the end of your studies — a return/onward ticket or sufficient funds to buy one (notably required by New Zealand).",
    why: "It reassures immigration that you intend to comply with your visa conditions and depart when required.",
    howToGet: ["Keep funds available specifically for onward travel where required.", "Or hold a flexible onward ticket."],
    tips: ["Check whether onward-travel funds are on top of the living-cost figure."],
    mistakes: ["Counting the same money twice for living costs and onward travel."],
  },
  "prior-qualification": {
    whatItIs: "A completed qualification at the level below your target programme, recognised as equivalent in the destination — a school-leaving certificate for a Bachelor's, a Bachelor's for a Master's, a Master's for most PhDs.",
    why: "Admission depends on holding the right prior qualification at a recognised standard; equivalence is checked for non-local degrees.",
    howToGet: ["Confirm your qualification is recognised as equivalent (some systems require a credential evaluation).", "Prepare certified copies and translations.", "Address any foundation-year requirement for shorter schooling systems."],
    tips: ["Credential recognition (e.g. uni-assist, WES) can take weeks — start early."],
    mistakes: ["Assuming equivalence without checking the destination's recognition rules."],
  },
  "minimum-grade": {
    whatItIs: "The academic threshold the programme sets — for example a UK 2:1, a German grade conversion, or a GPA cut-off.",
    why: "It's a primary admission filter; meeting it is necessary (though not always sufficient) to be considered.",
    howToGet: ["Find the exact threshold on the programme page.", "Convert your grades to the destination's scale to check you qualify.", "Strengthen a borderline application with test scores or relevant experience."],
    tips: ["Grade-conversion tools are indicative — the university's own conversion is what counts."],
    mistakes: ["Relying on an unofficial conversion that overstates your grade."],
  },
  transcripts: {
    whatItIs: "Official academic transcripts and degree/graduation certificates, often with certified translations and sometimes a formal credential evaluation.",
    why: "They prove what you studied and how you performed — the core evidence behind any admission decision.",
    howToGet: ["Request official transcripts from your institution.", "Obtain certified translations if not in an accepted language.", "Order a credential evaluation where the destination requires one."],
    tips: ["Order several certified copies — multiple applications each need originals."],
    mistakes: ["Submitting unofficial or untranslated documents."],
  },
  "motivation-letter": {
    whatItIs: "A statement of purpose explaining your background, why this specific programme, and your goals.",
    why: "It's where you turn a list of grades into a coherent case for admission and fit — often decisive between similar applicants.",
    howToGet: ["Research the programme's strengths and name specific modules/faculty.", "Connect your past, the programme, and your future plan.", "Edit ruthlessly and have someone proofread it."],
    tips: ["Tailor each letter — generic statements are obvious and weak."],
    mistakes: ["Reusing one generic letter across programmes."],
  },
  "recommendation-letters": {
    whatItIs: "One to three references (academic or professional, depending on level) who can speak credibly to your ability.",
    why: "They provide independent validation of your record and potential, which admissions committees weigh heavily.",
    howToGet: ["Choose referees who know your work well.", "Give them your CV, the programme details and plenty of time.", "Follow up politely before deadlines."],
    tips: ["A specific, enthusiastic letter beats a senior but generic one."],
    mistakes: ["Asking a big name who barely knows you."],
  },
  cv: {
    whatItIs: "An up-to-date academic/professional CV summarising your education, experience, skills and achievements.",
    why: "It gives admissions a fast, structured overview and supports your statement and references.",
    howToGet: ["Keep it concise and relevant to the programme.", "Quantify achievements where possible.", "Use a clean, consistent format."],
    tips: ["Mirror the language of the programme's focus areas."],
    mistakes: ["Padding with irrelevant detail or leaving gaps unexplained."],
  },
  "application-fee": {
    whatItIs: "A non-refundable fee many universities charge to process an application.",
    why: "It's a gate to submission; an unpaid fee means an incomplete application.",
    howToGet: ["Budget for fees across all the programmes you apply to.", "Pay with a low-FX method if applying from abroad.", "Check for fee waivers you may qualify for."],
    tips: ["Some universities waive fees for early or scholarship applicants."],
    mistakes: ["Missing a waiver you qualified for, or paying high card-FX fees."],
  },
  pal: {
    whatItIs: "A Provincial/Territorial Attestation Letter (PAL/TAL) confirms your study-permit application counts within a province's cap. Most Canadian applicants now need one.",
    why: "Canada caps study-permit intake by province; without a PAL/TAL (where required) the application is returned.",
    howToGet: ["Accept your offer from a designated learning institution.", "The institution/province issues your PAL/TAL.", "Include it in your study-permit application."],
    tips: ["Confirm your situation actually requires a PAL/TAL before applying."],
    mistakes: ["Submitting the permit application without the PAL/TAL where it's required."],
  },
  mvv: {
    whatItIs: "An MVV (provisional residence permit / entry visa) that non-EU nationals usually need to enter the Netherlands, arranged together with the residence permit via the TEV procedure.",
    why: "It's the legal entry document for longer stays; your Dutch institution typically applies on your behalf.",
    howToGet: ["Your recognised-sponsor institution lodges the TEV/MVV application.", "Collect the MVV at the embassy after approval.", "Enter the Netherlands and complete residence formalities."],
    tips: ["Check whether your nationality is MVV-exempt before assuming you need one."],
    mistakes: ["Booking travel before the MVV is approved."],
  },
  etudes: {
    whatItIs: "The 'Études en France' procedure run through Campus France, mandatory before a French student visa for nationals of connected countries.",
    why: "France routes admission and pre-visa steps for many countries through this platform; skipping it blocks the visa.",
    howToGet: ["Create an Études en France account.", "Complete your academic profile and pay the Campus France fee.", "Attend the Campus France interview, then book the visa."],
    tips: ["Start early — the procedure has its own timeline ahead of the visa."],
    mistakes: ["Treating it as optional when your nationality is connected to the platform."],
  },
  atas: {
    whatItIs: "An Academic Technology Approval Scheme (ATAS) certificate, required for certain sensitive science and technology subjects in the UK.",
    why: "The UK screens specified advanced subjects for security reasons; affected courses can't proceed without ATAS.",
    howToGet: ["Check if your course's CAH3 code requires ATAS.", "Apply online with your course and research details.", "Allow several weeks for the certificate before the visa."],
    tips: ["Your university CAS usually states whether ATAS is needed."],
    mistakes: ["Leaving ATAS late — it can take weeks and blocks the visa."],
  },
  "tb-test": {
    whatItIs: "A tuberculosis test certificate from an approved clinic, required if you're resident in a listed country.",
    why: "Several countries require TB screening before longer stays as a public-health measure.",
    howToGet: ["Check if your country of residence is on the destination's TB-testing list.", "Book with an approved clinic only.", "Carry the certificate for the application or arrival."],
    tips: ["Only approved-clinic results are accepted."],
    mistakes: ["Testing at a non-approved clinic, so the certificate is rejected."],
  },
  "genuine-student": {
    whatItIs:
      "A test of whether you genuinely intend to study (and comply with your visa), assessed from a written statement and your overall profile. Australia uses the Genuine Student (GS) requirement; other countries judge similar 'genuine temporary entrant' intent.",
    why: "Authorities want evidence that study is your real purpose and that you'll follow your visa conditions. A weak or inconsistent statement is a common refusal reason even when documents are in order.",
    howToGet: [
      "Answer the official GS questions in writing — your ties, why this course and provider, and how it fits your goals.",
      "Make your study plan coherent with your background and finances.",
      "Keep every claim consistent with your other documents.",
    ],
    tips: [
      "Be specific about why this exact course and institution, not just the country.",
      "Explain any gaps, changes of field, or unusual choices up front.",
    ],
    mistakes: [
      "Generic, templated statements that could apply to anyone.",
      "Claims that contradict your finances, age or academic history.",
    ],
  },
  "tuition-paid": {
    whatItIs: "Evidence that course fees (or a required first instalment) have been paid, which some countries want before granting the visa or permit.",
    why: "It confirms your place is secured and reduces the funds you must otherwise prove for living costs.",
    howToGet: ["Pay the required tuition/instalment to the institution.", "Keep the official receipt for the visa file.", "Transfer with a low-FX method to save on fees."],
    tips: ["Paying tuition can lower the separate proof-of-funds figure in some countries."],
    mistakes: ["Paying into an unverifiable account or losing the receipt."],
  },
};
