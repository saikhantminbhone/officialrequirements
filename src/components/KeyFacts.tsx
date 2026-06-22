// "Key facts at a glance" box — a compact, scannable summary of the computed
// figures at the top of a leaf page. Strong for featured snippets and for users
// who want the answer immediately; unique per page because the home-currency
// figure differs by nationality.
export interface Fact {
  label: string;
  value: string;
}

export default function KeyFacts({ facts }: { facts: Fact[] }) {
  if (!facts.length) return null;
  return (
    <section aria-label="Key facts at a glance" className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="section-kicker">At a glance</h2>
      <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.label} className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-2">
            <dt className="text-sm text-slate-600">{f.label}</dt>
            <dd className="text-sm font-semibold text-slate-900">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
