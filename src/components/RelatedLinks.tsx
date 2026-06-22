import Link from "next/link";

// Hub-and-spoke internal linking — distributes topical authority and keeps the
// crawler moving between related leaf pages.
export default function RelatedLinks({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <nav className="mt-10 rounded-xl border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-brand-600 hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
