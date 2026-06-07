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
  async redirects() {
    return [
      // Stub for future immutable-slug redirect mappings (§13)
      // { source: '/wisdom/old-category/old-post-slug', destination: '/wisdom/new-category/new-post-slug', permanent: true }
    ];
  }
};

export default withMDX(withSerwist(nextConfig));

