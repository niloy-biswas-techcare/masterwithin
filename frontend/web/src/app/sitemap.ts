import { MetadataRoute } from 'next';
import { listArticles, listCourses } from '@mw/backend';
import { CATEGORIES } from '@mw/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://masterwithin.org';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static paths
  const staticRoutes = [
    '',
    '/wisdom',
    '/courses',
    '/store',
    '/start-here',
    '/our-ideal',
    '/about',
    '/contact',
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Category paths
  const categoryRoutes = CATEGORIES.map((cat) => ({
    url: `${SITE_URL}/wisdom/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 3. Dynamic articles
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await listArticles();
    articleRoutes = articles.map((art) => ({
      url: `${SITE_URL}/wisdom/${art.category}/${art.slug}`,
      lastModified: new Date(art.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error('[sitemap] Failed to fetch articles for sitemap:', err);
  }

  // 4. Dynamic courses
  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    const courses = await listCourses();
    courseRoutes = courses
      .filter((c) => c.published)
      .map((c) => ({
        url: `${SITE_URL}/courses/${c.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch (err) {
    console.error('[sitemap] Failed to fetch courses for sitemap:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...courseRoutes];
}
