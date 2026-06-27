import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import withMDXInit from "@next/mdx";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: true,
});

const withMDX = withMDXInit({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'substackcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.substackcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'substack-post-media.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      // 1. All pages — 1-day CDN cache with stale-while-revalidate.
      //    Must come FIRST so the specific rules below can override it.
      //    Pages with `export const revalidate` (ISR) will have their own
      //    s-maxage set by Next.js/Vercel at render time, which takes precedence.
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=86400',
          },
        ],
      },
      // 2. /_next/static/ — content-addressed (hashed filenames), safe to cache forever.
      //    Overrides rule 1 for these paths.
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // 3. API routes — never cache; responses are dynamic and may be user-specific.
      //    Overrides rule 1 for these paths.
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Stub for future immutable-slug redirect mappings (§13)
      // { source: '/wisdom/old-category/old-post-slug', destination: '/wisdom/new-category/new-post-slug', permanent: true }
    ];
  }
};

export default withMDX(withSerwist(nextConfig));

