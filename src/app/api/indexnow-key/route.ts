// Serves the IndexNow verification key (the keyLocation referenced in pings).
// IndexNow fetches this to confirm we own the key before accepting submissions.
export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.INDEXNOW_KEY || "";
  return new Response(key, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
