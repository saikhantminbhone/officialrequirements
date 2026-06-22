// HTML + SPA-state parsing (no DOM dependency). Handles three realities:
//  1. Static HTML  → strip tags to visible text.
//  2. JS/SPA HTML  → the rendered data is almost always embedded as JSON in the
//     served HTML (Next __NEXT_DATA__, Nuxt __NUXT__, Apollo/Redux state,
//     <script type="application/json|ld+json">). We pull that JSON out so we can
//     read SPA data WITHOUT running a browser.
//  3. JSON API     → handled in source.ts.

/** Strip scripts/styles and tags, returning readable text. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&euro;/gi, "€")
    .replace(/&pound;/gi, "£")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/\s+/g, " ")
    .trim();
}

/** Extract embedded JSON blobs from SPA framework state + JSON script tags. */
export function extractEmbeddedJson(html: string): unknown[] {
  const blobs: unknown[] = [];
  const tryParse = (s: string) => {
    try {
      blobs.push(JSON.parse(s));
    } catch {
      /* ignore non-JSON */
    }
  };

  // Next.js
  const next = /<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i.exec(html);
  if (next) tryParse(next[1]);

  // <script type="application/json"> and ld+json (Nuxt payload, Apollo, schema, etc.)
  const scriptJson = /<script[^>]*type=["']application\/(?:ld\+)?json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptJson.exec(html))) tryParse(m[1].trim());

  // window.__NUXT__ = {...};  /  __INITIAL_STATE__ = {...}  /  __APOLLO_STATE__ = {...}
  const assigns = [
    /window\.__NUXT__\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/i,
    /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/i,
    /window\.__APOLLO_STATE__\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/i,
    /__INITIAL_DATA__\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/i,
  ];
  for (const re of assigns) {
    const a = re.exec(html);
    if (a) tryParse(a[1]);
  }

  return blobs;
}

/** Flatten any JSON value into a single text string so figure extraction can run over it. */
export function jsonToText(value: unknown, depth = 0): string {
  if (depth > 8 || value == null) return "";
  if (typeof value === "string") return value + " ";
  if (typeof value === "number" || typeof value === "boolean") return String(value) + " ";
  if (Array.isArray(value)) return value.map((v) => jsonToText(v, depth + 1)).join(" ");
  if (typeof value === "object") {
    // Include keys too — keys like "proofOfFunds" or "amount" give extraction context.
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}: ${jsonToText(v, depth + 1)}`)
      .join(" ");
  }
  return "";
}

/** Heuristic: does this HTML look client-rendered (a SPA shell) rather than content? */
export function looksLikeSpa(html: string, visibleText: string): boolean {
  const markers =
    /id=["']__next["']|id=["']app["']|id=["']root["']|data-reactroot|ng-version|__NUXT__|window\.__NEXT_DATA__|data-server-rendered/i.test(
      html
    );
  // A SPA shell typically has lots of script but little visible text.
  const thinText = visibleText.length < 600;
  return markers && thinText;
}
