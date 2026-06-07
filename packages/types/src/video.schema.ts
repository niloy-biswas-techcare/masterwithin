import { z } from 'zod';

/**
 * Video — a single YouTube video mirrored from one of the three channels (§8c, §16).
 * Primary key is the YouTube video ID (stable).
 */
export const VideoSchema = z.object({
  id: z.string(),                          // YouTube video ID (stable; primary key)
  title: z.string(),
  description: z.string().default(''),
  thumbnail: z.string().url(),             // Cloudinary URL (rewritten on ingest)
  duration: z.number().int().positive(),   // seconds
  publishedAt: z.string(),                 // ISO string
  channelId: z.string(),
  language: z.enum(['en', 'bn', 'hi']),
  category: z.string(),                    // one of 8 wisdom category slugs
  categoryLocked: z.boolean().default(false),
  playlistIds: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  hidden: z.boolean().default(false),      // admin can remove from library without deleting
  isShort: z.boolean().default(false),     // duration < 60 seconds
  youtubeUrl: z.string().url(),
});

export type Video = z.infer<typeof VideoSchema>;

/**
 * Playlist — a YouTube playlist mirrored from one of the three channels (§8c, §16).
 * Primary key is the YouTube playlist ID (stable).
 */
export const PlaylistSchema = z.object({
  id: z.string(),                          // YouTube playlist ID
  title: z.string(),
  description: z.string().default(''),
  thumbnail: z.string().url(),             // Cloudinary URL
  videoCount: z.number().int().default(0),
  channelId: z.string(),
  language: z.enum(['en', 'bn', 'hi']),
  publishedAt: z.string(),                 // ISO string
  featured: z.boolean().default(false),
  hidden: z.boolean().default(false),
});

export type Playlist = z.infer<typeof PlaylistSchema>;
