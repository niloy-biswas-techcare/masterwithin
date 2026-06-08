'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArticleCard, EmptyState } from '@mw/ui';
import { CATEGORIES } from '@mw/types';
import { articlesListKey, fetchArticles } from '@/lib/queries';

interface RelatedArticlesClientProps {
  category: string;
}

export function RelatedArticlesClient({ category }: RelatedArticlesClientProps) {
  const { data: allArticles } = useQuery({
    queryKey: articlesListKey,
    queryFn: fetchArticles,
  });

  const related = (allArticles ?? []).filter((a) => a.category === category).slice(0, 3);
  const categoryLabel = CATEGORIES.find((c) => c.slug === category)?.title ?? category;

  if (related.length === 0) {
    return (
      <EmptyState
        title="The library is growing."
        description="Articles in this category will appear here after the next sync."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {related.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          href={`/wisdom/${article.category}/${article.slug}`}
          categoryLabel={categoryLabel}
          linkComponent={Link}
        />
      ))}
    </div>
  );
}
