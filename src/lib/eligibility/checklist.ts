import type { RequirementRecord, RequirementItem, AffiliateTag } from "@/lib/req-data/types";

// Document-checklist generator: turns a requirement record + a few user answers
// into a personalized, trackable, source-linked checklist. Server-rendered so
// the output is real text to Google (anti-thin-page), then made interactive
// client-side.

export interface ChecklistInput {
  apsRequired?: boolean;
  programmeLanguage?: "english" | "german";
  transferringFunds?: boolean;
}

export interface ChecklistEntry {
  key: string;
  label: string;
  detail: string;
  required: boolean;
  affiliateTag?: AffiliateTag;
}

function itemApplies(item: RequirementItem, input: ChecklistInput): boolean {
  if (!item.appliesIf) return true;
  return Object.entries(item.appliesIf).every(([field, expected]) => {
    const actual = (input as Record<string, unknown>)[field];
    return actual === expected;
  });
}

export function generateChecklist(record: RequirementRecord, input: ChecklistInput): ChecklistEntry[] {
  return record.requirements
    .filter((item) => {
      // Drop the money-transfer line unless the user says they're transferring.
      if (item.key === "tuition-transfer" && !input.transferringFunds) return false;
      return itemApplies(item, input);
    })
    .map((item) => ({
      key: item.key,
      label: item.label,
      detail: item.detail,
      required: item.key === "aps-certificate" ? Boolean(input.apsRequired) : item.required,
      affiliateTag: item.affiliateTag,
    }));
}

/** Affiliate tags present in a checklist, ordered by appearance — drives intent-peak offers. */
export function affiliateTagsFor(entries: ChecklistEntry[]): AffiliateTag[] {
  const seen = new Set<AffiliateTag>();
  entries.forEach((e) => e.affiliateTag && seen.add(e.affiliateTag));
  return [...seen];
}
