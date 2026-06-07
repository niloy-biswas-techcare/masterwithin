import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getPlaylist, listVideos } from '@mw/backend';
import { Container, Badge, Eyebrow, Button, EmptyState } from '@mw/ui';
import { generateSiteMetadata } from '@/lib/seo';
import { playlistKey, videosListKey } from '@/lib/queries';
import { RelatedArticlesClient } from '@/features/media/RelatedArticlesClient';
import { BackButton } from '@/features/media/BackButton';
import { CATEGORIES } from '@mw/types';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

const LANGUAGE_LABELS: Record<string, string> = { en: 'English', bn: 'বাংলা', hi: 'हिंदी' };

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const playlist = await getPlaylist(id);
    return generateSiteMetadata({
      title: playlist.title,
      description: playlist.description.slice(0, 160) || 'A guided journey from Master Within Foundation',
      path: `/media/playlists/${id}`,
      ogImage: playlist.thumbnail,
    });
  } catch {
    return generateSiteMetadata({ title: 'Playlist not found', path: `/media/playlists/${id}` });
  }
}

export default async function PlaylistPage({ params }: Props) {
  const { id } = await params;
  const playlist = await getPlaylist(id).catch(() => null);
  if (!playlist) notFound();

  const { videos: playlistVideos } = await listVideos({ isShort: false }).catch(() => ({ videos: [] }));
  const filteredVideos = playlistVideos.filter((v) => v.playlistIds.includes(id));

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({ queryKey: playlistKey(id), queryFn: () => playlist });
  await queryClient.prefetchQuery({
    queryKey: videosListKey,
    queryFn: () => listVideos({ isShort: false }),
  });

  const playlistCategory = filteredVideos[0]?.category ?? CATEGORIES[0].slug;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: playlist.title,
    description: playlist.description,
    numberOfItems: playlist.videoCount,
    itemListElement: filteredVideos.map((v, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'VideoObject',
        name: v.title,
        thumbnailUrl: v.thumbnail,
        url: v.youtubeUrl,
      },
    })),
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
            <span className="truncate text-text/60">{playlist.title}</span>
          </div>
        </Container>
      </div>

      <Container variant="content" className="section-md flex flex-col gap-12">

        {/* Playlist header */}
        <div className="flex flex-col gap-4 max-w-prose">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="neutral">{LANGUAGE_LABELS[playlist.language] ?? playlist.language}</Badge>
            <span className="text-[13px] text-text/50 font-body">
              {filteredVideos.length > 0 ? filteredVideos.length : playlist.videoCount} talks
            </span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-text leading-tight">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="font-body text-text/70 leading-relaxed">{playlist.description}</p>
          )}
          {filteredVideos.length > 0 && (
            <Button asChild variant="primary" className="w-fit mt-2">
              <Link href={`/media/${filteredVideos[0].id}`}>Begin this journey</Link>
            </Button>
          )}
        </div>

        {/* Curriculum-style video list */}
        <section aria-labelledby="journey-contents-heading">
          <Eyebrow>Contents</Eyebrow>
          <h2 id="journey-contents-heading" className="font-display font-bold text-xl text-text mt-2 mb-6">
            {filteredVideos.length > 0 ? `${filteredVideos.length} Talks in This Journey` : 'Talks in This Journey'}
          </h2>

          {filteredVideos.length === 0 ? (
            <EmptyState
              title="No talks available yet."
              description="The videos in this journey haven't been synced yet. Check back soon, or explore other journeys in the library."
            />
          ) : (
            <ol className="flex flex-col divide-y divide-border/30">
              {filteredVideos.map((video, idx) => (
                <li key={video.id}>
                  <Link
                    href={`/media/${video.id}`}
                    className="group flex items-start gap-4 py-4 rounded-lg px-2 -mx-2 hover:bg-primary/4 transition-colors"
                  >
                    {/* Track number */}
                    <span className="shrink-0 mt-0.5 w-7 text-right font-body text-sm font-semibold text-text/30 group-hover:text-primary/60 transition-colors tabular-nums pt-1">
                      {idx + 1}
                    </span>

                    {/* Thumbnail */}
                    <div className="shrink-0 w-28 sm:w-36 aspect-[16/9] rounded-md overflow-hidden bg-muted/20 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={video.thumbnail}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 right-1 bg-dark/80 text-surface text-[10px] font-body px-1 py-0.5 rounded">
                        {formatDuration(video.duration)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0 pt-0.5">
                      <h3 className="font-display font-semibold text-[0.9375rem] leading-snug text-text line-clamp-2 group-hover:text-primary transition-colors">
                        {video.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-text/55 leading-relaxed hidden sm:block">
                        {video.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="neutral" className="text-[11px]">
                          {LANGUAGE_LABELS[video.language] ?? video.language}
                        </Badge>
                      </div>
                    </div>

                    {/* Arrow affordance */}
                    <span className="shrink-0 self-center text-text/20 group-hover:text-primary/60 transition-all group-hover:translate-x-0.5 pt-1 hidden sm:block">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Related Articles (cross-pillar bridge) */}
        <section aria-labelledby="playlist-related-articles">
          <Eyebrow>From the Written Library</Eyebrow>
          <h2 id="playlist-related-articles" className="font-display font-bold text-2xl text-text mt-2 mb-6">
            Deepen with Reading
          </h2>
          <RelatedArticlesClient category={playlistCategory} />
        </section>
      </Container>
    </HydrationBoundary>
  );
}
