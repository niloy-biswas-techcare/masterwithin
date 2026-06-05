import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Verifies the design tokens meet WCAG 2.2 AA contrast (≥4.5:1 for normal text) in
 * BOTH themes (§14). Reads the real tokens.css so the check fails if a token regresses.
 */

const css = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

function block(selector: string): string {
  const re = new RegExp(`${selector.replace(/[[\]']/g, '\\$&')}\\s*\\{([^}]*)\\}`);
  const m = css.match(re);
  if (!m) throw new Error(`Could not find CSS block for ${selector}`);
  return m[1]!;
}

function readVar(blockText: string, name: string): string {
  const m = blockText.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!m) throw new Error(`Token --${name} not found`);
  return m[1]!;
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const root = block(":root");
const dark = block("[data-theme='dark']");

// Tokens shared across themes (only overridden values appear in the dark block).
const WHITE = '#FFFFFF';
const deep = readVar(root, 'color-deep');

describe('token contrast — light theme (§14)', () => {
  const text = readVar(root, 'color-text');
  const bg = readVar(root, 'color-bg');
  const surface = readVar(root, 'color-surface');

  it('body text on page background ≥ 4.5:1', () => {
    expect(contrast(text, bg)).toBeGreaterThanOrEqual(4.5);
  });
  it('body text on surface ≥ 4.5:1', () => {
    expect(contrast(text, surface)).toBeGreaterThanOrEqual(4.5);
  });
  it('deep accent text on surface ≥ 4.5:1 (links/headings)', () => {
    expect(contrast(deep, surface)).toBeGreaterThanOrEqual(4.5);
  });
  it('white text on the deep solid fill ≥ 4.5:1 (buttons/badges)', () => {
    expect(contrast(WHITE, deep)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('token contrast — dark theme (§14)', () => {
  const text = readVar(dark, 'color-text');
  const bg = readVar(dark, 'color-bg');
  const surface = readVar(dark, 'color-surface');

  it('body text on page background ≥ 4.5:1', () => {
    expect(contrast(text, bg)).toBeGreaterThanOrEqual(4.5);
  });
  it('body text on surface ≥ 4.5:1', () => {
    expect(contrast(text, surface)).toBeGreaterThanOrEqual(4.5);
  });
});
