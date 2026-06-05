import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, toIsoDate, readingTime } from './format';

describe('formatPrice', () => {
  it('formats INR with grouping and the ₹ symbol', () => {
    expect(formatPrice(1299)).toBe('₹1,299');
    expect(formatPrice(299)).toBe('₹299');
    expect(formatPrice(100000)).toBe('₹1,00,000'); // Indian grouping
  });
});

describe('formatDate', () => {
  it('formats an ISO date for display', () => {
    expect(formatDate('2026-06-06T00:00:00.000Z')).toBe('6 June 2026');
  });

  it('returns the input unchanged when unparseable', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('toIsoDate', () => {
  it('normalizes to an ISO string', () => {
    expect(toIsoDate('2026-06-06T00:00:00.000Z')).toBe('2026-06-06T00:00:00.000Z');
  });
});

describe('readingTime', () => {
  it('estimates whole minutes at ~200 wpm', () => {
    const words = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(readingTime(words)).toBe(2);
  });

  it('ignores HTML tags and returns at least 1 minute', () => {
    expect(readingTime('<p>short</p>')).toBe(1);
  });
});
