import { describe, it, expect } from 'vitest';
import { sanitizeHtml, htmlToText } from './sanitize';

describe('sanitizeHtml', () => {
  // ── Baseline: existing security guarantees ──────────────────────────────

  it('strips <script> tags and their contents', () => {
    expect(sanitizeHtml('<script>alert(1)</script><p>ok</p>')).toBe('<p>ok</p>');
  });

  it('strips <style> tags and their contents', () => {
    expect(sanitizeHtml('<style>.x{color:red}</style><p>ok</p>')).toBe('<p>ok</p>');
  });

  it('strips <iframe> tags', () => {
    expect(sanitizeHtml('<iframe src="evil.com"></iframe><p>ok</p>')).toBe('<p>ok</p>');
  });

  it('strips event handler attributes', () => {
    expect(sanitizeHtml('<p onclick="evil()">text</p>')).toBe('<p>text</p>');
  });

  it('strips javascript: URLs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">click</a>')).toBe('<a>click</a>');
  });

  it('strips HTML comments', () => {
    expect(sanitizeHtml('<!-- comment --><p>ok</p>')).toBe('<p>ok</p>');
  });

  it('unwraps unknown tags (keeps text)', () => {
    expect(sanitizeHtml('<div>text</div>')).toBe('text');
  });

  // ── Preserving class attributes (§8b) ──────────────────────────────────

  it('preserves class attributes on allowed elements', () => {
    expect(sanitizeHtml('<p class="body-text bold">hello</p>')).toBe(
      '<p class="body-text bold">hello</p>',
    );
  });

  it('preserves class on headings', () => {
    expect(sanitizeHtml('<h2 class="header-with-anchor-widget">Title</h2>')).toBe(
      '<h2 class="header-with-anchor-widget">Title</h2>',
    );
  });

  it('preserves class on links', () => {
    expect(sanitizeHtml('<a href="/x" class="link-button">click</a>')).toBe(
      '<a href="/x" class="link-button">click</a>',
    );
  });

  it('preserves class on images', () => {
    expect(sanitizeHtml('<img src="https://cdn.img/x.png" class="cover-image" alt="test">')).toBe(
      '<img src="https://cdn.img/x.png" class="cover-image" alt="test">',
    );
  });

  it('preserves class on blockquotes', () => {
    expect(sanitizeHtml('<blockquote class="twitter-tweet">text</blockquote>')).toBe(
      '<blockquote class="twitter-tweet">text</blockquote>',
    );
  });

  // ── Preserving style attributes (§8b) ──────────────────────────────────

  it('preserves safe inline styles', () => {
    expect(sanitizeHtml('<h2 style="font-size: 24px; color: #333;">Title</h2>')).toBe(
      '<h2 style="font-size: 24px; color: #333;">Title</h2>',
    );
  });

  it('preserves margin and padding styles', () => {
    expect(sanitizeHtml('<p style="margin-bottom: 2em; line-height: 1.6;">text</p>')).toBe(
      '<p style="margin-bottom: 2em; line-height: 1.6;">text</p>',
    );
  });

  it('strips expression() in style attributes', () => {
    expect(sanitizeHtml('<p style="width: expression(alert(1))">text</p>')).toBe('<p>text</p>');
  });

  it('strips url(javascript:) in style attributes', () => {
    expect(sanitizeHtml('<p style="background: url(javascript:alert(1))">text</p>')).toBe(
      '<p>text</p>',
    );
  });

  it('strips url(data:) in style attributes', () => {
    expect(sanitizeHtml('<p style="background: url(data:text/html,<script>)">text</p>')).toBe(
      '<p>text</p>',
    );
  });

  it('strips -moz-binding in style attributes', () => {
    expect(sanitizeHtml('<p style="-moz-binding: url(evil)">text</p>')).toBe('<p>text</p>');
  });

  it('strips behavior in style attributes', () => {
    expect(sanitizeHtml('<p style="behavior: url(evil.htc)">text</p>')).toBe('<p>text</p>');
  });

  // ── Combined class + style + tag-specific attrs ────────────────────────

  it('preserves class, style, and tag-specific attrs together on <a>', () => {
    const input = '<a href="/path" class="btn" style="color: blue" target="_blank">link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('href="/path"');
    expect(result).toContain('class="btn"');
    expect(result).toContain('style="color: blue"');
    expect(result).toContain('target="_blank"');
  });

  it('preserves class, style, and tag-specific attrs together on <img>', () => {
    const input = '<img src="https://cdn.img/x.png" class="hero" style="width:100%" alt="test" width="800" height="400">';
    const result = sanitizeHtml(input);
    expect(result).toContain('src="https://cdn.img/x.png"');
    expect(result).toContain('class="hero"');
    expect(result).toContain('style="width:100%"');
    expect(result).toContain('alt="test"');
    expect(result).toContain('width="800"');
    expect(result).toContain('height="400"');
  });

  // ── Realistic Substack HTML fragment ────────────────────────────────────

  it('preserves a realistic Substack article fragment', () => {
    const input = `
      <h2 class="header-with-anchor-widget" style="font-size: 24px;">Deep Thinking</h2>
      <p class="body-markup" style="margin-bottom: 1em;">Some paragraph text.</p>
      <blockquote class="twitter-tweet" style="border-left: 3px solid #333;">
        <p>A quoted thought.</p>
      </blockquote>
      <figure class="image-link/image-inset">
        <img src="https://substackcdn.com/image/upload/some-id" alt="Diagram" width="600" height="400">
        <figcaption>Figure 1: A diagram</figcaption>
      </figure>
    `;
    const result = sanitizeHtml(input);

    // Classes preserved
    expect(result).toContain('class="header-with-anchor-widget"');
    expect(result).toContain('class="body-markup"');
    expect(result).toContain('class="twitter-tweet"');
    expect(result).toContain('class="image-link/image-inset"');

    // Inline styles preserved
    expect(result).toContain('style="font-size: 24px;"');
    expect(result).toContain('style="margin-bottom: 1em;"');
    expect(result).toContain('style="border-left: 3px solid #333;"');

    // Structural elements intact
    expect(result).toContain('<h2');
    expect(result).toContain('<p');
    expect(result).toContain('<blockquote');
    expect(result).toContain('<figure');
    expect(result).toContain('<img');
    expect(result).toContain('<figcaption');

    // No scriptable surface
    expect(result).not.toContain('<script');
    expect(result).not.toContain('onclick');
  });

  // ── htmlToText ──────────────────────────────────────────────────────────

  it('htmlToText strips all tags and collapses whitespace', () => {
    expect(htmlToText('<p>Hello <strong>world</strong>!</p>')).toBe('Hello world !');
  });
});
