import type { RequirementItem } from "@/lib/req-data/types";
import AffiliateBlock from "@/components/AffiliateBlock";
import { guideForKey } from "@/lib/requirement-guides";

// Renders a single requirement with its summary AND the full knowledge base
// (what it is, why, how to get it, tips, mistakes) shown INLINE — no collapsed
// toggles. Users see complete information without clicking, and the full text is
// server-rendered so it's crawlable and citable by AI/answer engines.
export default function RequirementDetail({ item }: { item: RequirementItem }) {
  const guide = guideForKey(item.key);
  return (
    <li className="card overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900">{item.label}</h3>
          {item.required ? (
            <span className="chip border-red-200 bg-red-50 text-red-700">Required</span>
          ) : (
            <span className="chip text-slate-500">If applicable</span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
      </div>

      {guide && (
        <div className="space-y-4 px-4 py-4 text-sm leading-6 text-slate-700">
          <div>
            <div className="section-kicker">What it is</div>
            <p className="mt-1">{guide.whatItIs}</p>
          </div>
          <div>
            <div className="section-kicker">Why it&apos;s required</div>
            <p className="mt-1">{guide.why}</p>
          </div>
          <div>
            <div className="section-kicker">How to get it</div>
            <ol className="mt-1.5 list-decimal space-y-1.5 pl-5">
              {guide.howToGet.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
          <div className="grid gap-4 rounded-lg bg-slate-50 p-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-trust-green">
                <span aria-hidden>✓</span> Tips
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                {guide.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-trust-amber">
                <span aria-hidden>!</span> Common mistakes
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                {guide.mistakes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {item.affiliateTag && (
            <div className="pt-1">
              <AffiliateBlock tag={item.affiliateTag} max={1} />
            </div>
          )}
        </div>
      )}

      {!guide && item.affiliateTag && (
        <div className="px-4 py-4">
          <AffiliateBlock tag={item.affiliateTag} max={1} />
        </div>
      )}
    </li>
  );
}
