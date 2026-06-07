import * as React from 'react';
import type { Video } from '@mw/types';
import { cn } from '../lib/cn';
import { Card } from './Card';
import { CldImage } from './CldImage';
import { Badge } from '../primitives/Badge';

const LANGUAGE_LABELS: Record<string, string> = { en: 'English', bn: 'বাংলা', hi: 'हिंदी' };

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export interface VideoCardProps {
  video: Video;
  href: string;
  categoryLabel?: string;
  anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  linkComponent?: React.ElementType;
  className?: string;
}

/** Video preview card for the Media Library grid (§7b, §11, §6d.5). */
export function VideoCard({
  video,
  href,
  categoryLabel,
  anchorProps,
  linkComponent,
  className,
}: VideoCardProps) {
  const LinkEl: React.ElementType = linkComponent ?? 'a';
  return (
    <Card className={cn('flex flex-col overflow-hidden group transition-transform duration-150 active:scale-[0.98] h-full', className)}>
      <LinkEl
        href={href}
        className="flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        {...anchorProps}
      >
        {/* Thumbnail — aspect-[16/9] */}
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted/20 relative">
          <CldImage
            src={video.thumbnail}
            alt=""
            width={640}
            height={360}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {/* Duration pill overlay */}
          <span className="absolute bottom-2 right-2 bg-dark/80 text-surface text-xs font-body px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
          {/* Short badge */}
          {video.isShort && (
            <span className="absolute top-2 left-2 bg-primary text-surface text-[11px] font-body font-semibold px-1.5 py-0.5 rounded">
              Short
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 p-5 flex-1">
          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-text/60 font-body">
            <Badge variant="neutral" className="shrink-0">
              {LANGUAGE_LABELS[video.language] ?? video.language}
            </Badge>
            <span aria-hidden="true">·</span>
            <Badge variant="primary" className="shrink-0 max-w-[180px] truncate">
              {categoryLabel ?? video.category}
            </Badge>
          </div>

          <h3 className="font-display font-semibold text-lg leading-snug text-text line-clamp-2 group-hover:text-deep transition-colors">
            {video.title}
          </h3>

          <p className="line-clamp-2 text-[0.9375rem] text-text/70 leading-relaxed flex-1">
            {video.description}
          </p>
        </div>
      </LinkEl>
    </Card>
  );
}
