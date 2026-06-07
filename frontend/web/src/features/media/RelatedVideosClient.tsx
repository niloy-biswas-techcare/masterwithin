'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { VideoCard, EmptyState } from '@mw/ui';
import { videosListKey, fetchVideos } from '@/lib/queries';

interface RelatedVideosClientProps {
  currentVideoId?: string;
  category: string;
}

export function RelatedVideosClient({ currentVideoId, category }: RelatedVideosClientProps) {
  const { data } = useQuery({
    queryKey: videosListKey,
    queryFn: fetchVideos,
  });

  const related = (data?.videos ?? [])
    .filter((v) => v.category === category && v.id !== currentVideoId)
    .slice(0, 3);

  if (related.length === 0) {
    return (
      <EmptyState
        heading="More talks coming soon."
        description="New videos in this category will appear here after the next sync."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {related.map((video) => (
        <VideoCard key={video.id} video={video} href={`/media/${video.id}`} linkComponent={Link} />
      ))}
    </div>
  );
}
