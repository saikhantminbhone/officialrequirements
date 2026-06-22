import Link from "next/link";
import { formatDate } from "./SourceCite";
import type { VerificationStatus } from "@/lib/req-data/types";

// Honest provenance line. We never claim a human verified a figure that was only
// machine-compiled — that would be a YMYL integrity failure. Machine-compiled
// records say so plainly (amber) and point to the official source; only records
// a person actually checked show the green "verified" state.
export default function DataTrustLine({
  verifiedBy,
  lastVerified,
  verification = "machine-compiled",
}: {
  verifiedBy: string;
  lastVerified: string;
  verification?: VerificationStatus;
}) {
  if (verification === "human-verified") {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-green-50 px-3 py-2 text-sm text-slate-600">
        <span className="font-medium text-trust-green">✓ Verified by a person</span>
        <span>{formatDate(lastVerified)} ({verifiedBy}).</span>
        <span>
          See our{" "}
          <Link href="/methodology" className="text-brand-600 hover:underline">methodology</Link> and{" "}
          <Link href="/data-sources" className="text-brand-600 hover:underline">data sources</Link>.
        </span>
      </div>
    );
  }

  if (verification === "auto-corroborated") {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-brand-50 px-3 py-2 text-sm text-slate-600">
        <span className="font-medium text-brand-700">✓✓ Cross-checked across multiple official sources</span>
        <span>on {formatDate(lastVerified)} — independent government/official pages agree on this figure.</span>
        <span>
          Still confirm with the official source above before acting. See our{" "}
          <Link href="/methodology" className="text-brand-600 hover:underline">methodology</Link>.
        </span>
      </div>
    );
  }
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      <span className="font-medium">Compiled from official sources</span>
      <span>on {formatDate(lastVerified)} — pending independent human verification.</span>
      <span>
        Always confirm the exact figure with the official source linked above. See our{" "}
        <Link href="/methodology" className="text-brand-700 underline">methodology</Link>.
      </span>
    </div>
  );
}
