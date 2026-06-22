import type { Metadata } from "next";
import SearchClient from "@/components/SearchClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Search",
  description: "Search student-visa, scholarship and university-admission requirements by country, nationality, program or scholarship.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Search</h1>
      <p className="mt-1 text-sm text-slate-500">
        Find requirements by country, nationality, program type, or scholarship name.
      </p>
      <div className="mt-5">
        <SearchClient initialQuery={q ?? ""} />
      </div>
    </div>
  );
}
