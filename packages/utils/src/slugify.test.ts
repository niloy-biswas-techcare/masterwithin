import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lower-cases and hyphenates spaces', () => {
    expect(slugify('The Source Code')).toBe('the-source-code');
  });

  it('strips accents/diacritics', () => {
    expect(slugify('Café Déjà Vu')).toBe('cafe-deja-vu');
  });

  it('collapses runs of non-alphanumerics into a single hyphen', () => {
    expect(slugify('hello --- world !!! again')).toBe('hello-world-again');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  --Wisdom Library--  ')).toBe('wisdom-library');
  });

  it('is stable (idempotent on an existing slug)', () => {
    const once = slugify('Optimal Living & Micro-Habits');
    expect(slugify(once)).toBe(once);
    expect(once).toBe('optimal-living-micro-habits');
  });

  it('returns an empty string when there are no usable characters', () => {
    expect(slugify('!!! ---')).toBe('');
  });
});
