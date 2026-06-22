import { buildLlmsTxt } from "@/lib/geo";

export const dynamic = "force-static";

// GEO surface: a citable, sourced index for AI answer engines.
export async function GET() {
  const body = await buildLlmsTxt();
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
