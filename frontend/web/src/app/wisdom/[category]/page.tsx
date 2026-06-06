import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listArticles } from '@mw/backend';
import { CATEGORIES, getCategoryBySlug } from '@mw/types';
import { ArticleCard } from '@mw/ui';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import type { Article } from '@mw/types';
import { generateSiteMetadata } from '@/lib/seo';

export const revalidate = 3600; // Cache for 1 hour (ISR)

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// Generate static routes for the 8 fixed categories at build time (§5.1, §12.3)
export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({
    category: c.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return generateSiteMetadata({ title: 'Category Not Found' });

  return generateSiteMetadata({
    title: category.title,
    description: `${category.description} Browse all articles in the ${category.title} category from Master Within Foundation.`,
    path: `/wisdom/${categorySlug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  
  const category = getCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  let articles: Article[] = [];
  try {
    const allArticles = await listArticles();
    articles = allArticles.filter((art) => art.category === categorySlug);
  } catch (err) {
    console.error('[category-page] Failed to fetch articles:', err);
  }

  return (
    <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 section-md flex flex-col gap-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text/50">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/wisdom" className="hover:text-primary transition-colors">Wisdom</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-text/80">{category.title}</span>
      </nav>

      {/* Header */}
      <div className="border-b border-border/40 pb-8">
        <Link
          href="/wisdom"
          className="group inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back to Library
        </Link>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text">
          {category.title}
        </h1>
        <p className="mt-2 text-lg text-text/75 max-w-2xl font-body">
          {category.description}
        </p>
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art) => (
            <ArticleCard
              key={art.id}
              article={art}
              href={`/wisdom/${art.category}/${art.slug}`}
              categoryLabel={category.title}
              className="h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-surface/10">
          <p className="text-text/75 text-lg font-display font-medium italic">The library is growing. Return soon.</p>
          <p className="text-text/50 text-sm mt-1">New writings in this category are being curated.</p>
          <Link
            href="/wisdom"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/95 transition-colors shadow-sm"
          >
            Browse Library
          </Link>
        </div>
      )}
    </div>
  );
}
