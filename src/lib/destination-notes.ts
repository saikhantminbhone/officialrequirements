// ─────────────────────────────────────────────────────────────────────────
// Curated, hand-authored "what's distinctive" notes per destination.
//
// The generated overview is necessarily templated; THIS is the unique,
// country-specific content that stops visa pages from reading like scaled
// content. Each entry names the things that genuinely set that country's process
// apart (its visa name, its signature requirement, its post-study route). Facts
// here are stable structural ones; exact figures still live on the official source.
// ─────────────────────────────────────────────────────────────────────────

export interface DestinationNote {
  visaName: string;
  distinctive: string[]; // the things that make this country's process unique
}

const NOTES: Record<string, DestinationNote> = {
  de: {
    visaName: "national (D) student visa / residence permit",
    distinctive: [
      "Most public universities charge little or no tuition — your main cost is living, not fees.",
      "Applicants from certain countries must obtain an APS certificate before they can even apply.",
      "Funds are typically shown via a blocked account (Sperrkonto) that releases a fixed sum each month.",
      "After graduating you can stay on an 18-month residence permit to look for relevant work.",
    ],
  },
  gb: {
    visaName: "Student visa (formerly Tier 4)",
    distinctive: [
      "You apply against a CAS issued by a licensed student sponsor — no CAS, no application.",
      "The Immigration Health Surcharge is paid up front and gives access to the NHS.",
      "Some science and technology courses also require an ATAS certificate.",
      "The Graduate Route lets most graduates stay two years (three for PhDs) to work.",
    ],
  },
  ca: {
    visaName: "study permit",
    distinctive: [
      "Most applicants now need a Provincial/Territorial Attestation Letter (PAL/TAL) within a provincial cap.",
      "Proof of funds is a defined amount on top of tuition, and the figure is set nationally.",
      "Biometrics are part of the application for most nationalities.",
      "The Post-Graduation Work Permit (PGWP) is a major draw for graduates.",
    ],
  },
  au: {
    visaName: "Student visa (subclass 500)",
    distinctive: [
      "The Genuine Student (GS) requirement assesses, in writing, whether study is your real purpose.",
      "Overseas Student Health Cover (OSHC) is compulsory for the visa.",
      "You apply against a Confirmation of Enrolment (CoE) from your provider.",
      "Graduates can apply for a Temporary Graduate visa (subclass 485) to work.",
    ],
  },
  us: {
    visaName: "F-1 student visa",
    distinctive: [
      "There is no single fixed proof-of-funds figure — it's set by your school's I-20.",
      "You pay the I-901 SEVIS fee and complete the DS-160 before an embassy interview.",
      "The visa interview itself is a decisive step, unlike many other countries.",
      "Optional Practical Training (OPT) lets graduates work in their field afterwards.",
    ],
  },
  nl: {
    visaName: "MVV entry visa + residence permit (TEV)",
    distinctive: [
      "Your recognised-sponsor institution usually lodges the MVV/residence application for you.",
      "Proof of financial means is shown to the institution, often by transferring it to them.",
      "An 'orientation year' permit lets graduates stay to find work.",
    ],
  },
  fr: {
    visaName: "VLS-TS long-stay student visa",
    distinctive: [
      "Nationals of many countries must complete the 'Études en France' procedure via Campus France first.",
      "The long-stay visa is validated as a residence permit shortly after you arrive.",
      "An APS (autorisation provisoire de séjour) lets graduates stay to seek work.",
    ],
  },
  ie: {
    visaName: "Irish study visa (long stay 'D')",
    distinctive: [
      "You show evidence of finances plus private medical insurance.",
      "Non-EU students register with immigration (IRP) after arrival.",
      "The Third Level Graduate Programme lets graduates stay to work.",
    ],
  },
};

export function getDestinationNote(code: string): DestinationNote | undefined {
  return NOTES[code];
}
