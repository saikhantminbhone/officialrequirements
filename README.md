# OfficialRequirements

A small, lightweight, affiliate-first programmatic SEO site for **student-visa, scholarship, and university-admission requirements**. Built per the project blueprint: static Next.js on Vercel, runtime-managed ads/affiliates, an admin panel, and a sourced, freshness-tracked data layer — with **Cloudflare R2 as the only data store (no backend server, no database)**.

## What it does

- **Auto-expanding programmatic pages.** One template + a list of nationalities generates a fully-formed, sourced page per `nationality × destination` at build time. Add a row, rebuild, and a new page appears — no hand-written pages. (`src/lib/req-data/`)
- **Four AI-resistant tools** (the moat): eligibility checker, document-checklist generator, cost & proof-of-funds calculator, timeline planner. Pure TypeScript, server-rendered output so it's real text to Google. (`src/lib/eligibility/`, `src/components/tools/`)
- **Runtime ad + affiliate config.** `<AdSlot/>` and `<AffiliateBlock/>` read config from R2 at load, so you toggle slots, swap networks, and reorder offers by EPC **without a rebuild** (changes live in ~60s).
- **Admin panel** (`/admin`): ads & affiliate manager, data-freshness queue, SEO/health dashboards, and a Rebuild button. Writes everything to R2.
- **E-E-A-T baked in:** persistent non-affiliation banner on every page, per-record `lastVerified` date, primary-source links, author schema, methodology page.

## Architecture

```
src/
├── app/                              # Next.js App Router
│   ├── [nationality]/[destination]/student-visa/  # programmatic SSG leaf pages
│   ├── scholarships/[scholarship]/   # scholarship SSG pages
│   ├── germany/study/                # hub
│   ├── tools/                        # standalone tool pages
│   ├── admin/                        # protected admin panel
│   ├── api/config/                   # runtime ad/affiliate config (reads R2)
│   └── api/admin/                    # login, save (writes R2), rebuild
├── components/                       # UI + tools + admin widgets
└── lib/
    ├── req-data/                     # THE MOAT: schema, seed, auto-expand loader
    ├── eligibility/                  # pure-TS rules engine (the 4 tools)
    ├── r2.ts                         # Cloudflare R2 (S3-compatible) client
    ├── config.ts / config-loader.ts  # runtime ad/affiliate config
    └── auth.ts                       # single-admin session
```

The data store is **Cloudflare R2**. There is no database and no separate backend — admin writes are Vercel serverless functions that PUT JSON to R2; pages read seed JSON (bundled) merged with R2 records at build time.

## Stack & versions

Next.js **16** (App Router, Turbopack), React **19**, TypeScript 5, Tailwind 3, Auth.js (NextAuth v5) for single-admin Google sign-in, Cloudflare R2 as the only data store. Requires Node **>= 20.9**.

> Next 15+ note: route `params` / `searchParams` are async (`Promise`) and are awaited in every page. Next 16 also renames the `middleware.ts` convention to `proxy.ts` — the current `src/middleware.ts` still works (deprecation warning only); rename it to `src/proxy.ts` when convenient.

## Quick start (local)

```bash
npm install                  # installs Next 16 + React 19
cp .env.example .env.local   # fill in values (R2 optional locally — runs on seed data)
npm run dev                  # http://localhost:3000
```

Without R2 credentials the site runs on bundled seed data (8 Germany visa pages + 2 scholarships) and the admin shows a "seed-only" notice.

## Cloudflare R2 setup (the data store)

1. Cloudflare dashboard → **R2** → create a bucket, e.g. `officialreq`.
2. **R2 → Manage API Tokens** → create an S3-compatible token; copy the Access Key ID + Secret.
3. Put these in `.env.local` (and in Vercel project env vars):
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
4. Seed the bucket with the default runtime config + scholarship records:
   ```bash
   npm run seed:r2
   ```

Data layout in R2:

| Key | Purpose |
|-----|---------|
| `config/runtime.json` | Ad/affiliate/lead-gen config (admin-editable, live without rebuild) |
| `data/visa/<id>.json` | Visa requirement records (override/extend the seed template) |
| `data/scholarship/<id>.json` | Scholarship records |

## Deploy (Vercel)

1. Push to GitHub, import into **Vercel**.
2. Add all env vars from `.env.example` in Project Settings → Environment Variables.
3. **Deploy Hook:** Settings → Git → Deploy Hooks → create one, paste the URL into `VERCEL_DEPLOY_HOOK_URL`. This powers the admin **Rebuild** button.
4. Deploy. Programmatic pages are statically generated; admin + API routes run as serverless functions.

## Verticals

Three content clusters, all auto-expanded from templates:

1. **Student visas** — `/{nationality}/{destination}/student-visa` (800 pages: 32 nationalities × 25 destinations).
2. **University admission** — `/university/{destination}/{program}` (150 pages: 25 destinations × 6 program archetypes — Bachelor, MSc ×3, MBA, PhD). Adjusts requirements per program (GRE for quantitative Master's, GMAT + work experience for MBA) and per destination (English thresholds, official admission body). Course / EducationalOccupationalProgram schema.
3. **Scholarships** — `/scholarships/{slug}` with an interactive eligibility checker (DAAD EPOS, Erasmus Mundus, expandable).

**Rich requirement detail.** Every requirement on a visa or admission page carries an expandable **Full details** block — what it is, why it's required, how to get it (steps), tips, and common mistakes — drawn from a shared knowledge base (`lib/requirement-guides.ts`). It's server-rendered inside native `<details>` so it's crawlable, substantive content (not a thin list) while keeping the page scannable.

**Rendering (ISR).** The programmatic routes use Incremental Static Regeneration: a small seed is prerendered at build, and the rest of the (growing) matrix is generated on first request and cached, revalidated daily. Every page is still fully static once served — this is the blueprint's build-ceiling mitigation (§11) and avoids prerendering 1,300+ pages at once.

**Comparison layer** — `/compare/study/{a}/{b}` (300 pages: every destination pair) renders a computed multi-factor table (proof of funds, living cost, visa fee, processing time, intakes, document load) plus a requirement diff. This is the AI-resistant wedge from blueprint §4.2 — a multi-factor comparison an AI Overview can't one-line and incumbents don't build. Hub at `/compare`.

**Reports / data stories** — `/reports/*` computed rankings that double as link-bait (the one ranking lever the blueprint flags as operational): cheapest proof of funds, total first-year cost, fastest processing — each a ranked table in euros (via ECB FX) with a computed insight, methodology and sources. Substantive by construction.

## Anti-thin-content discipline

Scaled near-duplicate pages get punished post-2025, so thinness is guarded on three levels:

1. **Genuine unique value per page.** Every visa page converts the destination's proof-of-funds into the **applicant's home currency** at ECB rates (`lib/fx.ts`) — e.g. Germany's €11,904 shown as ≈ 1,071,400 INR on `/in/de/student-visa`. Real, useful, and different on every nationality page. University program pages carry program-specific prerequisites and focus (CS vs Data Science vs Mechanical Engineering differ), so they aren't templated clones.
2. **Uniqueness engine** (`lib/uniqueness.ts`) — deterministic word-shingle Jaccard near-duplicate detection. Within a group it keeps the canonical and marks anything ≥0.9 similar as `noindex,follow` + excludes it from the sitemap. Currently 0 pages are flagged (the differentiation above keeps them distinct) — it's a backstop against future thin additions. Surfaced as "Near-dupes noindexed" in Admin → SEO.
3. **Index policy** (`lib/page-policy.ts`) — a page only earns `index` if it has enough substance (requirement count) and is fresh (verified within 180 days); stale/thin pages are `noindex` and sitemap-excluded.

Add a program to `seed/uni-programs.json` or a destination's admission source to `seed/uni-sources.json`, rebuild, and the university matrix expands automatically — same pattern as visas.

## Google Search Console (live SEO dashboard)

The admin SEO page shows **real** Search Console data — clicks, impressions, average position, top pages, and the niche-critical **% tier-1 traffic** — pulled via a service account (no extra npm dependency; JWT is signed with Node `crypto`). Setup:

1. Google Cloud → create a service account, enable the **Search Console API**.
2. Download its JSON key → put it in `GSC_SERVICE_ACCOUNT_JSON` (one line) **or** store it in R2 at `credentials/gsc-sa.json`.
3. Search Console → Settings → Users → add the service-account email to your property.
4. Set `GSC_SITE_URL` (e.g. `sc-domain:officialrequirements.com`).
5. It syncs daily via `/api/cron/gsc` (`0 5 * * *`), or hit **Sync Search Console now** in Admin → SEO.

The `% tier-1 traffic` stat turns green at ≥40% (Raptive's gate) — the lever that decides display RPM for this audience.

## Analytics & Core Web Vitals

- **Vercel Web Analytics + Speed Insights** are mounted in the root layout (real-user pageviews + Core Web Vitals, viewable in the Vercel dashboard — no key needed).
- **In-app Core Web Vitals** on the admin SEO page use the **Chrome UX Report (CrUX) field-data API** (`lib/cwv.ts`) — real-user p75 LCP / INP / CLS with good/needs-improvement/poor ratings. Set `CRUX_API_KEY` (enable the Chrome UX Report API in Google Cloud), then it syncs daily via `/api/cron/cwv` or on demand from Admin → SEO. New origins show "no field data yet" until they have enough traffic — that's expected.

## Global coverage

Student-visa requirements are seeded for **25 destinations** — Germany, the UK, Canada, Australia, the Netherlands, Ireland, the USA, Sweden, France, New Zealand, Italy, Spain, Finland, Norway, Switzerland, Denmark, Austria, Japan, South Korea, Belgium, Poland, Czechia, Portugal, Malaysia and the UAE — each with current official figures and primary-source links. The matrix auto-expands across **32 nationalities × 25 destinations = 800 sourced pages**, and grows when you add either a nationality row or a destination template. Every figure carries a `lastVerified` date and links to the official government source.

## Self-maintaining freshness (deterministic, no AI)

The system keeps itself current with two scheduled, rule-based jobs — no model in the loop:

- **`/api/cron/maintain`** (daily, `0 6 * * *`) — scores every record by verification age, **auto-unpublishes** anything past 180 days (safe direction: it removes possibly-stale YMYL info, never auto-publishes), builds a re-verification queue (past 90 days), writes a freshness report to R2, and pings the rebuild hook only if something changed.
- **`/api/cron/watch-sources`** (weekly, `0 3 * * 1`) — fetches each official source URL, hashes the normalized response, and compares to the last stored hash in R2. When a source page changes, it **flags** the affected records for human re-verification. Data is never auto-edited from a diff (YMYL guardrail).
- **`/api/cron/fx`** (daily, `0 2 * * *`) — refreshes ECB exchange rates (via frankfurter.app) into R2, keeping home-currency figures and reports current. Static fallback covers currencies the ECB feed doesn't list.
- **`/api/cron/gsc`** + **`/api/cron/cwv`** — Search Console performance and Core Web Vitals (see below).

Both are gated by `CRON_SECRET`, scheduled in `vercel.json`, and can be triggered on demand from **Admin → Data freshness → Run now**. Reports surface in the admin. The logic lives in `src/lib/maintenance.ts`.

## Self-healing crawler — finds gaps & auto-extracts (deterministic, no AI)

The system doesn't just flag staleness — it tries to fill the gaps itself, then asks a human to approve.

- **Gap detector** (`lib/gap-detector.ts`) scans every record and flags what's missing, incomplete or stale — a missing proof-of-funds figure, a missing fee, an absent requirement category, or a record past its freshness window. (Destinations with no fixed figure — US, Malaysia, UAE — are correctly exempt.)
- **Extraction engine** (`lib/extract/`) crawls each official source and pulls candidate values **no matter how the page is built**:
  - **Static HTML** → tags stripped to text, figures extracted.
  - **JSON API** → response parsed and flattened (handles amount/currency in separate fields).
  - **JS / SPA (Vue, React, Next, Nuxt)** → reads the data those frameworks embed in the served HTML (`__NEXT_DATA__`, `window.__NUXT__`, `__APOLLO_STATE__`, `<script type="application/json|ld+json">`) — so most client-rendered pages are extractable **without a browser**. For the rare fully-client-rendered page with no embedded data, it falls back to an optional headless render service (`RENDER_SERVICE_URL`).
  - Extraction is pure regex + JSON parsing (no AI): it finds money amounts, infers the unit (per-month figures are annualised), parses both `11,904` and EU-decimal `10.179,85`, and anchors each amount to a field by nearby keywords.
- **`/api/cron/crawl`** (weekly, `0 1 * * 1`) runs gap-scan → crawl → extract and writes a **review queue** to R2 (`seo/extraction-review.json`). It **never writes to the live dataset** — requirements are YMYL.
- **Human approval** — in **Admin → Data → Self-healing crawler**, each candidate shows the extracted value, the unit/confidence, the source snippet, and whether it **matches / differs from / is new** vs the current value. "Approve & apply" (`/api/admin/apply-candidate`) writes a **destination-level override** that updates every nationality page for that destination on the next rebuild, and bumps the verification date.

The extractor is proven by `node scripts/extract-selftest.mjs` (5/5 passing across static HTML, JSON API, SPA-embedded data, monthly→yearly conversion, and EU-decimal parsing).

**Coverage audit.** `npm run audit` (`scripts/audit-coverage.mjs`) checks every destination record is complete: it has the core requirement categories (admission, funds, insurance, language, passport), a government/official primary source plus at least one extra source, and that **every requirement maps to the rich-detail knowledge base** so no requirement is left thin. Current status: 25/25 destinations pass with zero gaps, all multi-sourced, every requirement key covered.

## How to grow the site (auto-expand)

- **Add a nationality:** add a row to `src/lib/req-data/seed/nationalities.json` (set `apsRequired` correctly), commit, rebuild. A new sourced page per destination is generated automatically.
- **Add a new destination:** create `src/lib/req-data/seed/tpl-<code>.json` (copy an existing one, fill in the official figures + sources), add the destination to `destinations.json`, and import it into the `TEMPLATES` array in `index.ts`. Rebuild → a full column of new pages + a `/study/<code>` hub appears. Launch in disciplined batches — measure impressions, prune thin pages, then scale (per blueprint §4.3).
- **Add/override a record from the admin:** the admin save endpoint writes `data/visa/<id>.json` to R2; on next build it's merged in and wins over the seed.

## SEO & GEO strategy (parity with OfficialSalary)

The same search + AI-visibility system OfficialSalary runs, adapted to this niche:

**Classic SEO**
- **Programmatic SSG** — one page per `nationality × destination`, statically generated.
- **Structured data** — global `Organization` + `WebSite` + `DataCatalog` (with `publishingPrinciples` + `correctionsPolicy`); per-page `Article`, `Dataset` (with source citations), `FAQPage`, `HowTo`, `BreadcrumbList`, and `Speakable`.
- **Sitemap + robots** — conventional `/sitemap.xml`; `robots.ts` with per-engine rules.
- **Dynamic OG images** — `/api/og?title=…&tag=…` renders a branded card per page.
- **Robots snippet directives** — every indexable page emits `max-image-preview:large`, `max-snippet:-1`, `max-video-preview:-1` (via `robotsFor` in `page-policy.ts`) for the largest SERP previews and AI citations.
- **Visible FAQ + matching schema** — every visa, university **and scholarship** page renders a real FAQ section (proof of funds, processing time, documents, insurance, fee, grades, English score, GMAT, eligibility, deadlines…) built from the data, and emits the identical `FAQPage` schema so it matches visible content — targeting "People Also Ask" and FAQ rich results. Builders: `buildVisaFaqs` / `buildUniversityFaqs` / `buildScholarshipFaqs` in `lib/seo.ts`.
- **Deep on-page content per leaf** (anti-thin, all server-rendered): a computed **"key facts at a glance"** box (proof of funds + home-currency, living cost, fee, processing, intakes), a visible **"How to apply, step by step"** section that matches the `HowTo` schema, and a data-driven **"How {destination} compares"** block that ranks the destination by proof-of-funds across all 25 tracked countries with links into the reports and comparisons. Every block is unique per page and adds genuine, useful content.
- **Hardened comparison + hub pages** (the two largest lighter clusters are no longer thin): every `/compare/study/{a}/{b}` page (300 of them) now carries a computed **Verdict** block (cheaper to fund / faster to process / fewer documents, normalised to euros at ECB rates) plus a comparison **FAQ** ("Is it cheaper to study in X or Y?", "Which visa is faster?") with matching schema; every `/study/{destination}` hub (25) gains a **key-facts box** and an **FAQ**. All carry the enhanced robots snippet directives.
- **Internal linking** — hub-and-spoke `RelatedLinks` (other nationalities for the same destination) **plus cross-vertical links** from every leaf page into the destination hub, comparisons, university admission, scholarships and reports — distributing topical authority across the whole cluster and deepening crawl paths.
- **IndexNow instant indexing** (`lib/indexnow.ts`) — pings Bing, Yandex and the shared IndexNow API the moment pages change, so engines re-crawl in minutes instead of waiting. The verification key is served at `/api/indexnow-key`. Runs daily (`/api/cron/indexnow`, scope "changed") or on demand from the admin (scope "all"); set `INDEXNOW_KEY`.
- **Anti-bloat index policy** (`src/lib/page-policy.ts`) — a page only earns `index` if it has real substance (enough requirement items) and is fresh (verified within 180 days). Thin/stale pages get `noindex,follow` and are excluded from the sitemap. A safety floor prevents over-pruning a young site.

**GEO (Generative Engine Optimization — being citable in AI search)**
- **`/llms.txt`** — concise, citable index with extractable numbers (blocked-account minimum, visa fee, verified date, official source URL per record).
- **`/llms-full.txt`** — the complete extractable dataset: every requirement item, sourced and dated.
- **AI-crawler allowlist** in `robots.ts` — GPTBot, OAI-SearchBot, PerplexityBot, Google-Extended, anthropic-ai/ClaudeBot, Applebot, and more are explicitly allowed; CCBot (bulk scraper) is blocked; admin/write APIs are disallowed for everyone.
- **`Speakable` schema + `data-speakable`** markup on the answer text, so voice/AI surfaces can read the key fact aloud.
- **Citable provenance everywhere** — every fact carries a primary-source link and a `lastVerified` date, the structure AI engines reward and can attribute cleanly.

**E-E-A-T trust cluster** — `/methodology`, `/data-sources`, `/editorial-policy` (publishing + corrections policy + monetization independence), `/changelog` (public freshness log), `/about` (real, credentialed author), plus a `DataTrustLine` "verified by / on" block on every record. Persistent non-affiliation banner site-wide.

## The thesis to validate (per blueprint §0.1)

Affiliate is the engine; display is the passenger. On non-tier-1 traffic, **affiliate income must carry the P&L**. The admin SEO module is where you track the **affiliate-vs-display split** and **% tier-1 traffic** — the health metrics for the whole project.

## Admin

- URL: `/admin` (sign in at `/admin/login` with `ADMIN_PASSWORD`).
- **Ads & affiliate:** toggle slots, switch network (AdSense → Journey → Raptive), reorder/enable affiliate offers, edit URLs, lead-gen toggle. Saves to R2; live in ~60s.
- **Data freshness:** records by `lastVerified` age, re-verification queue (human-verify-before-publish for YMYL), rebuild trigger.
- **SEO & health:** structural metrics now; wire GSC + Vercel Analytics to populate live traffic/CWV.

## Scripts

| Command | Does |
|---------|------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (SSG) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed:r2` | Push default config + scholarship records to R2 |

## Trust & compliance

Every page carries the non-affiliation banner, a primary-source link, and an **honest, three-tier provenance line**:

- **Compiled, pending verification** (amber) — seeded/crawled from one source, not yet checked.
- **Cross-checked across multiple official sources** (blue) — the **fact-check engine** (`lib/factcheck.ts`) crawled the primary *and* extra official sources, extracted the figure from each, and **2+ independent official sources agree**. This is the safe form of auto-verification: deterministic multi-source corroboration, no AI, no blind trust. Conflicts are flagged for review and never auto-applied; a human-verified record is never downgraded. Runs weekly (`/api/cron/factcheck`) or from Admin → Data.
- **Verified by a person** (green) — an operator confirmed it against the official source via Admin → Data.

We never imply a check that didn't happen — critical for YMYL integrity. Corroborated and verified records also earn indexing beyond the launch batch.

**E-E-A-T author.** A named, credentialed human author is the strongest YMYL signal. Set `AUTHOR_NAME` / `AUTHOR_URL` / `AUTHOR_BIO` to put a real person on the byline, author schema, and `/about`; otherwise it falls back to the editorial-team organization. (The name is intentionally kept out of the codebase.)

> Independent informational resource. Not affiliated with any government or university. Always verify with the official source.

## Known limitations (and what code can't fix)

Being honest about where this stands:

- **Seed data is not yet human-verified.** Every figure was compiled from web research, not confirmed against the primary source by a person. The site now says so plainly (see above) — but before a real launch, each figure needs the human re-verification step. This is the single most important task and it's manual.
- **Authority / backlinks are the real ranking gate.** On YMYL immigration topics, domain authority, backlinks and time beat any on-page work. A new domain with zero backlinks won't rank regardless of the schema/content depth here. Earning referring domains (e.g. via the data-story reports) is the dominant growth lever and is operational, not code.
- **Launch-batch gating, not the whole matrix.** To avoid scaled-content penalties, only a curated high-value core (priority origin × destination, plus anything human-verified) is indexed; the long-tail is `noindex,follow` until promoted (`PRIORITY_*` sets in `page-policy.ts`, surfaced in Admin → SEO). Indexed footprint is deliberately a fraction of the ~1,300 addressable pages.
- **Extraction is a helper, not autonomy.** The crawler reads structured figures deterministically and proposes candidates for human approval; it can't interpret conditional prose or guarantee correctness, and truly client-rendered SPAs need the optional render service.
- **Monetization is unvalidated.** Affiliate links are placeholders; the affiliate-first thesis is untested; ad networks need traffic the site doesn't have yet.
- **English-only.** The audience is global and often non-native-English; there are no translations or `hreflang` alternates yet. Full localization is a content project.
- **No legal review.** "Official" branding + immigration figures carry liability; the disclaimers help but a lawyer should review before launch.

## Notes

- Built and verified with Next.js 14.2.35 (patched), React 18, Tailwind 3, Zod validation. `npm run build` compiles cleanly, `npm run typecheck` passes, and `npm test` runs **20 unit tests** (Node's built-in runner with type-stripping) covering the cost calculator, timeline planner, eligibility checker, checklist generator, and the extraction engine — the "moat" math now has real coverage. The full addressable matrix is ~1,300 pages across 25 destinations; a seed is prerendered and the rest are served via ISR.
- **Admin auth: Auth.js (NextAuth) single-admin Google OAuth.** The console lives at `/ops` (sign in at `/ops/login`); only the Google account whose verified email equals `ADMIN_EMAIL` may access it (`src/auth.ts`). `src/middleware.ts` gates the whole `/ops` surface and `/api/admin/*` (redirect to `/ops/login`, or 401 for API); `next.config.mjs` adds `X-Robots-Tag: noindex` on `/ops` and `robots.ts` disallows it. Set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ADMIN_EMAIL`; add the redirect URI `https://officialrequirements.com/api/auth/callback/google` (and the localhost one) in the Google Cloud OAuth client. Old `/admin/*` URLs redirect to `/ops`.
