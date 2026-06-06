import { describe, it, expect } from 'vitest';
import { ArticleSchema } from './article.schema';
import { BookSchema, EbookSchema, CourseSchema, FreebieSchema } from './store';
import { CartItemSchema } from './cart';
import { OrderSchema, CustomerDetailsSchema } from './order';
import { ContactSchema } from './contact';

// ---------------------------------------------------------------------------
// ArticleSchema
// ---------------------------------------------------------------------------

describe('ArticleSchema', () => {
  const valid = {
    id: 'art-1',
    title: 'The Science of Mind',
    slug: 'science-of-mind',
    category: 'science-of-consciousness',
    tags: ['meditation'],
    excerpt: 'Short blurb',
    bodyHtml: '<p>Hello</p>',
    publishedAt: '2026-06-01T00:00:00Z',
    readingTime: 3,
    substackUrl: 'https://substack.com/p/mind',
    featured: false,
    categoryLocked: false,
  };

  it('parses a valid article', () => {
    expect(() => ArticleSchema.parse(valid)).not.toThrow();
  });

  it('defaults tags to [] when omitted', () => {
    const { tags: _, ...noTags } = valid;
    const result = ArticleSchema.parse(noTags);
    expect(result.tags).toEqual([]);
  });

  it('defaults featured and categoryLocked to false', () => {
    const { featured: _f, categoryLocked: _c, ...base } = valid;
    const result = ArticleSchema.parse(base);
    expect(result.featured).toBe(false);
    expect(result.categoryLocked).toBe(false);
  });

  it('rejects a non-positive readingTime', () => {
    expect(() => ArticleSchema.parse({ ...valid, readingTime: 0 })).toThrow();
    expect(() => ArticleSchema.parse({ ...valid, readingTime: -1 })).toThrow();
  });

  it('rejects an invalid substackUrl', () => {
    expect(() => ArticleSchema.parse({ ...valid, substackUrl: 'not-a-url' })).toThrow();
  });

  it('accepts a missing coverImage (optional)', () => {
    const result = ArticleSchema.parse({ ...valid, coverImage: undefined });
    expect(result.coverImage).toBeUndefined();
  });

  it('rejects an invalid coverImage URL', () => {
    expect(() => ArticleSchema.parse({ ...valid, coverImage: 'not-a-url' })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// BookSchema
// ---------------------------------------------------------------------------

describe('BookSchema', () => {
  const valid = {
    id: 'book-1',
    title: 'Mastering Life',
    author: 'Souvik Ghosh',
    price: 299,
    coverImage: 'https://res.cloudinary.com/mw/image/upload/book1.jpg',
    description: 'A great read',
    available: true,
    order: 1,
  };

  it('parses a valid book', () => {
    expect(() => BookSchema.parse(valid)).not.toThrow();
  });

  it('rejects negative price', () => {
    expect(() => BookSchema.parse({ ...valid, price: -1 })).toThrow();
  });

  it('rejects a non-integer price', () => {
    expect(() => BookSchema.parse({ ...valid, price: 49.99 })).toThrow();
  });

  it('rejects an empty title', () => {
    expect(() => BookSchema.parse({ ...valid, title: '' })).toThrow();
  });

  it('defaults available to true', () => {
    const { available: _, ...noAvail } = valid;
    expect(BookSchema.parse(noAvail).available).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// CartItemSchema
// ---------------------------------------------------------------------------

describe('CartItemSchema', () => {
  const valid = { id: 'book-1', title: 'A Book', price: 299, qty: 2 };

  it('parses a valid cart item', () => {
    expect(() => CartItemSchema.parse(valid)).not.toThrow();
  });

  it('rejects non-positive qty', () => {
    expect(() => CartItemSchema.parse({ ...valid, qty: 0 })).toThrow();
    expect(() => CartItemSchema.parse({ ...valid, qty: -1 })).toThrow();
  });

  it('rejects fractional qty', () => {
    expect(() => CartItemSchema.parse({ ...valid, qty: 1.5 })).toThrow();
  });

  it('rejects negative price', () => {
    expect(() => CartItemSchema.parse({ ...valid, price: -10 })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// OrderSchema / CustomerDetailsSchema
// ---------------------------------------------------------------------------

describe('CustomerDetailsSchema', () => {
  const valid = {
    name: 'Niloy',
    mobile: '9876543210',
    address: { line1: 'Flat 3A', city: 'Kolkata', state: 'WB', pin: '700091' },
  };

  it('parses valid customer details', () => {
    expect(() => CustomerDetailsSchema.parse(valid)).not.toThrow();
  });

  it('accepts optional address line2', () => {
    const result = CustomerDetailsSchema.parse({
      ...valid,
      address: { ...valid.address, line2: 'Block B' },
    });
    expect(result.address.line2).toBe('Block B');
  });

  it('rejects empty name', () => {
    expect(() => CustomerDetailsSchema.parse({ ...valid, name: '' })).toThrow();
  });

  it('rejects empty mobile', () => {
    expect(() => CustomerDetailsSchema.parse({ ...valid, mobile: '' })).toThrow();
  });

  it('rejects missing city', () => {
    expect(() =>
      CustomerDetailsSchema.parse({ ...valid, address: { ...valid.address, city: '' } }),
    ).toThrow();
  });
});

describe('OrderSchema', () => {
  const validOrder = {
    items: [{ id: 'book-1', title: 'Book', price: 299, qty: 1 }],
    customer: {
      name: 'Test User',
      mobile: '9876543210',
      address: { line1: 'Flat 1', city: 'Kolkata', state: 'WB', pin: '700001' },
    },
    total: 299,
  };

  it('parses a valid order', () => {
    const result = OrderSchema.parse(validOrder);
    expect(result.channel).toBe('whatsapp'); // default
  });

  it('rejects negative total', () => {
    expect(() => OrderSchema.parse({ ...validOrder, total: -1 })).toThrow();
  });

  it('rejects non-integer total', () => {
    expect(() => OrderSchema.parse({ ...validOrder, total: 99.5 })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// ContactSchema (honeypot)
// ---------------------------------------------------------------------------

describe('ContactSchema', () => {
  const valid = { name: 'Souvik', email: 'souvik@example.com', message: 'Hello!' };

  it('parses valid contact input', () => {
    expect(() => ContactSchema.parse(valid)).not.toThrow();
  });

  it('rejects an invalid email', () => {
    expect(() => ContactSchema.parse({ ...valid, email: 'not-an-email' })).toThrow();
  });

  it('rejects an empty name', () => {
    expect(() => ContactSchema.parse({ ...valid, name: '' })).toThrow();
  });

  it('honeypot: rejects any non-empty website value', () => {
    expect(() =>
      ContactSchema.parse({ ...valid, website: 'http://spam.com' }),
    ).toThrow();
  });

  it('honeypot: accepts empty string website (not triggered)', () => {
    expect(() => ContactSchema.parse({ ...valid, website: '' })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// EbookSchema, FreebieSchema, CourseSchema — boundary checks
// ---------------------------------------------------------------------------

describe('EbookSchema', () => {
  const valid = {
    id: 'eb-1',
    title: 'Ebook One',
    coverImage: 'https://res.cloudinary.com/mw/image/upload/eb1.jpg',
    description: 'An ebook',
    order: 1,
  };

  it('parses a valid ebook', () => {
    expect(() => EbookSchema.parse(valid)).not.toThrow();
  });

  it('rejects empty title', () => {
    expect(() => EbookSchema.parse({ ...valid, title: '' })).toThrow();
  });
});

describe('FreebieSchema', () => {
  const valid = {
    id: 'f-1',
    title: 'Free Guide',
    description: 'PDF download',
    fileUrl: 'https://storage.supabase.co/bucket/guide.pdf',
    order: 1,
  };

  it('parses a valid freebie', () => {
    expect(() => FreebieSchema.parse(valid)).not.toThrow();
  });

  it('rejects invalid fileUrl', () => {
    expect(() => FreebieSchema.parse({ ...valid, fileUrl: 'not-a-url' })).toThrow();
  });
});

describe('CourseSchema', () => {
  const valid = {
    id: 'c-1',
    slug: 'conscious-living',
    title: 'Conscious Living',
    level: 'beginner',
    description: 'A foundational course',
    whoItsFor: 'Everyone',
    whatYoullGain: 'Clarity',
    moduleOutline: [],
    enrollmentCtaLabel: 'Enroll',
    enrollmentCtaUrl: 'https://platform.com/c1',
    order: 1,
  };

  it('parses a valid course', () => {
    expect(() => CourseSchema.parse(valid)).not.toThrow();
  });

  it('rejects an invalid level', () => {
    expect(() => CourseSchema.parse({ ...valid, level: 'expert' })).toThrow();
  });

  it('rejects invalid enrollmentCtaUrl', () => {
    expect(() =>
      CourseSchema.parse({ ...valid, enrollmentCtaUrl: 'not-a-url' }),
    ).toThrow();
  });
});
