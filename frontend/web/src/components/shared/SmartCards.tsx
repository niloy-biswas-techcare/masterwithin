'use client';

import React from 'react';
import Link from 'next/link';
import { ArticleCard, CourseCard, CategoryCard } from '@mw/ui';
import type { ArticleCardProps, CourseCardProps, CategoryCardProps } from '@mw/ui';
import { usePrefetch } from '@/hooks/usePrefetch';

/**
 * Web-layer card wrappers that turn the framework-agnostic design-system cards into
 * **soft `next/link` navigations** (no full-page reload) and wire the intent + viewport
 * prefetch layer (§12.6 RC 1 + RC 2). The UI package stays router-free; these inject
 * `next/link` as `linkComponent` and attach `usePrefetch` handlers via `anchorProps`.
 */

type SmartArticleCardProps = Omit<ArticleCardProps, 'linkComponent' | 'anchorProps'> & {
  /** Optional TanStack Query warm-up fired on intent/viewport alongside `router.prefetch`. */
  prefetchQuery?: { queryKey: unknown[]; queryFn: () => Promise<unknown> };
};

export function SmartArticleCard({ href, prefetchQuery, ...rest }: SmartArticleCardProps) {
  const prefetchHandlers = usePrefetch({ href, prefetchQuery });
  return <ArticleCard href={href} linkComponent={Link} anchorProps={prefetchHandlers} {...rest} />;
}

type SmartCourseCardProps = Omit<CourseCardProps, 'linkComponent' | 'anchorProps'>;

export function SmartCourseCard({ href, ...rest }: SmartCourseCardProps) {
  const prefetchHandlers = usePrefetch({ href });
  return <CourseCard href={href} linkComponent={Link} anchorProps={prefetchHandlers} {...rest} />;
}

type SmartCategoryCardProps = Omit<CategoryCardProps, 'linkComponent' | 'anchorProps'>;

export function SmartCategoryCard({ href, ...rest }: SmartCategoryCardProps) {
  const prefetchHandlers = usePrefetch({ href });
  return <CategoryCard href={href} linkComponent={Link} anchorProps={prefetchHandlers} {...rest} />;
}
