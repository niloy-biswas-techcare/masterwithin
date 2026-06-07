import { NextResponse } from 'next/server';
import { listArticles } from '@mw/backend';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const articles = await listArticles();

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

    return NextResponse.json(searchEntries, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[search-index-api] Failed to generate search index:', err);
    return NextResponse.json([], { status: 200 });
  }
}
