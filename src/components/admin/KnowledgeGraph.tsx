import type { KnowledgeOverview, KnowledgeSnapshot } from "@/lib/knowledge";

// Lightweight knowledge dashboard — stat cards + an inline-SVG trend (no chart
// library, keeps the bundle small). Shows total knowledge, today's increase,
// quality-passed sources, and growth over the recent snapshots.
export default function KnowledgeGraph({ overview }: { overview: KnowledgeOverview }) {
  const { current, history, delta } = overview;
  const fmt = (n: number) => n.toLocaleString("en-US");
  const sign = (n: number) => (n > 0 ? `+${fmt(n)}` : fmt(n));

  const cards = [
    { label: "Total knowledge items", value: fmt(current.total), sub: delta ? `${sign(delta.total)} today` : "first snapshot" },
    { label: "Quality sources", value: fmt(current.sources), sub: delta ? `${sign(delta.sources)} today` : "official only" },
    { label: "Indexable pages", value: fmt(current.indexed), sub: "passing quality gate" },
    { label: "Human-verified", value: fmt(current.verified), sub: delta ? `${sign(delta.verified)} today` : "records" },
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-slate-900/[0.06] bg-white p-4 shadow-card">
            <div className="text-2xl font-semibold tracking-tight text-slate-900">{c.value}</div>
            <div className="mt-0.5 text-sm text-slate-500">{c.label}</div>
            <div className="mt-1 text-xs font-medium text-trust-green">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-900/[0.06] bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="section-kicker">Knowledge growth</div>
          <div className="text-xs text-slate-400">{history.length} snapshots</div>
        </div>
        <Sparkline data={history} />
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-500">
          <span>Visa: <strong className="text-slate-700">{fmt(current.visa)}</strong></span>
          <span>Admission: <strong className="text-slate-700">{fmt(current.university)}</strong></span>
          <span>Scholarships: <strong className="text-slate-700">{fmt(current.scholarship)}</strong></span>
          <span>Guides: <strong className="text-slate-700">{fmt(current.guides)}</strong></span>
          <span>Universities: <strong className="text-slate-700">{fmt(current.namedUniversities)}</strong></span>
          <span>Outcomes: <strong className="text-slate-700">{fmt(current.approvedOutcomes)}</strong></span>
        </div>
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: KnowledgeSnapshot[] }) {
  if (data.length < 2) {
    return <p className="mt-3 text-sm text-slate-400">Growth chart appears after a couple of daily snapshots.</p>;
  }
  const W = 720, H = 120, P = 6;
  const vals = data.map((d) => d.total);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const x = (i: number) => P + (i * (W - 2 * P)) / (data.length - 1);
  const y = (v: number) => H - P - ((v - min) / span) * (H - 2 * P);
  const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.total).toFixed(1)}`).join(" ");
  const area = `${P},${H - P} ${pts} ${W - P},${H - P}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-28 w-full" preserveAspectRatio="none" role="img" aria-label="Knowledge growth trend">
      <polygon points={area} fill="#eef2ff" />
      <polyline points={pts} fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
