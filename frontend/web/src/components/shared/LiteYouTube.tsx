'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface LiteYouTubeProps {
  videoId: string;
  title: string;
}

export function LiteYouTube({ videoId, title }: LiteYouTubeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 hover:shadow-md">
      {isLoaded ? (
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          onClick={() => setIsLoaded(true)}
          className="group absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-cover bg-center transition-transform hover:scale-[1.01]"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
          aria-label={`Play video: ${title}`}
        >
          {/* Black overlay backdrop */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors duration-300" />
          
          {/* Play Button Icon */}
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </div>

          <span className="relative z-10 mt-4 text-sm font-medium text-white drop-shadow-md">
            Click to load video
          </span>
        </button>
      )}
    </div>
  );
}
