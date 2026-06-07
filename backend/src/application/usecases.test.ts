import { describe, it, expect, beforeEach } from 'vitest';
import { createInMemoryPorts } from '../adapters/inmemory';
import {
  makeListArticles,
  makeGetArticle,
  makeFeatureArticle,
  makeOverrideCategory,
  makeDeleteArticle,
  makeSyncSubstack,
  makeImportBySubstackUrl,
  makeListBooks,
  makeUpsertBook,
  makeUpsertEbook,
  makeUpsertFreebie,
  makeUpsertCourse,
  makePlaceOrder,
  makeGetSiteConfig,
  makeUpdateSiteConfig,
  makeGetStartHere,
  makeUpdateStartHere,
  makeSubmitContact,
} from './index';
import type { Ports, Article, Book, Ebook, Course, Freebie, Order, ContactInput, SiteConfig } from '../domain';
import { ValidationError } from './errors';

describe('Application Use-Cases Unit Tests', () => {
  let ports: Ports;
  const adminActor = { uid: 'op-1', email: 'admin@test.com' };
  const sampleArticle: Article = {
    id: 'art-1',
    title: 'Sample Post',
    slug: 'sample-post',
    category: 'optimal-living',
    tags: ['habits'],
    excerpt: 'Post blurb',
    bodyHtml: '<p>Body text</p>',
    publishedAt: '2026-06-01T00:00:00Z',
    readingTime: 2,
    substackUrl: 'https://substack.com/p/sample',
    featured: false,
    categoryLocked: false,
  };

  beforeEach(() => {
    ports = createInMemoryPorts();
  });

  describe('Articles Curation Use-Cases', () => {
    beforeEach(async () => {
      await ports.articles.upsert(sampleArticle);
    });

    it('should list and retrieve articles', async () => {
      const listArticles = makeListArticles(ports.articles);
      const getArticle = makeGetArticle(ports.articles);

      const list = await listArticles();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('art-1');

      const found = await getArticle('sample-post');
      expect(found).not.toBeNull();
      expect(found!.id).toBe('art-1');
    });

    it('should toggle featured state and write audit logs', async () => {
      const featureArticle = makeFeatureArticle(ports.articles, ports.auditLogs);
      const updated = await featureArticle(adminActor, 'art-1', true);
      expect(updated.featured).toBe(true);

      const logs = await ports.auditLogs.list();
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('update');
      expect(logs[0].entity).toBe('article');
      expect(logs[0].diff.featured).toEqual({ from: false, to: true });
    });

    it('should override categories, lock them, and write audit logs', async () => {
      const overrideCategory = makeOverrideCategory(ports.articles, ports.auditLogs);
      const updated = await overrideCategory(adminActor, 'art-1', 'science-of-consciousness');
      expect(updated.category).toBe('science-of-consciousness');
      expect(updated.categoryLocked).toBe(true);

      const logs = await ports.auditLogs.list();
      expect(logs).toHaveLength(1);
      expect(logs[0].diff.category).toEqual({ from: 'optimal-living', to: 'science-of-consciousness' });
      expect(logs[0].diff.categoryLocked).toEqual({ from: false, to: true });
    });
  });

  describe('syncSubstack Use-Case', () => {
    const mockRssXml = `
      <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
        <channel>
          <item>
            <title>Optimal Morning Habits</title>
            <link>https://souvik.substack.com/p/optimal-morning-habits</link>
            <guid>https://souvik.substack.com/p/optimal-morning-habits</guid>
            <pubDate>Fri, 05 Jun 2026 12:00:00 GMT</pubDate>
            <category>optimal-living</category>
            <category>Routine</category>
            <description>A simple guide to morning habits.</description>
            <content:encoded><![CDATA[<p class="body-markup">Morning is key. Here is a picture: <img src="https://substack.com/img1.png" /></p>]]></content:encoded>
          </item>
        </channel>
      </rss>
    `;

    it('should perform a full RSS sync with sanitization, categorization, image rewriting, and auditing', async () => {
      const syncSubstack = makeSyncSubstack(ports, ports.auditLogs);
      const mockFetcher = async () => mockRssXml;

      const result = await syncSubstack(adminActor, 'https://mock.url/feed', mockFetcher);

      expect(result.fetched).toBe(1);
      expect(result.newCount).toBe(1);
      expect(result.updatedCount).toBe(0);
      expect(result.skippedCount).toBe(0);
      expect(result.errors).toHaveLength(0);

      // Verify article was inserted
      const list = await ports.articles.list();
      expect(list).toHaveLength(1);
      
      const article = list[0];
      expect(article.title).toBe('Optimal Morning Habits');
      expect(article.category).toBe('optimal-living'); // auto-categorized by keyword "habit/routine/optimal"
      expect(article.excerpt).toBe('Morning is key. Here is a picture:');
      
      // Inline image rewritten to mock Cloudinary URL
      expect(article.bodyHtml).toContain('https://res.cloudinary.com/mock-cloud/image/upload/articles/img1.png');
      expect(article.bodyHtml).not.toContain('https://substack.com/img1.png');

      // CSS class preserved through sanitizer (§8b)
      expect(article.bodyHtml).toContain('class="body-markup"');

      // Verify audit trail
      const logs = await ports.auditLogs.list();
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('create');
      expect(logs[0].entityId).toBe(article.id);
    });

    it('should respect categoryLocked status on sync update', async () => {
      const syncSubstack = makeSyncSubstack(ports, ports.auditLogs);
      const mockFetcher = async () => mockRssXml;

      // First sync
      await syncSubstack(adminActor, 'https://mock.url/feed', mockFetcher);
      const list = await ports.articles.list();
      
      // Manual override category
      const overrideCategory = makeOverrideCategory(ports.articles, ports.auditLogs);
      await overrideCategory(adminActor, list[0].id, 'source-code');

      // Second sync
      const result2 = await syncSubstack(adminActor, 'https://mock.url/feed', mockFetcher);
      expect(result2.skippedCount).toBe(1); // category remains locked, no changes

      const listAfter = await ports.articles.list();
      expect(listAfter[0].category).toBe('source-code');
    });
  });

  describe('deleteArticle Use-Case', () => {
    it('should delete an existing article and audit it', async () => {
      const deleteArticle = makeDeleteArticle(ports.articles, ports.auditLogs);
      const listArticles = makeListArticles(ports.articles);

      // Seed an article
      await ports.articles.upsert(sampleArticle);
      expect(await listArticles()).toHaveLength(1);

      // Delete it
      await deleteArticle(adminActor, sampleArticle.id);

      // Verify it's gone
      expect(await listArticles()).toHaveLength(0);

      // Verify audit log
      const logs = await ports.auditLogs.list();
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('delete');
      expect(logs[0].entityId).toBe(sampleArticle.id);
    });

    it('should throw if article not found', async () => {
      const deleteArticle = makeDeleteArticle(ports.articles, ports.auditLogs);
      await expect(deleteArticle(adminActor, 'nonexistent-id')).rejects.toThrow('Article not found');
    });
  });

  describe('syncSubstack mirror-delete', () => {
    it('should delete articles not present in the RSS feed', async () => {
      const syncSubstack = makeSyncSubstack(ports, ports.auditLogs);
      const listArticles = makeListArticles(ports.articles);

      // Seed 2 articles directly
      const article1: Article = {
        ...sampleArticle,
        id: 'feed-article-1',
        slug: 'feed-article-1',
        title: 'Feed Article',
        substackUrl: 'https://souvik.substack.com/p/feed-article-1',
      };
      const article2: Article = {
        ...sampleArticle,
        id: 'orphan-article-2',
        slug: 'orphan-article-2',
        title: 'Orphan Article',
        substackUrl: 'https://souvik.substack.com/p/orphan-article-2',
      };
      await ports.articles.upsert(article1);
      await ports.articles.upsert(article2);
      expect(await listArticles()).toHaveLength(2);

      // Mock RSS with only article1 (article2 is "deleted" from Substack)
      const mockRssWithOneItem = `
        <rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
          <channel>
            <item>
              <title>Feed Article</title>
              <link>https://souvik.substack.com/p/feed-article-1</link>
              <guid>https://souvik.substack.com/p/feed-article-1</guid>
              <pubDate>Fri, 05 Jun 2026 12:00:00 GMT</pubDate>
              <description>Desc</description>
              <content:encoded><![CDATA[<p>Content</p>]]></content:encoded>
            </item>
          </channel>
        </rss>
      `;
      const mockFetcher = async () => mockRssWithOneItem;

      const result = await syncSubstack(adminActor, 'https://mock.url/feed', mockFetcher);

      // article1 was updated (skipped — same content), article2 was mirror-deleted
      expect(result.deletedCount).toBe(1);
      expect(result.fetched).toBe(1);

      // Only article1 should remain
      const remaining = await listArticles();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('feed-article-1');
    });
  });

  describe('importBySubstackUrl Use-Case', () => {
    it('should import from feed fallback or direct scrape', async () => {
      const importBySubstackUrl = makeImportBySubstackUrl(ports, ports.auditLogs);

      const mockPageHtml = `
        <html>
          <head>
            <meta property="og:title" content="The Mystery of Mind" />
            <meta property="og:description" content="An investigation into thoughts." />
            <meta property="og:image" content="https://substack.com/cover.jpg" />
            <meta property="article:published_time" content="2026-06-01T15:00:00.000Z" />
          </head>
          <body>
            <div class="post-content">
              <p>Mind is vast.</p>
            </div>
          </body>
        </html>
      `;

      const mockFetcher = async () => mockPageHtml;
      
      const article = await importBySubstackUrl(
        adminActor,
        'https://souvik.substack.com/p/mystery-of-mind',
        mockFetcher
      );

      expect(article.title).toBe('The Mystery of Mind');
      expect(article.excerpt).toBe('An investigation into thoughts.');
      expect(article.bodyHtml).toBe('<p>Mind is vast.</p>');
      expect(article.coverImage).toBe('https://res.cloudinary.com/mock-cloud/image/upload/articles/cover.jpg');
      expect(article.category).toBe('science-of-consciousness'); // auto-categorized by "mind/thought" keyword
    });
  });

  describe('Store CRUD Use-Cases', () => {
    it('should support physical books operations with Zod validation', async () => {
      const listBooks = makeListBooks(ports.books);
      const upsertBook = makeUpsertBook(ports.books, ports.auditLogs);

      const validBook: Book = {
        id: 'book-1',
        title: 'Mastering Life',
        author: 'Souvik',
        price: 350,
        coverImage: 'https://cloudinary.com/mv/book1.jpg',
        description: 'Great read',
        order: 1,
        available: true,
      };

      const saved = await upsertBook(adminActor, validBook);
      expect(saved).toEqual(validBook);

      const list = await listBooks();
      expect(list).toHaveLength(1);

      // Verify audit logs
      const logs = await ports.auditLogs.list();
      expect(logs).toHaveLength(1);
      expect(logs[0].entityId).toBe('book-1');

      // Reject invalid book
      await expect(
        upsertBook(adminActor, { ...validBook, price: -10 } as any)
      ).rejects.toThrow(ValidationError);
    });

    it('should support ebooks, freebies, and courses operations', async () => {
      const upsertEbook = makeUpsertEbook(ports.ebooks, ports.auditLogs);
      const upsertFreebie = makeUpsertFreebie(ports.freebies, ports.auditLogs);
      const upsertCourse = makeUpsertCourse(ports.courses, ports.auditLogs);

      const validEbook: Ebook = {
        id: 'eb-1',
        title: 'Ebook 1',
        author: 'Souvik',
        coverImage: 'https://cl.com/eb1.jpg',
        description: 'Ebook description',
        order: 1,
        available: true,
      };

      const validFreebie: Freebie = {
        id: 'f-1',
        title: 'Free meditation guide',
        description: 'PDF copy',
        fileUrl: 'https://sup.com/meditation.pdf',
        order: 1,
        published: true,
      };

      const validCourse: Course = {
        id: 'c-1',
        slug: 'spiritual-vitality',
        title: 'Spiritual Vitality',
        level: 'intermediate',
        description: 'Growth course',
        whoItsFor: 'Everyone',
        whatYoullGain: 'Peace',
        moduleOutline: [],
        enrollmentCtaLabel: 'Buy',
        enrollmentCtaUrl: 'https://platform.com/c1',
        order: 1,
        published: true,
      };

      expect(await upsertEbook(adminActor, validEbook)).toBeDefined();
      expect(await upsertFreebie(adminActor, validFreebie)).toBeDefined();
      expect(await upsertCourse(adminActor, validCourse)).toBeDefined();
    });
  });

  describe('placeOrder Use-Case', () => {
    beforeEach(async () => {
      const book1: Book = {
        id: 'book-1',
        title: 'Authoritative Book',
        author: 'Souvik',
        price: 500, // authoritative price
        coverImage: 'https://cloudinary.com/mv/book1.jpg',
        description: 'Great read',
        order: 1,
        available: true,
      };
      const book2: Book = {
        id: 'book-2',
        title: 'Unavailable Book',
        author: 'Souvik',
        price: 300,
        coverImage: 'https://cloudinary.com/mv/book2.jpg',
        description: 'Sold out',
        order: 2,
        available: false,
      };
      await ports.books.upsert(book1);
      await ports.books.upsert(book2);
    });

    it('should verify authoritative prices and recalculate order totals', async () => {
      const placeOrder = makePlaceOrder(ports.books, ports.orders);

      const cartOrder: Order = {
        items: [
          { id: 'book-1', title: 'Tampered Book Name', price: 99, qty: 2 }, // tampered price and name
        ],
        customer: {
          name: 'Niloy',
          mobile: '9876543210',
          address: { line1: 'Slt Lk', city: 'Kolkata', state: 'WB', pin: '700091' },
        },
        total: 198, // tampered total
        channel: 'whatsapp',
      };

      const processed = await placeOrder(cartOrder);
      expect(processed.total).toBe(1000); // 500 * 2 (verified total)
      expect(processed.items[0].price).toBe(500); // verified price
      expect(processed.items[0].title).toBe('Authoritative Book'); // verified title
      expect(processed.id).toBeDefined();
    });

    it('should reject orders containing unavailable books', async () => {
      const placeOrder = makePlaceOrder(ports.books, ports.orders);

      const badOrder: Order = {
        items: [{ id: 'book-2', title: 'Unavailable Book', price: 300, qty: 1 }],
        customer: {
          name: 'Niloy',
          mobile: '9876543210',
          address: { line1: 'Slt Lk', city: 'Kolkata', state: 'WB', pin: '700091' },
        },
        total: 300,
        channel: 'whatsapp',
      };

      await expect(placeOrder(badOrder)).rejects.toThrow(ValidationError);
    });
  });

  describe('Config & Curation Config Use-Cases', () => {
    it('should update site configuration and Start Here paths', async () => {
      const getSiteConfig = makeGetSiteConfig(ports.siteConfig);
      const updateSiteConfig = makeUpdateSiteConfig(ports.siteConfig, ports.auditLogs);
      const getStartHere = makeGetStartHere(ports.startHere);
      const updateStartHere = makeUpdateStartHere(ports.startHere, ports.auditLogs);

      const config: SiteConfig = {
        id: 'main',
        whatsappNumber: '919876543210',
        socials: { youtube: 'https://youtube.com/mv' },
        youtube: { featuredVideoIds: [] },
        featured: { articleIds: [], bookIds: [] },
      };

      expect(await getSiteConfig()).toBeNull();
      const updatedConfig = await updateSiteConfig(adminActor, config);
      expect(updatedConfig.whatsappNumber).toBe('919876543210');
      expect(await getSiteConfig()).toEqual(updatedConfig);

      const startHereData = [
        {
          id: 'lost',
          title: 'Lost',
          blurb: 'lost blurb',
          targetTags: ['dharma'],
          deeperCtaLabel: 'CTA',
          deeperCtaHref: '/start',
        },
      ];

      expect(await getStartHere()).toEqual([]);
      const updatedSH = await updateStartHere(adminActor, startHereData);
      expect(updatedSH).toHaveLength(1);
      expect(await getStartHere()).toEqual(updatedSH);
    });
  });

  describe('submitContact Use-Case', () => {
    it('should save submissions and trigger notifications', async () => {
      const submitContact = makeSubmitContact(ports.contacts);

      const contact: ContactInput = {
        name: 'Souvik Ghosh',
        email: 'souvik@test.com',
        message: 'Hello World',
      };

      const saved = await submitContact(contact);
      expect(saved.id).toBeDefined();
      expect(saved.name).toBe('Souvik Ghosh');
    });

    it('should trigger honeypot detection for spam bots', async () => {
      const submitContact = makeSubmitContact(ports.contacts);

      const spamBotInput: ContactInput = {
        name: 'Spammer Bot',
        email: 'bot@spam.com',
        message: 'Click this link!',
        website: 'http://dangerouslink.com', // honeypot triggered
      };

      await expect(submitContact(spamBotInput)).rejects.toThrow(ValidationError);
    });
  });
});
