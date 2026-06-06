/**
 * HTML sanitization against an allowlist (§8, §18) 🔒.
 *
 * Third-party HTML (Substack post bodies) is cleaned **on ingest** so the stored
 * markup is safe and render stays cheap (§8). This is a conservative, dependency-free
 * allowlist sanitizer: unknown tags are unwrapped (their text is kept), `<script>` /
 * `<style>` are removed with their contents, and every surviving tag keeps only
 * allowlisted attributes with non-executable values.
 *
 * It is intentionally strict. The Supabase ingest path (Phase 4) may layer a
 * battle-tested library on top, but the domain contract is: "what comes out contains
 * no scriptable surface".
 */

/** Tags allowed to survive (lower-case). Anything else is unwrapped. */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'strong', 'b', 'em', 'i', 'u', 's', 'span', 'sub', 'sup',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);

/** Per-tag attribute allowlist; tags absent here keep no attributes. */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
};

/** Tags whose entire contents are discarded, not just unwrapped. */
const VOID_OF_CONTENT = ['script', 'style', 'iframe', 'object', 'embed', 'noscript'];

/** Reject URLs whose scheme can execute (javascript:, data:, vbscript:). */
function isSafeUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  // Allow relative URLs, anchors, http(s), mailto, tel, and protocol-relative.
  if (/^(https?:|mailto:|tel:|#|\/|\.)/.test(v)) return true;
  // Anything with an explicit dangerous scheme is rejected.
  return !/^[a-z][a-z0-9+.-]*:/.test(v);
}

/** Parse an attribute string into safe, allowlisted `name="value"` pairs. */
function sanitizeAttributes(tag: string, rawAttrs: string): string {
  const allowed = ALLOWED_ATTRS[tag];
  if (!allowed) return '';
  const out: string[] = [];
  const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(rawAttrs)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[3] ?? m[4] ?? m[5] ?? '';
    if (!allowed.has(name)) continue;
    // Event handlers never pass (defense in depth — they aren't allowlisted anyway).
    if (name.startsWith('on')) continue;
    if ((name === 'href' || name === 'src') && !isSafeUrl(value)) continue;
    const escaped = value.replace(/"/g, '&quot;');
    out.push(`${name}="${escaped}"`);
  }
  // External links get safe rel hardening when a target is present.
  if (tag === 'a' && /target\s*=/.test(out.join(' ')) && !/rel=/.test(out.join(' '))) {
    out.push('rel="noopener noreferrer"');
  }
  return out.length ? ' ' + out.join(' ') : '';
}

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  let out = html;

  // 1. Strip comments.
  out = out.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Remove dangerous elements *with* their contents.
  for (const tag of VOID_OF_CONTENT) {
    out = out.replace(new RegExp(`<${tag}[\\s\\S]*?</${tag}>`, 'gi'), '');
    // Also drop any orphaned/self-closing form.
    out = out.replace(new RegExp(`<${tag}\\b[^>]*/?>`, 'gi'), '');
  }

  // 3. Rewrite every remaining tag: keep allowlisted ones (with filtered attrs),
  //    unwrap the rest (drop the markup, keep inner text).
  out = out.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g,
    (_full, slash: string, name: string, attrs: string) => {
      const tag = name.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return '';
      if (slash === '/') return `</${tag}>`;
      const selfClose = /\/\s*$/.test(attrs) ? ' /' : '';
      return `<${tag}${sanitizeAttributes(tag, attrs)}${selfClose}>`;
    },
  );

  return out.trim();
}

/** Strip *all* tags, returning collapsed plain text (for excerpts/reading time). */
export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
