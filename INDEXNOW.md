# IndexNow setup (Bing + DuckDuckGo, and more)

IndexNow tells search engines the instant your pages change, instead of waiting
for a crawl. **Bing, Yandex, Seznam and Naver consume IndexNow**, and
**DuckDuckGo's results are powered by Bing** — so getting into Bing via IndexNow
also gets you into DuckDuckGo. (Google does not use IndexNow; use Search Console
for Google.)

This project already implements IndexNow end to end. You only need to set one
variable and verify once.

## 1. Generate a key

A key is a 8–128 char hex string. Generate one:

```bash
openssl rand -hex 16   # e.g. 3f9c1a7b2d4e6f8a0b1c2d3e4f5a6b7c
```

## 2. Set the environment variable

In Vercel → Project → Settings → Environment Variables (Production):

```
INDEXNOW_KEY = <the key you generated>
```

The key is hosted at the **root** as `{key}.txt` (in `public/`), and every
submission sets `keyLocation` to that root file. This matters: per the IndexNow
spec, a key file under a sub-path (e.g. `/api/...`) only authorizes URLs under
that path — a root key file authorizes the whole site, which is what we need.

After deploying, confirm `https://YOURDOMAIN/<key>.txt` returns exactly your key
as plain text (32 chars, no trailing newline).

> If you rotate the key, update the `INDEXNOW_KEY` env var **and** rename the
> file in `public/` to `<new-key>.txt` so the two stay in sync.

## 3. Verify in Bing Webmaster Tools (recommended)

1. Add and verify your site in Bing Webmaster Tools (BWT).
2. BWT → **IndexNow** → it will auto-detect submissions, or paste your key.
3. Submit your `sitemap.xml` in BWT as well — IndexNow + sitemap together is the
   fastest path.

## 4. What runs automatically (already wired)

| When | What | Cron |
|---|---|---|
| Daily | Submit pages whose official source changed | `/api/cron/indexnow` |
| Weekly (Mon) | Submit **every** indexable, quality-gated URL (catches new guides, universities, reports) | `/api/cron/indexnow-all` |
| On demand | Admin button in `/ops` → "Submit URLs" | — |

Only pages that pass the quality gate (`visaIndexDecision` / `scholarshipIndexDecision`)
are submitted — never thin or noindexed pages. Submissions go to
`https://api.indexnow.org/indexnow`, which fans out to all participating engines
including Bing.

Requires `INDEXNOW_KEY` **and** `NEXT_PUBLIC_SITE_URL` (your real domain) and
`CRON_SECRET` to be set, or the crons no-op.

## 5. Why Bing/DDG may still lag

Even with IndexNow, Bing decides what to index and is slow for new, low-authority
domains. IndexNow guarantees fast **discovery**, not instant **indexing**. Give it
days to weeks, keep the content substantive, and make sure
`NEXT_PUBLIC_SITE_URL` is your real production domain (a wrong host silently
breaks every submission).
