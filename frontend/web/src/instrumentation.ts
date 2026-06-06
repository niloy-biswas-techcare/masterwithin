/**
 * Next.js instrumentation hook (§19).
 *
 * Wire Sentry here when `NEXT_PUBLIC_SENTRY_DSN` is set.
 * This file is auto-loaded by Next.js on the server edge/Node runtime.
 *
 * To activate:
 *   1. pnpm add @sentry/nextjs --filter web
 *   2. Uncomment the Sentry block below.
 *   3. Add NEXT_PUBLIC_SENTRY_DSN to .env.local and Vercel runtime env.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Sentry server-side (Node.js runtime)
    // const { init } = await import('@sentry/nextjs');
    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   init({
    //     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    //     tracesSampleRate: 0.1,
    //     environment: process.env.NODE_ENV,
    //   });
    // }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Sentry edge runtime
    // const { init } = await import('@sentry/nextjs/edge');
    // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN });
    // }
  }
}

export function onRequestError(
  err: unknown,
  _request: { path: string; method: string },
  _context: { routeType: string },
) {
  // Forward unhandled server errors to the monitoring sink (§19).
  // Replace with: Sentry.captureRequestError(err, request, context)
  if (process.env.NODE_ENV !== 'production') {
    console.error('[instrumentation] unhandled server error:', err);
  }
}
