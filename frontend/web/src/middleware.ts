import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Bot classification lists
// ---------------------------------------------------------------------------

/**
 * SEO-valuable crawlers. These are rate-limited (via Upstash when configured)
 * but never blocked outright — blocking them hurts search rankings.
 */
const GOOD_BOT_PATTERNS = [
  'googlebot',
  'google-inspectiontool',
  'bingbot',
  'duckduckbot',
  'yandexbot',
  'baiduspider',
  'applebot',
  'linkedinbot',
  'twitterbot',
  'facebookexternalhit',
  'slurp', // Yahoo
  'ia_archiver', // Internet Archive
];

/**
 * Aggressive SEO scrapers, AI training crawlers, and spam bots.
 * Blocked with 403 — they provide no SEO value and burn edge quota.
 */
const BAD_BOT_PATTERNS = [
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'blexbot',
  'serpstatbot',
  'petalbot',
  'bytespider', // TikTok
  'gptbot', // OpenAI
  'anthropic-ai',
  'ccbot',
  'claudebot',
  'diffbot',
  'proximic',
  'seznambot',
  'siteauditbot',
  'rogerbot',
];

/**
 * Generic patterns that indicate a bot-like UA not in either allowlist.
 * Unknown crawlers are blocked — if a legitimate bot gets caught, add it
 * to GOOD_BOT_PATTERNS above.
 */
const GENERIC_BOT_RE = /bot|crawler|spider|scraper|fetcher|wget|curl|python-requests/i;

type BotClass = 'good' | 'bad' | 'unknown-bot' | 'human';

function classifyUA(ua: string): BotClass {
  const lower = ua.toLowerCase();
  if (BAD_BOT_PATTERNS.some((p) => lower.includes(p))) return 'bad';
  if (GOOD_BOT_PATTERNS.some((p) => lower.includes(p))) return 'good';
  if (GENERIC_BOT_RE.test(ua)) return 'unknown-bot';
  return 'human';
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
//
// ⚠️  IN-MEMORY THROTTLING DOES NOT WORK ON VERCEL EDGE RUNTIME.
//
// Middleware runs on a globally distributed fleet of edge nodes. Each node
// has isolated, non-persistent memory that is not shared across the fleet.
// A Map<ip, count> here would give each of thousands of edge nodes its own
// independent counter, so a single IP could hit every node once per window
// without ever being throttled.
//
// The correct solution is a distributed atomic store. The drop-in for Vercel
// is Upstash Redis + @upstash/ratelimit (free tier: 10,000 req/day):
//
//   Step 1 — install (run from the monorepo root):
//     pnpm add @upstash/ratelimit @upstash/redis --filter web
//
//   Step 2 — create a free Redis database at https://console.upstash.com
//             and copy the REST URL and token.
//
//   Step 3 — add to Vercel environment variables (and .env.local for dev):
//     UPSTASH_REDIS_REST_URL=https://...upstash.io
//     UPSTASH_REDIS_REST_TOKEN=...
//
//   Step 4 — replace the stub below with the real implementation:
//
// ---------------------------------------------------------------------------
/*
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  // Sliding window: 1 request per 10 seconds per IP, per bot.
  limiter: Ratelimit.slidingWindow(1, '10 s'),
  prefix: 'mw:bot',
  analytics: true, // visible in Upstash console
});

async function rateLimit(ip: string): Promise<{ limited: boolean; resetMs: number }> {
  const { success, reset } = await ratelimit.limit(ip);
  return { limited: !success, resetMs: reset };
}
*/

// Stub — always allows through. Remove once Upstash is wired up.
async function rateLimit(_ip: string): Promise<{ limited: boolean; resetMs: number }> {
  return { limited: false, resetMs: 0 };
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Skip entirely outside production so local dev is unaffected.
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  const ua = request.headers.get('user-agent') ?? '';
  const botClass = classifyUA(ua);

  // 1. Bad bots and unknown crawlers — reject immediately.
  if (botClass === 'bad' || botClass === 'unknown-bot') {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // 2. Known good bots — apply rate limit.
  if (botClass === 'good') {
    // Vercel sets x-real-ip; x-forwarded-for is the fallback for other hosts.
    const ip =
      request.headers.get('x-real-ip') ??
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      '127.0.0.1';

    const { limited, resetMs } = await rateLimit(ip);

    if (limited) {
      const retryAfter = Math.max(1, Math.ceil((resetMs - Date.now()) / 1000));
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          // RFC 9110 §10.2.4: seconds until the client may retry.
          'Retry-After': String(retryAfter),
          // Informal header used by some crawlers to respect the window.
          'X-RateLimit-Policy': '1;w=10',
        },
      });
    }
  }

  // 3. Human traffic (and good bots that passed rate limiting) — pass through.
  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files.
  // Keeping middleware off /_next/* and image/font files avoids unnecessary
  // edge invocations for assets that are already cached by the CDN.
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)',
  ],
};
