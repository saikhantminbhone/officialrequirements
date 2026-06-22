"use client";

import { useRuntimeConfig } from "./RuntimeConfigProvider";
import { offersForTag } from "@/lib/config";
import type { AffiliateTag } from "@/lib/req-data/types";

// Affiliate offers rendered at intent peaks (after a checklist line, in the
// cost output). Contextual, disclosed, genuinely useful — the relevance IS the
// conversion driver. Offers + order come from runtime config (admin-managed).
export default function AffiliateBlock({ tag, max = 1 }: { tag: AffiliateTag; max?: number }) {
  const config = useRuntimeConfig();
  const offers = offersForTag(config, tag).slice(0, max);
  if (offers.length === 0) return null;

  return (
    <div className="my-4 space-y-3">
      {offers.map((o) => (
        <div key={o.id} className="rounded-lg border border-brand-100 bg-brand-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">{o.brand}</div>
              <div className="font-semibold text-slate-800">{o.headline}</div>
              <p className="mt-1 text-sm text-slate-600">{o.description}</p>
            </div>
            <a
              href={o.url}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              className="shrink-0 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
              data-affiliate-id={o.id}
            >
              {o.ctaLabel}
            </a>
          </div>
          <p className="mt-2 text-xs text-slate-400">{o.disclosure}</p>
        </div>
      ))}
    </div>
  );
}
