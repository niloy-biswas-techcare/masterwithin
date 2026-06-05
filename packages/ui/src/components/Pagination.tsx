import { cn } from '../lib/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /** Builds the href for a given page (SEO-friendly `?page=` links, §7.2). */
  hrefForPage: (page: number) => string;
  className?: string;
}

/**
 * SEO-friendly, indexable pagination (§7.2, §11): real `<a>` links per page wrapped in
 * a labelled `<nav>`. The current page is marked with `aria-current="page"`.
 */
export function Pagination({ currentPage, totalPages, hrefForPage, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const linkBase =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      {currentPage > 1 ? (
        <a href={hrefForPage(currentPage - 1)} className={cn(linkBase, 'text-text hover:bg-bg')}>
          Previous
        </a>
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
          <a
            key={page}
            href={hrefForPage(page)}
            className={cn(linkBase, 'text-text hover:bg-bg')}
          >
            {page}
          </a>
        ),
      )}
      {currentPage < totalPages ? (
        <a href={hrefForPage(currentPage + 1)} className={cn(linkBase, 'text-text hover:bg-bg')}>
          Next
        </a>
      ) : null}
    </nav>
  );
}
