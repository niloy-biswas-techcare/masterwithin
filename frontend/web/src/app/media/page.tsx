import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { listVideos, listPlaylists } from '@mw/backend';
import { Spinner } from '@mw/ui';
import { generateSiteMetadata } from '@/lib/seo';
import { videosListKey, playlistsListKey } from '@/lib/queries';
import { MediaClient } from '@/features/media/MediaClient';

export const revalidate = 86400; // Daily ISR (§7b.1)

export const metadata: Metadata = generateSiteMetadata({
  title: 'Media Library — Spoken Wisdom',
  description:
    'Explore spoken wisdom from Master Within Foundation — talks, conversations, and guided journeys in English, Bengali, and Hindi. Videos auto-synced from three YouTube channels.',
  path: '/media',
});

export default async function MediaPage() {
  const queryClient = new QueryClient();

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: videosListKey,
        queryFn: () => listVideos(),
      }),
      queryClient.prefetchQuery({
        queryKey: playlistsListKey,
        queryFn: () => listPlaylists(),
      }),
    ]);
  } catch (err) {
    console.error('[media-page] Failed to prefetch on server:', err);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <Spinner className="h-8 w-8 text-primary" />
          </div>
        }
      >
        <MediaClient />
      </Suspense>
    </HydrationBoundary>
  );
}
