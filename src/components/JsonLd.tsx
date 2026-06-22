// Renders one or more JSON-LD blocks for rich results (Article, FAQPage, HowTo,
// BreadcrumbList). Server component — emits real <script> tags in the HTML.
export default function JsonLd({ data }: { data: object | object[] }) {
  const arr = Array.isArray(data) ? data : [data];
  return (
    <>
      {arr.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
