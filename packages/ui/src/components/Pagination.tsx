import * as React from 'react';
import { cn } from '../lib/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Builds the href for a given page (SEO-friendly `?page=` links, §7.2). */
  hrefForPage: (page: number) => string;
  /**
   * Router-aware link element injected by the consuming app (e.g. `next/link`'s `Link`)
   * so page changes are soft client transitions, not full-page reloads (§12.6 RC 1).
   * Defaults to a plain `'a'` to keep this design-system package framework-agnostic.
   */
  linkComponent?: React.ElementType;
  className?: string;
}

/**
 * SEO-friendly, indexable pagination (§7.2, §11): real link per page wrapped in
 * a labelled `<nav>`. The current page is marked with `aria-current="page"`.
 */
export function Pagination({
  currentPage,
  totalPages,
  hrefForPage,
  linkComponent,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const LinkEl: React.ElementType = linkComponent ?? 'a';
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const linkBase =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      {currentPage > 1 ? (
        <LinkEl href={hrefForPage(currentPage - 1)} className={cn(linkBase, 'text-text hover:bg-bg')}>
          Previous
        </LinkEl>
      ) : null}
      {pages.map((page) =>
        page === currentPage ? (
          <span
            key={page}
            aria-current="page"
            className={cn(linkBase, 'bg-deep font-medium text-surface')}
          >
            {page}
          </span>
        ) : (
          <LinkEl
            key={page}
            href={hrefForPage(page)}
            className={cn(linkBase, 'text-text hover:bg-bg')}
          >
            {page}
          </LinkEl>
        ),
      )}
      {currentPage < totalPages ? (
        <LinkEl href={hrefForPage(currentPage + 1)} className={cn(linkBase, 'text-text hover:bg-bg')}>
          Next
        </LinkEl>
      ) : null}
    </nav>
  );
}
