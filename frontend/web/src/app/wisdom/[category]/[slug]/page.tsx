import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticle, listArticles } from '@mw/backend';
import { getCategoryBySlug } from '@mw/types';
import { Prose, Badge } from '@mw/ui';
import { formatDate } from '@mw/utils';
import { ReadingProgress } from '@/components/shared/ReadingProgress';
import { ShareButtons } from '@/components/shared/ShareButtons';
import { FloatingShareButtons } from '@/components/shared/FloatingShareButtons';
import { generateSiteMetadata, getArticleJsonLd, getBreadcrumbsJsonLd } from '@/lib/seo';
import { RelatedArticlesClient } from './RelatedArticlesClient';
import { ChevronRight, Calendar, Clock, ArrowLeft } from 'lucide-react';
import type { Article } from '@mw/types';

export const revalidate = 3600; // Cache for 1 hour (ISR)

interface ArticlePageProps {
  params: Promise<{ category: string; slug: string }>;
}

// Generate static parameters for all ingested articles at build time (§5.1, §12.3)
export async function generateStaticParams() {
  try {
    const articles = await listArticles();
    return articles.map((art) => ({
      category: art.category,
      slug: art.slug,
    }));
  } catch (err) {
    console.error('[article-page] Failed to generate static params:', err);
    return [];
  }
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { category, slug } = await params;
  try {
    const article = await getArticle(slug);
    if (!article) {
      return generateSiteMetadata({ title: 'Article Not Found' });
    }
    
    // Dynamic OpenGraph image path
    const ogImage = `/api/og?title=${encodeURIComponent(article.title)}&category=${encodeURIComponent(category)}`;

    return generateSiteMetadata({
      title: article.title,
      description: article.excerpt,
      path: `/wisdom/${category}/${slug}`,
      ogImage,
    });
  } catch (err) {
    console.error('[article-page] Failed to generate metadata:', err);
    return generateSiteMetadata({ title: 'Article' });
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category: categorySlug, slug } = await params;

  const category = getCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  let article: Article | null = null;
  let relatedArticles: Article[] = [];

  try {
    article = await getArticle(slug);
    if (!article || article.category !== categorySlug) {
      notFound();
    }

    const allArticles = await listArticles();
    
    // Simple heuristic to retrieve top 3 related articles based on category match and tags overlaps
    relatedArticles = allArticles
      .filter((art) => art.id !== article!.id)
      .map((art) => {
        let score = 0;
        if (art.category === categorySlug) {
          score += 5;
        }
        const commonTags = art.tags?.filter((t) => article!.tags?.includes(t)) || [];
        score += commonTags.length * 2;
        return { article: art, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.article);

  } catch (err) {
    console.error('[article-page] Failed to fetch article details:', err);
    notFound();
  }

  // Generate structured JSON-LD schemas (§13)
  const breadcrumbsJsonLd = getBreadcrumbsJsonLd([
    { name: 'Home', item: '/' },
    { name: 'Wisdom', item: '/wisdom' },
    { name: category.title, item: `/wisdom/${categorySlug}` },
    { name: article.title, item: `/wisdom/${categorySlug}/${slug}` },
  ]);
  const articleJsonLd = getArticleJsonLd(article);

  return (
    <>
      {/* Dynamic structured data script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Reading Progress Bar (top sticky) */}
      <ReadingProgress />

      {/* Floating share buttons — desktop only, fades in after 500px scroll */}
      <FloatingShareButtons title={article.title} />

      <article className="w-full bg-bg">
        {/* Banner / Cover Header */}
        <div className="relative border-b border-border/20 bg-surface/30 py-16 md:py-24">
          <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-3xl flex flex-col gap-6">

              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text/50">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href="/wisdom" className="hover:text-primary transition-colors">Wisdom</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link href={`/wisdom/${categorySlug}`} className="hover:text-primary transition-colors">
                  {category.title}
                </Link>
              </nav>

              <Link
                href={`/wisdom/${categorySlug}`}
                className="group inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" /> Back to {category.title}
              </Link>

              <h1 className="font-display text-3xl font-bold tracking-tight text-text sm:text-4xl md:text-5xl leading-tight">
                {article.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-text/70 border-t border-border/40 pt-4">
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{category.title}</Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-text/50" />
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-text/50" />
                  <span>{article.readingTime} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Body — outer container matches home page width, prose column centered inside */}
        <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 py-12 md:py-16">
          <div className="mx-auto max-w-3xl flex flex-col gap-12">
            {/* Editorial Prose Content */}
            <Prose html={article.bodyHtml} />

            {/* Clickable tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-b border-border/40 py-4 my-4">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/wisdom?tag=${tag}`}
                    className="text-xs bg-surface border border-border/60 hover:bg-surface-hover hover:border-primary text-text/70 hover:text-primary transition-all px-2.5 py-1 rounded-full"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Social Share & Substack Attribution */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-surface/30 border border-border/40 rounded-xl p-6">
              <ShareButtons title={article.title} />

              {article.substackUrl && (
                <a
                  href={article.substackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700 transition-colors shadow-sm"
                >
                  Read & Comment on Substack
                </a>
              )}
            </div>
          </div>

          {/* Related Articles Section — full-width within max-w-280, matching home page */}
          {relatedArticles.length > 0 && (
            <div className="border-t border-border/40 pt-16 mt-16">
              <h2 className="font-display text-2xl font-bold tracking-tight text-text mb-8">
                Keep Inquiring
              </h2>
              <RelatedArticlesClient articles={relatedArticles} />
            </div>
          )}
        </div>
      </article>
    </>
  );
}
