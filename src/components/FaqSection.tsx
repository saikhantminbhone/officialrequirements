import type { Faq } from "@/lib/seo";

// Visible FAQ block. The same Q&As are emitted as FAQPage schema, so the
// structured data matches on-page content (Google's rule) and the page targets
// "People Also Ask" boxes and FAQ rich results. Server-rendered for crawlability.
export default function FaqSection({ faqs, heading = "Frequently asked questions" }: { faqs: Faq[]; heading?: string }) {
  if (!faqs.length) return null;
  return (
    <section className="mt-10" aria-label="Frequently asked questions">
      <h2 className="text-xl font-semibold text-slate-800">{heading}</h2>
      <div className="mt-4 divide-y divide-slate-100">
        {faqs.map((f) => (
          <div key={f.question} className="py-3">
            <h3 className="font-medium text-slate-800">{f.question}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
