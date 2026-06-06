import * as React from 'react';
import type { Article } from '@mw/types';
import { formatDate } from '@mw/utils';
import { cn } from '../lib/cn';
import { Card } from './Card';
import { CldImage } from './CldImage';
import { Badge } from '../primitives/Badge';

export interface ArticleCardProps {
  article: Article;
  /** Destination, e.g. `/wisdom/[category]/[slug]`. */
  href: string;
  /** Human-readable category title for the badge (falls back to the slug). */
  categoryLabel?: string;
  /**
   * Extra anchor props — used by the web layer to attach intent-prefetch handlers
   * (`onMouseEnter`/`onFocus`/`onTouchStart`) without coupling this card to a router (§12.2).
   */
  anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  /**
   * Router-aware link element injected by the consuming app (e.g. `next/link`'s `Link`)
   * so navigation is a soft client transition, not a full-page reload (§12.6 RC 1).
   * Defaults to a plain `'a'` to keep this design-system package framework-agnostic.
   */
  linkComponent?: React.ElementType;
  className?: string;
}

/** Article preview card for lists and the home grid (§7.2, §11, §4a.5). */
export function ArticleCard({
  article,
  href,
  categoryLabel,
  anchorProps,
  linkComponent,
  className,
}: ArticleCardProps) {
  const LinkEl: React.ElementType = linkComponent ?? 'a';
  return (
    <Card className={cn('flex flex-col overflow-hidden group', className)}>
      <LinkEl
        href={href}
        className="flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        {...anchorProps}
      >
        {/* Cover image — aspect-[16/9], overflow hidden for subtle scale on hover */}
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted/20">
          {article.coverImage ? (
            <CldImage
              src={article.coverImage}
              alt=""
              width={640}
              height={360}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-surface" />
          )}
        </div>

        <div className="flex flex-col gap-2 p-5 flex-1">
          {/* Required metadata row: [CategoryBadge] · [ReadingTime] · [PublishedDate] */}
          <div className="flex items-center gap-2 text-[13px] text-text/60 font-body">
            <Badge variant="primary" className="shrink-0">
              {categoryLabel ?? article.category}
            </Badge>
            <span aria-hidden="true">·</span>
            <span>{article.readingTime} min</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </div>

          <h3 className="font-display font-semibold text-xl leading-snug text-text group-hover:text-deep transition-colors">
            {article.title}
          </h3>

          {/* line-clamp-3: never 1-line truncation (§4a.5) */}
          <p className="line-clamp-3 text-[0.9375rem] text-text/70 leading-relaxed flex-1">
            {article.excerpt}
          </p>
        </div>
      </LinkEl>
    </Card>
  );
}
