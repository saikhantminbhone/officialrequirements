import type { ReactNode } from "react";

// Premium, consistent header for detail/article pages (visa, admission,
// scholarship). Gives every page a confident title block with a kicker, a large
// tracked headline, a lead paragraph, and a slot for the source/trust signals.
export default function ArticleHeader({
  kicker,
  title,
  summary,
  children,
}: {
  kicker: string;
  title: string;
  summary: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-slate-200 pb-7">
      <span className="section-kicker">{kicker}</span>
      <h1 className="mt-3 text-3xl font-semibold leading-[1.12] tracking-tighter2 text-slate-900 sm:text-[2.6rem]">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600" data-speakable>
        {summary}
      </p>
      {children && <div className="mt-5 space-y-2.5">{children}</div>}
    </header>
  );
}
