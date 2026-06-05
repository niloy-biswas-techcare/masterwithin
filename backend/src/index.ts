import { env } from "./env";
import type { ArticleRepository } from "./domain/ports/ArticleRepository";
import type { Article } from "@mw/types";

// Concrete stub repository for Phase 0
class StubArticleRepository implements ArticleRepository {
  async listArticles(): Promise<Article[]> {
    return [];
  }
  async getArticle(): Promise<Article | null> {
    return null;
  }
  async upsertArticle(article: Article): Promise<Article> {
    return article;
  }
}

// Instantiate repository depending on driver (stubbed for Phase 0)
const articleRepository: ArticleRepository = new StubArticleRepository();

export const listArticles = async (): Promise<Article[]> => {
  console.log(`[backend] listArticles executing using driver: ${env.BACKEND_DRIVER}`);
  return articleRepository.listArticles();
};

export const getArticle = async (slug: string): Promise<Article | null> => {
  console.log(`[backend] getArticle executing for slug: ${slug} using driver: ${env.BACKEND_DRIVER}`);
  return articleRepository.getArticle(slug);
};

export const upsertArticle = async (article: Article): Promise<Article> => {
  console.log(`[backend] upsertArticle executing using driver: ${env.BACKEND_DRIVER}`);
  return articleRepository.upsertArticle(article);
};
