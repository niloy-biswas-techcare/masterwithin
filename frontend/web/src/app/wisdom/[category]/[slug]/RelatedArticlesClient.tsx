'use client';

import React from 'react';
import { SmartArticleCard } from '@/components/shared/SmartCards';
import { CATEGORIES } from '@mw/types';
import type { Article } from '@mw/types';

interface RelatedArticlesClientProps {
  articles: Article[];
}

export function RelatedArticlesClient({ articles }: RelatedArticlesClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {articles.map((art) => (
        <SmartArticleCard
          key={art.id}
          article={art}
          href={`/wisdom/${art.category}/${art.slug}`}
          categoryLabel={CATEGORIES.find((c) => c.slug === art.category)?.title}
          className="h-full"
        />
      ))}
    </div>
  );
}
