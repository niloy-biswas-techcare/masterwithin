'use client';

import React from 'react';
import { ArticleCard } from '@mw/ui';
import { usePrefetch } from '@/hooks/usePrefetch';
import type { Article } from '@mw/types';

interface RelatedArticlesClientProps {
  articles: Article[];
}

export function RelatedArticlesClient({ articles }: RelatedArticlesClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {articles.map((art) => {
        const href = `/wisdom/${art.category}/${art.slug}`;
        return (
          <RelatedArticleCardWrapper key={art.id} article={art} href={href} />
        );
      })}
    </div>
  );
}

function RelatedArticleCardWrapper({ article, href }: { article: Article; href: string }) {
  const prefetchHandlers = usePrefetch({ href });

  return (
    <ArticleCard
      article={article}
      href={href}
      anchorProps={prefetchHandlers}
      className="h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
    />
  );
}
