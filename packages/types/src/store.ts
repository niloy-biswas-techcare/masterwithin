import { z } from 'zod';

/**
 * Physical book (§16 row shape). `price` is an integer in INR. `available` is the
 * public flag that the admin "published" toggle drives (§17.5). `order` is a manual
 * sort weight set via drag-to-reorder.
 *
 * Domain fields are camelCase; the Supabase adapter maps them to the snake_case
 * columns in §16 (`cover_image`, etc.).
 */
export const BookSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  author: z.string().min(1),
  price: z.number().int().nonnegative(), // INR
  coverImage: z.string().url(), // Cloudinary URL
  description: z.string(),
  pages: z.number().int().positive().optional(),
  available: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type Book = z.infer<typeof BookSchema>;

/**
 * eBook listing — like a book but fulfilled via external stores rather than the
 * WhatsApp checkout (§7.7). Carries Google Play Books / Kindle links.
 */
export const EbookSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  author: z.string().min(1).optional(),
  price: z.number().int().nonnegative().optional(), // INR; may be store-controlled
  coverImage: z.string().url(),
  description: z.string(),
  playStoreUrl: z.string().url().optional(),
  kindleUrl: z.string().url().optional(),
  available: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type Ebook = z.infer<typeof EbookSchema>;

export const CourseLevel = z.enum(['beginner', 'intermediate', 'advanced']);
export type CourseLevel = z.infer<typeof CourseLevel>;

/**
 * Course listing & detail (§7.6, §17.5). Structured so a future authenticated
 * "course progress" feature can attach without redesign.
 */
export const CourseSchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  title: z.string().min(1),
  level: CourseLevel,
  description: z.string(),
  whoItsFor: z.string(),
  whatYoullGain: z.string(),
  /** Ordered module outline (titles, optionally with a short summary). */
  moduleOutline: z
    .array(z.object({ title: z.string().min(1), summary: z.string().optional() }))
    .default([]),
  enrollmentCtaLabel: z.string(),
  enrollmentCtaUrl: z.string().url(),
  coverImage: z.string().url().optional(),
  order: z.number().int().default(0),
  published: z.boolean().default(false),
});

export type Course = z.infer<typeof CourseSchema>;

/**
 * Freebie — a free download (§7.7). The file lives in Supabase Storage; the stored
 * `fileUrl` is the signed/public download URL saved on the row (§17.7). No account,
 * no payment.
 */
export const FreebieSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  fileUrl: z.string().url(),
  coverImage: z.string().url().optional(),
  order: z.number().int().default(0),
  published: z.boolean().default(false),
});

export type Freebie = z.infer<typeof FreebieSchema>;
