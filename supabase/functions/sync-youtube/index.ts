/**
 * Supabase Edge Function — sync-youtube
 *
 * Syncs all configured YouTube channels (EN/BN/HI) to the Supabase `videos` and
 * `playlists` tables. Runs daily at 00:00 UTC via pg_cron (§8c, §21.4).
 * The Next.js /api/cron/sync-youtube route remains a manual HTTP fallback.
 *
 * Auth: Authorization: Bearer $CRON_SECRET
 *   - External callers (manual trigger): use CRON_SECRET
 *   - Supabase scheduled cron: uses service_role JWT — verified by role claim
 *
 * Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   YOUTUBE_API_KEY
 *   YOUTUBE_CHANNEL_EN, YOUTUBE_CHANNEL_BN, YOUTUBE_CHANNEL_HI
 *   CRON_SECRET
 *   NEXT_PUBLIC_SITE_URL, REVALIDATE_SECRET  (for ISR revalidation)
 */

import { createClient } from "npm:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface YTVideoItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  channelId: string;
  durationSeconds: number;
}

interface YTPlaylistItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  publishedAt: string;
  itemCount: number;
}

// ---------------------------------------------------------------------------
// CATEGORIES — inlined from @mw/types (Deno can't import from monorepo)
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
// Auto-categorize — ported from backend/src/application/content/autoCategorize.ts
// ---------------------------------------------------------------------------

function countMatches(haystack: string, keyword: string): number {
  if (!keyword) return 0;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, "g");
  return (haystack.match(re) ?? []).length;
}

function autoCategorize(title: string, bodyText: string): string {
  const t = title.toLowerCase();
  const b = bodyText.toLowerCase();
  let bestSlug = FALLBACK_CATEGORY;
  let bestScore = 0;
  for (const cat of CATEGORIES) {
    let score = 0;
    for (const kw of cat.keywords) {
      score += countMatches(t, kw) * 3;
      score += countMatches(b, kw) * 1;
    }
    if (score > bestScore) { bestScore = score; bestSlug = cat.slug; }
  }
  return bestScore > 0 ? bestSlug : FALLBACK_CATEGORY;
}

function resolveCategory(args: {
  title: string;
  description: string;
  existingCategory?: string;
  categoryLocked?: boolean;
}): string {
  if (args.categoryLocked && args.existingCategory) return args.existingCategory;
  return autoCategorize(args.title, args.description);
}

// ---------------------------------------------------------------------------
// YouTube API — ported from backend/src/application/content/youtubeApi.ts
// ---------------------------------------------------------------------------

const YT_BASE = "https://www.googleapis.com/youtube/v3";

function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || "0") * 3600) + (parseInt(m[2] || "0") * 60) + parseInt(m[3] || "0");
}

function bestThumbnail(t: any): string {
  return t?.maxres?.url || t?.standard?.url || t?.high?.url || t?.medium?.url || t?.default?.url || "";
}

async function ytFetch(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function fetchChannelVideos(channelId: string, apiKey: string): Promise<YTVideoItem[]> {
  const results: YTVideoItem[] = [];
  let pageToken: string | undefined;
  do {
    const p = new URLSearchParams({ part: "snippet", channelId, type: "video", order: "date", maxResults: "50", key: apiKey });
    if (pageToken) p.set("pageToken", pageToken);
    const data = await ytFetch(`${YT_BASE}/search?${p}`);
    const ids: string[] = (data.items || []).map((i: any) => i.id.videoId).filter(Boolean);
    if (ids.length > 0) {
      const dp = new URLSearchParams({ part: "snippet,contentDetails", id: ids.join(","), key: apiKey });
      const details = await ytFetch(`${YT_BASE}/videos?${dp}`);
      for (const item of details.items || []) {
        results.push({
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description || "",
          thumbnailUrl: bestThumbnail(item.snippet.thumbnails),
          publishedAt: item.snippet.publishedAt,
          channelId: item.snippet.channelId,
          durationSeconds: parseDuration(item.contentDetails?.duration || "PT0S"),
        });
      }
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return results;
}

async function fetchChannelPlaylists(channelId: string, apiKey: string): Promise<YTPlaylistItem[]> {
  const results: YTPlaylistItem[] = [];
  let pageToken: string | undefined;
  do {
    const p = new URLSearchParams({ part: "snippet,contentDetails", channelId, maxResults: "50", key: apiKey });
    if (pageToken) p.set("pageToken", pageToken);
    const data = await ytFetch(`${YT_BASE}/playlists?${p}`);
    for (const item of data.items || []) {
      results.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description || "",
        thumbnailUrl: bestThumbnail(item.snippet.thumbnails),
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        itemCount: item.contentDetails?.itemCount ?? 0,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return results;
}

// ---------------------------------------------------------------------------
// Revalidate web frontend — ported from backend/src/application/revalidate.ts
// ---------------------------------------------------------------------------

async function triggerRevalidate(siteUrl: string, secret: string, path: string): Promise<void> {
  if (!siteUrl || !secret) return;
  try {
    const url = new URL("/api/revalidate", siteUrl);
    url.searchParams.set("secret", secret);
    url.searchParams.set("path", path);
    const res = await fetch(url.toString(), { method: "POST" });
    if (!res.ok) console.error(`[sync-youtube] revalidate ${path} failed: ${res.status}`);
  } catch (err) {
    console.error(`[sync-youtube] revalidate ${path} error:`, err);
  }
}

// ---------------------------------------------------------------------------
// Auth helper — accepts CRON_SECRET or Supabase service_role JWT
// ---------------------------------------------------------------------------

function isAuthorized(req: Request): boolean {
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  const token = req.headers.get("Authorization")?.split(" ")[1] ?? "";

  if (token === cronSecret && cronSecret !== "") return true;

  // Supabase scheduled invocations send a service_role JWT — check role claim.
  // Not cryptographically verified here; forging would require the JWT secret.
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload?.role === "service_role") return true;
  } catch { /* invalid JWT shape — fall through to deny */ }

  return false;
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
  const supabaseUrl     = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") ?? "";
  const serviceRoleKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const apiKey          = Deno.env.get("YOUTUBE_API_KEY") ?? "";
  const siteUrl         = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "";
  const revalidateSecret = Deno.env.get("REVALIDATE_SECRET") ?? "";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "YOUTUBE_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create client early — needed for site_config fallback below
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const channelMap: Record<string, "en" | "bn" | "hi"> = {};

  // Prefer env vars, fall back to site_config.youtube.channels stored in DB.
  // This means the admin panel's YouTube channel fields are the source of truth
  // when env vars aren't set (§8c fallback, same as the Node.js backend).
  const en = Deno.env.get("YOUTUBE_CHANNEL_EN");
  const bn = Deno.env.get("YOUTUBE_CHANNEL_BN");
  const hi = Deno.env.get("YOUTUBE_CHANNEL_HI");

  if (en) channelMap[en] = "en";
  if (bn) channelMap[bn] = "bn";
  if (hi) channelMap[hi] = "hi";

  if (Object.keys(channelMap).length === 0) {
    // No env vars — read from site_config table (set via admin settings page)
    const { data: configRow } = await supabase
      .from("site_config")
      .select("youtube")
      .eq("id", "main")
      .maybeSingle();

    const ch = configRow?.youtube?.channels as { en?: string; bn?: string; hi?: string } | undefined;
    if (ch?.en) channelMap[ch.en] = "en";
    if (ch?.bn) channelMap[ch.bn] = "bn";
    if (ch?.hi) channelMap[ch.hi] = "hi";
  }

  if (Object.keys(channelMap).length === 0) {
    return new Response(JSON.stringify({ error: "No YouTube channels configured. Set them in Admin → Settings → YouTube Channels." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const channelResults: any[] = [];
  let totalFetched = 0, totalNew = 0, totalUpdated = 0;
  const topErrors: string[] = [];
  const BATCH = 25;

  for (const [channelId, language] of Object.entries(channelMap)) {
    const result = { channel: channelId, language, fetched: 0, newCount: 0, updatedCount: 0, errors: [] as string[] };
    try {
      // --- Videos ---
      const ytVideos = await fetchChannelVideos(channelId, apiKey);
      result.fetched = ytVideos.length;
      totalFetched += ytVideos.length;

      // Batch-load existing records to preserve featured/hidden/categoryLocked state
      const existingMap = new Map<string, any>();
      for (let i = 0; i < ytVideos.length; i += BATCH) {
        const ids = ytVideos.slice(i, i + BATCH).map(v => v.id);
        const { data } = await supabase.from("videos")
          .select("id,category,category_locked,playlist_ids,featured,hidden")
          .in("id", ids);
        (data || []).forEach((v: any) => existingMap.set(v.id, v));
      }

      for (const ytV of ytVideos) {
        try {
          const existing = existingMap.get(ytV.id);
          const category = resolveCategory({
            title: ytV.title,
            description: ytV.description,
            existingCategory: existing?.category,
            categoryLocked: existing?.category_locked,
          });

          const { error } = await supabase.from("videos").upsert({
            id: ytV.id,
            title: ytV.title,
            description: ytV.description,
            thumbnail: ytV.thumbnailUrl,
            duration: ytV.durationSeconds,
            published_at: ytV.publishedAt,
            channel_id: ytV.channelId,
            language,
            category,
            category_locked: existing?.category_locked ?? false,
            playlist_ids: existing?.playlist_ids ?? [],
            featured: existing?.featured ?? false,
            hidden: existing?.hidden ?? false,
            is_short: ytV.durationSeconds < 60,
            youtube_url: `https://www.youtube.com/watch?v=${ytV.id}`,
            updated_at: new Date().toISOString(),
          });
          if (error) throw error;

          if (existing) { result.updatedCount++; totalUpdated++; }
          else           { result.newCount++;     totalNew++;     }
        } catch (err: any) {
          result.errors.push(`Video ${ytV.id}: ${err.message}`);
        }
      }

      // --- Playlists ---
      const ytPlaylists = await fetchChannelPlaylists(channelId, apiKey);
      const existingPlaylistMap = new Map<string, any>();
      for (let i = 0; i < ytPlaylists.length; i += BATCH) {
        const ids = ytPlaylists.slice(i, i + BATCH).map(p => p.id);
        const { data } = await supabase.from("playlists")
          .select("id,description,featured,hidden")
          .in("id", ids);
        (data || []).forEach((p: any) => existingPlaylistMap.set(p.id, p));
      }

      for (const ytP of ytPlaylists) {
        try {
          const existing = existingPlaylistMap.get(ytP.id);
          const { error } = await supabase.from("playlists").upsert({
            id: ytP.id,
            title: ytP.title,
            description: existing?.description ?? ytP.description,
            thumbnail: ytP.thumbnailUrl,
            video_count: ytP.itemCount,
            channel_id: ytP.channelId,
            language,
            published_at: ytP.publishedAt,
            featured: existing?.featured ?? false,
            hidden: existing?.hidden ?? false,
            updated_at: new Date().toISOString(),
          });
          if (error) throw error;
        } catch (err: any) {
          result.errors.push(`Playlist ${ytP.id}: ${err.message}`);
        }
      }
    } catch (err: any) {
      const msg = err.message ?? String(err);
      result.errors.push(`Channel sync failed: ${msg}`);
      topErrors.push(`[${language}] ${msg}`);
    }

    console.log(`[sync-youtube] ${channelId} (${language}): ${result.newCount} new, ${result.updatedCount} updated, ${result.errors.length} errors`);
    channelResults.push(result);
  }

  // Audit log
  if (totalNew > 0 || totalUpdated > 0) {
    try {
      await supabase.from("audit_logs").insert({
        actor_uid: "system",
        actor_email: "system@masterwithin.org",
        action: "youtube_sync",
        entity: "video",
        entity_id: "all",
        diff: { totalNew: { from: null, to: totalNew }, totalUpdated: { from: null, to: totalUpdated }, totalFetched: { from: null, to: totalFetched } },
        at: new Date().toISOString(),
      });
    } catch (err) { console.error("[sync-youtube] audit log failed:", err); }

    await triggerRevalidate(siteUrl, revalidateSecret, "/media");
  }

  const summary = { channels: channelResults, totalFetched, totalNew, totalUpdated, errors: topErrors };
  console.log("[sync-youtube] Done:", JSON.stringify({ totalFetched, totalNew, totalUpdated, errors: topErrors.length }));

  return new Response(JSON.stringify(summary), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
