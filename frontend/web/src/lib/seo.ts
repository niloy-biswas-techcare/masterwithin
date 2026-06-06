import type { Metadata } from 'next';
import type { Article, Course, Book } from '@mw/backend';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://masterwithin.org';

/**
 * Generate standard SEO page metadata baseline.
 */
export function generateSiteMetadata({
  title,
  description,
  path = '',
  ogImage,
}: {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
} = {}): Metadata {
  const baseTitle = 'Master Within Foundation';
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  const defDescription =
    'A spiritual–philosophical knowledge hub: the most comprehensive English-language resource for deep life questions.';
  const fullDesc = description || defDescription;
  const canonicalUrl = `${SITE_URL}${path}`;

  return {
    title: fullTitle,
    description: fullDesc,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description: fullDesc,
      url: canonicalUrl,
      siteName: baseTitle,
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : [{ url: `${SITE_URL}/og-image.png` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDesc,
      images: ogImage ? [ogImage] : [`${SITE_URL}/og-image.png`],
    },
  };
}

/**
 * Generate site-wide Organization JSON-LD.
 */
export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Master Within Foundation',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      caption: 'Master Within Foundation Logo',
    },
    sameAs: [
      'https://youtube.com/@masterwithin',
      'https://instagram.com/masterwithin',
      'https://masterwithin.substack.com',
    ],
  };
}

/**
 * Generate BreadcrumbList JSON-LD.
 */
export function getBreadcrumbsJsonLd(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: `${SITE_URL}${it.item}`,
    })),
  };
}

/**
 * Generate Article JSON-LD for Wisdom Library posts.
 */
export function getArticleJsonLd(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': `${SITE_URL}/wisdom/${article.category}/${article.slug}/#article`,
    isPartOf: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/wisdom/${article.category}/${article.slug}/`,
    },
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage ? [article.coverImage] : [`${SITE_URL}/og-image.png`],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: `${SITE_URL}/wisdom/${article.category}/${article.slug}/`,
    author: {
      '@type': 'Person',
      name: 'Souvik Ghosh',
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Master Within Foundation',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

/**
 * Generate Course JSON-LD for the structured courses.
 */
export function getCourseJsonLd(course: Course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${SITE_URL}/courses/${course.slug}/#course`,
    name: course.title,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: 'Master Within Foundation',
      url: SITE_URL,
    },
  };
}

/**
 * Generate Product JSON-LD for books in the store.
 */
export function getProductJsonLd(book: Book) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/store/#product-${book.id}`,
    name: book.title,
    image: book.coverImage ? [book.coverImage] : [],
    description: book.description,
    offers: {
      '@type': 'Offer',
      price: book.price,
      priceCurrency: 'INR',
      availability: book.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/store`,
    },
  };
}
