import type {
  Article,
  ArticleRepository,
  ArticleListFilter,
  Book,
  BookRepository,
  Ebook,
  EbookRepository,
  Course,
  CourseRepository,
  Freebie,
  FreebieRepository,
  Order,
  OrderRepository,
  OrderListFilter,
  Contact,
  ContactRepository,
  SiteConfig,
  SiteConfigRepository,
  StartHereConfig,
  StartHereRepository,
  AuditLog,
  AuditLogRepository,
  AuthGateway,
  Operator,
  OperatorRole,
  OperatorSession,
  StorageGateway,
  SignedImageUpload,
  SignedFileUpload,
  Video,
  VideoRepository,
  VideoListFilter,
  Playlist,
  PlaylistRepository,
  PlaylistListFilter,
  Ports,
} from '../domain';

/**
 * Deep-clones an object to avoid in-memory reference sharing (§20).
 */
function clone<T>(val: T): T {
  if (val === undefined) return undefined as any;
  return JSON.parse(JSON.stringify(val));
}

export class InMemoryArticleRepository implements ArticleRepository {
  private articles: Article[] = [];

  async list(filter?: ArticleListFilter): Promise<Article[]> {
    let result = [...this.articles];

    if (filter) {
      if (filter.category) {
        result = result.filter((a) => a.category === filter.category);
      }
      if (filter.tag) {
        result = result.filter((a) => a.tags.includes(filter.tag!));
      }
      if (filter.featured !== undefined) {
        result = result.filter((a) => a.featured === filter.featured);
      }
    }

    // Sort newest-first (by publishedAt descending)
    result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Pagination
    if (filter && filter.page && filter.pageSize) {
      const start = (filter.page - 1) * filter.pageSize;
      result = result.slice(start, start + filter.pageSize);
    }

    return result.map(clone);
  }

  async count(filter?: ArticleListFilter): Promise<number> {
    let result = [...this.articles];

    if (filter) {
      if (filter.category) {
        result = result.filter((a) => a.category === filter.category);
      }
      if (filter.tag) {
        result = result.filter((a) => a.tags.includes(filter.tag!));
      }
      if (filter.featured !== undefined) {
        result = result.filter((a) => a.featured === filter.featured);
      }
    }

    return result.length;
  }

  async getBySlug(slug: string): Promise<Article | null> {
    const art = this.articles.find((a) => a.slug === slug);
    return art ? clone(art) : null;
  }

  async getById(id: string): Promise<Article | null> {
    const art = this.articles.find((a) => a.id === id);
    return art ? clone(art) : null;
  }

  async upsert(article: Article): Promise<Article> {
    const cloned = clone(article);
    const idx = this.articles.findIndex((a) => a.id === article.id);
    if (idx >= 0) {
      this.articles[idx] = cloned;
    } else {
      this.articles.push(cloned);
    }
    return clone(cloned);
  }

  async setFeatured(id: string, featured: boolean): Promise<Article> {
    const art = this.articles.find((a) => a.id === id);
    if (!art) throw new Error(`Article not found: ${id}`);
    art.featured = featured;
    return clone(art);
  }

  async overrideCategory(id: string, category: string): Promise<Article> {
    const art = this.articles.find((a) => a.id === id);
    if (!art) throw new Error(`Article not found: ${id}`);
    art.category = category;
    art.categoryLocked = true;
    return clone(art);
  }

  async delete(id: string): Promise<void> {
    this.articles = this.articles.filter((a) => a.id !== id);
  }
}

export class InMemoryBookRepository implements BookRepository {
  private books: Book[] = [];

  async list(): Promise<Book[]> {
    return [...this.books].sort((a, b) => a.order - b.order).map(clone);
  }

  async getById(id: string): Promise<Book | null> {
    const book = this.books.find((b) => b.id === id);
    return book ? clone(book) : null;
  }

  async upsert(book: Book): Promise<Book> {
    const cloned = clone(book);
    const idx = this.books.findIndex((b) => b.id === book.id);
    if (idx >= 0) {
      this.books[idx] = cloned;
    } else {
      this.books.push(cloned);
    }
    return clone(cloned);
  }

  async delete(id: string): Promise<void> {
    this.books = this.books.filter((b) => b.id !== id);
  }
}

export class InMemoryEbookRepository implements EbookRepository {
  private ebooks: Ebook[] = [];

  async list(): Promise<Ebook[]> {
    return [...this.ebooks].sort((a, b) => a.order - b.order).map(clone);
  }

  async getById(id: string): Promise<Ebook | null> {
    const ebook = this.ebooks.find((e) => e.id === id);
    return ebook ? clone(ebook) : null;
  }

  async upsert(ebook: Ebook): Promise<Ebook> {
    const cloned = clone(ebook);
    const idx = this.ebooks.findIndex((e) => e.id === ebook.id);
    if (idx >= 0) {
      this.ebooks[idx] = cloned;
    } else {
      this.ebooks.push(cloned);
    }
    return clone(cloned);
  }
}

export class InMemoryCourseRepository implements CourseRepository {
  private courses: Course[] = [];

  async list(): Promise<Course[]> {
    return [...this.courses].sort((a, b) => a.order - b.order).map(clone);
  }

  async getBySlug(slug: string): Promise<Course | null> {
    const course = this.courses.find((c) => c.slug === slug);
    return course ? clone(course) : null;
  }

  async getById(id: string): Promise<Course | null> {
    const course = this.courses.find((c) => c.id === id);
    return course ? clone(course) : null;
  }

  async upsert(course: Course): Promise<Course> {
    const cloned = clone(course);
    const idx = this.courses.findIndex((c) => c.id === course.id);
    if (idx >= 0) {
      this.courses[idx] = cloned;
    } else {
      this.courses.push(cloned);
    }
    return clone(cloned);
  }
}

export class InMemoryFreebieRepository implements FreebieRepository {
  private freebies: Freebie[] = [];

  async list(): Promise<Freebie[]> {
    return [...this.freebies].sort((a, b) => a.order - b.order).map(clone);
  }

  async getById(id: string): Promise<Freebie | null> {
    const freebie = this.freebies.find((f) => f.id === id);
    return freebie ? clone(freebie) : null;
  }

  async upsert(freebie: Freebie): Promise<Freebie> {
    const cloned = clone(freebie);
    const idx = this.freebies.findIndex((f) => f.id === freebie.id);
    if (idx >= 0) {
      this.freebies[idx] = cloned;
    } else {
      this.freebies.push(cloned);
    }
    return clone(cloned);
  }
}

export class InMemoryOrderRepository implements OrderRepository {
  private orders: Order[] = [];
  private orderCounter = 0;

  async create(order: Order): Promise<Order> {
    this.orderCounter++;
    const cloned = clone(order);
    const created: Order = {
      ...cloned,
      id: cloned.id || `order-${this.orderCounter}`,
      createdAt: cloned.createdAt || new Date().toISOString(),
    };
    this.orders.push(created);
    return clone(created);
  }

  async list(filter?: OrderListFilter): Promise<Order[]> {
    let result = [...this.orders];

    // Sort newest-first (createdAt descending)
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    if (filter && filter.page && filter.pageSize) {
      const start = (filter.page - 1) * filter.pageSize;
      result = result.slice(start, start + filter.pageSize);
    }

    return result.map(clone);
  }

  async count(): Promise<number> {
    return this.orders.length;
  }
}

export class InMemoryContactRepository implements ContactRepository {
  private contacts: Contact[] = [];
  private contactCounter = 0;

  async create(contact: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact> {
    this.contactCounter++;
    const created: Contact = {
      ...clone(contact),
      id: `contact-${this.contactCounter}`,
      createdAt: new Date().toISOString(),
    };
    this.contacts.push(created);
    return clone(created);
  }
}

export class InMemorySiteConfigRepository implements SiteConfigRepository {
  private config: SiteConfig | null = null;

  async get(): Promise<SiteConfig | null> {
    return this.config ? clone(this.config) : null;
  }

  async upsert(config: SiteConfig): Promise<SiteConfig> {
    const cloned = clone(config);
    this.config = cloned;
    return clone(cloned);
  }
}

export class InMemoryStartHereRepository implements StartHereRepository {
  private config: StartHereConfig = [];

  async get(): Promise<StartHereConfig> {
    return clone(this.config);
  }

  async upsert(config: StartHereConfig): Promise<StartHereConfig> {
    const cloned = clone(config);
    this.config = cloned;
    return clone(cloned);
  }
}

export class InMemoryAuditLogRepository implements AuditLogRepository {
  private logs: AuditLog[] = [];
  private logCounter = 0;

  async append(entry: AuditLog): Promise<AuditLog> {
    this.logCounter++;
    const cloned = clone(entry);
    const created: AuditLog = {
      ...cloned,
      id: cloned.id || `audit-${this.logCounter}`,
    };
    this.logs.push(created);
    return clone(created);
  }

  async list(limit?: number): Promise<AuditLog[]> {
    let result = [...this.logs];

    // Sort newest-first
    result.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    if (limit !== undefined) {
      result = result.slice(0, limit);
    }

    return result.map(clone);
  }
}

export class InMemoryAuthGateway implements AuthGateway {
  private operators: Operator[] = [];
  private sessions = new Map<string, Operator>();

  constructor(initialOperators: Operator[] = []) {
    this.operators = clone(initialOperators);
  }

  async signIn(email: string, password: string): Promise<OperatorSession | null> {
    const operator = this.operators.find((op) => op.email === email);
    if (!operator) return null;

    // A stub password verification
    if (password !== 'password123' && password !== 'admin123') {
      return null;
    }

    const accessToken = `mock-session-token-${operator.uid}-${Date.now()}`;
    this.sessions.set(accessToken, clone(operator));

    return { operator: clone(operator), accessToken };
  }

  async verifySession(accessToken: string): Promise<Operator | null> {
    const op = this.sessions.get(accessToken);
    return op ? clone(op) : null;
  }

  async revoke(uid: string): Promise<void> {
    for (const [token, op] of this.sessions.entries()) {
      if (op.uid === uid) {
        this.sessions.delete(token);
      }
    }
  }

  async getRole(uid: string): Promise<OperatorRole | null> {
    const op = this.operators.find((o) => o.uid === uid);
    return op ? op.role : null;
  }

  // Testing helpers
  addOperator(op: Operator) {
    this.operators.push(clone(op));
  }
}

export class InMemoryStorageGateway implements StorageGateway {
  async signImageUpload(input: { folder?: string }): Promise<SignedImageUpload> {
    return {
      signature: 'mock-cloudinary-signature',
      timestamp: Math.floor(Date.now() / 1000),
      apiKey: 'mock-cloudinary-api-key',
      cloudName: 'mock-cloudinary-cloud-name',
      uploadPreset: 'mock-preset',
      folder: input.folder,
    };
  }

  async signFileUpload(input: { path: string; contentType?: string }): Promise<SignedFileUpload> {
    return {
      uploadUrl: `https://storage.supabase.co/mock-upload/${input.path}`,
      path: input.path,
      token: 'mock-supabase-upload-token',
    };
  }

  async uploadImage(imageUrl: string, options?: { folder?: string }): Promise<string> {
    const folder = options?.folder || 'articles';
    const filename = encodeURIComponent(imageUrl.split('/').pop() || 'image.jpg');
    return `https://res.cloudinary.com/mock-cloud/image/upload/${folder}/${filename}`;
  }
}

export class InMemoryVideoRepository implements VideoRepository {
  private videos: Video[] = [];

  async list(filter?: VideoListFilter): Promise<Video[]> {
    let result = [...this.videos];

    if (filter) {
      if (filter.language) result = result.filter((v) => v.language === filter.language);
      if (filter.category) result = result.filter((v) => v.category === filter.category);
      if (filter.isShort !== undefined) result = result.filter((v) => v.isShort === filter.isShort);
      else result = result.filter((v) => !v.isShort);
      if (filter.featured !== undefined) result = result.filter((v) => v.featured === filter.featured);
      if (filter.hidden !== undefined) result = result.filter((v) => v.hidden === filter.hidden);
      else result = result.filter((v) => !v.hidden);
    } else {
      // Default: exclude Shorts and hidden
      result = result.filter((v) => !v.isShort && !v.hidden);
    }

    result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    if (filter && filter.page && filter.pageSize) {
      const start = (filter.page - 1) * filter.pageSize;
      result = result.slice(start, start + filter.pageSize);
    }

    return result.map(clone);
  }

  async count(filter?: VideoListFilter): Promise<number> {
    const list = await this.list(filter);
    return list.length;
  }

  async getById(id: string): Promise<Video | null> {
    const v = this.videos.find((v) => v.id === id);
    return v ? clone(v) : null;
  }

  async upsert(video: Video): Promise<Video> {
    const cloned = clone(video);
    const idx = this.videos.findIndex((v) => v.id === video.id);
    if (idx >= 0) {
      this.videos[idx] = cloned;
    } else {
      this.videos.push(cloned);
    }
    return clone(cloned);
  }

  async setFeatured(id: string, featured: boolean): Promise<Video> {
    const v = this.videos.find((v) => v.id === id);
    if (!v) throw new Error(`Video not found: ${id}`);
    v.featured = featured;
    return clone(v);
  }

  async setHidden(id: string, hidden: boolean): Promise<Video> {
    const v = this.videos.find((v) => v.id === id);
    if (!v) throw new Error(`Video not found: ${id}`);
    v.hidden = hidden;
    return clone(v);
  }

  async overrideCategory(id: string, category: string): Promise<Video> {
    const v = this.videos.find((v) => v.id === id);
    if (!v) throw new Error(`Video not found: ${id}`);
    v.category = category;
    v.categoryLocked = true;
    return clone(v);
  }
}

export class InMemoryPlaylistRepository implements PlaylistRepository {
  private playlists: Playlist[] = [];

  async list(filter?: PlaylistListFilter): Promise<Playlist[]> {
    let result = [...this.playlists];

    if (filter) {
      if (filter.language) result = result.filter((p) => p.language === filter.language);
      if (filter.featured !== undefined) result = result.filter((p) => p.featured === filter.featured);
      if (filter.hidden !== undefined) result = result.filter((p) => p.hidden === filter.hidden);
      else result = result.filter((p) => !p.hidden);
    } else {
      result = result.filter((p) => !p.hidden);
    }

    result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    if (filter && filter.page && filter.pageSize) {
      const start = (filter.page - 1) * filter.pageSize;
      result = result.slice(start, start + filter.pageSize);
    }

    return result.map(clone);
  }

  async count(filter?: PlaylistListFilter): Promise<number> {
    const list = await this.list(filter);
    return list.length;
  }

  async getById(id: string): Promise<Playlist | null> {
    const p = this.playlists.find((p) => p.id === id);
    return p ? clone(p) : null;
  }

  async upsert(playlist: Playlist): Promise<Playlist> {
    const cloned = clone(playlist);
    const idx = this.playlists.findIndex((p) => p.id === playlist.id);
    if (idx >= 0) {
      this.playlists[idx] = cloned;
    } else {
      this.playlists.push(cloned);
    }
    return clone(cloned);
  }

  async setFeatured(id: string, featured: boolean): Promise<Playlist> {
    const p = this.playlists.find((p) => p.id === id);
    if (!p) throw new Error(`Playlist not found: ${id}`);
    p.featured = featured;
    return clone(p);
  }

  async setHidden(id: string, hidden: boolean): Promise<Playlist> {
    const p = this.playlists.find((p) => p.id === id);
    if (!p) throw new Error(`Playlist not found: ${id}`);
    p.hidden = hidden;
    return clone(p);
  }

  async updateDescription(id: string, description: string): Promise<Playlist> {
    const p = this.playlists.find((p) => p.id === id);
    if (!p) throw new Error(`Playlist not found: ${id}`);
    p.description = description;
    return clone(p);
  }
}

export function createInMemoryPorts(initialOperators: Operator[] = []): Ports {
  return {
    articles: new InMemoryArticleRepository(),
    books: new InMemoryBookRepository(),
    ebooks: new InMemoryEbookRepository(),
    courses: new InMemoryCourseRepository(),
    freebies: new InMemoryFreebieRepository(),
    orders: new InMemoryOrderRepository(),
    contacts: new InMemoryContactRepository(),
    siteConfig: new InMemorySiteConfigRepository(),
    startHere: new InMemoryStartHereRepository(),
    auditLogs: new InMemoryAuditLogRepository(),
    auth: new InMemoryAuthGateway(initialOperators),
    storage: new InMemoryStorageGateway(),
    videos: new InMemoryVideoRepository(),
    playlists: new InMemoryPlaylistRepository(),
  };
}
