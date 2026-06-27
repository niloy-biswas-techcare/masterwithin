/**
 * Supabase Edge Function — sync-substack
 *
 * Fetches the Substack RSS feed, parses and sanitizes each post, rewrites images
 * to Cloudinary, upserts articles to Supabase, and mirror-deletes articles no
 * longer in the feed. Runs daily at 01:00 UTC via pg_cron (§8, §21.4).
 * The Next.js /api/cron/sync-substack route remains a manual HTTP fallback.
 *
 * Auth: Authorization: Bearer $CRON_SECRET
 *   - External callers (manual trigger): use CRON_SECRET
 *   - Supabase scheduled cron: uses service_role JWT — verified by role claim
 *
 * Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   SUBSTACK_FEED_URL
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 *   CLOUDINARY_API_SECRET, CLOUDINARY_UPLOAD_PRESET
 *   CRON_SECRET
 *   NEXT_PUBLIC_SITE_URL, REVALIDATE_SECRET  (for ISR revalidation)
 *   ADMIN_BOOTSTRAP_EMAIL                    (for audit log actor)
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Auth helper — accepts CRON_SECRET or Supabase service_role JWT
// ---------------------------------------------------------------------------

function isAuthorized(req: Request): boolean {
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  const token = req.headers.get("Authorization")?.split(" ")[1] ?? "";

  if (token === cronSecret && cronSecret !== "") return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload?.role === "service_role") return true;
  } catch { /* invalid JWT shape */ }

  return false;
}

// ---------------------------------------------------------------------------
// CATEGORIES — inlined from @mw/types
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { slug: "science-of-consciousness", keywords: ["consciousness","awareness","mind","meditation","attention","perception","neuroscience","self","presence"] },
  { slug: "optimal-living",           keywords: ["habit","habits","routine","discipline","productivity","focus","sleep","energy","lifestyle","micro-habit"] },
  { slug: "conscious-relationships",  keywords: ["relationship","relationships","love","marriage","family","compatibility","partner","intimacy","attachment","genetics"] },
  { slug: "self-actualization",       keywords: ["self-actualization","growth","potential","education","learning","purpose","meaning","fulfillment","dharma","identity"] },
  { slug: "holistic-wealth",          keywords: ["wealth","money","finance","economics","work","career","abundance","value","prosperity","business"] },
  { slug: "bio-vitality",             keywords: ["health","healing","nutrition","diet","movement","exercise","vitality","body","wellness","natural"] },
  { slug: "systems-of-peace",         keywords: ["peace","society","community","social","systems","governance","conflict","cooperation","collective","harmony"] },
  { slug: "source-code",              keywords: ["spirit","spirituality","source","truth","philosophy","metaphysics","reality","being","soul","transcendence"] },
] as const;

const FALLBACK_CATEGORY = "source-code";

// ---------------------------------------------------------------------------
// Utilities — ported from @mw/utils
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeTags(tags: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const tag = slugify(raw);
    if (tag && !seen.has(tag)) { seen.add(tag); out.push(tag); }
  }
  return out;
}

// ---------------------------------------------------------------------------
// stableId — ported from backend/src/application/content/stableId.ts
// FNV-1a hash: deterministic, edge-runtime safe, no crypto/IO.
// ---------------------------------------------------------------------------

function stableId(source: string): string {
  const fnv = (input: string, seed: number): number => {
    let hash = seed >>> 0;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
  };
  const a = fnv(source, 0x811c9dc5);
  const b = fnv(source + " salt", 0x811c9dc5);
  return a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0");
}

// ---------------------------------------------------------------------------
// HTML sanitize + htmlToText — ported from backend/src/application/content/sanitize.ts
// ---------------------------------------------------------------------------

const ALLOWED_TAGS = new Set(["p","br","hr","h1","h2","h3","h4","h5","h6","ul","ol","li","blockquote","pre","code","strong","b","em","i","u","s","span","sub","sup","a","img","figure","figcaption","table","thead","tbody","tr","th","td"]);
const ALLOWED_ATTRS: Record<string, Set<string>> = { a: new Set(["href","title","target","rel"]), img: new Set(["src","alt","title","width","height"]) };
const UNIVERSAL_ATTRS = new Set(["class","style"]);
const VOID_OF_CONTENT = ["script","style","iframe","object","embed","noscript"];

function isSafeUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  if (/^(https?:|mailto:|tel:|#|\/|\.)/.test(v)) return true;
  return !/^[a-z][a-z0-9+.-]*:/.test(v);
}

function isSafeStyle(value: string): boolean {
  const v = value.toLowerCase();
  if (/expression\s*\(/.test(v)) return false;
  if (/url\s*\(\s*["']?\s*(javascript|data|vbscript)\s*:/.test(v)) return false;
  if (/-moz-binding\s*:/.test(v)) return false;
  if (/behavior\s*:/.test(v)) return false;
  return true;
}

function sanitizeAttributes(tag: string, rawAttrs: string): string {
  const tagSpecific = ALLOWED_ATTRS[tag];
  const allowed = tagSpecific ? new Set([...UNIVERSAL_ATTRS, ...tagSpecific]) : UNIVERSAL_ATTRS;
  const out: string[] = [];
  const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(rawAttrs)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[3] ?? m[4] ?? m[5] ?? "";
    if (!allowed.has(name)) continue;
    if (name.startsWith("on")) continue;
    if ((name === "href" || name === "src") && !isSafeUrl(value)) continue;
    if (name === "style" && !isSafeStyle(value)) continue;
    out.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
  }
  if (tag === "a" && /target\s*=/.test(out.join(" ")) && !/rel=/.test(out.join(" "))) {
    out.push('rel="noopener noreferrer"');
  }
  return out.length ? " " + out.join(" ") : "";
}

function sanitizeHtml(html: string): string {
  if (!html) return "";
  let out = html;
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of VOID_OF_CONTENT) {
    out = out.replace(new RegExp(`<${tag}[\\s\\S]*?</${tag}>`, "gi"), "");
    out = out.replace(new RegExp(`<${tag}\\b[^>]*/?>`, "gi"), "");
  }
  out = out.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g,
    (_full, slash: string, name: string, attrs: string) => {
      const tag = name.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (slash === "/") return `</${tag}>`;
      const selfClose = /\/\s*$/.test(attrs) ? " /" : "";
      return `<${tag}${sanitizeAttributes(tag, attrs)}${selfClose}>`;
    });
  return out.trim();
}

function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// buildExcerpt — ported from backend/src/application/content/excerpt.ts
// ---------------------------------------------------------------------------

function buildExcerpt(content: string, maxLength = 200): string {
  const text = htmlToText(content);
  if (text.length <= maxLength) return text;
  const sliced = text.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace > maxLength * 0.5 ? sliced.slice(0, lastSpace) : sliced;
  return `${cut.trimEnd()}…`;
}

// ---------------------------------------------------------------------------
// Auto-categorize — ported from backend/src/application/content/autoCategorize.ts
// ---------------------------------------------------------------------------

function countMatches(haystack: string, keyword: string): number {
  if (!keyword) return 0;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (haystack.match(new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, "g")) ?? []).length;
}

function autoCategorize(title: string, bodyHtml: string, tags: string[]): string {
  const t = title.toLowerCase();
  const b = htmlToText(bodyHtml).toLowerCase();
  const tg = tags.join(" ").toLowerCase();
  let bestSlug = FALLBACK_CATEGORY;
  let bestScore = 0;
  for (const cat of CATEGORIES) {
    let score = 0;
    for (const kw of cat.keywords) {
      score += countMatches(t, kw) * 3;
      score += countMatches(tg, kw) * 2;
      score += countMatches(b, kw) * 1;
    }
    if (score > bestScore) { bestScore = score; bestSlug = cat.slug; }
  }
  return bestScore > 0 ? bestSlug : FALLBACK_CATEGORY;
}

function resolveCategory(args: {
  title: string;
  bodyHtml: string;
  tags: string[];
  existingCategory?: string;
  categoryLocked?: boolean;
}): string {
  if (args.categoryLocked && args.existingCategory) return args.existingCategory;
  return autoCategorize(args.title, args.bodyHtml, args.tags);
}

// ---------------------------------------------------------------------------
// Substack RSS parse — ported from backend/src/application/content/substackRss.ts
// ---------------------------------------------------------------------------

function decodeXml(value: string): string {
  const cdata = value.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  const text = cdata ? cdata[1] : value;
  return text
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&amp;/g, "&")
    .trim();
}

function pick(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  return block.match(re)?.[1];
}

function extractCoverFromBlock(block: string): string | undefined {
  const enclosure = block.match(/<enclosure\b[^>]*\burl\s*=\s*["']([^"']+)["'][^>]*type\s*=\s*["']image[^"']*["']/i)
    ?? block.match(/<enclosure\b[^>]*type\s*=\s*["']image[^"']*["'][^>]*\burl\s*=\s*["']([^"']+)["']/i);
  if (enclosure) return enclosure[1];
  const mediaThumbnail = block.match(/<media:thumbnail\b[^>]*\burl\s*=\s*["']([^"']+)["']/i);
  if (mediaThumbnail) return mediaThumbnail[1];
  const mediaContent = block.match(/<media:content\b[^>]*\burl\s*=\s*["']([^"']+)["'][^>]*medium\s*=\s*["']image["']/i)
    ?? block.match(/<media:content\b[^>]*medium\s*=\s*["']image["'][^>]*\burl\s*=\s*["']([^"']+)["']/i);
  if (mediaContent) return mediaContent[1];
  return undefined;
}

interface ArticleDraft {
  id: string;
  title: string;
  slug: string;
  rawBodyHtml: string;
  tags: string[];
  publishedAt: string;
  substackUrl: string;
  coverImage?: string;
}

function parseSubstackFeed(xml: string): ArticleDraft[] {
  const drafts: ArticleDraft[] = [];
  const itemRe = /<item\b[\s\S]*?<\/item>/gi;
  const blocks = xml.match(itemRe) ?? [];

  for (const block of blocks) {
    const link = decodeXml(pick(block, "link") ?? "");
    const guidRaw = decodeXml(pick(block, "guid") ?? "");
    const title = decodeXml(pick(block, "title") ?? "");
    const content = decodeXml(pick(block, "content:encoded") ?? pick(block, "description") ?? "");
    const pubDate = decodeXml(pick(block, "pubDate") ?? "");
    const categories = [...block.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)]
      .map(m => decodeXml(m[1])).filter(Boolean);

    const guid = guidRaw || link;
    if (!guid && !link) continue;

    const iso = pubDate
      ? (Number.isNaN(Date.parse(pubDate)) ? new Date(0).toISOString() : new Date(pubDate).toISOString())
      : new Date(0).toISOString();

    const id = stableId(guid || link);
    const slug = slugify(title) || id;
    const coverImage = extractCoverFromBlock(block)
      ?? content.match(/<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];

    drafts.push({ id, title, slug, rawBodyHtml: content, tags: categories, publishedAt: iso, substackUrl: link, coverImage });
  }

  return drafts;
}

// ---------------------------------------------------------------------------
// Cloudinary upload via REST — Web Crypto SHA-1 (replaces Node.js crypto)
// ---------------------------------------------------------------------------

async function sha1Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const buf = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function uploadToCloudinary(imageUrl: string, opts: {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset: string;
  folder: string;
}): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string> = {
    folder: opts.folder,
    timestamp: timestamp.toString(),
    upload_preset: opts.uploadPreset,
  };
  const serialized = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  const signature = await sha1Hex(serialized + opts.apiSecret);

  const form = new FormData();
  form.append("file", imageUrl);
  form.append("folder", opts.folder);
  form.append("timestamp", timestamp.toString());
  form.append("upload_preset", opts.uploadPreset);
  form.append("api_key", opts.apiKey);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${opts.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${await res.text()}`);
  return (await res.json()).secure_url as string;
}

// ---------------------------------------------------------------------------
// Revalidate web frontend
// ---------------------------------------------------------------------------

async function triggerRevalidate(siteUrl: string, secret: string, path: string): Promise<void> {
  if (!siteUrl || !secret) return;
  try {
    const url = new URL("/api/revalidate", siteUrl);
    url.searchParams.set("secret", secret);
    url.searchParams.set("path", path);
    const res = await fetch(url.toString(), { method: "POST" });
    if (!res.ok) console.error(`[sync-substack] revalidate ${path} failed: ${res.status}`);
  } catch (err) {
    console.error(`[sync-substack] revalidate ${path} error:`, err);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected by the Edge Function runtime.
  const supabaseUrl      = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
  const serviceRoleKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const feedUrl          = Deno.env.get("SUBSTACK_FEED_URL") ?? "";
  const siteUrl          = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "";
  const revalidateSecret = Deno.env.get("REVALIDATE_SECRET") ?? "";
  const adminEmail       = Deno.env.get("ADMIN_BOOTSTRAP_EMAIL") ?? "system@masterwithin.org";

  const cloudOpts = {
    cloudName:    Deno.env.get("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME") ?? "",
    apiKey:       Deno.env.get("CLOUDINARY_API_KEY") ?? "",
    apiSecret:    Deno.env.get("CLOUDINARY_API_SECRET") ?? "",
    uploadPreset: Deno.env.get("CLOUDINARY_UPLOAD_PRESET") ?? "mw_signed",
    folder:       "articles",
  };

  if (!feedUrl) {
    return new Response(JSON.stringify({ error: "SUBSTACK_FEED_URL not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const result = { fetched: 0, newCount: 0, updatedCount: 0, skippedCount: 0, deletedCount: 0, errors: [] as string[] };

  try {
    console.log(`[sync-substack] Fetching RSS from: ${feedUrl}`);
    const xml = await fetch(feedUrl).then(r => { if (!r.ok) throw new Error(`RSS fetch ${r.status}`); return r.text(); });
    const drafts = parseSubstackFeed(xml);
    result.fetched = drafts.length;
    console.log(`[sync-substack] Parsed ${drafts.length} items from feed`);

    const affectedCategories = new Set<string>();
    const feedIds = new Set<string>();

    for (const draft of drafts) {
      feedIds.add(draft.id);
      try {
        // Load existing record — check by ID first, then by slug as fallback.
        // Slug fallback handles cases where articles were previously synced with
        // a different ID (e.g. after a stableId change or manual import).
        let { data: existingRow } = await supabase.from("articles").select("*").eq("id", draft.id).maybeSingle();
        if (!existingRow) {
          const { data: bySlug } = await supabase.from("articles").select("*").eq("slug", draft.slug).maybeSingle();
          existingRow = bySlug;
        }

        // Category
        const sanitizedBody = sanitizeHtml(draft.rawBodyHtml);
        const tags = normalizeTags(draft.tags);
        const category = resolveCategory({
          title: draft.title,
          bodyHtml: sanitizedBody,
          tags,
          existingCategory: existingRow?.category,
          categoryLocked: existingRow?.category_locked,
        });

        // Rewrite cover image to Cloudinary
        let finalCover: string | undefined = draft.coverImage;
        if (cloudOpts.cloudName && cloudOpts.apiKey && cloudOpts.apiSecret) {
          if (finalCover && !finalCover.includes("res.cloudinary.com")) {
            try {
              finalCover = await uploadToCloudinary(finalCover, cloudOpts);
            } catch (err) {
              console.error(`[sync-substack] Cover image rewrite failed for ${draft.id}:`, err);
            }
          }

          // Rewrite inline images
          let newBodyHtml = sanitizedBody;
          const imgRe = /<img\b([^>]*)\bsrc\s*=\s*["']([^"']+)["']/gi;
          const matches: { src: string }[] = [];
          let m: RegExpExecArray | null;
          while ((m = imgRe.exec(sanitizedBody)) !== null) matches.push({ src: m[2] });

          const srcMap = new Map<string, string>();
          for (const { src } of matches) {
            if (srcMap.has(src)) continue;
            if (!src.includes("res.cloudinary.com")) {
              try {
                srcMap.set(src, await uploadToCloudinary(src, cloudOpts));
              } catch {
                srcMap.set(src, src);
              }
            } else {
              srcMap.set(src, src);
            }
          }
          for (const [orig, rewritten] of srcMap.entries()) {
            const escaped = orig.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            newBodyHtml = newBodyHtml.replace(new RegExp(`(src\\s*=\\s*["'])${escaped}(["'])`, "g"), `$1${rewritten}$2`);
          }

          const article = {
            id: draft.id,
            title: draft.title,
            slug: existingRow?.slug ?? draft.slug,
            category,
            tags,
            excerpt: buildExcerpt(newBodyHtml),
            body_html: newBodyHtml,
            cover_image: finalCover ?? null,
            published_at: draft.publishedAt,
            reading_time: Math.max(1, Math.round(htmlToText(newBodyHtml).split(/\s+/).filter(Boolean).length / 200)),
            substack_url: draft.substackUrl,
            featured: existingRow?.featured ?? false,
            category_locked: existingRow?.category_locked ?? false,
          };

          // Use existing ID when found by slug to avoid primary key conflicts
          const articleId = existingRow?.id ?? draft.id;

          if (!existingRow) {
            const { error } = await supabase.from("articles").upsert({ ...article, id: articleId });
            if (error) throw error;
            result.newCount++;
            affectedCategories.add(category);

            try {
              await supabase.from("audit_logs").insert({
                actor_uid: "system", actor_email: adminEmail,
                action: "create", entity: "article", entity_id: articleId,
                diff: { title: { from: null, to: draft.title } },
                at: new Date().toISOString(),
              });
            } catch { /* audit log is non-critical */ }
          } else {
            // Only upsert if something changed
            const changed =
              existingRow.title !== article.title ||
              existingRow.body_html !== article.body_html ||
              existingRow.cover_image !== article.cover_image ||
              existingRow.category !== article.category;

            if (changed) {
              const { error } = await supabase.from("articles").upsert({ ...article, id: articleId });
              if (error) throw error;
              result.updatedCount++;
              affectedCategories.add(category);
              affectedCategories.add(existingRow.category);

              try {
                await supabase.from("audit_logs").insert({
                  actor_uid: "system", actor_email: adminEmail,
                  action: "sync", entity: "article", entity_id: articleId,
                  diff: { title: { from: existingRow.title, to: article.title } },
                  at: new Date().toISOString(),
                });
              } catch { /* audit log is non-critical */ }
            } else {
              result.skippedCount++;
            }
          }
        } else {
          // No Cloudinary config — upsert without image rewrite
          const articleId = existingRow?.id ?? draft.id;
          const article = {
            id: articleId,
            title: draft.title,
            slug: existingRow?.slug ?? draft.slug,
            category,
            tags,
            excerpt: buildExcerpt(sanitizedBody),
            body_html: sanitizedBody,
            cover_image: draft.coverImage ?? null,
            published_at: draft.publishedAt,
            reading_time: Math.max(1, Math.round(htmlToText(sanitizedBody).split(/\s+/).filter(Boolean).length / 200)),
            substack_url: draft.substackUrl,
            featured: existingRow?.featured ?? false,
            category_locked: existingRow?.category_locked ?? false,
          };
          const { error } = await supabase.from("articles").upsert(article);
          if (error) throw error;
          if (!existingRow) result.newCount++; else result.updatedCount++;
          affectedCategories.add(category);
        }
      } catch (itemErr: any) {
        console.error(`[sync-substack] Failed item "${draft.title}":`, itemErr);
        result.errors.push(`"${draft.title}": ${itemErr.message ?? itemErr}`);
      }
    }

    // Mirror-delete: remove articles no longer in the RSS feed
    const { data: allExisting } = await supabase.from("articles").select("id,title,category");
    for (const existing of allExisting || []) {
      if (!feedIds.has(existing.id)) {
        const { error } = await supabase.from("articles").delete().eq("id", existing.id);
        if (!error) {
          result.deletedCount++;
          affectedCategories.add(existing.category);
          console.log(`[sync-substack] Mirror-deleted "${existing.title}" (${existing.id})`);

          try {
            await supabase.from("audit_logs").insert({
              actor_uid: "system", actor_email: adminEmail,
              action: "delete", entity: "article", entity_id: existing.id,
              diff: { title: { from: existing.title, to: null } },
              at: new Date().toISOString(),
            });
          } catch { /* audit log is non-critical */ }
        }
      }
    }

    // ISR revalidation for all affected pages
    if (result.newCount > 0 || result.updatedCount > 0 || result.deletedCount > 0) {
      await triggerRevalidate(siteUrl, revalidateSecret, "/");
      await triggerRevalidate(siteUrl, revalidateSecret, "/wisdom");
      for (const cat of affectedCategories) {
        await triggerRevalidate(siteUrl, revalidateSecret, `/wisdom/${cat}`);
      }
    }
  } catch (err: any) {
    console.error("[sync-substack] Sync failed:", err);
    result.errors.push(`Sync error: ${err.message ?? err}`);
  }

  console.log("[sync-substack] Done:", JSON.stringify({
    fetched: result.fetched,
    new: result.newCount,
    updated: result.updatedCount,
    skipped: result.skippedCount,
    deleted: result.deletedCount,
    errors: result.errors.length,
  }));

  return new Response(JSON.stringify(result), {
    status: result.errors.length > 0 && result.fetched === 0 ? 500 : 200,
    headers: { "Content-Type": "application/json" },
  });
});
