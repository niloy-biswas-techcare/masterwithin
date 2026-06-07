'use client';
import * as React from 'react';
import { cn } from '../lib/cn';
import { CldImage } from './CldImage';

export interface VideoPlayerProps {
  videoId: string;
  thumbnail: string;
  title: string;
  className?: string;
}

/**
 * Lite-embed YouTube player (§7b.2, §6d.5).
 * Renders thumbnail + play-button overlay on load; swaps to iframe on click.
 * No autoplay on page load — autoplay only fires after the play-button click.
 * prefers-reduced-motion: play overlay has no animation.
 */
export function VideoPlayer({ videoId, thumbnail, title, className }: VideoPlayerProps) {
  const [playing, setPlaying] = React.useState(false);

  if (playing) {
    return (
      <div className={cn('aspect-[16/9] w-full rounded-lg overflow-hidden bg-dark', className)}>
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        'aspect-[16/9] w-full rounded-lg overflow-hidden relative group cursor-pointer bg-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      onClick={() => setPlaying(true)}
      aria-label={`Play: ${title}`}
    >
      <CldImage
        src={thumbnail}
        alt={title}
        width={1280}
        height={720}
        className="w-full h-full object-cover"
      />
      {/* Play button overlay */}
      <span
        className="absolute inset-0 flex items-center justify-center bg-dark/30 group-hover:bg-dark/40 transition-colors"
        aria-hidden="true"
      >
        <span className="w-16 h-16 rounded-full bg-surface/90 flex items-center justify-center shadow-md">
          {/* Inline SVG play icon — no external dep */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-7 h-7 text-primary ml-1"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
