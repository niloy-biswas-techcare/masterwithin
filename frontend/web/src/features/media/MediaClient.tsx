'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'framer-motion';
import { VideoCard, PlaylistCard, EmptyState, Eyebrow, Container } from '@mw/ui';
import { videosListKey, playlistsListKey, fetchVideos, fetchPlaylists } from '@/lib/queries';
import { motionTokens } from '@/lib/motion';

type Language = 'all' | 'en' | 'bn' | 'hi';
type ContentType = 'all' | 'journeys' | 'talks' | 'shorts';

const LANGUAGE_TABS: { value: Language; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'en', label: 'English' },
  { value: 'bn', label: 'বাংলা' },
  { value: 'hi', label: 'हिंदी' },
];

const CONTENT_TABS: { value: ContentType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'journeys', label: 'Journeys' },
  { value: 'talks', label: 'Talks' },
  { value: 'shorts', label: 'Brief Reflections' },
];

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: motionTokens.staggerChildren } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: motionTokens.standard, ease: motionTokens.easeOut as [number, number, number, number] },
  },
};

export function MediaClient() {
  const [language, setLanguage] = useState<Language>('all');
  const [contentType, setContentType] = useState<ContentType>('all');

  const isShortFilter = contentType === 'shorts' ? true : contentType === 'talks' ? false : undefined;
  const langFilter = language === 'all' ? undefined : language;

  const { data: videosData } = useQuery({
    queryKey: videosListKey,
    queryFn: fetchVideos,
  });

  const { data: playlistsData } = useQuery({
    queryKey: playlistsListKey,
    queryFn: fetchPlaylists,
  });

  const allVideos = videosData?.videos ?? [];
  const allPlaylists = playlistsData?.playlists ?? [];

  // Filter client-side
  const filteredVideos = allVideos.filter((v) => {
    const langMatch = !langFilter || v.language === langFilter;
    const shortMatch = isShortFilter === undefined ? !v.isShort : v.isShort === isShortFilter;
    return langMatch && shortMatch;
  });

  const filteredPlaylists = allPlaylists.filter((p) => {
    return !langFilter || p.language === langFilter;
  });

  const showPlaylists = contentType === 'all' || contentType === 'journeys';
  const showVideos = contentType === 'all' || contentType === 'talks' || contentType === 'shorts';
  const featuredPlaylists = filteredPlaylists.filter((p) => p.featured);
  const displayPlaylists = featuredPlaylists.length > 0 ? featuredPlaylists : filteredPlaylists.slice(0, 3);

  return (
    <>
      {/* Hero (§7b.1) */}
      <section className="section-lg bg-gradient-to-b from-primary/5 to-bg relative overflow-hidden">
        <Container variant="content" className="flex flex-col items-center text-center gap-6">
          <Eyebrow>Spoken Wisdom</Eyebrow>
          <motion.h1
            className="font-display font-bold text-[clamp(2.75rem,5vw,4rem)] leading-tight text-text tracking-[-0.02em]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut as [number, number, number, number] }}
          >
            Wisdom in Every Language
          </motion.h1>
          <motion.p
            className="max-w-xl text-text/70 font-body leading-relaxed text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.deliberate, delay: 0.1, ease: motionTokens.easeOut as [number, number, number, number] }}
          >
            Spoken explorations of consciousness, meaning, and inner growth — available in English, Bengali, and Hindi.
          </motion.p>
          <motion.p
            className="text-sm text-text/50 font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: motionTokens.standard, delay: 0.2 }}
          >
            {allVideos.length} talks · {allPlaylists.length} journeys · 3 channels
          </motion.p>
        </Container>
      </section>

      <Container variant="content" className="section-md flex flex-col gap-12">
        {/* Language filter (§7b.1) */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 sticky top-[64px] z-10 bg-bg py-3">
          {LANGUAGE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setLanguage(tab.value)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-colors ${
                language === tab.value
                  ? 'bg-primary text-surface border-primary shadow-sm ring-1 ring-primary'
                  : 'border-border/60 text-text/70 hover:border-primary/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content type filter */}
        <div className="flex gap-2 flex-wrap">
          {CONTENT_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setContentType(tab.value)}
              className={`px-3 py-1 rounded text-sm font-body border transition-colors ${
                contentType === tab.value
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'border-border text-text/60 hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Featured Journeys */}
        {showPlaylists && displayPlaylists.length > 0 && (
          <section aria-labelledby="journeys-heading">
            <Eyebrow>Guided Journeys</Eyebrow>
            <h2 id="journeys-heading" className="font-display font-bold text-2xl text-text mt-2 mb-6">
              Structured Paths of Inquiry
            </h2>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
            >
              {displayPlaylists.map((pl) => (
                <motion.div key={pl.id} variants={cardVariants} className="h-full">
                  <PlaylistCard playlist={pl} href={`/media/playlists/${pl.id}`} linkComponent={Link} className="h-full" />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Latest Talks */}
        {showVideos && (
          <section aria-labelledby="talks-heading">
            <Eyebrow>Latest Talks</Eyebrow>
            <h2 id="talks-heading" className="font-display font-bold text-2xl text-text mt-2 mb-6">
              {contentType === 'shorts' ? 'Brief Reflections' : 'Spoken Wisdom'}
            </h2>
            {filteredVideos.length === 0 ? (
              <EmptyState
                heading="The library is growing."
                description="New videos will appear here after the next sync. Return soon."
              />
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={gridVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredVideos.map((video) => (
                  <motion.div key={video.id} variants={cardVariants} className="h-full">
                    <VideoCard video={video} href={`/media/${video.id}`} linkComponent={Link} className="h-full" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        )}

        {/* Bottom CTA — cross-pillar bridge */}
        <div className="flex flex-col items-center text-center gap-4 section-sm border-t border-border">
          <p className="font-display italic text-text/70 max-w-lg">
            "The spoken word opens the door; the written word deepens the room."
          </p>
          <Link
            href="/wisdom"
            className="text-primary font-body font-medium hover:underline"
          >
            Explore the written library →
          </Link>
        </div>
      </Container>
    </>
  );
}
