import { z } from "zod";

export const ArticleSchema = z.object({
  id: z.string(),                  // stable hash of Substack guid/link
  title: z.string(),
  slug: z.string(),                // URL-safe; immutable after first ingest
  category: z.string(),            // one of the 8 category slugs (auto or manual)
  tags: z.array(z.string()).default([]),
  excerpt: z.string(),
  bodyHtml: z.string(),            // sanitized HTML (Cloudinary-rewritten images)
  coverImage: z.string().url().optional(),  // Cloudinary URL
  publishedAt: z.string(),         // ISO string (serializable across RSC boundary)
  readingTime: z.number().int().positive(),
  substackUrl: z.string().url(),
  featured: z.boolean().default(false),
  categoryLocked: z.boolean().default(false), // true once an editor sets category manually
});

export type Article = z.infer<typeof ArticleSchema>;
