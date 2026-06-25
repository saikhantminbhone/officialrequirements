// Visible, numbered "How to apply, step by step" section. The required
// documents in order ARE the application steps, so this gives the page real
// procedural content that matches the HowTo schema emitted for the page
// (Google rewards schema that reflects visible content) and is genuinely useful.
export interface Step {
  title: string;
  detail: string;
}

export default function HowToApply({
  steps,
  destinationName,
  heading,
}: {
  steps: Step[];
  destinationName: string;
  /** Override the default visa-oriented heading (e.g. for admission timelines). */
  heading?: string;
}) {
  if (!steps.length) return null;
  return (
    <section className="mt-10" aria-label="How to apply">
      <h2 className="text-xl font-semibold text-slate-800">{heading ?? `How to apply for a ${destinationName} student visa, step by step`}</h2>
      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {i + 1}
            </span>
            <div>
              <div className="font-medium text-slate-800">{s.title}</div>
              <p className="mt-0.5 text-sm text-slate-600">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
