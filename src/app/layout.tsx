import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { RuntimeConfigProvider } from "@/components/RuntimeConfigProvider";
import JsonLd from "@/components/JsonLd";
import { globalLd } from "@/lib/seo";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://officialrequirements.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "OfficialRequirements — Study-abroad visa, scholarship & admission requirements",
    template: "%s · OfficialRequirements",
  },
  description:
    "Independent, sourced, freshness-tracked requirements for student visas, scholarships and university admission — with interactive checkers, checklists and cost calculators.",
  robots: {
    index: true,
    follow: true,
    // Allow the largest SERP + AI snippets/previews (better CTR and AI citations).
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: "OfficialRequirements",
    url: siteUrl,
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/api/og"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ga4 = process.env.NEXT_PUBLIC_GA4_ID;
  const isProd = process.env.NODE_ENV === "production";
  return (
    <html lang="en">
      <body>
        <JsonLd data={globalLd()} />
        <RuntimeConfigProvider>
          <SiteHeader />
          <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
          <SiteFooter />
        </RuntimeConfigProvider>
        {/* Vercel Web Analytics + Speed Insights via the auto-served scripts —
            active when deployed on Vercel, no npm dependency to break the build. */}
        {isProd && (
          <>
            <script defer src="/_vercel/insights/script.js" />
            <script defer src="/_vercel/speed-insights/script.js" />
          </>
        )}
        {ga4 && (
          <>
            {/* eslint-disable-next-line @next/next/next-script-for-ga */}
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
