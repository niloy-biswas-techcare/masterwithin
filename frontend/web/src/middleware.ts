import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ---------------------------------------------------------------------------
// Bot classification
// ---------------------------------------------------------------------------

// SEO-valuable crawlers — rate-limited but never blocked outright.
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
  'slurp',
  'ia_archiver',
];

// Aggressive scrapers, AI training crawlers, spam bots — always 403.
// These provide no SEO value and burn edge quota.
const BAD_BOT_PATTERNS = [
  'semrushbot',
  'ahrefsbot',
  'mj12bot',
  'dotbot',
  'blexbot',
  'serpstatbot',
  'petalbot',
  'bytespider',
  'gptbot',
  'anthropic-ai',
  'ccbot',
  'claudebot',
  'diffbot',
  'proximic',
  'seznambot',
  'siteauditbot',
  'rogerbot',
  'piplbot',
  'neevabot',
  'dataforseobot',
  'screaming frog',
];

// Generic bot signals not in either list above — blocked by default.
const GENERIC_BOT_RE = /bot|crawler|spider|scraper|fetcher|wget|curl|python-requests|go-http-client|okhttp/i;

type BotClass = 'good' | 'bad' | 'unknown-bot' | 'human';

function classifyUA(ua: string): BotClass {
  const lower = ua.toLowerCase();
  if (BAD_BOT_PATTERNS.some((p) => lower.includes(p))) return 'bad';
  if (GOOD_BOT_PATTERNS.some((p) => lower.includes(p))) return 'good';
  if (GENERIC_BOT_RE.test(ua)) return 'unknown-bot';
  return 'human';
}

// ---------------------------------------------------------------------------
// Rate limiting via Upstash Redis
//
// Set these in Vercel env vars (and .env.local for dev):
//   UPSTASH_REDIS_REST_URL=https://...upstash.io
//   UPSTASH_REDIS_REST_TOKEN=...
//
// Create a free Redis database at https://console.upstash.com
// If env vars are absent, rate limiting is skipped (allow-all fallback).
// ---------------------------------------------------------------------------

const _redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Good bots: 1 request per 10 seconds per IP.
// Prevents crawlers from hammering pages faster than Googlebot's recommended rate.
const _botLimiter = _redis
  ? new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(1, '10 s'),
      prefix: 'mw:bot',
      analytics: true,
    })
  : null;

// Human / unknown traffic: 120 requests per 60 seconds per IP.
// Stops DDoS amplification while leaving room for heavy legitimate users.
const _humanLimiter = _redis
  ? new Ratelimit({
      redis: _redis,
      limiter: Ratelimit.slidingWindow(120, '60 s'),
      prefix: 'mw:human',
      analytics: true,
    })
  : null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    '127.0.0.1'
  );
}

function rateLimitResponse(reset: number, limit: number): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return new NextResponse('Too Many Requests', {
    status: 429,
    headers: {
      'Content-Type': 'text/plain',
      'Retry-After': String(retryAfter),
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
    },
  });
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Skip in dev so local work is unaffected.
  if (process.env.NODE_ENV !== 'production') return NextResponse.next();

  const ua = request.headers.get('user-agent') ?? '';
  const botClass = classifyUA(ua);

  // 1. Bad bots and unknown crawlers — reject immediately, no Upstash call.
  if (botClass === 'bad' || botClass === 'unknown-bot') {
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // 2. Apply rate limiting for both good bots and human traffic.
  const limiter = botClass === 'good' ? _botLimiter : _humanLimiter;

  if (limiter) {
    const ip = getIP(request);
    const { success, reset, limit } = await limiter.limit(ip);
    if (!success) return rateLimitResponse(reset, limit);
  }

  return NextResponse.next();
}

export const config = {
  // Run ONLY on routes where per-request logic is genuinely needed.
  //
  // WHY so narrow:
  // Vercel middleware runs before the CDN cache is consulted, so it fires on
  // every single request — including those served entirely from cache. Matching
  // all routes means every Googlebot crawl and every user page view burns an
  // edge invocation, even for fully static / ISR-cached pages.
  //
  // Static and ISR pages (/wisdom, /courses, /media, /store, home, etc.) are
  // already served from Vercel's CDN. By excluding them here, a cache hit
  // costs ZERO edge invocations. Bot protection for those routes is handled
  // by the Vercel Firewall rules (CDN-level, no invocation cost).
  //
  // What IS matched here:
  //   /api/search-index  — force-dynamic, hits Supabase on every call
  //   /api/og            — dynamic OG image generation
  //   /api/videos        — cached but worth rate-limiting direct abuse
  //   /api/playlists     — same as above
  //   /media/[videoId]   — server-rendered on demand (not cached)
  //   /media/playlists/… — server-rendered on demand
  matcher: [
    '/api/search-index',
    '/api/og',
    '/api/videos',
    '/api/playlists',
    '/media/:path*',
  ],
};
