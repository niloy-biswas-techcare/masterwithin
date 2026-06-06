/// <reference lib="webworker" />

import { installSerwist } from '@serwist/sw';
import { NetworkFirst, CacheFirst, ExpirationPlugin, type PrecacheEntry } from 'serwist';

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (string | PrecacheEntry)[] | undefined;
};

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching: [
    {
      matcher: ({ request }: { request: Request }) => request.destination === 'document',
      handler: new NetworkFirst({
        cacheName: 'mw-documents-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
      }),
    },
    {
      matcher: ({ request }: { request: Request }) =>
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'worker',
      handler: new CacheFirst({
        cacheName: 'mw-assets-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    {
      matcher: ({ request }: { request: Request }) => request.destination === 'image',
      handler: new CacheFirst({
        cacheName: 'mw-images-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
  ],
});
