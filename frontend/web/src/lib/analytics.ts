'use client';

/**
 * Provider-agnostic analytics wrapper (§19).
 *
 * Drop in Plausible, GA4, or any provider by implementing the `send` function
 * below — all call sites remain unchanged.
 *
 * Rules:
 * - No PII ever passed to this module.
 * - Consent-aware: if `navigator.doNotTrack === '1'` or the browser has
 *   `Save-Data: on`, we skip non-essential events.
 * - Events are fire-and-forget; failures are silently swallowed so analytics
 *   never degrades UX.
 */

type AnalyticsEvent =
  | { name: 'page_view'; props?: { path: string } }
  | { name: 'article_read'; props: { slug: string; category: string; reading_time: number } }
  | { name: 'add_to_cart'; props: { item_id: string; item_title: string; price: number } }
  | { name: 'checkout_started'; props: { item_count: number; total: number } }
  | { name: 'order_sent'; props: { channel: 'whatsapp' } };

function isConsentGiven(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (navigator.doNotTrack === '1') return false;
  // @ts-expect-error — Save-Data is not in all TS lib typings
  if (navigator.connection?.saveData === true) return false;
  return true;
}

function send(event: AnalyticsEvent): void {
  if (!isConsentGiven()) return;

  try {
    // Plausible: uncomment and add <script defer data-domain="masterwithin.org" src="https://plausible.io/js/script.js"> to layout
    // if (typeof window !== 'undefined' && 'plausible' in window) {
    //   (window as any).plausible(event.name, { props: event.props });
    //   return;
    // }

    // GA4: uncomment when gtag is loaded
    // if (typeof window !== 'undefined' && 'gtag' in window) {
    //   (window as any).gtag('event', event.name, event.props);
    //   return;
    // }

    // Development stub: log to console so events are visible during local dev
    if (process.env.NODE_ENV === 'development') {
      console.debug('[analytics]', event.name, event.props ?? '');
    }
  } catch {
    // Never let analytics break the app
  }
}

export const analytics = {
  pageView(path: string): void {
    send({ name: 'page_view', props: { path } });
  },

  articleRead(slug: string, category: string, readingTime: number): void {
    send({ name: 'article_read', props: { slug, category, reading_time: readingTime } });
  },

  addToCart(itemId: string, itemTitle: string, price: number): void {
    send({ name: 'add_to_cart', props: { item_id: itemId, item_title: itemTitle, price } });
  },

  checkoutStarted(itemCount: number, total: number): void {
    send({ name: 'checkout_started', props: { item_count: itemCount, total } });
  },

  orderSent(): void {
    send({ name: 'order_sent', props: { channel: 'whatsapp' } });
  },
} as const;
