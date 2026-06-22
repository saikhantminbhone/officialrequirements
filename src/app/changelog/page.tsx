import type { Metadata } from "next";
import { getAllRecordsForAdmin } from "@/lib/req-data";
import { formatDate } from "@/components/SourceCite";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Data changelog",
  description: "A transparent log of when each requirement record was added, verified or updated — a public freshness signal.",
  alternates: { canonical: "/changelog" },
};

export default async function ChangelogPage() {
  const { visa, university, scholarships } = await getAllRecordsForAdmin();

  const entries: { date: string; title: string; note: string }[] = [];
  visa.forEach((r) => r.changeLog.forEach((c) => entries.push({ date: c.date, title: r.title, note: c.note })));
  university.forEach((r) => r.changeLog.forEach((c) => entries.push({ date: c.date, title: r.title, note: c.note })));
  scholarships.forEach((s) => s.changeLog.forEach((c) => entries.push({ date: c.date, title: s.name, note: c.note })));
  entries.sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <article className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">Data changelog</h1>
      <p className="mt-3 text-slate-600" data-speakable>
        Every change to a requirement record is logged here with its date — a transparent freshness
        signal so you (and search and AI engines) can see exactly when each fact was last touched.
      </p>

      <ul className="mt-6 space-y-3">
        {entries.map((e, i) => (
          <li key={i} className="flex items-start gap-3 border-b border-slate-100 pb-3">
            <span className="w-32 shrink-0 text-sm font-medium text-brand-700">{formatDate(e.date)}</span>
            <span className="text-sm text-slate-700">
              <span className="font-medium">{e.title}:</span> {e.note}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
