// Brand lockup: the checklist-with-check badge + "OfficialRequirements" wordmark.
// Same family as OfficialCost (rounded badge + two-tone wordmark), themed for
// requirements (document/checklist + verified check) instead of cost.
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
        <defs>
          <linearGradient id="logoG" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2563eb" />
            <stop offset="1" stopColor="#1e40af" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#logoG)" />
        <rect x="15" y="11" width="28" height="42" rx="4" fill="#ffffff" />
        <rect x="20" y="19" width="14" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="20" y="27" width="18" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="20" y="35" width="12" height="3" rx="1.5" fill="#cbd5e1" />
        <circle cx="44" cy="44" r="12" fill="#16a34a" />
        <path d="M38.7 44.6l3.4 3.4 6.4-7" stroke="#ffffff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-lg font-bold tracking-tight">
        <span className="text-slate-900">Official</span>
        <span className="text-brand-600">Requirements</span>
      </span>
    </span>
  );
}
