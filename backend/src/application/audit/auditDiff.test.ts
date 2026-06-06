import { describe, it, expect } from 'vitest';
import { buildDiff } from './writeAuditLog';

describe('buildDiff', () => {
  it('records all non-metadata fields as changed when creating a new entity (no old state)', () => {
    const diff = buildDiff(null, { id: 'book-1', title: 'New Book', price: 299, available: true });
    expect(diff).toEqual({
      title: { from: undefined, to: 'New Book' },
      price: { from: undefined, to: 299 },
      available: { from: undefined, to: true },
    });
    // 'id' must be excluded
    expect('id' in diff).toBe(false);
  });

  it('returns an empty diff when nothing changed', () => {
    const obj = { id: 'b-1', title: 'Same', price: 100 };
    expect(buildDiff(obj, obj)).toEqual({});
  });

  it('captures scalar field changes', () => {
    const diff = buildDiff(
      { id: 'b-1', title: 'Old', price: 299 },
      { id: 'b-1', title: 'New', price: 349 },
    );
    expect(diff).toEqual({
      title: { from: 'Old', to: 'New' },
      price: { from: 299, to: 349 },
    });
  });

  it('captures boolean toggle (featured flag)', () => {
    const diff = buildDiff(
      { id: 'art-1', featured: false, categoryLocked: false },
      { id: 'art-1', featured: true, categoryLocked: false },
    );
    expect(diff).toEqual({ featured: { from: false, to: true } });
  });

  it('captures both featured and category changes together', () => {
    const diff = buildDiff(
      { id: 'art-1', category: 'optimal-living', categoryLocked: false },
      { id: 'art-1', category: 'source-code', categoryLocked: true },
    );
    expect(diff.category).toEqual({ from: 'optimal-living', to: 'source-code' });
    expect(diff.categoryLocked).toEqual({ from: false, to: true });
  });

  it('captures array changes (e.g. tags)', () => {
    const diff = buildDiff(
      { id: 'a-1', tags: ['burnout'] },
      { id: 'a-1', tags: ['burnout', 'stress'] },
    );
    expect(diff.tags).toEqual({ from: ['burnout'], to: ['burnout', 'stress'] });
  });

  it('captures nested object changes', () => {
    const diff = buildDiff(
      { id: 'c-1', address: { city: 'Kolkata', pin: '700001' } },
      { id: 'c-1', address: { city: 'Kolkata', pin: '700091' } },
    );
    expect(diff.address).toEqual({
      from: { city: 'Kolkata', pin: '700001' },
      to: { city: 'Kolkata', pin: '700091' },
    });
  });

  it('excludes metadata keys: id, createdAt, updatedAt, order', () => {
    const diff = buildDiff(
      { id: 'b-1', order: 1, title: 'Old' },
      { id: 'b-1', order: 2, title: 'New', createdAt: '2026-01-01', updatedAt: '2026-06-06' },
    );
    expect('id' in diff).toBe(false);
    expect('order' in diff).toBe(false);
    expect('createdAt' in diff).toBe(false);
    expect('updatedAt' in diff).toBe(false);
    expect(diff.title).toEqual({ from: 'Old', to: 'New' });
  });

  it('handles fields appearing in new but not old (field added)', () => {
    const diff = buildDiff(
      { id: 'b-1', title: 'Book' },
      { id: 'b-1', title: 'Book', pages: 220 },
    );
    expect(diff.pages).toEqual({ from: undefined, to: 220 });
  });

  it('handles fields disappearing (field removed)', () => {
    const diff = buildDiff(
      { id: 'b-1', title: 'Book', pages: 220 },
      { id: 'b-1', title: 'Book' },
    );
    expect(diff.pages).toEqual({ from: 220, to: undefined });
  });
});
