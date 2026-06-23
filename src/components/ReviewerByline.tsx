import { AUTHOR_NAME, AUTHOR_URL, AUTHOR_BIO, hasNamedAuthor } from "@/lib/seo";

// Visible author/reviewer byline — a real E-E-A-T signal for YMYL pages. Shows a
// named, credentialed reviewer when AUTHOR_NAME is set (recommended for ranking),
// otherwise the editorial team. Never implies a human check that didn't happen.
export default function ReviewerByline() {
  if (hasNamedAuthor) {
    return (
      <div className="flex items-center gap-2.5 text-sm">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          {AUTHOR_NAME.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
        </span>
        <span className="text-slate-600">
          Reviewed by{" "}
          <a href={AUTHOR_URL} className="font-medium text-slate-900 hover:text-brand-700" title={AUTHOR_BIO}>
            {AUTHOR_NAME}
          </a>
        </span>
      </div>
    );
  }
  return (
    <div className="text-sm text-slate-500">
      Compiled and checked by the <span className="font-medium text-slate-700">OfficialRequirements editorial team</span>
    </div>
  );
}
