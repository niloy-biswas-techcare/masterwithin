# Infrastructure Setup Guide

One-time configuration required to bring the CI/CD pipeline fully live (§21).
Code files handle the logic; this document covers the external-service configuration
that code cannot express — GitHub Environments, Vercel projects, and Supabase secrets.

---

## 1. GitHub Environments & Secrets (§21.4)

All sensitive values live in GitHub — never in Vercel via Actions, never in git.

### Repository-level secrets/vars (shared across all jobs)

| Type | Key | Value |
|------|-----|-------|
| Secret | `TURBO_TOKEN` | Turborepo remote cache API token (from Vercel dashboard → Remote Cache) |
| Variable | `TURBO_TEAM` | Turborepo team slug (from Vercel dashboard, e.g. `masterwithin`) |

> These are repository-level so every CI job (verify, e2e, lighthouse) inherits them
> and shares a single remote cache hash with Vercel builds (§21).

### `production` Environment secrets

Create a **GitHub Environment** named `production` (Settings → Environments → New environment).
Optional: add required reviewers to gate production deploys.

| Secret | Used by | Value |
|--------|---------|-------|
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI auth | Personal/CI access token from supabase.com/dashboard/account/tokens |
| `SUPABASE_PROJECT_REF` | `supabase link`, `functions deploy` | Project ref (e.g. `abcdefghijklmnop`) from supabase.com/dashboard |
| `SUPABASE_DB_PASSWORD` | `supabase db push` | Database password from Supabase dashboard → Project Settings → Database |

### Making jobs required status checks

In GitHub → Repository Settings → Branches → Branch protection rules for `main`:
- Enable **"Require status checks to pass before merging"**
- Add required checks: `verify`, `e2e`, `lighthouse`

---

## 2. Vercel Git Integration (§21)

Two separate Vercel projects point at the same GitHub repo with different root directories.

### Project 1 — Public site (`masterwithin.org`)

1. Vercel dashboard → New Project → import this GitHub repo
2. **Root Directory:** `frontend/web`
3. **Framework Preset:** Next.js (auto-detected)
4. Build/install commands are overridden by `frontend/web/vercel.json` — no changes needed in the dashboard
5. Production domain: `masterwithin.org`
6. Git branch: `main` → production; `feature/*` PRs → preview deploys

### Project 2 — Admin console (`admin.masterwithin.org`)

1. Vercel dashboard → New Project → import **the same repo again**
2. **Root Directory:** `frontend/admin`
3. **Framework Preset:** Next.js (auto-detected)
4. Build/install commands overridden by `frontend/admin/vercel.json`
5. Production domain: `admin.masterwithin.org`
6. Git branch: `main` → production; `feature/*` PRs → preview deploys

### Per-PR preview deploys

Vercel auto-creates preview deployments for every PR — one per app. Both preview URLs
are posted as PR comments by the Vercel GitHub App.

---

## 3. Vercel Runtime Environment Variables (§15)

For each Vercel project, populate environment variables in the Vercel dashboard
(Settings → Environment Variables). Set each variable for **Production** and **Preview**
environments as appropriate. Secrets must never be committed to git.

### Web app (`frontend/web`)

| Variable | Env | Value |
|----------|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview | Service role key (server-only) |
| `SUPABASE_JWT_SECRET` | Production + Preview | JWT secret from Supabase Auth settings |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Production + Preview | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Production + Preview | Cloudinary API key (server-only) |
| `CLOUDINARY_API_SECRET` | Production + Preview | Cloudinary API secret (server-only) |
| `CLOUDINARY_UPLOAD_PRESET` | Production + Preview | `mw_signed` |
| `NEXT_PUBLIC_SITE_URL` | Production | `https://masterwithin.org` |
| `NEXT_PUBLIC_SITE_URL` | Preview | (Vercel preview URL — set per-deployment or use `VERCEL_URL`) |
| `SUBSTACK_FEED_URL` | Production + Preview | `https://masterwithin.substack.com/feed` |
| `WHATSAPP_NUMBER` | Production + Preview | `91XXXXXXXXXX` (no `+`) |
| `RESEND_API_KEY` | Production + Preview | Resend API key |
| `REVALIDATE_SECRET` | Production + Preview | Random secret (protects `/api/revalidate`) |
| `CRON_SECRET` | Production + Preview | Random secret (protects `/api/cron/sync-substack`) |
| `BACKEND_DRIVER` | Production + Preview | `supabase` |
| `TURBO_TOKEN` | Production + Preview | Same token as GitHub secret |
| `TURBO_TEAM` | Production + Preview | Same team slug as GitHub variable |

### Admin app (`frontend/admin`)

| Variable | Env | Value |
|----------|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production + Preview | Same as web |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production + Preview | Same as web (login handshake only) |
| `SUPABASE_SERVICE_ROLE_KEY` | Production + Preview | Same as web |
| `SUPABASE_JWT_SECRET` | Production + Preview | Same as web |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Production + Preview | Same as web |
| `CLOUDINARY_API_KEY` | Production + Preview | Same as web |
| `CLOUDINARY_API_SECRET` | Production + Preview | Same as web |
| `CLOUDINARY_UPLOAD_PRESET` | Production + Preview | `mw_signed` |
| `NEXT_PUBLIC_SITE_URL` | Production | `https://masterwithin.org` |
| `ADMIN_SESSION_COOKIE_NAME` | Production + Preview | `mw_session` |
| `ADMIN_SESSION_MAX_AGE_DAYS` | Production + Preview | `5` |
| `ADMIN_ALLOWLIST` | Production + Preview | `ops@masterwithin.org` (comma-separated) |
| `ADMIN_BOOTSTRAP_EMAIL` | Production | Email of the first admin operator |
| `BACKEND_DRIVER` | Production + Preview | `supabase` |
| `TURBO_TOKEN` | Production + Preview | Same token as GitHub secret |
| `TURBO_TEAM` | Production + Preview | Same team slug as GitHub variable |

> **Preview isolation:** for preview deploys, use a separate Supabase project or the local
> Supabase stack. Set preview-specific values for `NEXT_PUBLIC_SUPABASE_URL`,
> `SUPABASE_SERVICE_ROLE_KEY`, etc. so preview branches never hit the production database.

---

## 4. Turborepo Remote Cache (§21)

The same Turbo cache is shared between GitHub Actions and Vercel builds, so a hash
computed in CI is reused by the Vercel deploy (no double-build).

1. In the Vercel dashboard, go to the `masterwithin` team → Settings → Remote Cache
2. Generate a **Remote Cache Token** and copy it
3. Save it as `TURBO_TOKEN` in GitHub repository secrets **and** as `TURBO_TOKEN` in both
   Vercel projects' environment variables
4. Save the team slug as `TURBO_TEAM` in GitHub repository variables **and** both Vercel projects

Turborepo v2+ automatically reads `TURBO_TOKEN` and `TURBO_TEAM` from the environment —
no `turbo.json` changes required.

---

## 5. Supabase Edge Function Cron (§21.4)

The `sync-substack` Edge Function is configured in `backend/infra/supabase/config.toml`:

```toml
[edge_functions.sync-substack]
verify_jwt = false
cron = "0 * * * *"   # runs every hour at :00
```

The `db-migrate.yml` workflow deploys (or re-deploys) all Edge Functions on every merge to
`main` when `backend/infra/supabase/**` changes. To force a re-deploy without a schema
change, touch any file in that path.

The function calls the web app's `/api/cron/sync-substack` route, which requires the
`CRON_SECRET` environment variable to be set in the Supabase Edge Function secrets.
Set it via the Supabase dashboard → Edge Functions → sync-substack → Secrets, or:

```bash
supabase secrets set CRON_SECRET=<your-secret> --project-ref <ref>
supabase secrets set NEXT_PUBLIC_SITE_URL=https://masterwithin.org --project-ref <ref>
```

---

## 6. Rollback Policy (§21.1, §21.4)

### Frontend rollback (Vercel)

Vercel stores every deployment as an immutable build. To roll back:
1. Vercel dashboard → project → Deployments tab
2. Find the last known-good deployment
3. Click the `⋯` menu → **Promote to Production**

This is instant — no rebuild required. The previous build artifact is already on Vercel's CDN.

### Database rollback (Supabase)

There is **no destructive rollback** in production. The policy is **roll forward**:
- If a migration causes an issue, write a new migration that fixes or reverts the schema change
- Never run `supabase db reset` or manually drop tables on the production database

**Expand-then-contract pattern for breaking changes:**
1. PR 1: Add the new column/table (expand). Deploy. Both old and new code work.
2. PR 2: Migrate data, update application code to use the new shape (contract). Deploy.
3. PR 3 (optional): Remove the old column once all deploys reference only the new shape.

This keeps the ordering of Vercel deploy + DB migration safe (§21.1).

### Edge Function rollback

Edge Functions are deployed on every merge. If a function deploy causes problems:
1. Revert the function code in git and merge (triggers a new deploy)
2. Alternatively, use the Supabase dashboard → Edge Functions to manage versions

---

## 7. Domain & DNS (§21)

| Domain | Vercel project | DNS record |
|--------|---------------|------------|
| `masterwithin.org` | web | `A`/`CNAME` → Vercel nameserver |
| `admin.masterwithin.org` | admin | `CNAME` → Vercel alias |

Configure in your DNS provider. Vercel will provision TLS certificates automatically
once the DNS records propagate. Enable "Enforce HTTPS" in Vercel project settings.
