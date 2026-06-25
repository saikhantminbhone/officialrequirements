import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: "Study-abroad guides — visas, funds, admission, documents" },
  description:
    "In-depth, explained guides to studying abroad: visa rejection reasons, proof of funds, blocked accounts, APS, document translation and more — not just requirements, but how they actually work.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  return (
    <div>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
          ]),
        ]}
      />
      <span className="section-kicker">Guides</span>
      <h1 className="mt-2 text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-[2.4rem]">
        Study-abroad guides
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">
        Not just what the requirements are — how they actually work, why applications fail, and how to get
        each step right. Explained, not aggregated.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="card-link">
            <div className="font-semibold text-slate-900">{g.h1}</div>
            <div className="mt-1.5 text-sm leading-6 text-slate-600">{g.description}</div>
            <div className="mt-3 text-sm font-medium text-brand-700">Read the guide →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
