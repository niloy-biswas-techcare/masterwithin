import { z } from 'zod';

/**
 * Site config — the singleton row (`id: 'main'`) holding operator-editable,
 * public-readable settings (§17.9). Edited in Admin → Settings (`admin` role).
 */
export const SiteConfigSchema = z.object({
  id: z.literal('main').default('main'),
  /** WhatsApp number, international format, no '+' (e.g. 919876543210). */
  whatsappNumber: z.string(),
  socials: z.object({
    youtube: z.string().url().optional(),
    instagram: z.string().url().optional(),
    substack: z.string().url().optional(),
  }),
  youtube: z.object({
    channelId: z.string().optional(),
    featuredVideoIds: z.array(z.string()).default([]),
    channels: z.object({
      en: z.string().optional(),
      bn: z.string().optional(),
      hi: z.string().optional(),
    }).optional(),
  }),
  featured: z.object({
    articleIds: z.array(z.string()).default([]),
    bookIds: z.array(z.string()).default([]),
  }),
  updatedAt: z.string().optional(), // ISO
  updatedBy: z.string().optional(), // operator uid
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
