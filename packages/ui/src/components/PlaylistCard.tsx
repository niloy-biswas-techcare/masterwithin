import * as React from 'react';
import type { Playlist } from '@mw/types';
import { cn } from '../lib/cn';
import { Card } from './Card';
import { CldImage } from './CldImage';
import { Badge } from '../primitives/Badge';

const LANGUAGE_LABELS: Record<string, string> = { en: 'English', bn: 'বাংলা', hi: 'हिंदी' };

export interface PlaylistCardProps {
  playlist: Playlist;
  href: string;
  anchorProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  linkComponent?: React.ElementType;
  className?: string;
}

/** Playlist ("Journey") preview card for the Media Library (§7b, §11, §6d.5). */
export function PlaylistCard({
  playlist,
  href,
  anchorProps,
  linkComponent,
  className,
}: PlaylistCardProps) {
  const LinkEl: React.ElementType = linkComponent ?? 'a';
  return (
    <Card className={cn('flex flex-col overflow-hidden group transition-transform duration-150 active:scale-[0.98] h-full', className)}>
      <LinkEl
        href={href}
        className="flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        {...anchorProps}
      >
        {/* Thumbnail */}
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted/20 relative">
          <CldImage
            src={playlist.thumbnail}
            alt=""
            width={640}
            height={360}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {/* Video count badge */}
          <span className="absolute bottom-2 right-2 bg-dark/80 text-surface text-xs font-body px-1.5 py-0.5 rounded">
            {playlist.videoCount} talks
          </span>
        </div>

        <div className="flex flex-col gap-2 p-5 flex-1">
          {/* Language badge */}
          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="shrink-0">
              {LANGUAGE_LABELS[playlist.language] ?? playlist.language}
            </Badge>
          </div>

          <h3 className="font-display font-semibold text-lg leading-snug text-text line-clamp-2 group-hover:text-deep transition-colors">
            {playlist.title}
          </h3>

          <p className="line-clamp-2 text-[0.9375rem] text-text/70 leading-relaxed flex-1">
            {playlist.description}
          </p>

          {/* Hover affordance (§4a.5, §7b) */}
          <span className="font-display italic text-sm text-primary/80 mt-1 group-hover:text-primary transition-colors">
            Begin this journey →
          </span>
        </div>
      </LinkEl>
    </Card>
  );
}
