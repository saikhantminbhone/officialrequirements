import { NextResponse } from "next/server";
import { getVisaRecords, getUniversityRecords, getScholarships } from "@/lib/req-data";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

// RSS feed of requirement changes — unique data nobody else publishes. Feeds
// get picked up by aggregators (citations/links), give subscribers a second
// channel next to email alerts, and signal engines to re-crawl changed pages.
const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const [visa, university, scholarships] = await Promise.all([
    getVisaRecords(),
    getUniversityRecords(),
    getScholarships(),
  ]);

  const items: { date: string; title: string; note: string; link: string }[] = [];
  visa.forEach((r) =>
    r.changeLog.forEach((c) =>
      items.push({ date: c.date, title: r.title, note: c.note, link: `${SITE}/${r.nationality}/${r.destination}/student-visa` })
    )
  );
  university.forEach((r) =>
    r.changeLog.forEach((c) =>
      items.push({ date: c.date, title: r.title, note: c.note, link: `${SITE}/university/${r.destination}/${r.program?.slug ?? ""}` })
    )
  );
  scholarships.forEach((s) =>
    s.changeLog.forEach((c) => items.push({ date: c.date, title: s.name, note: c.note, link: `${SITE}/scholarships/${s.slug}` }))
  );

  items.sort((a, b) => b.date.localeCompare(a.date));
  const latest = items.slice(0, 50);

  const xmlItems = latest
    .map(
      (i) => `    <item>
      <title>${escapeXml(i.title)}</title>
      <link>${escapeXml(i.link)}</link>
      <guid isPermaLink="false">${escapeXml(`${i.link}#${i.date}`)}</guid>
      <pubDate>${new Date(i.date + "T00:00:00Z").toUTCString()}</pubDate>
      <description>${escapeXml(i.note)}</description>
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>OfficialRequirements — requirement changes</title>
    <link>${SITE}/changelog</link>
    <atom:link href="${SITE}/changes.xml" rel="self" type="application/rss+xml"/>
    <description>Dated changes to student-visa, scholarship and admission requirements, tracked against official sources.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${xmlItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
