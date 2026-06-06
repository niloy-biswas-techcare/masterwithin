import { NextResponse } from 'next/server';
import { listArticles } from '@mw/backend';

export const revalidate = 3600; // Cache for 1 hour (ISR)

export async function GET() {
  try {
    const articles = await listArticles();
    
    // Map articles to lightweight search entries
    const searchEntries = articles.map((art) => ({
      id: art.id,
      title: art.title,
      excerpt: art.excerpt,
      tags: art.tags,
      category: art.category,
      slug: art.slug,
      publishedAt: art.publishedAt,
      coverImage: art.coverImage,
      readingTime: art.readingTime,
    }));

    return NextResponse.json(searchEntries);
  } catch (err) {
    console.error('[search-index-api] Failed to generate search index:', err);
    // Return empty array fallback so build-time generation or temporary DB outages do not break the app
    return NextResponse.json([]);
  }
}
