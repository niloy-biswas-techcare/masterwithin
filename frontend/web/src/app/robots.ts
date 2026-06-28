import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.masterwithin.net';

// Paths that no crawler should ever reach.
const INTERNAL_PATHS = ['/api/', '/admin/', '/_next/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── Search engine crawlers ────────────────────────────────────────────
      // Googlebot: full access; crawl-rate is managed via Search Console
      // because Googlebot ignores Crawl-delay in robots.txt.
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: INTERNAL_PATHS,
      },

      // Bing / Microsoft: full access with a modest delay.
      {
        userAgent: ['Bingbot', 'msnbot', 'msnbot-media'],
        allow: '/',
        disallow: INTERNAL_PATHS,
        crawlDelay: 5,
      },

      // Other reputable search engines.
      {
        userAgent: ['DuckDuckBot', 'YandexBot', 'Baiduspider', 'Applebot'],
        allow: '/',
        disallow: INTERNAL_PATHS,
        crawlDelay: 10,
      },

      // Social / link-preview bots (LinkedIn, Twitter/X, Facebook previews).
      {
        userAgent: ['LinkedInBot', 'Twitterbot', 'facebookexternalhit'],
        allow: '/',
        disallow: INTERNAL_PATHS,
      },

      // Archive.org — allow full indexing.
      {
        userAgent: 'ia_archiver',
        allow: '/',
        disallow: INTERNAL_PATHS,
        crawlDelay: 10,
      },

      // ── AI training crawlers — disallow all ──────────────────────────────
      // These crawlers harvest content for AI model training without
      // compensation. Blocking them does not affect search rankings.
      {
        userAgent: [
          'GPTBot',           // OpenAI
          'ChatGPT-User',     // OpenAI (browsing)
          'Google-Extended',  // Google AI products
          'anthropic-ai',     // Anthropic
          'ClaudeBot',        // Anthropic / Claude
          'CCBot',            // Common Crawl (used for AI training)
          'PerplexityBot',    // Perplexity AI
          'Amazonbot',        // Amazon Alexa AI
          'YouBot',           // You.com AI
          'Applebot-Extended',// Apple AI products
          'Diffbot',          // Diffbot AI
          'Bytespider',       // TikTok / ByteDance
          'FacebookBot',      // Meta AI
          'Omgilibot',        // Webz.io AI data
          'ImagesiftBot',     // AI image harvesting
          'Seekr',            // Seekr AI
        ],
        disallow: '/',
      },

      // ── SEO scrapers — disallow all ──────────────────────────────────────
      // These tools provide no SEO value to the site owner and consume
      // significant server resources / edge quota.
      {
        userAgent: [
          'SemrushBot',
          'SemrushBot-SA',
          'AhrefsBot',
          'MJ12bot',
          'DotBot',
          'BLEXBot',
          'SerpstatBot',
          'RogerBot',
          'SiteAuditBot',
          'DataForSeoBot',
          'PetalBot',
          'proximic',
          'seznambot',
        ],
        disallow: '/',
      },

      // ── Default rule — all other crawlers ────────────────────────────────
      {
        userAgent: '*',
        allow: '/',
        disallow: INTERNAL_PATHS,
        crawlDelay: 10,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
