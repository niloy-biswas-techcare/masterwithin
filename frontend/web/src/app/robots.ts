import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.masterwithin.net';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Googlebot gets full access; crawl-rate is managed via Search Console
        // because Googlebot ignores Crawl-delay.
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
      {
        // All other crawlers: same path rules plus a 10-second crawl delay.
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
        crawlDelay: 10,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
