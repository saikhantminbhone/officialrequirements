// ─────────────────────────────────────────────────────────────────────────
// Visa-type registry — the expansion axis for "every country, every visa type".
//
// The site launched with the student visa fully built (the matrix of
// nationality × destination). This registry defines the other types so the
// crawler + source registry can target them and pages can be generated as real
// data is sourced. We deliberately do NOT auto-generate thin work/tourist pages
// without data — that's the scaled-content trap. Each type is "live" only once
// its data layer is seeded; until then it's a planned expansion slot.
// ─────────────────────────────────────────────────────────────────────────

export interface VisaType {
  slug: string;
  name: string;
  /** URL category segment used in routes (student visa uses "student-visa"). */
  category: string;
  description: string;
  status: "live" | "planned";
}

export const VISA_TYPES: VisaType[] = [
  {
    slug: "student",
    name: "Student visa",
    category: "student-visa",
    description: "Study at a recognised institution — the flagship vertical, fully built across nationalities and destinations.",
    status: "live",
  },
  {
    slug: "work",
    name: "Work visa",
    category: "work-visa",
    description: "Employment-based permits (skilled worker, post-study work). Planned — fills as official sources are crawled.",
    status: "planned",
  },
  {
    slug: "visitor",
    name: "Visitor / tourist visa",
    category: "visitor-visa",
    description: "Short-stay tourism/visit permits. Planned expansion slot.",
    status: "planned",
  },
  {
    slug: "dependent",
    name: "Dependent / family visa",
    category: "dependent-visa",
    description: "Permits for spouses and children of students/workers. Planned expansion slot.",
    status: "planned",
  },
];

export function liveVisaTypes(): VisaType[] {
  return VISA_TYPES.filter((v) => v.status === "live");
}

export function getVisaType(slug: string): VisaType | undefined {
  return VISA_TYPES.find((v) => v.slug === slug);
}
