import type { Metadata } from "next";
import OutcomeForm from "@/components/OutcomeForm";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: "Share your admission or visa outcome" },
  description:
    "Share your real university-admission or student-visa outcome — accepted/rejected, your grades, funds and timeline — to help the next applicant. Reviewed before publishing.",
  alternates: { canonical: "/share-outcome" },
};

export default function ShareOutcomePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <span className="section-kicker">Give back</span>
      <h1 className="mt-2 text-3xl font-semibold tracking-tighter2 text-slate-900 sm:text-[2.4rem]">
        Share your outcome
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-slate-600">
        Real results are the most useful data there is. Tell future applicants what happened — your grades,
        funds and timeline — and we&apos;ll aggregate it (reviewed first, names never required).
      </p>
      <div className="mt-8">
        <OutcomeForm />
      </div>
    </div>
  );
}
