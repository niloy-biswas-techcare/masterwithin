import React, { Suspense } from 'react';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { listArticles } from '@mw/backend';
import { WisdomClient } from './WisdomClient';
import { Spinner } from '@mw/ui';

export const revalidate = 3600; // Cache index for 1 hour (ISR)

export default async function WisdomPage() {
  const queryClient = new QueryClient();

  try {
    // Prefetch articles server-side to warm Cache and enable instant SEO-ready hydration (§12.3)
    await queryClient.prefetchQuery({
      queryKey: ['articles'],
      queryFn: () => listArticles(),
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
