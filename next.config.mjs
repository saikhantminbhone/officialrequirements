/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Programmatic pages are statically generated via generateStaticParams.
  // Runtime ad/affiliate config and admin writes use Vercel serverless functions
  // (no dedicated backend server, no database — data lives in Cloudflare R2).
  experimental: {
    optimizePackageImports: ["@aws-sdk/client-s3"],
  },
  async redirects() {
    return [
      {
        // Next 16 reserves /sitemap.xml for generateSitemaps but doesn't serve an
        // index there — keep the canonical URL working for GSC/BWT/robots.txt.
        source: "/sitemap.xml",
        destination: "/sitemap-index.xml",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/config",
        headers: [
          // Runtime config is cached at the edge for 60s so toggling ads/affiliates
          // is near-instant without a rebuild.
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
      {
        // The admin console must never be indexed.
        source: "/ops/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
