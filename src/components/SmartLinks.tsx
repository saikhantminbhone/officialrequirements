import Link from "next/link";
import { loadLinkPlan } from "@/lib/link-plan";

// Server component rendering the striking-distance link plan (see lib/link-plan).
// Placed on high-authority pages; anchors are the real queries people search.
// Renders nothing until GSC data exists — zero cost on a young site.
export default async function SmartLinks({
  title = "People are looking up",
  pathFilter,
  max = 10,
}: {
  title?: string;
  /** Only show entries whose target path contains this substring (e.g. "/de/"). */
  pathFilter?: string;
  max?: number;
}) {
  const plan = await loadLinkPlan();
  const entries = plan.entries.filter((e) => (pathFilter ? e.path.includes(pathFilter) : true)).slice(0, max);
  if (entries.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {entries.map((e) => (
          <Link
            key={e.path + e.query}
            href={e.path}
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
          >
            {e.query}
          </Link>
        ))}
      </div>
    </section>
  );
}
