"use client";

import { useState } from "react";

const YEAR = new Date().getFullYear();
const YEARS = [YEAR + 1, YEAR, YEAR - 1, YEAR - 2, YEAR - 3];

// Submit an admission/visa outcome. Stored as pending; shown only after an admin
// approves it. Includes a hidden honeypot field that bots fill and humans don't.
export default function OutcomeForm({ defaultUniversity, defaultDestination }: { defaultUniversity?: string; defaultDestination?: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("saving");
    setErrors([]);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/outcomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setState("done");
      } else {
        setErrors(json.errors ?? ["Something went wrong."]);
        setState("error");
      }
    } catch {
      setErrors(["Network error."]);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="card p-6 text-sm text-slate-700">
        <div className="font-semibold text-trust-green">Thank you — submitted for review.</div>
        <p className="mt-1">Your outcome will appear once it&apos;s checked. Real results help the next applicant enormously.</p>
      </div>
    );
  }

  const field = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";
  const label = "block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      {/* Honeypot — keep visually hidden; bots fill it. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="type">Outcome type</label>
          <select id="type" name="type" className={field} required defaultValue="admission">
            <option value="admission">University admission</option>
            <option value="visa">Student visa</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="result">Result</label>
          <select id="result" name="result" className={field} required defaultValue="accepted">
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="approved">Visa approved</option>
            <option value="refused">Visa refused</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="destination">Country code (e.g. de, gb, ca)</label>
          <input id="destination" name="destination" className={field} maxLength={2} required defaultValue={defaultDestination} placeholder="de" />
        </div>
        <div>
          <label className={label} htmlFor="nationality">Your nationality code (optional)</label>
          <input id="nationality" name="nationality" className={field} maxLength={2} placeholder="in" />
        </div>
        <div>
          <label className={label} htmlFor="university">University (optional)</label>
          <input id="university" name="university" className={field} defaultValue={defaultUniversity} placeholder="tu-berlin" />
        </div>
        <div>
          <label className={label} htmlFor="program">Program (optional)</label>
          <input id="program" name="program" className={field} placeholder="MSc Computer Science" />
        </div>
        <div>
          <label className={label} htmlFor="year">Intake year</label>
          <select id="year" name="year" className={field} required defaultValue={String(YEAR)}>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="intake">Intake (optional)</label>
          <input id="intake" name="intake" className={field} placeholder="Fall / Winter" />
        </div>
        <div>
          <label className={label} htmlFor="gpa">GPA / grade (optional)</label>
          <input id="gpa" name="gpa" type="number" step="0.01" className={field} placeholder="3.6" />
        </div>
        <div>
          <label className={label} htmlFor="ielts">IELTS (optional)</label>
          <input id="ielts" name="ielts" type="number" step="0.5" className={field} placeholder="7.0" />
        </div>
        <div>
          <label className={label} htmlFor="fundsShownEur">Funds shown, € (optional)</label>
          <input id="fundsShownEur" name="fundsShownEur" type="number" className={field} placeholder="11904" />
        </div>
        <div>
          <label className={label} htmlFor="processingWeeks">Processing weeks (optional)</label>
          <input id="processingWeeks" name="processingWeeks" type="number" className={field} placeholder="6" />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="note">Anything else? (optional, no links)</label>
        <textarea id="note" name="note" className={field} rows={3} maxLength={500} placeholder="e.g. APS took 5 weeks; interview was straightforward." />
      </div>

      {state === "error" && errors.length > 0 && (
        <ul className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      <button type="submit" disabled={state === "saving"} className="btn-primary">
        {state === "saving" ? "Submitting…" : "Submit my outcome"}
      </button>
      <p className="text-xs text-slate-400">
        Submissions are reviewed before they appear. Don&apos;t include personal data — share figures, not names.
      </p>
    </form>
  );
}
