import Link from "next/link";

// Visible "related searches" cluster. Surfaces the long-tail queries a page
// targets as real, crawlable text, each linking into on-site search — adds
// keyword relevance and internal links without keyword-stuffing the prose.
export default function RelatedSearches({ keywords }: { keywords: string[] }) {
  if (!keywords.length) return null;
  return (
    <section className="mt-10" aria-label="Related searches">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Related searches</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {keywords.map((k) => (
          <Link
            key={k}
            href={`/search?q=${encodeURIComponent(k)}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
          >
            {k}
          </Link>
        ))}
      </div>
    </section>
  );
}
