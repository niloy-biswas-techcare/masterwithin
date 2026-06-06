import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import withMDXInit from "@next/mdx";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
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
  async redirects() {
    return [
      // Stub for future immutable-slug redirect mappings (§13)
      // { source: '/wisdom/old-category/old-post-slug', destination: '/wisdom/new-category/new-post-slug', permanent: true }
    ];
  }
};

export default withMDX(withSerwist(nextConfig));

