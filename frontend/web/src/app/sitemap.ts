import { MetadataRoute } from 'next';
import { listArticles, listCourses, listVideos, listPlaylists } from '@mw/backend';
import { CATEGORIES } from '@mw/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.masterwithin.net';

// Regenerate at most once per hour so bots never hit Supabase directly.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static paths
  // lastModified is intentionally omitted — these pages have no reliable
  // modification date and setting new Date() would falsely signal a change
  // on every regeneration, wasting crawl budget.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`,            changeFrequency: 'daily',  priority: 1.0 },
    { url: `${SITE_URL}/wisdom`,     changeFrequency: 'daily',  priority: 0.9 },
    { url: `${SITE_URL}/media`,      changeFrequency: 'daily',  priority: 0.8 },
    { url: `${SITE_URL}/courses`,    changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/store`,      changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/start-here`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/our-ideal`,  changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/about`,      changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`,    changeFrequency: 'monthly', priority: 0.6 },
  ];

  // 2. Category index pages
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${SITE_URL}/wisdom/${cat.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 3. Dynamic articles
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await listArticles();
    articleRoutes = articles.map((art) => ({
      url: `${SITE_URL}/wisdom/${art.category}/${art.slug}`,
      lastModified: new Date(art.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (err) {
    console.error('[sitemap] Failed to fetch articles:', err);
  }

  // 4. Dynamic courses (published only; no date field on CourseSchema)
  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    const courses = await listCourses();
    courseRoutes = courses
      .filter((c) => c.published)
      .map((c) => ({
        url: `${SITE_URL}/courses/${c.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch (err) {
    console.error('[sitemap] Failed to fetch courses:', err);
  }

  // 5. Dynamic videos (adapter excludes hidden and Shorts by default)
  let videoRoutes: MetadataRoute.Sitemap = [];
  try {
    const { videos } = await listVideos();
    videoRoutes = videos.map((v) => ({
      url: `${SITE_URL}/media/${v.id}`,
      lastModified: new Date(v.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch (err) {
    console.error('[sitemap] Failed to fetch videos:', err);
  }

  // 6. Dynamic playlists
  let playlistRoutes: MetadataRoute.Sitemap = [];
  try {
    const { playlists } = await listPlaylists();
    playlistRoutes = playlists.map((p) => ({
      url: `${SITE_URL}/media/playlists/${p.id}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.65,
    }));
  } catch (err) {
    console.error('[sitemap] Failed to fetch playlists:', err);
  }

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...courseRoutes,
    ...videoRoutes,
    ...playlistRoutes,
  ];
}
