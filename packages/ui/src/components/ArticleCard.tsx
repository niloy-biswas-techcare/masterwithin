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
  className?: string;
}

/** Article preview card for lists and the home grid (§7.2, §11). */
export function ArticleCard({
  article,
  href,
  categoryLabel,
  anchorProps,
  className,
}: ArticleCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <a
        href={href}
        className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        {...anchorProps}
      >
        {article.coverImage ? (
          <CldImage
            src={article.coverImage}
            alt=""
            width={640}
            height={360}
            className="aspect-video w-full object-cover"
          />
        ) : null}
        <div className="flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2">
            <Badge variant="primary">{categoryLabel ?? article.category}</Badge>
            <span className="text-sm text-text/70">{article.readingTime} min read</span>
          </div>
          <h3 className="font-display text-xl leading-tight text-text group-hover:text-deep">
            {article.title}
          </h3>
          <p className="line-clamp-3 text-base text-text/80">{article.excerpt}</p>
          <time dateTime={article.publishedAt} className="mt-1 text-sm text-text/70">
            {formatDate(article.publishedAt)}
          </time>
        </div>
      </a>
    </Card>
  );
}
