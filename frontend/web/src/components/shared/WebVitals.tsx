'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * Reports real-user Web Vitals (LCP, CLS, INP, FCP, TTFB) to the analytics
 * sink (§19). Wire a provider inside the `onReport` callback below.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[web-vitals]', metric.name, Math.round(metric.value), metric.rating);
    }

    // Plausible: uncomment to forward vitals as custom events
    // if (typeof window !== 'undefined' && 'plausible' in window) {
    //   (window as any).plausible(metric.name, {
    //     props: { value: Math.round(metric.value), rating: metric.rating },
    //   });
    // }

    // GA4: uncomment when gtag is loaded
    // if (typeof window !== 'undefined' && 'gtag' in window) {
    //   (window as any).gtag('event', metric.name, {
    //     value: Math.round(metric.value),
    //     metric_rating: metric.rating,
    //     non_interaction: true,
    //   });
    // }
  });

  return null;
}
