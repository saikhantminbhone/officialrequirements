import type { RequirementRecord } from "@/lib/req-data/types";

// Timeline planner: works backwards from an intake date to dated milestones
// (test booking, APS, blocked account, visa appointment). Deterministic and
// server-renderable.

export interface TimelineInput {
  intakeDate: string; // ISO date the programme starts
  apsRequired?: boolean;
}

export interface Milestone {
  key: string;
  label: string;
  date: string; // ISO
  weeksBeforeIntake: number;
  detail: string;
}

function minusWeeks(iso: string, weeks: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() - weeks * 7);
  return d.toISOString().slice(0, 10);
}

export function planTimeline(record: RequirementRecord, input: TimelineInput): Milestone[] {
  const processingWeeks = record.toolDefaults?.processingWeeks ?? 8;
  const milestones: Array<Omit<Milestone, "date">> = [
    { key: "english-test", label: "Book & sit English/German test", weeksBeforeIntake: 36, detail: "Results can take 2 weeks; book early so scores are ready for admission." },
    { key: "admission", label: "Submit university applications", weeksBeforeIntake: 28, detail: "Deadlines often fall 1–2 intakes ahead; confirm the programme's exact cut-off." },
  ];

  if (input.apsRequired) {
    milestones.push({ key: "aps", label: "Obtain APS certificate", weeksBeforeIntake: 26, detail: "APS verification is mandatory for your nationality and must precede the visa application." });
  }

  milestones.push(
    { key: "admission-letter", label: "Receive admission letter", weeksBeforeIntake: 18, detail: "You need this before the blocked account and visa steps." },
    { key: "blocked-account", label: "Open blocked account & insurance", weeksBeforeIntake: 16, detail: "Fund the account to the annual minimum and arrange incoming health insurance." },
    { key: "visa-appointment", label: "Book visa appointment", weeksBeforeIntake: processingWeeks + 4, detail: "Embassy slots are scarce — book as soon as you have the admission letter." },
    { key: "visa-decision", label: "Visa processing buffer ends", weeksBeforeIntake: 2, detail: `Allow ~${processingWeeks} weeks for a decision; keep a 2-week buffer before travel.` },
    { key: "arrival", label: "Travel & arrival (eSIM, Anmeldung)", weeksBeforeIntake: 1, detail: "Arrive ~1 week early for city registration and bank setup." }
  );

  return milestones
    .map((m) => ({ ...m, date: minusWeeks(input.intakeDate, m.weeksBeforeIntake) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}
