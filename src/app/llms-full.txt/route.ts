import { buildLlmsFullTxt } from "@/lib/geo";

export const dynamic = "force-static";

// GEO surface (full): the complete extractable dataset with sources + dates.
export async function GET() {
  const body = await buildLlmsFullTxt();
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
