// Bing Webmaster Tools "XML file" verification method, served at
// /BingSiteAuth.xml. Set BING_SITE_VERIFICATION to the code Bing gives you
// (same code as the meta-tag method) and redeploy. This is an alternative to
// the meta tag in layout.tsx — either one verifies ownership.
export const dynamic = "force-static";

export function GET() {
  const token = process.env.BING_SITE_VERIFICATION || "";
  const xml = `<?xml version="1.0"?>\n<users>\n  <user>${token}</user>\n</users>\n`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
