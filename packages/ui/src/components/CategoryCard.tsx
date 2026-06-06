import * as React from 'react';
import type { Category } from '@mw/types';
import { cn } from '../lib/cn';
import { Card } from './Card';

export interface CategoryCardProps {
  category: Category;
  /** Destination, e.g. `/wisdom/[slug]`. */
  href: string;
  /** Number of articles in this category, shown as a count (§7.2). */
  count?: number;
  /**
   * Icon node, resolved by the consuming app from `category.icon` (a Lucide name).
   * Kept as a prop so this package needn't bundle an icon registry.
   */
  icon?: React.ReactNode;
  anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  /**
   * Router-aware link element injected by the consuming app (e.g. `next/link`'s `Link`)
   * so navigation is a soft client transition, not a full-page reload (§12.6 RC 1).
   * Defaults to a plain `'a'` to keep this design-system package framework-agnostic.
   */
  linkComponent?: React.ElementType;
  className?: string;
}

/** Wisdom Library category card (§7.2, §4a.5). Icon circle + title + description + count. */
export function CategoryCard({
  category,
  href,
  count,
  icon,
  anchorProps,
  linkComponent,
  className,
}: CategoryCardProps) {
  const LinkEl: React.ElementType = linkComponent ?? 'a';
  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md hover:bg-primary/5',
        className,
      )}
    >
      <LinkEl
        href={href}
        className="group flex flex-col gap-3 p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        {...anchorProps}
      >
        {/* 40px icon circle with bg-primary/8 (§4a.5) */}
        {icon ? (
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-primary shrink-0"
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}

        <h3 className="font-display text-xl leading-tight text-text group-hover:text-deep transition-colors">
          {category.title}
        </h3>
        <p className="text-[0.9375rem] text-text/70 leading-relaxed">{category.description}</p>

        {/* Article count — competence signal, not gatekeeping (§4a.4.0) */}
        {typeof count === 'number' ? (
          <span className="mt-1 text-[13px] font-body font-medium text-primary">
            {count} {count === 1 ? 'article' : 'articles'}
          </span>
        ) : null}
      </LinkEl>
    </Card>
  );
}
