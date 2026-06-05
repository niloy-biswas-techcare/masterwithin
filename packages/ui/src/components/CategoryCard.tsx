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
  className?: string;
}

/** Wisdom Library category card with title, description, and article count (§7.2). */
export function CategoryCard({
  category,
  href,
  count,
  icon,
  anchorProps,
  className,
}: CategoryCardProps) {
  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <a
        href={href}
        className="group flex flex-col gap-2 p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        {...anchorProps}
      >
        {icon ? (
          <span className="text-deep" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <h3 className="font-display text-xl leading-tight text-text group-hover:text-deep">
          {category.title}
        </h3>
        <p className="text-base text-text/80">{category.description}</p>
        {typeof count === 'number' ? (
          <span className="mt-1 text-sm text-text/70">
            {count} {count === 1 ? 'article' : 'articles'}
          </span>
        ) : null}
      </a>
    </Card>
  );
}
