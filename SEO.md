# SEO & ranking strategy

How OfficialRequirements is built to rank, and the weekly workflow to keep climbing.
Everything here is deterministic (no AI) and runs on the existing Cloudflare R2 + Vercel
cron stack.

## 1. On-page keyword strategy

Titles, descriptions and a long-tail "related searches" cluster are generated from each
record's own facts and the current year — not a fixed template — so similar pages don't
share identical titles and each targets the query its data can answer.
(`src/lib/keywords.ts`)

| Page type | Title leads with | Example |
|---|---|---|
| Student visa | Proof of funds, or processing time | `Germany Student Visa for Indian Citizens (2026) — Proof of Funds & Requirements` |
| University | Program + admission/GPA | `MSc Computer Science in Germany (2026) — Admission Requirements & GPA` |
| Scholarship | Eligibility, benefits, deadlines | `DAAD EPOS 2026 — Eligibility, Benefits & Deadlines` |
| Destination hub | Visa + costs + scholarships | `Study in Germany (2026) — Student Visa, Costs & Scholarships` |

Each page also renders a visible **Related searches** block (`src/components/RelatedSearches.tsx`)
— the long-tail queries it targets, linking into on-site search. Adds keyword relevance and
internal links without stuffing the prose.

## 2. Quality gates (what is allowed to rank)

A page only earns `index` when it clears every gate (`src/lib/page-policy.ts`):

- Published and not stale (< 180 days since verification).
- At least 3 required requirement items.
- **Authoritative source** — the source domain must pass the trust check
  (`src/lib/source-trust.ts`); blogs/forums/non-official domains are noindexed.
- **Quality score ≥ 45** (`pageQualityScore`) — a composite of computed-fact completeness,
  requirement depth, source authority and corroboration.
- Launch-batch discipline: long-tail nationality×destination pairs stay noindex,follow until
  they're corroborated, human-verified, or promoted by real demand.

Thin or low-authority pages never compete, which protects the whole domain's quality signal.

## 3. Automation (the smart-without-AI loop)

Scheduled Vercel crons keep data fresh and trustworthy (`vercel.json`):

1. **Gap detector** finds missing/stale fields (`src/lib/gap-detector.ts`).
2. **Crawler** fetches the official source (HTML / JSON API / JS-SPA) and extracts candidates
   (`src/lib/crawl.ts`). Each candidate is auto-graded: **source trust** + **quality**
   (`src/lib/quality.ts`) → a recommendation (`ready-to-approve` / `needs-review` / `reject`).
3. **Cross-source fact-check** corroborates a figure only when 2+ **official** sources agree
   (`src/lib/factcheck.ts`).
4. **Freshness** auto-unpublishes records > 180 days and queues re-verification
   (`src/lib/maintenance.ts`).
5. **Source-watch** hashes official pages and flags when they change.
6. **IndexNow** pings search engines about new/changed URLs.
7. **FX** refreshes currency conversions daily.

Nothing publishes a YMYL figure automatically — a human approves the graded queue in `/ops`,
where clean official matches are one-glance approvals and garbage is pre-rejected.

## 4. Keyword opportunity engine (the weekly ranking workflow)

The Search Console harvest pulls the **query** dimension and runs a deterministic
opportunity algorithm (`src/lib/keyword-opportunities.ts`), shown in **/ops → SEO**:

- **Striking-distance** — queries ranking ~5–20 with real impressions. Small pushes move
  them onto page 1. Scored by estimated extra clicks.
- **CTR-gap** — queries already top-5 but under-clicking → rewrite the title/description.

**Weekly:** open /ops → SEO → "Keyword opportunities", work top-down by `+clicks`:
- *push to page 1* → strengthen that page (add a matching H2/FAQ, internal links to it).
- *fix title/CTR* → tighten the title/meta to match the query.

This is data-driven and self-improving — it sharpens as your traffic grows.

## 5. E-E-A-T

A visible **Reviewed by** byline renders on every article page
(`src/components/ReviewerByline.tsx`), paired with author schema in the structured data.
Set `AUTHOR_NAME`, `AUTHOR_URL`, `AUTHOR_BIO` to a real credentialed person — the single
strongest YMYL signal. Until set, it honestly shows the editorial team.

## 6. Technical / GEO

- Structured data: Article, Dataset, HowTo, FAQPage, EducationalOccupationalProgram,
  Organization, WebSite, DataCatalog, BreadcrumbList, Speakable (`src/lib/seo.ts`).
- `sitemap.ts` with per-type priority + change-frequency; noindex pages excluded.
- `robots.ts` allowlists AI/answer-engine crawlers (GEO) and blocks bulk scrapers; `/ops`
  and `/search` disallowed.
- Static/ISR pages (fast), OG images, `llms.txt`, hreflang scaffold.

## 7. What only you can do (off-page)

The system maximizes on-page + technical. Rankings still need:

- **Backlinks / authority** — outreach, digital-PR using the unique computed data
  (home-currency proof of funds, cost rankings), getting cited.
- **A real named reviewer** — set the `AUTHOR_*` env vars to a real person with credentials.
- **Demand-led expansion** — promote long-tail pages where Search Console shows real
  impressions, rather than chasing every keyword.
