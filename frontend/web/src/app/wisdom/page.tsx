import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { listArticles } from '@mw/backend';
import { WisdomClient } from './WisdomClient';
import { Spinner } from '@mw/ui';
import { generateSiteMetadata } from '@/lib/seo';
import { articlesListKey } from '@/lib/queries';

export const revalidate = 3600; // Cache index for 1 hour (ISR)

export const metadata: Metadata = generateSiteMetadata({
  title: 'Wisdom Library',
  description:
    'Explore the Master Within Foundation Wisdom Library — long-form essays on consciousness, optimal living, conscious relationships, self-actualization, and more. Organized into 8 contemplative categories.',
  path: '/wisdom',
});

export default async function WisdomPage() {
  const queryClient = new QueryClient();

  try {
    // Prefetch articles server-side to warm the cache and enable instant SEO-ready
    // hydration (§12.3). Dehydrate the *same lightweight shape* the client reader
    // (`WisdomClient` → `/api/search-index`) expects under the *same key* so the entry
    // is a cache hit on arrival — no duplicate fetch (§12.6 bullet 4).
    await queryClient.prefetchQuery({
      queryKey: articlesListKey,
      queryFn: async () => {
        const articles = await listArticles();
        return articles.map((art) => ({
          id: art.id,
          title: art.title,
          excerpt: art.excerpt,
          tags: art.tags,
          category: art.category,
          slug: art.slug,
          publishedAt: art.publishedAt,
          coverImage: art.coverImage,
          readingTime: art.readingTime,
        }));
      },
    });
  } catch (err) {
    console.error('[wisdom-page] Failed to prefetch articles on server:', err);
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
        <WisdomClient />
      </Suspense>
    </HydrationBoundary>
  );
}
