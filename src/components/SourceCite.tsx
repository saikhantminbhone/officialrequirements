import type { Source } from "@/lib/req-data/types";

// Renders a primary-source citation. Linking out to authority is a positive
// E-E-A-T signal, not a leak.
export function SourceCite({ source, lastVerified }: { source: Source; lastVerified?: string }) {
  return (
    <div className="text-sm text-slate-600 border-l-2 border-trust-green/50 pl-3">
      <span className="font-medium text-slate-700">Source: </span>
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="text-brand-600 hover:underline"
      >
        {source.name}
      </a>
      <span className="ml-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs uppercase tracking-wide text-slate-500">
        {source.type}
      </span>
      {lastVerified && (
        <span className="ml-2 text-trust-green">Verified {formatDate(lastVerified)}</span>
      )}
    </div>
  );
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}
