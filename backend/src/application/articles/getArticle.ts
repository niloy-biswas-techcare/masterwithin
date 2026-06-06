import type { ArticleRepository, Article } from '../../domain';

export type GetArticle = (slug: string) => Promise<Article | null>;

export function makeGetArticle(articles: ArticleRepository): GetArticle {
  return async (slug) => {
    return articles.getBySlug(slug);
  };
}
