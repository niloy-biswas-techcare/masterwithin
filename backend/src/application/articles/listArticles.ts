import type { ArticleRepository, ArticleListFilter, Article } from '../../domain';

export type ListArticles = (filter?: ArticleListFilter) => Promise<Article[]>;

export function makeListArticles(articles: ArticleRepository): ListArticles {
  return async (filter) => {
    return articles.list(filter);
  };
}
