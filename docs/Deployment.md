# Deployment Guide — Master Within Foundation

> Step-by-step guide to deploying the monorepo with CI/CD on the `main` branch.
> The architecture uses **Vercel** (frontend hosting) + **Supabase** (backend) + **GitHub Actions** (CI/CD).

---

## Overview — What Already Exists

| Component | Status | Location |
|---|---|---|
| CI workflow (PR checks) | ✅ Ready | `.github/workflows/ci.yml` |
| DB migration workflow | ✅ Ready | `.github/workflows/db-migrate.yml` |
| Vercel build configs | ✅ Ready | `frontend/web/vercel.json`, `frontend/admin/vercel.json` |
| Supabase migrations | ✅ Ready | `backend/infra/supabase/migrations/` |
| Edge Functions | ✅ Ready | `backend/infra/supabase/functions/sync-substack/` |
| Lighthouse CI config | ✅ Ready | `frontend/web/.lighthouserc.json` |
| Local build | ✅ Passes | `pnpm turbo run build` — all 6 tasks succeed |

---

## Step 1: Supabase — Production Project

> Skip if you already have a production Supabase project with migrations applied.

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Set project name: `masterwithin-production`
3. Set a strong database password → save it (you'll need it as `SUPABASE_DB_PASSWORD`)
4. Select the closest region
5. Wait for the project to provision

### Apply migrations

```bash
# From project root
cd backend/infra

# Link to production project
supabase link --project-ref <YOUR_PROJECT_REF>

# Push all migrations
SUPABASE_DB_PASSWORD=<your-db-password> supabase db push

# Generate TypeScript types
supabase gen types typescript --linked > supabase/generated/types.ts
```

### Record these values (needed later)

- `SUPABASE_PROJECT_REF` — found in Project Settings → General → Reference ID
- `SUPABASE_URL` — `https://<ref>.supabase.co`
- `SUPABASE_ANON_KEY` — Project Settings → API → anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → service_role key (secret!)
- `SUPABASE_JWT_SECRET` — Project Settings → API → JWT Secret
- `SUPABASE_DB_PASSWORD` — the password you set above
- `SUPABASE_ACCESS_TOKEN` — Account Settings → Access Tokens → Generate new token

### Configure Edge Function secrets

In the Supabase Dashboard → Edge Functions → Secrets, add:

```
CRON_SECRET=<generate-a-random-secret>
NEXT_PUBLIC_SITE_URL=https://masterwithin.org
```

---

## Step 2: Vercel — Create Two Projects

You need **two separate Vercel projects** — one for the public web app, one for the admin console.

### 2a. Web App (public site)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repo: `niloy-biswas-techcare/masterwithin`
3. **Root Directory**: set to `frontend/web`
4. Framework Preset: **Next.js** (auto-detected)
5. Build settings (Vercel should auto-detect from `vercel.json`):
   - Build Command: `cd ../.. && pnpm turbo run build --filter web`
   - Install Command: `cd ../.. && pnpm install --frozen-lockfile`
   - Output Directory: `.next`
6. Add all environment variables from `.env.example` (see Section 4 below)
7. Deploy

### 2b. Admin Console

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the **same** GitHub repo: `niloy-biswas-techcare/masterwithin`
3. **Root Directory**: set to `frontend/admin`
4. Framework Preset: **Next.js** (auto-detected)
5. Build settings (auto-detected from `vercel.json`):
   - Build Command: `cd ../.. && pnpm turbo run build --filter admin`
   - Install Command: `cd ../.. && pnpm install --frozen-lockfile`
   - Output Directory: `.next`
6. Add the same environment variables (see Section 4 below)
7. Deploy

### Vercel — Enable Turborepo Remote Cache (shared between CI & Vercel)

1. In either Vercel project → Settings → General → Turborepo Remote Cache → **Enable**
2. This gives you `TURBO_TOKEN` and `TURBO_TEAM` values (find them in Settings → Remote Cache)

---

## Step 3: GitHub — Configure Secrets & Variables

Go to your GitHub repo → **Settings → Secrets and variables → Actions**.

### Repository Secrets

| Secret Name | Value |
|---|---|
| `TURBO_TOKEN` | From Vercel → Settings → Remote Cache |
| `SUPABASE_ACCESS_TOKEN` | From Supabase → Account Settings → Access Tokens |

### Repository Variables

| Variable Name | Value |
|---|---|
| `TURBO_TEAM` | From Vercel → Settings → Remote Cache (usually your team slug) |

### Create a `production` Environment

1. GitHub repo → Settings → Environments → **New environment** → name: `production`
2. Add these **environment secrets**:

| Environment Secret | Value |
|---|---|
| `SUPABASE_PROJECT_REF` | Your Supabase project ref |
| `SUPABASE_DB_PASSWORD` | Your Supabase DB password |
| `SUPABASE_ACCESS_TOKEN` | Your Supabase access token |

> **Optional but recommended:** Enable "Required reviewers" on the `production` environment
> to require approval before db-migrate.yml runs.

---

## Step 4: Environment Variables for Vercel

Add these in **both** Vercel projects (web + admin) → Settings → Environment Variables:

### Required for both apps

```
BACKEND_DRIVER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_JWT_SECRET=<jwt-secret>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
CLOUDINARY_UPLOAD_PRESET=mw_signed
NEXT_PUBLIC_SITE_URL=https://masterwithin.org
SUBSTACK_FEED_URL=https://masterwithin.substack.com/feed
WHATSAPP_NUMBER=<your-whatsapp-number>
RESEND_API_KEY=<your-resend-key>
REVALIDATE_SECRET=<generate-a-random-secret>
CRON_SECRET=<same-as-supabase-edge-function>
ADMIN_SESSION_COOKIE_NAME=mw_session
ADMIN_SESSION_MAX_AGE_DAYS=5
ADMIN_ALLOWLIST=<comma-separated-emails>
ADMIN_BOOTSTRAP_EMAIL=<first-admin-email>
```

### Web app only extras

- `NEXT_PUBLIC_SITE_URL=https://masterwithin.org` (production domain)

### Admin app only extras

- `NEXT_PUBLIC_SITE_URL=https://admin.masterwithin.org` (admin domain)

---

## Step 5: Custom Domains

### Web app → `masterwithin.org`

1. Vercel → web project → Settings → Domains → Add `masterwithin.org` + `www.masterwithin.org`
2. Follow Vercel's DNS instructions (typically add a CNAME or A record to your domain registrar)

### Admin app → `admin.masterwithin.org`

1. Vercel → admin project → Settings → Domains → Add `admin.masterwithin.org`
2. Add a CNAME record: `admin → cname.vercel-dns.com`

---

## Step 6: Branch Protection Rules (GitHub)

Go to GitHub repo → Settings → Branches → **Add branch protection rule** for `main`:

- ✅ Require a pull request before merging
- ✅ Require approvals (1)
- ✅ Require status checks to pass before merging
  - Add these required checks:
    - `verify` (from ci.yml)
    - `e2e` (from ci.yml)
    - `lighthouse` (from ci.yml)
- ✅ Require branches to be up to date before merging
- ✅ Require linear history (optional, keeps git log clean)

---

## Step 7: Bootstrap the First Admin User

After the first production deploy:

```bash
cd backend

# Set production env vars locally or use Supabase dashboard
npx vite-node scripts/grant-admin.ts
```

Or manually via the Supabase Dashboard:
1. Go to Authentication → Users
2. Create a user with the admin email
3. Run this SQL in the SQL Editor:
```sql
UPDATE auth.users
SET app_metadata = jsonb_set(app_metadata, '{role}', '"admin"')
WHERE email = 'your-admin@email.com';
```

---

## Step 8: Verify Everything Works

### After first deploy:

| Check | How |
|---|---|
| Web site loads | Visit `https://masterwithin.org` |
| Admin loads | Visit `https://admin.masterwithin.org` → redirects to login |
| CI runs on PR | Open a test PR → check Actions tab |
| DB migrations | Merge a PR touching `backend/infra/supabase/**` → check Actions |
| Substack sync | Check Supabase Edge Functions logs for the cron run |
| ISR revalidation | Publish content in Admin → check if it appears on the public site |

---

## How the CI/CD Pipeline Works

```
Feature branch PR ──────────────────────────────────────────────
  GitHub Actions CI:
    1. verify   → typecheck · lint · test · build (all packages)
    2. e2e      → Playwright smoke tests on built web app
    3. lighthouse → performance/SEO/a11y budget checks
  Vercel:
    → Auto-deploy preview (both apps) with unique URLs

Merge to main ─────────────────────────────────────────────────
  Vercel:
    → Production deploy (immutable, instant rollback)
  GitHub Actions (if backend/infra/supabase/** changed):
    → Apply Supabase migrations
    → Verify type drift check
    → Deploy Edge Functions
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Vercel build fails: "Cannot find module @mw/backend" | Ensure `installCommand` runs from repo root (`cd ../.. && pnpm install --frozen-lockfile`) |
| CI fails: "pnpm install --frozen-lockfile" | Run `pnpm install` locally and commit the updated `pnpm-lock.yaml` |
| Lighthouse CI fails on budget | Check the failing metric in the report; adjust performance or update `.lighthouserc.json` thresholds |
| DB migration drift check fails | Run `pnpm db:types` locally and commit `backend/infra/supabase/generated/types.ts` |
| Vercel monorepo detection issues | Ensure `Root Directory` is set correctly and `vercel.json` points build commands to repo root |
| Turborepo cache misses | Verify `TURBO_TOKEN` and `TURBO_TEAM` match between GitHub Secrets and Vercel |
