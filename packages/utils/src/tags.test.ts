import { describe, it, expect } from 'vitest';
import { normalizeTag, normalizeTags } from './tags';

describe('normalizeTag', () => {
  it('lower-cases and kebab-cases', () => {
    expect(normalizeTag('Inner Growth')).toBe('inner-growth');
  });
});

describe('normalizeTags', () => {
  it('normalizes, drops empties, and dedupes preserving first-seen order', () => {
    expect(normalizeTags(['Burnout', 'burnout', '  ', 'Inner Growth', 'BURNOUT'])).toEqual([
      'burnout',
      'inner-growth',
    ]);
  });

  it('returns an empty array for no usable tags', () => {
    expect(normalizeTags(['!!!', '   ', ''])).toEqual([]);
  });
});
