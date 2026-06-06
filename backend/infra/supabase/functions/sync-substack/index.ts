// Supabase Edge Function: sync-substack
// Scheduled to run hourly via pg_cron configuration in config.toml

Deno.serve(async (req) => {
  const cronSecret = Deno.env.get("CRON_SECRET");
  const siteUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") || "https://masterwithin.org";

  // If a CRON_SECRET is configured, enforce authorization headers
  if (cronSecret) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    const url = `${siteUrl}/api/cron/sync-substack`;
    console.log(`[edge-function] Triggering Substack sync via: ${url}`);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${cronSecret}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to trigger sync: ${res.status} ${text}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(`[edge-function] Sync trigger error:`, err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
