import { candidatesFromText, type FieldCandidate } from "./figures";
import { htmlToText, extractEmbeddedJson, jsonToText, looksLikeSpa } from "./html";

// Orchestrates extraction from a single source URL. Detects whether the page is
// a JSON API, static HTML, or a JS/SPA-rendered page, and extracts accordingly:
//   - JSON API   → parse and flatten to text, then run figure extraction.
//   - static HTML→ strip to visible text (+ any embedded JSON) → extract.
//   - SPA HTML   → read embedded framework JSON; if none and a render service is
//                  configured, fetch the rendered HTML and try again.
// Everything is deterministic and produces *candidates* for human review.

export type ContentKind = "json" | "html-static" | "html-spa" | "rendered" | "unreachable";

export interface ExtractionResult {
  url: string;
  status: number | null;
  kind: ContentKind;
  method: string;
  candidates: FieldCandidate[];
  textSample: string;
  note?: string;
}

const UA = "OfficialRequirements-Extractor/1.0 (+gap-fill; respects robots; human-verified before publish)";

async function fetchText(url: string, timeoutMs = 15000): Promise<{ status: number; contentType: string; body: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": UA, Accept: "*/*" }, redirect: "follow" });
    const contentType = res.headers.get("content-type") || "";
    const body = await res.text();
    return { status: res.status, contentType, body };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function isJson(body: string, contentType: string): boolean {
  if (/application\/json|text\/json/i.test(contentType)) return true;
  const t = body.trimStart();
  return t.startsWith("{") || t.startsWith("[");
}

/** Optional headless-render fallback for fully client-rendered pages. Set
 *  RENDER_SERVICE_URL to a service that returns rendered HTML for ?url=. */
async function renderViaService(url: string): Promise<string | null> {
  const base = process.env.RENDER_SERVICE_URL;
  if (!base) return null;
  const endpoint = base.includes("{url}") ? base.replace("{url}", encodeURIComponent(url)) : `${base}?url=${encodeURIComponent(url)}`;
  const res = await fetchText(endpoint, 25000);
  return res?.body ?? null;
}

export async function extractFromSource(url: string): Promise<ExtractionResult> {
  const fetched = await fetchText(url);
  if (!fetched) {
    return { url, status: null, kind: "unreachable", method: "fetch-failed", candidates: [], textSample: "", note: "Source unreachable or timed out." };
  }
  const { status, contentType, body } = fetched;

  // 1) JSON API
  if (isJson(body, contentType)) {
    try {
      const json = JSON.parse(body);
      const text = jsonToText(json);
      return { url, status, kind: "json", method: "json-api", candidates: candidatesFromText(text), textSample: text.slice(0, 400) };
    } catch {
      /* fall through to html handling */
    }
  }

  // 2) HTML — visible text + any embedded JSON (covers most static + many SPA pages)
  const visible = htmlToText(body);
  const embedded = extractEmbeddedJson(body);
  const embeddedText = embedded.map((b) => jsonToText(b)).join(" ");
  const combined = `${visible} ${embeddedText}`;
  let candidates = candidatesFromText(combined);

  const spa = looksLikeSpa(body, visible);

  if (candidates.length > 0) {
    return {
      url,
      status,
      kind: spa ? "html-spa" : "html-static",
      method: embeddedText && !visible ? "spa-embedded-json" : "html-text",
      candidates,
      textSample: combined.slice(0, 400),
    };
  }

  // 3) SPA with no usable embedded data → optional render-service fallback
  if (spa) {
    const rendered = await renderViaService(url);
    if (rendered) {
      const rText = htmlToText(rendered);
      candidates = candidatesFromText(rText);
      return { url, status, kind: "rendered", method: "render-service", candidates, textSample: rText.slice(0, 400) };
    }
    return {
      url,
      status,
      kind: "html-spa",
      method: "spa-no-data",
      candidates: [],
      textSample: visible.slice(0, 400),
      note: "Client-rendered page with no embedded data. Set RENDER_SERVICE_URL to enable headless rendering, or add an API/static source.",
    };
  }

  return { url, status, kind: "html-static", method: "html-text", candidates, textSample: visible.slice(0, 400), note: candidates.length ? undefined : "No figures matched on this page." };
}
