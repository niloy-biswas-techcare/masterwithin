import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getVideo, listVideos, listArticles } from '@mw/backend';
import { VideoPlayer, Container, Badge, Eyebrow } from '@mw/ui';
import { generateSiteMetadata } from '@/lib/seo';
import { videoKey, videosListKey, articlesListKey } from '@/lib/queries';
import { RelatedVideosClient } from '@/features/media/RelatedVideosClient';
import { RelatedArticlesClient } from '@/features/media/RelatedArticlesClient';
import { BackButton } from '@/features/media/BackButton';

export const revalidate = 3600;

type Props = { params: Promise<{ videoId: string }> };

const LANGUAGE_LABELS: Record<string, string> = { en: 'English', bn: 'বাংলা', hi: 'हिंदी' };

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m watch`;
  return `${m}m watch`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoId } = await params;
  try {
    const video = await getVideo(videoId);
    return generateSiteMetadata({
      title: video.title,
      description: video.description.slice(0, 160) || 'Watch on Master Within Foundation',
      path: `/media/${videoId}`,
      ogImage: video.thumbnail,
    });
  } catch {
    return generateSiteMetadata({ title: 'Video not found', path: `/media/${videoId}` });
  }
}

export default async function VideoPage({ params }: Props) {
  const { videoId } = await params;
  const video = await getVideo(videoId).catch(() => null);
  if (!video) notFound();

  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: videoKey(videoId), queryFn: () => video }),
    queryClient.prefetchQuery({
      queryKey: videosListKey,
      queryFn: () => listVideos({ category: video.category }),
    }),
    queryClient.prefetchQuery({
      queryKey: articlesListKey,
      queryFn: () => listArticles({ category: video.category }),
    }),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnail,
    uploadDate: video.publishedAt,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    url: video.youtubeUrl,
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Navigation bar */}
      <div className="border-b border-border/40 bg-bg/95 backdrop-blur-sm sticky top-16 z-10">
        <Container variant="content" className="py-3 flex items-center justify-between gap-4">
          <BackButton href="/media" label="Back to Library" />
          <div className="flex items-center gap-2 text-sm font-body text-text/40 truncate min-w-0">
            <Link href="/media" className="hover:text-primary transition-colors shrink-0">
              Media Library
            </Link>
            <span className="shrink-0">/</span>
            <span className="truncate text-text/60">{video.title}</span>
          </div>
        </Container>
      </div>

      <Container variant="content" className="section-md flex flex-col gap-12">
        {/* Video player */}
        <VideoPlayer videoId={video.id} thumbnail={video.thumbnail} title={video.title} />

        {/* Metadata header */}
        <div className="flex flex-col gap-4 max-w-prose">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">{LANGUAGE_LABELS[video.language] ?? video.language}</Badge>
            <Badge variant="primary">{video.category}</Badge>
            <span className="text-[13px] text-text/60 font-body">{formatDuration(video.duration)}</span>
          </div>
          <h1 className="font-display font-semibold text-2xl md:text-3xl leading-snug text-text">
            {video.title}
          </h1>
          <p className="font-body text-text/70 leading-relaxed whitespace-pre-line">
            {video.description}
          </p>
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline font-body mt-1"
          >
            Watch on YouTube ↗
          </a>
        </div>

        {/* Related Videos */}
        <section aria-labelledby="related-videos-heading">
          <Eyebrow>More Talks</Eyebrow>
          <h2 id="related-videos-heading" className="font-display font-bold text-2xl text-text mt-2 mb-6">
            Related Videos
          </h2>
          <RelatedVideosClient currentVideoId={video.id} category={video.category} />
        </section>

        {/* Related Articles */}
        <section aria-labelledby="related-articles-heading">
          <Eyebrow>From the Written Library</Eyebrow>
          <h2 id="related-articles-heading" className="font-display font-bold text-2xl text-text mt-2 mb-6">
            Deepen with Reading
          </h2>
          <RelatedArticlesClient category={video.category} />
        </section>
      </Container>
    </HydrationBoundary>
  );
}
