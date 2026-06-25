import { getJson, putJson, listKeys, deleteKey, r2Configured } from "@/lib/r2";
import { validateOutcome, summarize, type OutcomeInput, type OutcomeRecord, type OutcomeSummary } from "@/lib/outcomes-core";

export type { OutcomeRecord, OutcomeSummary } from "@/lib/outcomes-core";

// R2 layout: pending submissions await moderation; approved are public.
const PENDING = "data/outcomes/pending/";
const APPROVED = "data/outcomes/approved/";

function id(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Validate + store a submission as PENDING (never public until approved). */
export async function submitOutcome(raw: Partial<OutcomeInput>): Promise<{ ok: boolean; errors?: string[] }> {
  const v = validateOutcome(raw);
  if (!v.ok || !v.clean) return { ok: false, errors: v.errors };
  if (!r2Configured) return { ok: false, errors: ["storage not configured"] };
  const rec: OutcomeRecord = { ...v.clean, id: id(), submittedAt: new Date().toISOString(), status: "pending" };
  await putJson(`${PENDING}${rec.id}.json`, rec);
  return { ok: true };
}

async function loadFrom(prefix: string): Promise<OutcomeRecord[]> {
  if (!r2Configured) return [];
  const keys = await listKeys(prefix);
  const out: OutcomeRecord[] = [];
  for (const k of keys) {
    const r = await getJson<OutcomeRecord>(k);
    if (r) out.push(r);
  }
  return out;
}

export async function pendingOutcomes(): Promise<OutcomeRecord[]> {
  return (await loadFrom(PENDING)).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export async function approvedOutcomes(): Promise<OutcomeRecord[]> {
  return loadFrom(APPROVED);
}

/** Moderation: approve moves pending→approved; reject deletes the pending item. */
export async function moderateOutcome(id: string, action: "approve" | "reject"): Promise<boolean> {
  if (!r2Configured) return false;
  const rec = await getJson<OutcomeRecord>(`${PENDING}${id}.json`);
  if (!rec) return false;
  if (action === "approve") {
    await putJson(`${APPROVED}${id}.json`, { ...rec, status: "approved" });
  }
  await deleteKey(`${PENDING}${id}.json`);
  return true;
}

/** Approved outcomes for a named university (admission), aggregated. */
export async function outcomesForUniversity(slug: string): Promise<{ records: OutcomeRecord[]; summary: OutcomeSummary }> {
  const records = (await approvedOutcomes()).filter((r) => r.type === "admission" && r.university === slug);
  return { records, summary: summarize(records) };
}

/** Approved outcomes for a destination (visa or admission), aggregated. */
export async function outcomesForDestination(code: string): Promise<{ records: OutcomeRecord[]; summary: OutcomeSummary }> {
  const records = (await approvedOutcomes()).filter((r) => r.destination === code);
  return { records, summary: summarize(records) };
}
