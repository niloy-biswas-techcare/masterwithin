'use client';

import React, { useEffect, useRef } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface PrefetchLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  prefetchQuery?: {
    queryKey: unknown[];
    queryFn: () => Promise<unknown>;
  };
}

export function PrefetchLink({ children, className, prefetchQuery, href, ...props }: PrefetchLinkProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLAnchorElement | null>(null);

  const triggerPrefetch = React.useCallback(() => {
    // 1. Prefetch Next.js page route
    if (typeof href === 'string') {
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
    // Check if network connection has Save-Data enabled
    const nav = navigator as unknown as { connection?: { saveData?: boolean } };
    const connection = nav.connection;
    const saveData = connection?.saveData || false;

    if (saveData) {
      return; // Respect user preferences: disable prefetch on Save-Data
    }

    if (elementRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              triggerPrefetch();
              // Unobserve immediately after prefetching
              if (observerRef.current && elementRef.current) {
                observerRef.current.unobserve(elementRef.current);
              }
            }
          });
        },
        { rootMargin: '100px' } // Prefetch when within 100px of viewport
      );

      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [href, prefetchQuery, triggerPrefetch]);

  const handleMouseEnter = () => {
    triggerPrefetch();
  };

  const handleFocus = () => {
    triggerPrefetch();
  };

  const handleTouchStart = () => {
    triggerPrefetch();
  };

  const handleMouseDown = () => {
    triggerPrefetch();
  };

  return (
    <Link
      ref={elementRef}
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {children}
    </Link>
  );
}
