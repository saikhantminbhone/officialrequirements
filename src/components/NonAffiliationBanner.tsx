// Persistent, honest non-affiliation disclaimer. Rendered on EVERY page.
// Simultaneously an ethics requirement, a trust signal, and an E-E-A-T ranking
// signal. Non-negotiable per the blueprint (§0.3).
export default function NonAffiliationBanner() {
  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-900">
      <div className="mx-auto max-w-6xl px-4 py-2 text-sm text-center">
        <strong>Independent informational resource.</strong> Not affiliated with any government or
        university. Requirements change — always verify with the official source, which we link on
        every page.
      </div>
    </div>
  );
}
