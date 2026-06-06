'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface UsePrefetchOptions {
  href: string;
  prefetchQuery?: {
    queryKey: unknown[];
    queryFn: () => Promise<unknown>;
  };
}

export function usePrefetch({ href, prefetchQuery }: UsePrefetchOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const elementRef = useRef<HTMLAnchorElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const triggerPrefetch = useCallback(() => {
    // Respect user preferences: disable prefetch on Save-Data
    const nav = navigator as unknown as { connection?: { saveData?: boolean } };
    const connection = nav.connection;
    const saveData = connection?.saveData || false;

    if (saveData) {
      return;
    }

    // 1. Prefetch Next.js page route
    if (href) {
      router.prefetch(href);
    }
    
    // 2. Prefetch TanStack Query data cache
    if (prefetchQuery) {
      queryClient.prefetchQuery({
        queryKey: prefetchQuery.queryKey,
        queryFn: prefetchQuery.queryFn,
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    }
  }, [href, prefetchQuery, router, queryClient]);

  useEffect(() => {
    const nav = navigator as unknown as { connection?: { saveData?: boolean } };
    const connection = nav.connection;
    const saveData = connection?.saveData || false;

    if (saveData) {
      return;
    }

    const currentElement = elementRef.current;
    if (currentElement) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              triggerPrefetch();
              if (observerRef.current && currentElement) {
                observerRef.current.unobserve(currentElement);
              }
            }
          });
        },
        { rootMargin: '100px' }
      );

      observerRef.current.observe(currentElement);
    }

    return () => {
      if (observerRef.current && currentElement) {
        observerRef.current.unobserve(currentElement);
      }
    };
  }, [triggerPrefetch]);

  const onMouseEnter = () => triggerPrefetch();
  const onFocus = () => triggerPrefetch();
  const onTouchStart = () => triggerPrefetch();
  const onMouseDown = () => triggerPrefetch();

  return {
    ref: elementRef,
    onMouseEnter,
    onFocus,
    onTouchStart,
    onMouseDown,
  };
}
