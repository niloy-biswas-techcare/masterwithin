import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Admin is fully dynamic — no ISR/SSG (§17.1)
  experimental: {
    dynamicIO: false,
  },
  headers: async () => [
    {
      // noindex the entire admin app (§17.1, §13)
      source: "/(.*)",
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
  ],
};

export default nextConfig;
