# Deploy checklist — Vercel Pro

Status at last check: `tsc --noEmit` clean · 20/20 unit tests pass · `next build` compiles
(Next 16 + React 19). The app builds and runs on bundled **seed data** with no env vars,
so a missing variable never breaks the build — the related feature just stays dormant.

## 1. Environment variables (Vercel → Project → Settings → Environment Variables)

### Required for full functionality
| Variable | Why |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your production URL, e.g. `https://officialrequirements.com`. Drives canonical tags, OG images, sitemap, robots. Set this or SEO breaks. |
| `AUTH_SECRET` | Auth.js session encryption. Generate: `openssl rand -base64 32`. **Rotate the one shared in chat.** |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth client for admin login. |
| `ADMIN_EMAIL` | The single Google account allowed into `/ops`. |
| `CRON_SECRET` | **Without it, every cron returns 401 and nothing runs.** Vercel auto-sends it as a Bearer token. Generate: `openssl rand -hex 32`. |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` | Cloudflare R2 — the only data store. Without these the site serves seed data only and admin/crawl writes won't persist. |

### Optional (degrade gracefully if unset)
| Variable | Enables |
|---|---|
| `R2_PUBLIC_BASE_URL` | Public R2 asset URLs (if used). |
| `VERCEL_DEPLOY_HOOK_URL` | Auto-rebuild after data changes / auto-unpublish. |
| `RENDER_SERVICE_URL` | JS/SPA rendering during the crawl (else static + JSON extraction only). |
| `GSC_SERVICE_ACCOUNT_JSON` / `GSC_SITE_URL` | Search Console performance cron. |
| `CRUX_API_KEY` | Core Web Vitals cron (Chrome UX Report). |
| `INDEXNOW_KEY` | Instant index pings to search engines. |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4. |
| `AUTHOR_NAME` / `AUTHOR_URL` / `AUTHOR_BIO` | Named credentialed author (stronger E-E-A-T). |

Set required vars for **Production** (and Preview if you want previews to work).

## 2. Google OAuth console
Add the production redirect URI and origin to the OAuth client:
- Authorized redirect URI: `https://YOURDOMAIN/api/auth/callback/google`
- Authorized origin: `https://YOURDOMAIN`
(Keep the localhost ones for dev.)

## 3. Cron jobs
Defined in `vercel.json` (8 jobs). They run **only on production deployments**, and Pro
supports this schedule. They no-op safely until `CRON_SECRET` + R2 are set.

## 4. Project settings
- Framework: Next.js (auto-detected). Build command `next build` (in vercel.json).
- Node version: 20.x or 22.x (project requires >= 20.9).
- The build prints a `middleware → proxy` deprecation **warning** — harmless, not a failure.

## 5. After first deploy
1. Visit `/ops/login`, sign in with the `ADMIN_EMAIL` Google account.
2. Confirm `/sitemap.xml` and `/robots.txt` show your production domain.
3. Trigger a cron once manually to confirm auth + R2:
   `curl -H "Authorization: Bearer $CRON_SECRET" https://YOURDOMAIN/api/cron/fx`
4. Submit the sitemap in Google Search Console.
