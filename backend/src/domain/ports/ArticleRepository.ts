import type { Article } from "@mw/types";

export interface ArticleRepository {
  listArticles(): Promise<Article[]>;
  getArticle(slug: string): Promise<Article | null>;
  upsertArticle(article: Article): Promise<Article>;
}
