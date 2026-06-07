import { describe, it, expect, beforeEach } from 'vitest';
import type { Ports, Article, Book, Ebook, Course, Freebie, Order, SiteConfig, StartHereConfig, AuditLog, Operator, Video, Playlist } from '../../domain';

export function runArticleRepositoryContractTests(createRepo: () => Promise<Ports['articles']>) {
  describe('ArticleRepository Contract', () => {
    let repo: Ports['articles'];

    const article1: Article = {
      id: 'art-1',
      title: 'Science of Meditation',
      slug: 'science-of-meditation',
      category: 'science-of-consciousness',
      tags: ['meditation', 'neuroscience'],
      excerpt: 'Exploring brain waves...',
      bodyHtml: '<p>Body 1</p>',
      publishedAt: '2026-01-01T10:00:00Z',
      readingTime: 3,
      substackUrl: 'https://substack.com/p/art-1',
      featured: false,
      categoryLocked: false,
    };

    const article2: Article = {
      id: 'art-2',
      title: 'Mindful Relationships',
      slug: 'mindful-relationships',
      category: 'conscious-relationships',
      tags: ['relationships'],
      excerpt: 'Love and genetics...',
      bodyHtml: '<p>Body 2</p>',
      publishedAt: '2026-01-02T10:00:00Z',
      readingTime: 4,
      substackUrl: 'https://substack.com/p/art-2',
      featured: true,
      categoryLocked: true,
    };

    beforeEach(async () => {
      repo = await createRepo();
      await repo.upsert(article1);
      await repo.upsert(article2);
    });

    it('should retrieve articles by id and slug', async () => {
      const byId = await repo.getById('art-1');
      expect(byId).toEqual(article1);

      const bySlug = await repo.getBySlug('mindful-relationships');
      expect(bySlug).toEqual(article2);

      expect(await repo.getById('non-existent')).toBeNull();
      expect(await repo.getBySlug('non-existent')).toBeNull();
    });

    it('should list articles sorted by publishedAt descending by default', async () => {
      const list = await repo.list();
      expect(list).toHaveLength(2);
      expect(list[0].id).toBe('art-2'); // newest
      expect(list[1].id).toBe('art-1');
    });

    it('should filter articles by category, tag, or featured state', async () => {
      const byCategory = await repo.list({ category: 'science-of-consciousness' });
      expect(byCategory).toHaveLength(1);
      expect(byCategory[0].id).toBe('art-1');

      const byTag = await repo.list({ tag: 'neuroscience' });
      expect(byTag).toHaveLength(1);
      expect(byTag[0].id).toBe('art-1');

      const byFeatured = await repo.list({ featured: true });
      expect(byFeatured).toHaveLength(1);
      expect(byFeatured[0].id).toBe('art-2');
    });

    it('should support pagination', async () => {
      const page1 = await repo.list({ page: 1, pageSize: 1 });
      expect(page1).toHaveLength(1);
      expect(page1[0].id).toBe('art-2');

      const page2 = await repo.list({ page: 2, pageSize: 1 });
      expect(page2).toHaveLength(1);
      expect(page2[0].id).toBe('art-1');

      expect(await repo.count()).toBe(2);
      expect(await repo.count({ category: 'science-of-consciousness' })).toBe(1);
    });

    it('should mutate featured flag and lock category', async () => {
      const featured = await repo.setFeatured('art-1', true);
      expect(featured.featured).toBe(true);

      const overriden = await repo.overrideCategory('art-1', 'optimal-living');
      expect(overriden.category).toBe('optimal-living');
      expect(overriden.categoryLocked).toBe(true);
    });
  });
}

export function runBookRepositoryContractTests(createRepo: () => Promise<Ports['books']>) {
  describe('BookRepository Contract', () => {
    let repo: Ports['books'];

    const book1: Book = {
      id: 'book-1',
      title: 'First Book',
      author: 'Souvik',
      price: 499,
      coverImage: 'https://images.com/cover1.jpg',
      description: 'First description',
      order: 2,
      available: true,
    };

    const book2: Book = {
      id: 'book-2',
      title: 'Second Book',
      author: 'Souvik',
      price: 599,
      coverImage: 'https://images.com/cover2.jpg',
      description: 'Second description',
      order: 1,
      available: false,
    };

    beforeEach(async () => {
      repo = await createRepo();
      await repo.upsert(book1);
      await repo.upsert(book2);
    });

    it('should list books sorted by manual order weight ascending', async () => {
      const list = await repo.list();
      expect(list).toHaveLength(2);
      expect(list[0].id).toBe('book-2'); // order 1
      expect(list[1].id).toBe('book-1'); // order 2
    });

    it('should fetch book by id', async () => {
      const book = await repo.getById('book-1');
      expect(book).toEqual(book1);
      expect(await repo.getById('invalid')).toBeNull();
    });
  });
}

export function runEbookRepositoryContractTests(createRepo: () => Promise<Ports['ebooks']>) {
  describe('EbookRepository Contract', () => {
    let repo: Ports['ebooks'];

    const ebook1: Ebook = {
      id: 'eb-1',
      title: 'Ebook 1',
      author: 'Souvik',
      coverImage: 'https://images.com/eb1.jpg',
      description: 'Desc',
      order: 10,
      available: true,
    };

    beforeEach(async () => {
      repo = await createRepo();
      await repo.upsert(ebook1);
    });

    it('should CRUD ebooks', async () => {
      const list = await repo.list();
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('eb-1');

      const found = await repo.getById('eb-1');
      expect(found).toEqual(ebook1);
    });
  });
}

export function runCourseRepositoryContractTests(createRepo: () => Promise<Ports['courses']>) {
  describe('CourseRepository Contract', () => {
    let repo: Ports['courses'];

    const course1: Course = {
      id: 'c-1',
      slug: 'intro-course',
      title: 'Intro Course',
      level: 'beginner',
      description: 'Learn foundations',
      whoItsFor: 'Beginners',
      whatYoullGain: 'Knowledge',
      moduleOutline: [{ title: 'Module 1', summary: 'Summary 1' }],
      enrollmentCtaLabel: 'Enroll Now',
      enrollmentCtaUrl: 'https://platform.com/c1',
      order: 1,
      published: true,
    };

    beforeEach(async () => {
      repo = await createRepo();
      await repo.upsert(course1);
    });

    it('should fetch courses by slug, id, and list them', async () => {
      const list = await repo.list();
      expect(list).toHaveLength(1);

      const byId = await repo.getById('c-1');
      expect(byId).toEqual(course1);

      const bySlug = await repo.getBySlug('intro-course');
      expect(bySlug).toEqual(course1);
    });
  });
}

export function runFreebieRepositoryContractTests(createRepo: () => Promise<Ports['freebies']>) {
  describe('FreebieRepository Contract', () => {
    let repo: Ports['freebies'];

    const freebie1: Freebie = {
      id: 'f-1',
      title: 'Spiritual Guide',
      description: 'PDF guide',
      fileUrl: 'https://supabase.storage/guide.pdf',
      order: 1,
      published: true,
    };

    beforeEach(async () => {
      repo = await createRepo();
      await repo.upsert(freebie1);
    });

    it('should CRUD freebies', async () => {
      const list = await repo.list();
      expect(list).toHaveLength(1);
      
      const found = await repo.getById('f-1');
      expect(found).toEqual(freebie1);
    });
  });
}

export function runOrderRepositoryContractTests(createRepo: () => Promise<Ports['orders']>) {
  describe('OrderRepository Contract', () => {
    let repo: Ports['orders'];

    const order: Order = {
      items: [{ id: 'book-1', title: 'Book 1', price: 299, qty: 1 }],
      customer: {
        name: 'Niloy',
        mobile: '9876543210',
        address: { line1: 'Sector 5', city: 'Kolkata', state: 'WB', pin: '700091' },
      },
      total: 299,
      channel: 'whatsapp',
    };

    beforeEach(async () => {
      repo = await createRepo();
    });

    it('should persist orders and assign ids', async () => {
      const saved = await repo.create(order);
      expect(saved.id).toBeDefined();
      expect(saved.createdAt).toBeDefined();

      const list = await repo.list();
      expect(list).toHaveLength(1);
      expect(list[0].total).toBe(299);
      expect(await repo.count()).toBe(1);
    });
  });
}

export function runContactRepositoryContractTests(createRepo: () => Promise<Ports['contacts']>) {
  describe('ContactRepository Contract', () => {
    let repo: Ports['contacts'];

    beforeEach(async () => {
      repo = await createRepo();
    });

    it('should persist contacts', async () => {
      const saved = await repo.create({
        name: 'Souvik',
        email: 'souvik@test.com',
        message: 'Hello!',
      });
      expect(saved.id).toBeDefined();
      expect(saved.createdAt).toBeDefined();
    });
  });
}

export function runSiteConfigRepositoryContractTests(createRepo: () => Promise<Ports['siteConfig']>) {
  describe('SiteConfigRepository Contract', () => {
    let repo: Ports['siteConfig'];

    const config: SiteConfig = {
      id: 'main',
      whatsappNumber: '919876543210',
      socials: { youtube: 'https://youtube.com/c/mv' },
      youtube: { featuredVideoIds: ['vid1'] },
      featured: { articleIds: ['art1'], bookIds: ['book1'] },
    };

    beforeEach(async () => {
      repo = await createRepo();
    });

    it('should store and retrieve site config', async () => {
      expect(await repo.get()).toBeNull();
      await repo.upsert(config);
      expect(await repo.get()).toEqual(config);
    });
  });
}

export function runStartHereRepositoryContractTests(createRepo: () => Promise<Ports['startHere']>) {
  describe('StartHereRepository Contract', () => {
    let repo: Ports['startHere'];

    const config: StartHereConfig = [
      {
        id: 'lost',
        title: 'Feeling Lost',
        blurb: 'Help direction',
        targetTags: ['dharma'],
        deeperCtaLabel: 'Read More',
        deeperCtaHref: '/ wisdom',
      },
    ];

    beforeEach(async () => {
      repo = await createRepo();
    });

    it('should store and retrieve Start Here config', async () => {
      expect(await repo.get()).toEqual([]);
      await repo.upsert(config);
      expect(await repo.get()).toEqual(config);
    });
  });
}

export function runAuditLogRepositoryContractTests(createRepo: () => Promise<Ports['auditLogs']>) {
  describe('AuditLogRepository Contract', () => {
    let repo: Ports['auditLogs'];

    const entry: AuditLog = {
      actorUid: 'operator-1',
      actorEmail: 'admin@test.com',
      action: 'create',
      entity: 'book',
      entityId: 'book-1',
      diff: { title: { from: undefined, to: 'Title' } },
      at: '2026-01-01T12:00:00Z',
    };

    beforeEach(async () => {
      repo = await createRepo();
    });

    it('should append logs and list them sorted by timestamp descending', async () => {
      await repo.append(entry);
      await repo.append({ ...entry, at: '2026-01-02T12:00:00Z', entityId: 'book-2' });

      const logs = await repo.list();
      expect(logs).toHaveLength(2);
      expect(logs[0].entityId).toBe('book-2'); // newest
      expect(logs[1].entityId).toBe('book-1');
      
      const limited = await repo.list(1);
      expect(limited).toHaveLength(1);
      expect(limited[0].entityId).toBe('book-2');
    });
  });
}

export function runAuthGatewayContractTests(
  createGateway: (initialOps: Operator[]) => Promise<Ports['auth']>
) {
  describe('AuthGateway Contract', () => {
    let gw: Ports['auth'];
    const op: Operator = { uid: 'uid-1', email: 'admin@test.com', role: 'admin' };

    beforeEach(async () => {
      gw = await createGateway([op]);
    });

    it('should signIn valid operator and verify session', async () => {
      const session = await gw.signIn('admin@test.com', 'admin123');
      expect(session).not.toBeNull();
      expect(session!.operator.email).toBe('admin@test.com');
      expect(session!.accessToken).toBeDefined();

      const verified = await gw.verifySession(session!.accessToken);
      expect(verified).toEqual(op);

      const invalidSession = await gw.verifySession('invalid-token');
      expect(invalidSession).toBeNull();
    });

    it('should reject invalid password or email', async () => {
      expect(await gw.signIn('admin@test.com', 'wrong-pass')).toBeNull();
      expect(await gw.signIn('nonexistent@test.com', 'admin123')).toBeNull();
    });

    it('should revoke sessions and fetch roles', async () => {
      const session = await gw.signIn('admin@test.com', 'admin123');
      expect(await gw.getRole('uid-1')).toBe('admin');

      await gw.revoke('uid-1');
      expect(await gw.verifySession(session!.accessToken)).toBeNull();
    });
  });
}

export function runStorageGatewayContractTests(createGateway: () => Promise<Ports['storage']>) {
  describe('StorageGateway Contract', () => {
    let gw: Ports['storage'];

    beforeEach(async () => {
      gw = await createGateway();
    });

    it('should issue signed upload params and mirror URLs', async () => {
      const imgUpload = await gw.signImageUpload({ folder: 'covers' });
      expect(imgUpload.signature).toBeDefined();
      expect(imgUpload.uploadPreset).toBeDefined();

      const fileUpload = await gw.signFileUpload({ path: 'pdf/guide.pdf' });
      expect(fileUpload.uploadUrl).toBeDefined();
      expect(fileUpload.token).toBeDefined();

      const mirrored = await gw.uploadImage('https://substack.com/image.png');
      expect(mirrored).toContain('res.cloudinary.com');
      expect(mirrored).toContain('image.png');
    });
  });
}

export function runVideoRepositoryContractTests(createRepo: () => Promise<Ports['videos']>) {
  describe('VideoRepository Contract', () => {
    let repo: Ports['videos'];

    const video1: Video = {
      id: 'vid-1',
      title: 'Consciousness Explained',
      description: 'A deep dive into consciousness',
      thumbnail: 'https://res.cloudinary.com/test/image/upload/vid1.jpg',
      duration: 1800,
      publishedAt: '2026-01-01T10:00:00Z',
      channelId: 'UCenglish',
      language: 'en',
      category: 'science-of-consciousness',
      categoryLocked: false,
      playlistIds: [],
      featured: false,
      hidden: false,
      isShort: false,
      youtubeUrl: 'https://youtube.com/watch?v=vid-1',
    };

    const video2: Video = {
      id: 'vid-2',
      title: 'Quick Meditation Tip',
      description: 'Short tip',
      thumbnail: 'https://res.cloudinary.com/test/image/upload/vid2.jpg',
      duration: 45,
      publishedAt: '2026-01-02T10:00:00Z',
      channelId: 'UCenglish',
      language: 'en',
      category: 'optimal-living',
      categoryLocked: false,
      playlistIds: [],
      featured: true,
      hidden: false,
      isShort: true,
      youtubeUrl: 'https://youtube.com/watch?v=vid-2',
    };

    beforeEach(async () => {
      repo = await createRepo();
      await repo.upsert(video1);
      await repo.upsert(video2);
    });

    it('should retrieve a video by id', async () => {
      const found = await repo.getById('vid-1');
      expect(found).toBeDefined();
      expect(found!.title).toBe('Consciousness Explained');
      expect(await repo.getById('non-existent')).toBeNull();
    });

    it('should exclude Shorts by default', async () => {
      const list = await repo.list();
      expect(list.every((v) => !v.isShort)).toBe(true);
      expect(list.some((v) => v.id === 'vid-1')).toBe(true);
      expect(list.some((v) => v.id === 'vid-2')).toBe(false);
    });

    it('should include Shorts when explicitly requested', async () => {
      const shorts = await repo.list({ isShort: true });
      expect(shorts.some((v) => v.id === 'vid-2')).toBe(true);
    });

    it('should filter by language and category', async () => {
      const enVideos = await repo.list({ isShort: false, language: 'en' });
      expect(enVideos.every((v) => v.language === 'en')).toBe(true);

      const byCategory = await repo.list({ isShort: false, category: 'science-of-consciousness' });
      expect(byCategory.length).toBeGreaterThan(0);
      expect(byCategory.every((v) => v.category === 'science-of-consciousness')).toBe(true);
    });

    it('should support curation mutations', async () => {
      const featured = await repo.setFeatured('vid-1', true);
      expect(featured.featured).toBe(true);

      const hidden = await repo.setHidden('vid-1', true);
      expect(hidden.hidden).toBe(true);

      const overridden = await repo.overrideCategory('vid-1', 'optimal-living');
      expect(overridden.category).toBe('optimal-living');
      expect(overridden.categoryLocked).toBe(true);
    });

    it('should idempotently upsert by video id', async () => {
      const updated = await repo.upsert({ ...video1, title: 'Updated Title' });
      expect(updated.title).toBe('Updated Title');
      const found = await repo.getById('vid-1');
      expect(found!.title).toBe('Updated Title');
    });
  });
}

export function runPlaylistRepositoryContractTests(createRepo: () => Promise<Ports['playlists']>) {
  describe('PlaylistRepository Contract', () => {
    let repo: Ports['playlists'];

    const playlist1: Playlist = {
      id: 'pl-1',
      title: 'Journey to Consciousness',
      description: 'A 12-video series',
      thumbnail: 'https://res.cloudinary.com/test/image/upload/pl1.jpg',
      videoCount: 12,
      channelId: 'UCenglish',
      language: 'en',
      publishedAt: '2026-01-01T10:00:00Z',
      featured: false,
      hidden: false,
    };

    beforeEach(async () => {
      repo = await createRepo();
      await repo.upsert(playlist1);
    });

    it('should retrieve a playlist by id', async () => {
      const found = await repo.getById('pl-1');
      expect(found).toBeDefined();
      expect(found!.title).toBe('Journey to Consciousness');
      expect(await repo.getById('non-existent')).toBeNull();
    });

    it('should list playlists excluding hidden by default', async () => {
      await repo.upsert({ ...playlist1, id: 'pl-hidden', hidden: true });
      const list = await repo.list();
      expect(list.every((p) => !p.hidden)).toBe(true);
    });

    it('should support curation mutations', async () => {
      const featured = await repo.setFeatured('pl-1', true);
      expect(featured.featured).toBe(true);

      const hidden = await repo.setHidden('pl-1', true);
      expect(hidden.hidden).toBe(true);

      const updated = await repo.updateDescription('pl-1', 'New description');
      expect(updated.description).toBe('New description');
    });

    it('should idempotently upsert by playlist id', async () => {
      await repo.upsert({ ...playlist1, videoCount: 15 });
      const found = await repo.getById('pl-1');
      expect(found!.videoCount).toBe(15);
    });
  });
}
