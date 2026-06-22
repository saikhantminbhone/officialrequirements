"use client";

import { useRuntimeConfig } from "./RuntimeConfigProvider";

// Lead-gen — the highest per-visitor value in this niche. Gated behind tool
// output ("Want an agency to handle your application? Get matched →").
export default function LeadGenBlock() {
  const { leadGen } = useRuntimeConfig();
  if (!leadGen.enabled) return null;
  return (
    <div className="my-6 rounded-lg border border-trust-green/30 bg-green-50 p-5">
      <div className="font-semibold text-slate-800">{leadGen.headline}</div>
      <p className="mt-1 text-sm text-slate-600">{leadGen.description}</p>
      <a
        href={leadGen.formUrl}
        target="_blank"
        rel="noopener noreferrer sponsored nofollow"
        className="mt-3 inline-block rounded-md bg-trust-green px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        {leadGen.ctaLabel}
      </a>
      <p className="mt-2 text-xs text-slate-400">
        Sponsored matching service. We may earn a referral fee. Informational only — we don&apos;t
        process applications.
      </p>
    </div>
  );
}
