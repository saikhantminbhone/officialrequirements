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
];

export function getUniversity(slug: string): NamedUniversity | undefined {
  return UNIVERSITIES.find((u) => u.slug === slug);
}

export function universitiesForDestination(code: string): NamedUniversity[] {
  return UNIVERSITIES.filter((u) => u.destination === code);
}
