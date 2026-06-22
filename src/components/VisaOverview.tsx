import type { OverviewSection } from "@/lib/destination-overview";

// Long-form, server-rendered overview shown inline on visa pages. Gives every
// page substantial unique prose (good for users, SEO depth, and AI citation)
// without any collapsing — the full text is always visible.
export default function VisaOverview({ sections, title }: { sections: OverviewSection[]; title: string }) {
  if (!sections.length) return null;
  return (
    <section className="prose-content mt-8" aria-label="Overview">
      <h2 className="section-title">{title}</h2>
      <div className="mt-4 space-y-7">
        {sections.map((s) => (
          <div key={s.heading}>
            <h3>{s.heading}</h3>
            {s.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
