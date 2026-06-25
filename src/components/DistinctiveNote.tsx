import { getDestinationNote } from "@/lib/destination-notes";

// Unique, hand-authored "what's distinctive" block per destination — the
// country-specific content that differentiates each page from the templated
// overview (anti scaled-content). Renders nothing for destinations without a
// curated note yet.
export default function DistinctiveNote({ code, name }: { code: string; name: string }) {
  const note = getDestinationNote(code);
  if (!note) return null;
  return (
    <section className="mt-8 rounded-2xl border border-slate-900/[0.06] bg-slate-50 p-5 sm:p-6">
      <span className="section-kicker">What sets {name} apart</span>
      <p className="mt-2 text-sm text-slate-600">
        {name} issues a {note.visaName}. A few things make its process different from other destinations:
      </p>
      <ul className="mt-3 space-y-2">
        {note.distinctive.map((d) => (
          <li key={d} className="flex gap-2.5 text-sm leading-6 text-slate-700">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
