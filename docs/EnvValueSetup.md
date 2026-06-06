# Environment Setup, Local Dev & Deployment Guide

Full step-by-step flow: get secrets → run locally → deploy to Vercel → connect GoDaddy domain.

---

## Table of Contents

1. [Get Your Environment Values](#1-get-your-environment-values)
2. [Configure the .env File](#2-configure-the-env-file)
3. [Run the App Locally](#3-run-the-app-locally)
4. [Deploy to Vercel](#4-deploy-to-vercel)
5. [Connect GoDaddy Domain](#5-connect-godaddy-domain)

---

## 1. Get Your Environment Values

### 1.1 Supabase

> Used for: database, auth, storage, row-level security.

1. Go to [supabase.com](https://supabase.com) → **New Project**.
2. Choose an organisation, enter a project name (e.g. `masterwithin`), pick a strong **Database Password**, and select a region close to your users.
3. Wait ~2 minutes for provisioning.
4. In your project dashboard go to **Project Settings → API**:

| Value you need | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** field |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project API keys → anon / public** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Project API keys → service_role** (keep secret) |
| `SUPABASE_JWT_SECRET` | **Project Settings → API → JWT Settings → JWT Secret** |

### 1.2 Cloudinary

> Used for: image upload, transformation, and delivery.

1. Go to [cloudinary.com](https://cloudinary.com) → **Sign Up / Log In**.
2. In the **Dashboard** copy:

| Value you need | Where to find it |
|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | **Cloud name** (top of dashboard) |
| `CLOUDINARY_API_KEY` | **API Key** |
| `CLOUDINARY_API_SECRET` | **API Secret** |

3. Create a **signed upload preset** for admin uploads:
   - Go to **Settings → Upload → Upload Presets → Add upload preset**.
   - Set **Signing mode** to **Signed**.
   - Name it `mw_signed` (matches `CLOUDINARY_UPLOAD_PRESET` default).
   - Save.

### 1.3 Resend (email)

> Used for: transactional emails (contact form, order confirmations).

1. Go to [resend.com](https://resend.com) → **Sign Up / Log In**.
2. In **API Keys** → **Create API Key**.
3. Copy the key — that is your `RESEND_API_KEY` (format: `re_…`).

### 1.4 Admin & security secrets

These are random secrets you generate yourself — they are never stored in any third-party dashboard.

Run this command once to generate three secrets:

```bash
node -e "for(let i=0;i<3;i++) console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Assign the three output lines to:
- `REVALIDATE_SECRET` — used to trigger ISR cache revalidation from the CMS.
- `CRON_SECRET` — used to authenticate the Vercel cron job (`/api/cron/sync-substack`).
- (Optional third one for future use.)

### 1.5 Substack & WhatsApp

| Variable | Value |
|---|---|
| `SUBSTACK_FEED_URL` | Your Substack RSS feed URL, e.g. `https://masterwithin.substack.com/feed` |
| `WHATSAPP_NUMBER` | Your WhatsApp number in international format **without** `+`, e.g. `919876543210` |

---

## 2. Configure the .env File

1. Copy the example file to `.env` in the **repo root**:

```bash
cp .env.example .env
```

2. Open `.env` and fill in every value:

```env
# ── Backend selection ──────────────────────────────────────────────────────────
BACKEND_DRIVER=supabase
BACKEND_API_URL=

# ── Supabase ───────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# ── Cloudinary ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=mw_signed

# ── Public site config ─────────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://masterwithin.org    # use http://localhost:3000 for local dev

# ── Server-only ────────────────────────────────────────────────────────────────
SUBSTACK_FEED_URL=https://masterwithin.substack.com/feed
WHATSAPP_NUMBER=919876543210
RESEND_API_KEY=re_xxxxxxxxxxxx
REVALIDATE_SECRET=your-generated-secret
CRON_SECRET=your-generated-secret

# ── Admin auth ─────────────────────────────────────────────────────────────────
ADMIN_SESSION_COOKIE_NAME=mw_session
ADMIN_SESSION_MAX_AGE_DAYS=5
ADMIN_ALLOWLIST=ops@masterwithin.org,admin@masterwithin.org
ADMIN_BOOTSTRAP_EMAIL=admin@masterwithin.org
```

> **For local dev only** — change `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000`.

---

## 3. Run the App Locally

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20.12.0 | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| pnpm | 9.x | `npm install -g pnpm@9` |
| Supabase CLI | latest | `brew install supabase/tap/supabase` |

### Step 1 — Install dependencies

```bash
pnpm install
```

### Step 2 — Apply database migrations

Push the schema to your remote Supabase project (run once, then after every migration):

```bash
pnpm db:migrate
```

Or using the Supabase CLI directly:

```bash
supabase db push --db-url "postgresql://postgres:[YOUR_DB_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

### Step 3 — Seed the admin user (first time only)

```bash
pnpm db:seed
```

This grants the `ADMIN_BOOTSTRAP_EMAIL` user the `admin` role in Supabase.

### Step 4 — Start all apps in dev mode

```bash
pnpm dev
```

Turborepo starts both apps concurrently:

| App | URL |
|---|---|
| Public website (`frontend/web`) | http://localhost:3000 |
| Admin dashboard (`frontend/admin`) | http://localhost:3001 |

To start only one app:

```bash
# public site only
pnpm --filter web dev

# admin only
pnpm --filter admin dev
```

---

## 4. Deploy to Vercel

Both apps (`web` and `admin`) are deployed as **separate Vercel projects** from the same monorepo.

### Step 1 — Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### Step 2 — Deploy the public website

```bash
cd frontend/web
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your Vercel team/account
- **Link to existing project?** → No (first time) → Enter project name `masterwithin-web`
- **In which directory is your code?** → `./` (stay in `frontend/web`)
- **Override settings?** → No (Vercel reads `vercel.json` automatically)

### Step 3 — Deploy the admin dashboard

```bash
cd frontend/admin
vercel
```

Same prompts — name it `masterwithin-admin`.

### Step 4 — Add environment variables to Vercel

In the [Vercel Dashboard](https://vercel.com/dashboard) → open each project → **Settings → Environment Variables**.

Add **every variable from your `.env` file** to both projects. Mark each variable with the correct environments (Production / Preview / Development).

**Quick way via CLI (run from repo root):**

```bash
# For web project
vercel env add NEXT_PUBLIC_SUPABASE_URL --scope production -y < /dev/null
# Repeat for every variable...
```

Or use the dashboard UI — it's easier for bulk entry.

### Step 5 — Deploy to production

After environment variables are set, trigger a production deploy:

```bash
# from frontend/web
vercel --prod

# from frontend/admin
vercel --prod
```

Your apps are now live at the Vercel-assigned `.vercel.app` URLs.

### Step 6 — Verify the cron job

The public site has a Vercel cron defined in `frontend/web/vercel.json`:

```json
{ "path": "/api/cron/sync-substack", "schedule": "0 * * * *" }
```

Confirm it appears in **Vercel Dashboard → project → Settings → Cron Jobs**. It runs every hour and uses `CRON_SECRET` for authorization.

---

## 5. Connect GoDaddy Domain

You will point your GoDaddy domain (e.g. `masterwithin.org`) to the **public website** Vercel project, and optionally a subdomain (e.g. `admin.masterwithin.org`) to the **admin** project.

### Step 1 — Add the domain in Vercel

1. Open **Vercel Dashboard → masterwithin-web project → Settings → Domains**.
2. Click **Add Domain** → enter `masterwithin.org` → click **Add**.
3. Also add `www.masterwithin.org` and set a redirect from `www` → root (Vercel offers this automatically).
4. Vercel shows you the DNS records to configure — keep this page open.

For admin (optional):
- In **masterwithin-admin project → Settings → Domains** → add `admin.masterwithin.org`.

### Step 2 — Configure DNS in GoDaddy

1. Log in to [GoDaddy](https://godaddy.com) → **My Products → Domains → Manage** → click your domain.
2. Click **DNS** (or **Manage DNS**).
3. Delete any existing `A` records and `CNAME` records for `@` and `www` (GoDaddy defaults).

**Add these records:**

| Type | Name | Value | TTL |
|---|---|---|---|
| `A` | `@` | `76.76.21.21` | 600 |
| `CNAME` | `www` | `cname.vercel-dns.com.` | 600 |
| `CNAME` | `admin` | `cname.vercel-dns.com.` | 600 |

> The `A` record IP (`76.76.21.21`) is Vercel's global anycast IP. The `CNAME` value is always `cname.vercel-dns.com.`

4. Save changes.

### Step 3 — Wait for DNS propagation

DNS changes can take **5 minutes to 48 hours** to propagate globally. Use this command to check:

```bash
dig masterwithin.org A +short
# Expected: 76.76.21.21
```

Or check online at [dnschecker.org](https://dnschecker.org).

### Step 4 — SSL certificate (automatic)

Vercel automatically provisions a **free TLS certificate** via Let's Encrypt once DNS resolves. No action needed — the padlock appears within minutes of DNS propagating.

### Step 5 — Update NEXT_PUBLIC_SITE_URL in Vercel

After the domain is live, update the environment variable in both Vercel projects:

```
NEXT_PUBLIC_SITE_URL=https://masterwithin.org
```

Then re-deploy to pick up the change:

```bash
vercel --prod
```

### Step 6 — Verify end-to-end

```bash
# Check the homepage loads over HTTPS
curl -I https://masterwithin.org

# Check www redirects to apex
curl -I https://www.masterwithin.org

# Check admin subdomain
curl -I https://admin.masterwithin.org
```

All three should return `HTTP/2 200` (or `301` for the www redirect).

---

## Quick Reference Checklist

```
[ ] Supabase project created — URL, anon key, service role key, JWT secret copied
[ ] Cloudinary account set up — cloud name, API key, API secret, signed preset created
[ ] Resend API key generated
[ ] REVALIDATE_SECRET and CRON_SECRET generated (random hex)
[ ] .env file filled from .env.example
[ ] pnpm install completed
[ ] pnpm db:migrate applied schema to Supabase
[ ] pnpm db:seed run (first time) to bootstrap admin user
[ ] pnpm dev — both apps run locally without errors
[ ] Vercel projects created for web and admin
[ ] All env vars added to both Vercel projects
[ ] vercel --prod deployed both projects
[ ] GoDaddy A record set to 76.76.21.21
[ ] GoDaddy CNAME records set for www and admin
[ ] DNS propagated (dig returns correct IP)
[ ] SSL certificate active (HTTPS padlock visible)
[ ] NEXT_PUBLIC_SITE_URL updated to https://masterwithin.org in Vercel
[ ] Final vercel --prod redeploy done
```
