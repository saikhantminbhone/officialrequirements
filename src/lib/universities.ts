// ─────────────────────────────────────────────────────────────────────────
// Named-university database (framework + curated seed).
//
// Each entry is hand-authored with content unique to that institution — not a
// template — so these pages carry real value (the critique's #1 fix). Facts are
// stable structural ones; figures that change (exact scores, fees) are framed as
// "typical / confirm on the official page". Add a record here and a fully-formed,
// linked page appears. Later these can be overridden from R2 like other data.
// ─────────────────────────────────────────────────────────────────────────

export interface NamedUniversity {
  slug: string;
  name: string;
  destination: string; // ISO code, ties into the country cluster
  city: string;
  type: "public" | "private";
  summary: string;
  distinctive: string[]; // unique, authored bullets
  facts: { label: string; value: string }[];
  programs: { name: string; programSlug?: string }[]; // link to admission archetype
  checklist: string[];
  timeline: { step: string; when: string }[];
  source: { name: string; url: string };
  lastVerified: string;
}

const V = "2026-06-20";

export const UNIVERSITIES: NamedUniversity[] = [
  {
    slug: "tu-berlin",
    name: "Technische Universität Berlin",
    destination: "de",
    city: "Berlin",
    type: "public",
    summary:
      "TU Berlin is one of Germany's largest technical universities, strong in engineering, computer science and planning, in the heart of Berlin's startup scene.",
    distinctive: [
      "As a public university there are no tuition fees — you pay only a modest semester contribution.",
      "Several Master's are taught in English; many Bachelor's are German-taught, so language proof must match the programme.",
      "Competitive programmes can carry a numerus clausus (NC) — admission depends on your grade in a limited cohort, not a fixed acceptance rate.",
      "Applications for international qualifications often route through uni-assist for pre-checking.",
    ],
    facts: [
      { label: "Type", value: "Public · no tuition (semester fee only)" },
      { label: "English requirement", value: "Typically IELTS 6.5 / TOEFL 88 for English Master's — confirm per programme" },
      { label: "Admission basis", value: "Meeting requirements + grade (NC where capped)" },
      { label: "Application route", value: "uni-assist or direct, by programme" },
    ],
    programs: [
      { name: "MSc Computer Science", programSlug: "msc-computer-science" },
      { name: "MSc Data Science", programSlug: "msc-data-science" },
      { name: "MBA / Management", programSlug: "mba" },
    ],
    checklist: [
      "Recognised Bachelor's in a related field (checked for equivalence, often via uni-assist)",
      "Grade/GPA meeting the programme threshold",
      "English (or German) language certificate at the programme's level",
      "Transcripts and degree certificate with certified translations",
      "CV and motivation letter tailored to the programme",
      "APS certificate if your nationality requires it",
    ],
    timeline: [
      { step: "Check programme + language requirements", when: "9–12 months before" },
      { step: "Sit IELTS/TOEFL; start APS if required", when: "8–10 months before" },
      { step: "Submit application (uni-assist/direct)", when: "by the programme deadline" },
      { step: "Accept offer, open blocked account, apply for visa", when: "3–4 months before" },
    ],
    source: { name: "TU Berlin — International Students", url: "https://www.tu.berlin/en/studying" },
    lastVerified: V,
  },
  {
    slug: "rwth-aachen",
    name: "RWTH Aachen University",
    destination: "de",
    city: "Aachen",
    type: "public",
    summary:
      "RWTH Aachen is Germany's leading engineering university, renowned for mechanical, electrical and software engineering, with deep industry links.",
    distinctive: [
      "An engineering powerhouse — its mechanical and electrical engineering programmes are among Europe's most respected.",
      "Offers English-taught Master's such as Software Systems Engineering; check each programme's language of instruction.",
      "No tuition fees as a public university; a semester fee covers administration and a transport pass.",
      "Some programmes require a specific prior background and may have additional aptitude steps.",
    ],
    facts: [
      { label: "Type", value: "Public · no tuition (semester fee only)" },
      { label: "English requirement", value: "Typically IELTS 6.5 / TOEFL 90 for English Master's — confirm per programme" },
      { label: "Standout fields", value: "Mechanical, electrical & software engineering" },
      { label: "Application route", value: "uni-assist or RWTHonline, by programme" },
    ],
    programs: [
      { name: "MSc Software Systems Engineering", programSlug: "msc-computer-science" },
      { name: "MSc Data Science", programSlug: "msc-data-science" },
      { name: "PhD / Doctoral study", programSlug: "phd" },
    ],
    checklist: [
      "Recognised Bachelor's in a closely-related field (equivalence checked)",
      "Strong grade/GPA — engineering programmes are competitive",
      "English certificate at the programme's level (or German where required)",
      "Transcripts, degree certificate and certified translations",
      "CV, motivation letter, and references where requested",
      "APS certificate if your nationality requires it",
    ],
    timeline: [
      { step: "Shortlist programmes, confirm prerequisites", when: "10–12 months before" },
      { step: "English test; begin APS if required", when: "8–10 months before" },
      { step: "Apply via uni-assist / RWTHonline", when: "by the deadline" },
      { step: "Offer, blocked account, visa appointment", when: "3–4 months before" },
    ],
    source: { name: "RWTH Aachen — International", url: "https://www.rwth-aachen.de/go/id/a/?lidx=1" },
    lastVerified: V,
  },
  {
    slug: "lmu-munich",
    name: "Ludwig Maximilian University of Munich (LMU)",
    destination: "de",
    city: "Munich",
    type: "public",
    summary:
      "LMU Munich is one of Europe's leading research universities, broad across the sciences, humanities, law and medicine.",
    distinctive: [
      "A comprehensive research university — strong well beyond engineering, including natural sciences, humanities and law.",
      "Many Bachelor's are taught in German; a growing set of Master's are English-taught.",
      "Public university: no tuition, only a semester contribution.",
      "Highly sought-after, so meeting the minimum rarely guarantees a place in capped subjects.",
    ],
    facts: [
      { label: "Type", value: "Public · no tuition (semester fee only)" },
      { label: "English requirement", value: "Programme-dependent; German certificate for German-taught courses" },
      { label: "Standout fields", value: "Sciences, humanities, law, medicine" },
      { label: "Application route", value: "uni-assist or direct, by programme" },
    ],
    programs: [
      { name: "MSc programmes", programSlug: "msc-computer-science" },
      { name: "MSc Data Science", programSlug: "msc-data-science" },
      { name: "PhD / Doctoral study", programSlug: "phd" },
    ],
    checklist: [
      "Recognised prior qualification at the right level",
      "Grade meeting the programme threshold (NC where applicable)",
      "Language certificate matching the language of instruction",
      "Transcripts and certified translations",
      "Motivation letter and CV",
      "APS certificate if your nationality requires it",
    ],
    timeline: [
      { step: "Confirm language of instruction + requirements", when: "9–12 months before" },
      { step: "Language test; APS if required", when: "8–10 months before" },
      { step: "Submit application", when: "by the deadline" },
      { step: "Offer, funds, visa", when: "3–4 months before" },
    ],
    source: { name: "LMU Munich — International", url: "https://www.lmu.de/en/study/" },
    lastVerified: V,
  },
  {
    slug: "university-of-amsterdam",
    name: "University of Amsterdam (UvA)",
    destination: "nl",
    city: "Amsterdam",
    type: "public",
    summary:
      "The University of Amsterdam is the Netherlands' largest research university, with a wide range of English-taught Bachelor's and Master's.",
    distinctive: [
      "One of the most internationally-oriented Dutch universities — many programmes are fully English-taught.",
      "Popular Bachelor's can be numerus fixus (capped), with a selection procedure and early deadlines.",
      "As a recognised sponsor, the university usually arranges your MVV/residence permit for you.",
      "Tuition is higher for non-EU students than at German publics, but funding and Holland Scholarships exist.",
    ],
    facts: [
      { label: "Type", value: "Public · tuition applies (non-EU rate higher)" },
      { label: "English requirement", value: "Typically IELTS 6.5 / TOEFL 92 — confirm per programme" },
      { label: "Admission note", value: "Numerus fixus + early deadlines for some Bachelor's" },
      { label: "Residence permit", value: "Arranged by the university as your recognised sponsor" },
    ],
    programs: [
      { name: "MSc Computer Science", programSlug: "msc-computer-science" },
      { name: "MSc Data Science", programSlug: "msc-data-science" },
      { name: "MBA / Business", programSlug: "mba" },
    ],
    checklist: [
      "Recognised prior qualification meeting the programme bar",
      "English certificate at the required level",
      "Transcripts, certified translations, CV",
      "Motivation letter; portfolio/test for selective programmes",
      "Proof of financial means (often transferred to the university)",
    ],
    timeline: [
      { step: "Check deadlines (numerus fixus is early)", when: "10–12 months before" },
      { step: "English test; prepare documents", when: "8–10 months before" },
      { step: "Apply via Studielink + university portal", when: "by the deadline" },
      { step: "Offer; university arranges MVV/permit", when: "3–4 months before" },
    ],
    source: { name: "University of Amsterdam — International", url: "https://www.uva.nl/en/education" },
    lastVerified: V,
  },
  {
    slug: "university-of-oxford",
    name: "University of Oxford",
    destination: "gb",
    city: "Oxford",
    type: "public",
    summary:
      "Oxford is a collegiate research university and one of the most selective in the world, known for its tutorial teaching and breadth across the humanities and sciences.",
    distinctive: [
      "Collegiate and tutorial-based — you apply to the university and (often) a college, and teaching is in very small groups.",
      "Highly selective: meeting the minimum grades is rarely enough; admissions tests and interviews are common for many courses.",
      "Undergraduate applications go through UCAS with an earlier mid-October deadline than most UK universities.",
      "International tuition is high and varies sharply by course — budget carefully and check funding.",
    ],
    facts: [
      { label: "Type", value: "Public · high international tuition (varies by course)" },
      { label: "English requirement", value: "High — typically IELTS 7.0–7.5 — confirm per course" },
      { label: "Admission basis", value: "Top grades + admissions test/interview for many courses" },
      { label: "Deadline", value: "Earlier than most UK unis (mid-October for undergraduate)" },
    ],
    programs: [
      { name: "MSc programmes", programSlug: "msc-computer-science" },
      { name: "MSc Data Science", programSlug: "msc-data-science" },
      { name: "PhD / DPhil", programSlug: "phd" },
    ],
    checklist: [
      "Outstanding prior academic record meeting the course threshold",
      "Admissions test and/or interview where the course requires it",
      "English certificate at the (high) required level",
      "Transcripts, references and a strong personal statement",
      "Proof of funds for tuition and Oxford's living costs",
    ],
    timeline: [
      { step: "Research course + college, note the early deadline", when: "12+ months before" },
      { step: "Sit any required admissions test; English test", when: "9–11 months before" },
      { step: "Apply (UCAS undergrad / direct postgrad) by deadline", when: "by the deadline" },
      { step: "Interviews, offer, then visa + funds", when: "3–6 months before" },
    ],
    source: { name: "University of Oxford — Admissions", url: "https://www.ox.ac.uk/admissions" },
    lastVerified: V,
  },
  {
    slug: "imperial-college-london",
    name: "Imperial College London",
    destination: "gb",
    city: "London",
    type: "public",
    summary:
      "Imperial is a London-based university focused entirely on science, engineering, medicine and business, with strong industry and research links.",
    distinctive: [
      "STEM-only focus — exceptional for engineering, computing, natural sciences, medicine and business.",
      "Strong quantitative and English requirements; many Master's are competitive and fill early.",
      "Central London location means higher living costs — factor this into your proof of funds.",
      "Graduate Route lets most graduates stay to work after finishing.",
    ],
    facts: [
      { label: "Type", value: "Public · high international tuition" },
      { label: "English requirement", value: "Typically IELTS 6.5–7.0 — confirm per programme" },
      { label: "Standout fields", value: "Engineering, computing, medicine, business" },
      { label: "Application route", value: "UCAS (undergrad) / direct (postgrad)" },
    ],
    programs: [
      { name: "MSc Computing", programSlug: "msc-computer-science" },
      { name: "MSc Data Science", programSlug: "msc-data-science" },
      { name: "MBA / Management", programSlug: "mba" },
    ],
    checklist: [
      "Strong quantitative undergraduate degree at the required grade",
      "English certificate at the programme's level",
      "Transcripts, references and a focused statement",
      "GRE/GMAT where a programme requests it",
      "Proof of funds covering tuition and London living costs",
    ],
    timeline: [
      { step: "Shortlist programmes (they fill early)", when: "10–12 months before" },
      { step: "English test; prepare documents", when: "8–10 months before" },
      { step: "Apply as early as the cycle opens", when: "by the deadline" },
      { step: "Offer, then UK visa + IHS + funds", when: "3–4 months before" },
    ],
    source: { name: "Imperial College London — Study", url: "https://www.imperial.ac.uk/study/" },
    lastVerified: V,
  },
  {
    slug: "university-of-toronto",
    name: "University of Toronto",
    destination: "ca",
    city: "Toronto",
    type: "public",
    summary:
      "U of T is Canada's largest research university, consistently top-ranked, with a very wide range of programmes across three campuses.",
    distinctive: [
      "Large, research-intensive and competitive — strong across most fields.",
      "International tuition is among the higher in Canada; budget for it plus Toronto living costs.",
      "Graduates are eligible for the Post-Graduation Work Permit (PGWP), a major draw.",
      "Applications are programme-specific with their own deadlines and supplementary materials.",
    ],
    facts: [
      { label: "Type", value: "Public · high international tuition" },
      { label: "English requirement", value: "Typically IELTS 6.5+ / TOEFL 100 — confirm per programme" },
      { label: "Admission basis", value: "Competitive grades + programme requirements" },
      { label: "After study", value: "PGWP eligible" },
    ],
    programs: [
      { name: "MSc Computer Science", programSlug: "msc-computer-science" },
      { name: "MSc Data Science", programSlug: "msc-data-science" },
      { name: "PhD / Doctoral study", programSlug: "phd" },
    ],
    checklist: [
      "Recognised degree meeting the programme's competitive threshold",
      "English certificate at the required level",
      "Transcripts, references, statement; GRE where requested",
      "Proof of funds (tuition + living) for the study permit",
      "Provincial Attestation Letter (PAL) for the study permit where required",
    ],
    timeline: [
      { step: "Check programme deadlines + requirements", when: "10–12 months before" },
      { step: "English test; gather references", when: "8–10 months before" },
      { step: "Apply via the programme portal", when: "by the deadline" },
      { step: "Offer, PAL, then study permit + funds", when: "3–5 months before" },
    ],
    source: { name: "University of Toronto — Future Students", url: "https://future.utoronto.ca/" },
    lastVerified: V,
  },
  {
    slug: "university-of-melbourne",
    name: "University of Melbourne",
    destination: "au",
    city: "Melbourne",
    type: "public",
    summary:
      "The University of Melbourne is a leading Australian research university known for the 'Melbourne Model' of broad undergraduate degrees feeding specialised graduate study.",
    distinctive: [
      "The 'Melbourne Model' separates broad bachelor's from specialised graduate degrees.",
      "Competitive entry with programme-specific prerequisites and grade thresholds.",
      "The Genuine Student (GS) requirement applies to the student visa, alongside OSHC.",
      "High international tuition and Melbourne living costs — plan your financial capacity.",
    ],
    facts: [
      { label: "Type", value: "Public · high international tuition" },
      { label: "English requirement", value: "Typically IELTS 6.5 (no band < 6.0) — confirm per course" },
      { label: "Admission basis", value: "Competitive grades + prerequisites" },
      { label: "Visa note", value: "GS statement + OSHC required for subclass 500" },
    ],
    programs: [
      { name: "Master's programmes", programSlug: "msc-computer-science" },
      { name: "MSc Data Science", programSlug: "msc-data-science" },
      { name: "MBA / Management", programSlug: "mba" },
    ],
    checklist: [
      "Recognised prior qualification meeting the course threshold",
      "English certificate at the required level",
      "Transcripts, references and any prerequisites",
      "Confirmation of Enrolment (CoE) once you accept",
      "Financial capacity evidence + OSHC for the visa",
    ],
    timeline: [
      { step: "Confirm course prerequisites + intake", when: "10–12 months before" },
      { step: "English test; prepare documents", when: "8–10 months before" },
      { step: "Apply; accept offer and get the CoE", when: "by the deadline" },
      { step: "GS statement, OSHC, then subclass 500 visa", when: "2–4 months before" },
    ],
    source: { name: "University of Melbourne — Study", url: "https://study.unimelb.edu.au/" },
    lastVerified: V,
  },
  {
    slug: "technical-university-of-munich",
    name: "Technical University of Munich (TUM)",
    destination: "de",
    city: "Munich",
    type: "public",
    summary:
      "TUM is one of Europe's top technical universities, strong in engineering, computer science, natural sciences and medicine, with many English-taught Master's.",
    distinctive: [
      "A top technical university with a large catalogue of English-taught Master's.",
      "Note: TUM charges tuition fees for non-EU/EEA students (introduced from winter 2024/25) — confirm the current amount for your programme.",
      "Competitive, with programme-specific aptitude assessments for some courses.",
      "Munich living costs are among Germany's highest — budget your blocked account accordingly.",
    ],
    facts: [
      { label: "Type", value: "Public · tuition fees for non-EU/EEA (since 2024/25)" },
      { label: "English requirement", value: "Typically IELTS 6.5 / TOEFL 88 for English Master's — confirm per programme" },
      { label: "Standout fields", value: "Engineering, computer science, natural sciences" },
      { label: "Application route", value: "TUMonline (+ uni-assist for some)" },
    ],
    programs: [
      { name: "MSc Computer Science / Informatics", programSlug: "msc-computer-science" },
      { name: "MSc Data Science", programSlug: "msc-data-science" },
      { name: "PhD / Doctoral study", programSlug: "phd" },
    ],
    checklist: [
      "Recognised Bachelor's in a closely-related field (equivalence checked)",
      "Strong grade/GPA — programmes are competitive",
      "English (or German) certificate at the programme's level",
      "Transcripts, certified translations, CV, motivation letter",
      "APS certificate if your nationality requires it",
      "Blocked account for the German student visa",
    ],
    timeline: [
      { step: "Shortlist programmes; check tuition + aptitude steps", when: "10–12 months before" },
      { step: "English test; begin APS if required", when: "8–10 months before" },
      { step: "Apply via TUMonline / uni-assist", when: "by the deadline" },
      { step: "Offer, blocked account, visa appointment", when: "3–4 months before" },
    ],
    source: { name: "TUM — Studies", url: "https://www.tum.de/en/studies" },
    lastVerified: V,
  },
];

export function getUniversity(slug: string): NamedUniversity | undefined {
  return UNIVERSITIES.find((u) => u.slug === slug);
}

export function universitiesForDestination(code: string): NamedUniversity[] {
  return UNIVERSITIES.filter((u) => u.destination === code);
}
