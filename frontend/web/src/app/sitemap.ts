import { MetadataRoute } from 'next';
import { listArticles, listCourses, listVideos, listPlaylists } from '@mw/backend';
import { CATEGORIES } from '@mw/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://masterwithin.org';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static paths
  const staticRoutes = [
    '',
    '/wisdom',
    '/media',
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

  // 5. Dynamic videos
  let videoRoutes: MetadataRoute.Sitemap = [];
  try {
    const { videos } = await listVideos();
    videoRoutes = videos.map((v) => ({
      url: `${SITE_URL}/media/${v.id}`,
      lastModified: new Date(v.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error('[sitemap] Failed to fetch videos for sitemap:', err);
  }

  // 6. Dynamic playlists
  let playlistRoutes: MetadataRoute.Sitemap = [];
  try {
    const { playlists } = await listPlaylists();
    playlistRoutes = playlists.map((p) => ({
      url: `${SITE_URL}/media/playlists/${p.id}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    }));
  } catch (err) {
    console.error('[sitemap] Failed to fetch playlists for sitemap:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...courseRoutes, ...videoRoutes, ...playlistRoutes];
}
