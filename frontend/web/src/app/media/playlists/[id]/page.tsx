import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { getPlaylist, listVideos } from '@mw/backend';
import { Container, VideoCard, Badge, Eyebrow, Button } from '@mw/ui';
import { generateSiteMetadata } from '@/lib/seo';
import { playlistKey, videosListKey } from '@/lib/queries';
import { RelatedArticlesClient } from '@/features/media/RelatedArticlesClient';
import { CATEGORIES } from '@mw/types';

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

const LANGUAGE_LABELS: Record<string, string> = { en: 'English', bn: 'বাংলা', hi: 'हिंदी' };

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

  // Fetch videos in this playlist
  const { videos: playlistVideos } = await listVideos({ isShort: false }).catch(() => ({ videos: [] }));
  const filteredVideos = playlistVideos.filter((v) => v.playlistIds.includes(id));

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({ queryKey: playlistKey(id), queryFn: () => playlist });
  await queryClient.prefetchQuery({
    queryKey: videosListKey,
    queryFn: () => listVideos({ isShort: false }),
  });

  // Resolve a category for related articles (use first video's category or fallback)
  const playlistCategory = filteredVideos[0]?.category ?? CATEGORIES[0].slug;

  // ItemList JSON-LD (§7b.3)
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
      <Container variant="content" className="section-md flex flex-col gap-12">
        {/* Playlist header */}
        <div className="flex flex-col gap-4 max-w-prose">
          <div className="flex items-center gap-2">
            <Badge variant="neutral">{LANGUAGE_LABELS[playlist.language] ?? playlist.language}</Badge>
            <span className="text-[13px] text-text/60 font-body">{playlist.videoCount} talks</span>
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

        {/* Video list */}
        {filteredVideos.length > 0 && (
          <section aria-label="Videos in this journey">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  href={`/media/${video.id}`}
                  linkComponent={Link}
                />
              ))}
            </div>
          </section>
        )}

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
