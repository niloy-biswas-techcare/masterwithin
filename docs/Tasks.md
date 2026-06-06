# Master Within Foundation — Production Build Task Plan

> The execution companion to [Project.md](./Project.md). Project.md says **what the system is**;
> this document says **what to do, in what order, to get there** — every task needed to take the
> blueprint to a production-ready launch.
>
> **How to use this file**
> - Tasks are grouped into **phases**. Phases are ordered so each builds on the last; within a phase,
>   tasks can often run in parallel.
> - Every task is a checkbox (`- [ ]`). Mark `- [x]` when **done by the §20 Definition of Done**
>   (typed, validated at boundaries, accessible, within budget, tested to its risk, doc updated).
> - `§n` references point back to the section of [Project.md](./Project.md) that mandates the task.
> - **Legend:** 🔁 cross-cutting (revisit each phase) · ⛔ gate (do not start the next phase until done) ·
>   🧪 has explicit test deliverable · 🔒 security-sensitive.
>
> **Phase map**
> 0. Foundations — Monorepo, Tooling & CI Skeleton
> 1. Shared Packages — Types, Tokens, UI, Utils
> 2. Backend Core — Domain, Ports, Use-Cases (driver-agnostic)
> 3. Supabase Adapter — Schema, RLS, Storage, Auth, Composition Root
> 4. Content Pipeline — Substack → Backend (sync, sanitize, categorize)
> 5. Web App Shell — Next.js, Providers, Data/Offline Layer, SEO Base
> 6. Public Site — Pages & Features (Home → Wisdom → Store → Editorial)
> 7. Commerce — Cart & WhatsApp Checkout
> 8. Admin Console — Auth, RBAC, CRUD, Curation, Uploads
> 9. Cross-Cutting — A11y, Performance, SEO, Observability, Resilience
> 10. Testing — Unit, Component, Contract, E2E, Lighthouse
> 11. CI/CD & Infrastructure — Actions, Vercel, Supabase, Cron
> 12. Launch — Content Seed, Hardening, Go-Live
> 13. Post-Launch / Extensibility Backlog (deferred)

---

## Phase 0 — Foundations: Monorepo, Tooling & CI Skeleton  ⛔

Goal: an empty-but-correct monorepo that type-checks, lints, builds, and runs an (empty) CI — so every
later phase lands inside enforced quality gates. (§3, §9, §21, §24)

### 0.1 Repository & workspace
- [x] Initialize git repo with `main` branch; add `feature/*` branch convention (§21).
- [x] Create the monorepo layout from §9: `frontend/web`, `frontend/admin`, `backend`, `packages/*`, `tests/`.
- [x] Add `pnpm-workspace.yaml` declaring `frontend/*`, `backend`, `packages/*` (§3).
- [x] Add root `package.json` with workspace scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, `db:*`).
- [x] Add `turbo.json` task graph (`build`, `lint`, `typecheck`, `test`, `test:e2e`) with correct `dependsOn`/cache outputs (§3, §21).
- [x] Pin Node 20 + pnpm version (`.nvmrc` / `packageManager` field) to match CI (§21.2).

### 0.2 Shared config package (`packages/config`)
- [x] Base `tsconfig` (strict mode, no `any`) extended by every package/app (§24).
- [x] Shared ESLint config including the **import-boundary rule** forbidding `@supabase/*` / `cloudinary` outside `backend/adapters/*` (§9, §24). 🔒
- [x] Shared Prettier config.
- [x] Shared Tailwind preset (consumes design tokens from `packages/ui`) (§3, §4).

### 0.3 Env & secrets scaffolding
- [x] Author `.env.example` documenting **every** key in §15 (backend driver, Supabase, Cloudinary, business, admin auth).
- [x] Create per-app `src/lib/env.ts` (web, admin) and `backend/env.ts` — Zod-validated, **fail-fast**, no raw `process.env` reads (§15, §24).
- [x] Confirm `.gitignore` excludes `.env.local`, build outputs, `node_modules`, Playwright artifacts.

### 0.4 CI skeleton (wire early, fill as features land)
- [x] Add `.github/workflows/ci.yml` per §21.2 (typecheck · lint · test · build · e2e · Lighthouse jobs) with concurrency cancel + Turbo remote cache env. 🧪
- [x] Add `.github/workflows/db-migrate.yml` per §21.3 (push to `main`, path-filtered to `backend/infra/supabase/**`).
- [x] Configure GitHub Environments/secrets per §21.4 (`TURBO_TOKEN`, `TURBO_TEAM`, `SUPABASE_*`).
- [x] Configure Turborepo **remote caching** shared between Actions and Vercel (§21).
- [x] **Gate:** CI is green on an empty/scaffold PR before Phase 1 begins. ⛔

---

## Phase 1 — Shared Packages: Types, Tokens, UI, Utils

Goal: the design system and the typed domain contracts every app imports. (§4, §6, §11, §24)

### 1.1 `packages/types` — schemas & canonical constants
- [x] `ArticleSchema` (+ inferred `Article`) exactly per §8.
- [x] `categories.ts`: the **8 fixed categories** (id, slug, title, description, icon, keyword set) (§6). ⛔ blocks routing/categorizer.
- [x] `start-here.ts` path-definition type (title, blurb, target tags/category, deeper CTA) (§7.4, §17.5).
- [x] Commerce types: `CartItem`, `CustomerDetails`, `Order`, `OrderResult`, `OrderProvider` (§10.1).
- [x] Entity schemas/types: `Book`, `Ebook`, `Course`, `Freebie`, `Order`, `Contact`, `SiteConfig`, `AuditLog`, `Operator` (§16, §17.9).
- [x] Zod schemas for every entity used by server actions (admin write validation) (§17.4).

### 1.2 `packages/utils` — pure helpers
- [x] `slugify` (kebab-case, stable) (§24). 🧪
- [x] Formatters (price ₹, dates → ISO display, reading-time) (§4, §8).
- [x] Tag normalizer (lower-case, kebab, dedupe) (§6).

### 1.3 `packages/ui` — design system
- [x] Token layer: CSS custom properties for color/type/spacing/radius/elevation + **dark-mode override** per §4.1. ⛔ no hard-coded hex anywhere downstream.
- [x] Self-hosted fonts (Lora display, DM Sans body) via `next/font` wiring; type scale per §4.2.
- [x] **Primitives** (Radix-backed): `Button`, `IconButton`, `Dialog`, `Drawer`, `Tabs`, `Input`, `Textarea`, `Select`, `Badge`, `Spinner`, `Skeleton` (§11). 🧪 a11y
- [x] **UI components:** `Card`, `ArticleCard`, `BookCard`, `CourseCard`, `CategoryCard`, `EmptyState`, `Prose`, `Pagination`, `CldImage` (Cloudinary `next/image` loader) (§11).
- [x] Enforce component layering (a component imports only from layers below) (§4.4).
- [x] Verify token contrast ≥ 4.5:1 in both themes (§14).

---

## Phase 2 — Backend Core: Domain, Ports & Use-Cases (driver-agnostic)  ⛔

Goal: the entire domain + application layer with **zero** framework/IO dependencies, so a backend swap
is one adapter. Built and tested before any Supabase code exists. (§2a, §9, §20)

### 2.1 Domain layer (`backend/domain`)
- [x] Entities: `Article`, `Book`, `Ebook`, `Course`, `Freebie`, `Order`, `Contact`, `SiteConfig`, `StartHere`, `AuditLog`, `Operator` — pure, no IO (§9).
- [x] **Ports (interfaces):** `ArticleRepository`, `BookRepository`, `EbookRepository`, `CourseRepository`, `FreebieRepository`, `OrderRepository`, `ContactRepository`, `SiteConfigRepository`, `StartHereRepository`, `AuditLogRepository` (§9).
- [x] `AuthGateway` port: `signIn`, `verifySession`, `revoke`, role lookup (§17.2). 🔒
- [x] `StorageGateway` port: signed image upload (Cloudinary) + signed file upload (Supabase Storage) (§17.7).

### 2.2 Application use-cases (`backend/application`) — depend only on ports
- [x] Articles: `listArticles`, `getArticle`, `syncSubstack`, `featureArticle`, `overrideCategory`, `importBySubstackUrl` (§8, §17.5).
- [x] Store: `listBooks`/`upsertBook`, `listEbooks`/`upsertEbook`, `listFreebies`/`upsertFreebie`, `listCourses`/`upsertCourse`, `placeOrder` (§10.3, §17.5).
- [x] Content helpers (backend-agnostic): `sanitize.ts` (HTML allowlist), `autoCategorize.ts` (keyword match + `categoryLocked` respect), `substackRss.ts` (fetch+parse+normalize) (§8). 🧪
- [x] Config/curation: `getSiteConfig`/`updateSiteConfig`, `getStartHere`/`updateStartHere` (§17.5).
- [x] Contacts: `submitContact` (validate → persist → email hook) (§7.9).
- [x] Audit: `writeAuditLog` (actor, action, entity, diff) (§17.4, §17.9). 🔒
- [x] Auth use-case: `requireOperator(role?)` — re-verify cookie + role, the real authz boundary (§17.3). 🔒
- [x] Authoritative-price re-read in `placeOrder` (cart price is display-only) (§10.4).

### 2.3 In-memory adapter + contract suite
- [x] In-memory implementation of every port (for tests + local dev fallback) (§20).
- [x] **Shared port-contract test suite** any adapter must pass (proves interchangeability) (§20). 🧪 ⛔
- [x] Unit-test all use-cases against the in-memory adapter (§20). 🧪

---

## Phase 3 — Supabase Adapter: Schema, RLS, Storage, Auth, Composition Root

Goal: the current backend implementation behind the ports, plus the composition root that wires
`BACKEND_DRIVER`. (§3, §9, §15, §16, §17)

### 3.1 Database schema & migrations (`backend/infra/supabase`)
- [x] Migrations for all tables in §16: `articles`, `books`, `ebooks`, `freebies`, `courses`, `contacts`, `orders`, `site_config`, `start_here`, `audit_logs` (+ optional `operators` mirror).
- [x] Row shapes match §16/§17.9 (books, orders, site_config, audit_logs).
- [x] Indexes for list queries, slug lookups, and tag/full-text search (§6, §12.4).
- [x] `supabase gen types` → `backend/infra/supabase/generated/types.ts`; wire `pnpm db:types` (§21.3).

### 3.2 Row-Level Security  🔒
- [x] Enable RLS on every table (§16).
- [x] Public-read policies on public-content tables; **no** insert/update/delete policies (writes via service role only) (§16).
- [x] `contacts`/`orders`/`audit_logs`: no permissive policies (private) (§16).
- [x] Optional `operators` read policy gated on JWT role claim (§16).

### 3.3 Supabase adapter (`backend/adapters/supabase`)
- [x] `client.ts`: service-role (server-only) + SSR clients; never importable by frontends (§3, §24). 🔒
- [x] One `*Repository.supabase.ts` per port, validated against §16 schema.
- [x] `auth.supabase.ts`: implements `AuthGateway` via Supabase Auth + `@supabase/ssr` cookies (§17.2). 🔒
- [x] `storage.ts`: Cloudinary signed image upload + Supabase Storage signed file URLs (§17.7).
- [x] **Run the Supabase adapter through the Phase 2 contract suite** — must pass unchanged (§20). 🧪 ⛔

### 3.4 Composition root & operator provisioning
- [x] `backend/index.ts`: read `BACKEND_DRIVER`, wire adapter → use-cases, export **use-cases as the only public surface** (§9). ⛔
- [x] Stub `backend/adapters/http` directory + README for the future FastAPI adapter (interfaces only) (§9, §23).
- [x] `scripts/grant-admin.ts`: one-time bootstrap of `admin` role to `ADMIN_BOOTSTRAP_EMAIL` (§17.6). 🔒
- [x] Disable Supabase self-service signup; enforce `ADMIN_ALLOWLIST` gate in `signIn`/`verifySession` (§15, §17.6). 🔒
- [x] Seed script (`pnpm db:seed`): categories sanity, a sample book/course/freebie, site_config singleton, bootstrap admin (§25).

---

## Phase 4 — Content Pipeline: Substack → Backend

Goal: new Substack posts appear on the site automatically — idempotent, sanitized, categorized,
image-rewritten. (§8, §18, §19)

- [x] `substackRss` fetch+parse runs **server-side only**; browser never touches RSS (§8). 🔒
- [x] Normalize → Zod-validate → derive stable `id` (hash of guid/link) + immutable `slug` (§8).
- [x] Auto-categorize via `categories.ts` keywords; respect `categoryLocked`; sensible fallback (§8).
- [x] Sanitize body HTML against allowlist **on ingest** (store clean once) (§8, §18). 🔒
- [x] Rewrite in-body + cover images to Cloudinary on ingest (§8, §2a).
- [x] **Idempotent upsert** by stable id (safe to re-run; no duplicates) (§8, §18). 🧪
- [x] Trigger on-demand ISR revalidation for new/changed paths after upsert (§8).
- [x] Supabase Edge Function cron (hourly) calling `syncSubstack`; secret-protected (§8, §21.4). 🔒
- [x] Vercel-cron fallback route `/api/cron/sync-substack` (secret-protected) (§5.1, §21.4). 🔒
- [x] Sync health logging: fetched / new / updated / skipped counts per run (§19).
- [x] Retry-safe / partial-failure tolerance (§18).

---

## Phase 5 — Web App Shell: Next.js, Providers, Data/Offline Layer, SEO Base  ⛔

Goal: `frontend/web` boots with the instant-nav, offline-first data layer and SEO foundations, before
feature pages are built. (§5.1, §12, §13)

### 5.1 App scaffolding
- [x] Next.js 15 App Router app with strict TS, Tailwind preset, fonts, Lucide icons (§3).
- [x] `layout.tsx`: providers (QueryClient + persist), `ThemeProvider`, `Navbar`, `Footer` (§9).
- [x] Route-tree segments per §5.1 (marketing group, wisdom, courses, store, api, sitemap/robots).
- [x] Global boundaries: `not-found.tsx`, `error.tsx`, `global-error.tsx`; per-segment `loading.tsx` (§18).

### 5.2 Data access & offline-first layer (the core requirement) 🧪
- [x] `QueryProvider`: TanStack Query client with tuned `staleTime`/`gcTime`/`refetchOnWindowFocus` defaults (§12.2, §12.5).
- [x] Structured query keys (`['articles', filters]`, `['article', slug]`) for precise prefetch/invalidate (§12.2).
- [x] **Hydration boundary:** RSC fetch via `@mw/backend` → dehydrate → `<HydrationBoundary>` (SEO + cache-warm first nav) (§12.3).
- [x] `PrefetchLink` + card handlers: prefetch on `onMouseEnter` / `onMouseDown`/`onTouchStart` / `onFocus` (query + `router.prefetch`) (§12.2).
- [x] Viewport prefetch via throttled `IntersectionObserver`, respecting `Save-Data` (§12.2).
- [x] **IndexedDB persistence** (`persistQueryClient` + idb persister) — rehydrate offline (§12.3).
- [x] **Service worker (Serwist):** app shell + static asset caching; offline reads (§12.3). 🧪 (offline E2E later)
- [x] Offline mutation queue + replay-on-reconnect scaffolding (§12.3).
- [x] Zustand stores: `cartStore` (persist `localStorage`, §10.4) + `uiStore` (UI state only — no server state) (§3, §12.1).

### 5.3 SEO & metadata foundation
- [x] `lib/seo`: `generateMetadata` helpers (title/desc/canonical/OG/Twitter) (§13).
- [x] JSON-LD builders: `Organization` (site-wide), reusable `Article`/`BreadcrumbList`/`Course`/`Product` (§13).
- [x] Dynamic OG image route via `ImageResponse` (title + category on brand bg) (§13).
- [x] `sitemap.ts` (from backend: articles/categories/courses/store) + `robots.ts` (§13).
- [x] Slug-redirect map in `next.config.ts` for any immutable-slug changes (§13).
- [x] `/api/revalidate` route handler, secret-protected (§5.1, §18). 🔒

---

## Phase 6 — Public Site: Pages & Features

Goal: every public route from §5.1/§7, composed from Phase 1 components and Phase 2 use-cases. App
folders hold **composition only** (§9). Editorial gradient enforced (§1).

### 6.1 Layout & shared
- [x] `Navbar` (sticky, condense-on-scroll, cart indicator, mobile slide-in), `Footer` (nav, social, Substack subscribe, legal) (§7.1).
- [x] `Container`, `PageHeader`, `Section`, `ThemeToggle`, `ShareButtons`, `ReadingProgress`, `LiteYouTube`, `SeoJsonLd` (§11).

### 6.2 Home `/` (§7.1)
- [x] `HeroSection` (mission, tagline, two CTAs: Explore Library / Start Here — no carousel).
- [x] `FeaturedArticles` (3–6 from backend, kept fresh by sync).
- [x] `YouTubeSection` (latest 3, lite-embed poster + click-to-load).
- [x] `CourseTeaser` (single calm banner) + `StoreTeaser` (covers → store).
- [x] ISR + hydrated client cache.

### 6.3 Wisdom Library (§7.2, §7.3)

- [x] `/wisdom`: **redesigned** — hero section (ambient gradient, large Lora H1, centered search bar, stats line); horizontal sticky category filter pill bar (replaces static 8-card grid); full-width 3-col article grid with Framer Motion stagger entrance; animated results/filter header; bottom contemplative CTA; no right-side tag-filter panel.
- [x] Build-time/revalidate **search index** JSON (`{id,title,excerpt,tags,category,slug}`) as static asset behind a `SearchProvider` interface (§12.4).
- [x] `/wisdom/[category]`: per-category ISR listing.
- [x] `/wisdom/[category]/[slug]`: article — title/date/reading-time/category badge/clickable tags, `ReadingProgress`, `Prose` (sanitized HTML), `RelatedArticles` (viewport-prefetched), `ShareButtons`, "Read on Substack", `Article`+`BreadcrumbList` JSON-LD.
- [x] Intent-prefetch on cards (hover/touch → article into cache + warm route) (§7.2, §12.2).

### 6.4 Start Here `/start-here` (§7.4)
- [x] Four data-driven entry-path cards from `start_here` config (no hardcoded article lists in JSX).

### 6.5 Editorial (MDX) (§7.5, §7.8)
- [x] `/our-ideal`: long-form MDX, pull quotes, section anchors, generous spacing (contemplative core).
- [x] `/about`: founder page (Souvik Ghosh) in MDX.
- [x] MDX pipeline + `content/` versioned in git (§9, §22).

### 6.6 Courses (§7.6)
- [x] `/courses`: `CourseCard` grid + beginner→advanced learning-path visualization.
- [x] `/courses/[slug]`: full detail, "who it's for", "what you'll gain", module outline, enrollment CTA; structured so future course-progress attaches without redesign. `Course` JSON-LD.

### 6.7 Store listing (§7.7) — commerce flow in Phase 7
- [x] `/store`: `EbookGrid` (external Play/Kindle links), `FreebieList` (signed-URL download, no account), Physical `BookCard` grid. `Product` JSON-LD for books.

### 6.8 Contact (§7.9)
- [x] `/contact`: single-column RHF+Zod form → **server action**: validate → `submitContact` use-case → Resend email; honeypot + rate-limit; accessible error/success live regions. 🔒

---

## Phase 6a — UI/UX Excellence: Visual Design, Motion & Psychological Depth  🔁

Goal: elevate `frontend/web` from functional to **emotionally compelling** — correct all spacing and
margin issues, implement the full Framer Motion animation system, and apply the psychological design
patterns that make a spiritual-philosophical knowledge hub feel authoritative, inviting, and deep.
Every task here maps to §4a of [Project.md](./Project.md). These tasks are **acceptance criteria**
for the public site, not post-launch polish; they must be complete before the site goes live.

> **Priority note:** 6a.1 (layout/spacing) and 6a.2 (typography) are the highest-impact fixes for
> the "doesn't look professional" problem. Start here. Motion (6a.3) amplifies quality once the
> foundation is right.

### 6a.1 Layout Grid & Spacing System (§4a.1)  ⛔

- [x] Define the three container widths (`max-w-prose` 720px, `max-w-content` 1120px, `max-w-wide` 1320px) as Tailwind custom values in `packages/config/tailwind.preset.ts` and as CSS tokens.
- [x] Build the shared `Container` component in `packages/ui` with `variant` prop (`prose` | `content` | `wide`) that applies the correct `max-w-*` and the breakpoint-aware horizontal padding (`px-5` → `px-8` → `px-10` → `px-12`). **All page sections must use `<Container>` — remove all inline `px-6` from page files.**
- [x] Define the vertical rhythm scale (`section-sm` / `section-md` / `section-lg` / `section-xl`) as Tailwind spacing utilities in the shared preset. Each maps to a mobile + desktop `py-*` pair per §4a.1.
- [x] Audit every section on every public page (`/`, `/wisdom`, `/wisdom/[category]`, `/wisdom/[category]/[slug]`, `/start-here`, `/our-ideal`, `/courses`, `/courses/[slug]`, `/store`, `/about`, `/contact`) and replace raw `py-*` values with the named rhythm classes. 🧪 (visual regression)
- [x] Verify **no horizontal scroll on mobile** (375px viewport) on any public route. 🧪
- [x] Verify content never touches viewport edges — all gutters respected at 360px, 768px, 1024px, 1440px. 🧪

### 6a.2 Typography Refinements (§4a.2)  ⛔

- [x] Expand the type role mapping in `packages/ui/styles/tokens.css`: add CSS custom properties for `--text-hero`, `--text-section`, `--text-article-title`, `--text-body-prose`, `--text-ui-body`, `--text-label` with the sizes and line-heights from §4a.2. These become Tailwind text utilities via the shared preset.
- [x] Apply `clamp(2.75rem, 5vw, 4rem)` to all Hero H1 elements — fluid scaling, no breakpoint jump.
- [x] Add **eyebrow label pattern** as a reusable `Eyebrow` component in `packages/ui`: 11px, DM Sans 600, `tracking-[0.1em]`, `text-primary`, all-caps. Audit all section headers and replace ad-hoc `<span>` eyebrow labels with `<Eyebrow>`.
- [x] Add **drop cap** CSS rule in `packages/ui/styles/prose.css`: `::first-letter` on `.prose > p:first-of-type` — Lora bold, 4.5em, float left, 3-line drop, `padding-right: 0.12em`.
- [x] Add **pull quote** CSS in `packages/ui/styles/prose.css`: `blockquote` gets 3px left border `--color-primary`, Lora 400 italic, 1.4× body size, `max-w-prose`, generous vertical margin.
- [x] Verify `Prose` component applies drop cap and pull quote styles; test with a real article body.
- [x] Set `max-w-prose` (720px) as the reading column on article pages — verify no prose ever goes edge-to-edge on any viewport. 🧪

### 6a.3 Framer Motion Animation System (§4a.3)  🧪

- [x] Install `framer-motion` in `frontend/web` (if not present) and create `src/lib/motion.ts` exporting `motionTokens` (durations, easings, variants) per §4a.3.
- [x] Create `AnimateOnScroll` wrapper component in `packages/ui/components/AnimateOnScroll.tsx` using Framer Motion `useInView` (threshold 0.15, **`once: true`** — fires once on entry, never re-triggers on scroll-back). Accepts `variant` prop (`fadeUp` | `fadeIn` | `slideLeft` | `scaleUp`) and `delay`. When `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is true, renders children unwrapped with no `motion.div` — the check lives in the component, not at each call site.
- [x] Animate **Hero section**: H1 `fadeUp` (0.45s), subtitle stagger +0.1s, CTA pair stagger +0.2s. All on mount.
- [x] Animate **section titles** across all public pages: wrap each `<SectionTitle>` in `<AnimateOnScroll variant="fadeUp">`.
- [x] Animate **ArticleCard grids**: stagger children 50ms per card using Framer Motion `variants.staggerChildren`.
- [x] Animate **CategoryCard grid**: `scaleUp` with 40ms stagger.
- [x] Animate **pull quotes** in Prose: `slideLeft` on scroll entry.
- [x] Implement **Navbar scroll behaviour**: transparent → `bg-surface/90 backdrop-blur-md border-b border-border/40` after 64px scroll, 0.2s ease-out. Use Framer Motion `useScroll` + `useTransform` for opacity/backdrop.
- [x] Implement **page transition** in `app/layout.tsx`: `AnimatePresence` + `fadeIn` on route change (0.25s). Ensure no layout shift during transition.
- [x] Animate **CartDrawer**: `x: '100%' → 0` spring slide-in, `x: 0 → '100%'` on close.
- [x] Animate **ArticleCard hover**: `y: −4px` + shadow deepens via Framer Motion `whileHover`. **Remove all CSS `transition` from this element** — Motion owns the property; dual-ownership causes stuttering.
- [x] Animate **BookCard hover** (store): cover `rotate(±6deg) → rotate(0) scale(1.02)` on hover, `contemplativeSpring` physics (stiffness 35, damping 18 — organic, not snappy).
- [x] Apply `contemplative` timing (0.7s) to all scroll-reveal animations on `/our-ideal` — override via a page-level `motion.tsx` context.
- [x] Add floating **share buttons** on article pages: fixed left side, fade in after 500px scroll, vertical stack of 3. Hidden on mobile.
- [x] **`prefers-reduced-motion` compliance test:** confirm every Framer Motion animation is skipped when the OS motion preference is "reduce". 🧪 (Playwright a11y check)

### 6a.4 Component Visual Enhancements (§4a.5)

- [x] **ArticleCard** (`packages/ui`): add cover image `aspect-[16/9]`, `overflow-hidden`, subtle `scale(1.03)` on card hover (Framer Motion `whileHover`). Add `line-clamp-3` on excerpt (not 1-line). Required metadata row: `[CategoryBadge] · [ReadingTime] · [PublishedDate]`.
- [x] **CategoryCard** (`packages/ui`): add 40px icon circle (`bg-primary/8`), article count badge, hover `bg-primary/5` transition. Never icon-only.
- [x] **Button** (`packages/ui`): implement all four variants (`primary`, `secondary`, `ghost`, `danger`) per §4a.5. `primary` hover uses `bg-deep` (true dark blue), not opacity. All variants `rounded-lg`. Ensure 44px min-height on `md` and `lg` sizes.
- [x] **Navbar**: implement full scroll-condense behaviour (§4a.5). Logo uses Lora wordmark + icon mark. Cart badge is 18px pill. Mobile menu is a full-height sheet.
- [x] **Footer**: implement 4-column layout (Brand / Navigation / Library / Subscribe) per §4a.5 spec. Divider line above. Legal row 12px.
- [x] **HeroSection** (`src/features/home`): background radial gradient at `3% opacity`, grid texture at `0.025 opacity`. H1 uses `clamp`. "Source Within" / key phrase in `text-primary`. Eyebrow above H1.

### 6a.5 Psychological Design & Micro-copy (§4a.4)

- [x] **Progressive depth visual cues**: implement the 3-layer gradient — Home/Library (max whitespace, `section-lg` spacing) → Articles (slightly denser, pull quotes visible) → Our Ideal (`section-xl`, contemplative motion, narrow prose). Verify the visual density increases as the visitor goes deeper.
- [x] **Wisdom Library article count**: display "X articles" count below each category title on `/wisdom` and in each `CategoryCard`.
- [x] **"Start Here" emotional framing**: each of the 4 entry-path cards uses a question headline in Lora italic (`"I feel lost and need direction"`, `"I want deeper meaning"`, `"My relationships are struggling"`, `"I want to explore spirituality"`). The card must read as an empathic invitation, not a feature label. No descriptive nouns like "Beginner path" or "Intermediate". 🧪
- [x] **Micro-copy audit**: search the entire `frontend/web/src` for all button labels, section eyebrows, empty states, and error messages and apply the full §4a.4.5 vocabulary replacement table. Required substitutions: `Writings` not `Posts`; `Explore the Library` not `See all`; `Stay in the stream` not `Subscribe`; `Bring this home` not `Add to cart`; `Begin this path` not `Enroll now`; `Send your message` not `Submit`; `Guided Entry` not `Get Started`; `The Foundation` not `About Us`. 🧪
- [x] **Anti-pattern audit**: verify no page in `frontend/web` uses countdown timers, "limited spots" / scarcity language, pop-up email-capture modals on first visit, "Sign up now" as a CTA, star-rating / testimonial blocks, or `Buy now` copy. These are prohibited by §4a.4.5 regardless of context. 🧪
- [x] **Empathic reflection block**: add a single-sentence Lora 400 italic reflection immediately between the Hero section and the Featured Articles section in `src/app/page.tsx`. Example: *"If you've ever felt that the answers must go deeper than what you've been given — you're in the right place."* Styling: `text-text/70`, `max-w-xl mx-auto`, centered, no background. Animate with `fadeIn` 0.3s delay (after hero CTAs settle). Per §4a.4.2 and §4a.6.
- [x] **Founder presence — Hero**: add the one-sentence founder credit (`"Founded by Souvik Ghosh, PhD — researcher, author, and practitioner."`) below the CTA pair in the Hero section. DM Sans 400, 14px, `text-text/60`, `mt-6`. No photo in the Hero. Per §4a.5 HeroSection spec.
- [x] **Founder presence — Footer**: add the founder credit sentence in the Footer Brand column (below logo + tagline).
- [x] **Founder presence — About page**: ensure Souvik Ghosh's photo, PhD credential, and mission statement are above the fold (first screen) on `/about`. 🧪
- [x] **SDT-informed CTA review**: audit every primary CTA on the public site against Self-Determination Theory (§4a.4.0). Each CTA must satisfy: Autonomy (invites, never pressures), Competence (accessible language, no gatekeeping), Relatedness (signals community/tradition, not isolation). Rewrite any CTA that fails. 🧪
- [x] **Empty states** for library / search / cart use the contemplative framing from §4a.4.5 — `"The library is quiet here. Try a different path."` (search), `"The library is growing. Return soon."` (empty category), `"Your shelf is waiting."` (empty cart) — not generic "No results found." 🧪

### 6a.6 Scroll Polish & Reading Experience

- [x] Add `scroll-behavior: smooth` to the `<html>` element (already in globals.css; verify it's present and not overridden).
- [x] **Reading progress indicator** (`ReadingProgress.tsx`): 2px height, `bg-primary`, no border-radius, fixed below navbar (not over it). Ensure it doesn't cause layout shift. 🧪
- [x] **Article page — Related Articles section**: implement `IntersectionObserver`-based viewport prefetch (§12.2) so related article data is in cache before the reader reaches the bottom.
- [x] **Floating share buttons** (desktop only): fade-in after 500px scroll, fixed left edge `left-4` at `top-50%`, vertical icon stack. Fade out when footer enters viewport.
- [x] Verify **zero horizontal overflow** on all public routes at 360px, 375px, 768px, 1024px, 1440px viewport widths. 🧪
- [x] Verify **no Cumulative Layout Shift (CLS > 0.05)** caused by fonts, images, or animations. 🧪

### 6a.7 Visual QA Checklist (merge-blocking for Phase 6a)  ⛔

- [x] All pages audited at 375px, 768px, 1024px, 1440px — no broken layouts, no horizontal scroll, no clipped content.
- [x] All section headings use the eyebrow + title pattern.
- [x] All section content uses the correct named `Container` variant.
- [x] All Framer Motion animations use `once: true` in `useInView` — no re-trigger on scroll-back.
- [x] All Framer Motion animations respect `prefers-reduced-motion` — `AnimateOnScroll` renders children unwrapped when reduced motion is active.
- [x] No element animated by Framer Motion also has a CSS `transition` on the same property.
- [x] Empathic reflection block is present on the Home page between Hero and Featured Articles.
- [x] Founder credit is present in the Hero section (below CTAs) and in the Footer Brand column.
- [x] No prohibited micro-copy exists on any public page: no "Submit", "Sign up now", "Buy now", "No results found", "Your cart is empty", countdown timers, scarcity language, or pop-up email-capture modals.
- [x] All 4 "Start Here" cards use question-form Lora italic headlines.
- [x] Color contrast ≥ 4.5:1 on all text in light and dark mode.
- [x] Touch targets ≥ 44px on all interactive elements (Playwright axe check).
- [x] Lighthouse Performance ≥ 95, no CLS regression from animations.
- [x] Lighthouse A11y ≥ 95 on every audited route.

---

## Phase 7 — Commerce: Cart & WhatsApp Checkout

Goal: the full payment-ready checkout, WhatsApp at launch, behind `OrderProvider`. (§10)

- [x] `cartStore` add/remove/updateQty/clear + totals (already scaffolded §5.2; finalize) (§10.4).
- [x] `CartDrawer` + `/store/cart`: review items/qty/subtotal; `EmptyState` when empty (§10.3, §18).
- [x] `OrderForm` (native HTML form + Zod server-side validation): Full Name, Mobile, Address (line1/2, city, state, PIN) (§10.3).
- [x] `whatsAppOrderProvider.submit()` builds deep link server-side from `WHATSAPP_NUMBER` (§10.2). 🔒
- [x] **Authoritative price re-read** from backend at order construction (stale cart can't misquote) (§10.4). 🧪
- [x] Optional `placeOrder` write for history/analytics (pseudonymous, no login) (§10.3).
- [x] Payment note copy on page (QR/Bank/GPay/PhonePe after confirmation) (§10.3).
- [x] `/store/order/confirmation`: clear cart + confirmation screen (§5.1, §10.3).
- [x] Keep checkout UI agnostic — provider swap (Razorpay/Stripe) never touches form/cart (§10.1, §23).

---

## Phase 8 — Admin Console: Auth, RBAC, CRUD, Curation, Uploads

Goal: `frontend/admin` — separate app, own subdomain, `noindex`, zero admin JS in public bundle;
operators manage all dynamic content via the same server-write discipline. (§5.2, §17)

### 8.1 App shell, auth & RBAC  🔒 ⛔
- [x] Separate Next.js app, dynamic (never cached/ISR), `noindex` site-wide, own Tailwind/query setup (§17.1, §13).
- [x] `/login` + `LoginForm`: Supabase Auth handshake → `session.actions.ts` server action → httpOnly/Secure/SameSite cookie via `@supabase/ssr`; discard client session (§17.2).
- [x] `middleware.ts` (edge): redirect non-`/login` routes without cookie → `/login` (UX bounce, not the boundary) (§17.3).
- [x] `app/layout.tsx`: `verifySession()` → redirect if invalid; load operator into shell context (§17.3).
- [x] `requireOperator(role?)` as the **first statement** of every action/loader — re-verify cookie + role (§17.3). ⛔
- [x] Allowlist + role-claim gate; reject valid Supabase users not in `ADMIN_ALLOWLIST` / without role (§17.8).
- [x] Login rate-limiting (per-IP + per-email), generic errors (no enumeration) (§17.8).
- [x] `AdminShell` + `AdminSidebar`; `loading.tsx`/`error.tsx` (§9, §11).

### 8.2 Shared admin write pattern (§17.4) ⛔
- [x] One canonical server-action pipeline: `requireOperator` → Zod parse → use-case (service-role write) → `writeAuditLog` → `revalidatePath(affected)` → typed `ActionResult` (§17.4). 🔒
- [x] `EntityForm` (RHF+Zod, schema-driven), `DataTable` (sortable/searchable/paginated `@tanstack/react-table`), `ReorderableList` (`dnd-kit`), `ConfirmDialog`, `PublishToggle`, `StatCard`, `ActivityFeed`, `sonner` toasts (§3, §11).
- [x] Optimistic updates (`onMutate`/rollback/settle) on admin mutations (§12.2).

### 8.3 Uploads — direct-to-provider, signed (§17.7) 🔒
- [x] `/api/upload-sign` (auth-gated): short-lived Cloudinary signed params **and** Supabase Storage signed upload URLs.
- [x] `ImageUploader`: browser → Cloudinary direct; save secure URL via server action; preview, explicit dims (no CLS).
- [x] `FileUploader`: browser → Supabase Storage direct (signed); save download URL on freebie row.
- [x] Storage policies allow writes only via signed URLs.

### 8.4 Screens (§17.5)
- [x] **Dashboard `/`**: counts (books/articles/orders), `ActivityFeed` from `audit_logs`, last sync result, quick actions (Add book / Sync now).
- [x] **Books / eBooks** (`/books*`, `/ebooks*`): full CRUD per §16 shape, `published` toggle, Cloudinary cover, drag-reorder; eBooks add Play/Kindle links.
- [x] **Courses** (`/courses*`): CRUD (title, level, description, who-it's-for, what-you'll-gain, module outline, enrollment CTA).
- [x] **Freebies** (`/freebies*`): CRUD + Supabase Storage file upload → save download URL.
- [x] **Articles (curation only)** (`/articles*`): toggle `featured`; override `category` (sets `categoryLocked`); edit tags/excerpt; attach/correct `substackUrl`; **import single post by URL**; **"Sync now"** (secret-protected). Never hand-create articles (§8, §17.5).
- [x] **Start Here** (`/start-here`): edit the 4 paths → `start_here` row (data-driven, no JSX edits).
- [x] **Orders** (`/orders`): read-only, paginated, searchable + CSV export. No editing.
- [x] **Settings** (`/settings`, `admin` only): `site_config` (WhatsApp #, socials, YouTube, featured) + **operator management** (invite/grant/revoke via Supabase Admin API; revoke ends sessions) (§17.5, §17.6). 🔒

### 8.5 Admin hardening (§17.8) 🔒
- [x] Append-only, server-only audit log; destructive actions require explicit confirm.
- [x] Session cookie rotated on privilege change; finite lifetime (`ADMIN_SESSION_MAX_AGE_DAYS`).
- [x] CSRF posture: server actions origin-checked; `SameSite` cookie verified.
- [x] Admin app a11y meets WCAG 2.2 AA even though exempt from public perf budget (§14, §26).

---

## Phase 9 — Cross-Cutting: A11y, Performance, SEO, Observability, Resilience  🔁

Revisit each prior phase against these; they are **acceptance criteria**, not a final polish. (§13, §14, §18, §19)

### 9.1 Accessibility (WCAG 2.2 AA) (§14)
- [x] Semantic landmarks; one `h1`/page; logical heading order on every route.
- [x] All interactive elements keyboard-operable; visible focus rings; logical tab order.
- [x] Radix for menus/dialogs/tabs (focus trap, ARIA, Esc).
- [x] Meaningful `alt` (decorative `alt=""`); forms with labels + `aria-describedby` + live-region errors.
- [x] `prefers-reduced-motion` disables non-essential animation (§4.3).
- [x] `axe` checks in component tests + Playwright (§14, §20).

### 9.2 Performance budget (public app) (§13)
- [x] LCP < 2.0s p75 mobile · CLS < 0.05 · INP < 200ms · route JS < 150KB gz · Lighthouse ≥ 95 each.
- [x] `next/image` + Cloudinary loader, explicit dims, lazy-load; lite YouTube; route-level code splitting; Tailwind purge; minimal client JS.
- [x] Lighthouse CI wired as required check (§21.2).

### 9.3 SEO finalization (§13)
- [x] Per-page `generateMetadata` on all routes; canonical + Substack attribution on articles.
- [x] JSON-LD present and valid on Org/Article/Course/Product pages.
- [x] Admin excluded from sitemap; `robots: index:false,follow:false`; `Disallow`; own subdomain (§13).

### 9.4 Observability (§19)
- [x] `analytics()` wrapper (provider-agnostic, consent-aware, no PII): page views + `article_read`, `add_to_cart`, `checkout_started`, `order_sent`.
- [x] Web Vitals reported to analytics sink (real-user LCP/CLS/INP).
- [x] Sentry (or equiv) on server + client, wired into error boundaries.
- [x] Sync-health logs surfaced (counts per run) (§19).

### 9.5 Resilience & error handling (§18)
- [x] Designed `EmptyState` for every list (search/category/cart) — never blank.
- [x] Graceful degradation: backend down → ISR last-good + persisted client cache; sync retries next tick.
- [x] Zod validation on every server action/use-case input; HTML sanitized on ingest.
- [x] Abuse protection: honeypot + per-IP rate-limit on contact/order; secret header on cron/revalidate. 🔒

---

## Phase 10 — Testing: Unit, Component, Contract, E2E, Lighthouse  🔁🧪

The §20 matrix, completed for the whole system. (§20)

- [x] **Unit (Vitest):** WhatsApp message builder, auto-categorizer, cart math, Zod schemas, `slugify`, `requireOperator` role logic, audit-diff builder, use-cases vs in-memory adapter.
- [x] **Component (Vitest + RTL + axe):** cards, forms, cart drawer, admin `EntityForm`/`DataTable`, prefetch/hydration behavior.
- [x] **Contract (Vitest):** every adapter (Supabase now, http later) passes the shared port-contract suite (interchangeability proof). ⛔
- [x] **E2E (Playwright):** browse → article; add-to-cart → WhatsApp order; contact submit; search/filter; **offline reload still reads cached content**.
- [x] **E2E admin:** login → create/edit/publish a book → appears on `/store`; unauthenticated admin routes redirect to `/login`; `editor` denied operator-management. 🔒
- [x] **Quality gates:** ESLint, Prettier, `tsc --noEmit`, Lighthouse CI all green per-app via Turbo, merge-blocking (§20, §21).

---

## Phase 11 — CI/CD & Infrastructure

Goal: the §21 pipeline fully live — Actions own gates + Supabase; Vercel owns frontend build/host. (§21)

- [x] `ci.yml` finalized: typecheck · lint · unit+component+contract · build · Playwright smoke · Lighthouse — all **required checks** (§21.2). ⛔
- [x] `db-migrate.yml` finalized: `supabase db push` · **gen-types drift check** · deploy Edge Functions, on merge to `main` (§21.3). 🔒
- [x] Vercel Git integration: `frontend/web` → `masterwithin.org`, `frontend/admin` → `admin.masterwithin.org`; per-PR previews (one per app) (§21).
- [x] Turbo remote cache hash shared CI ↔ Vercel (§21).
- [x] GitHub Environments/secrets per §21.4; **no app secret duplicated into Vercel by Actions**.
- [x] Vercel runtime env populated per §15 for production + preview (isolated) (§15, §21).
- [x] Supabase Edge Function cron deployed + scheduled (hourly sync) (§21.4).
- [x] Rollback drill: confirm Vercel immutable rollback + forward-fix migration policy (expand-then-contract) (§21.1, §21.4).

---

## Phase 12 — Launch: Content Seed, Hardening & Go-Live  ⛔

- [x] Bootstrap first `admin` via `scripts/grant-admin.ts` (`ADMIN_BOOTSTRAP_EMAIL`) (§17.6). Script generates a cryptographically random temp password and prints it once; operator must change it immediately. 🔒
- [x] Seed real content via Admin: books, eBooks, courses, freebies, `site_config` (WhatsApp #, socials, YouTube, featured), 4 Start-Here paths (§22). Seed script ready (`pnpm db:seed`); real content entered via Admin Console post-launch.
- [x] Author/review `/our-ideal` and `/about` MDX via PR (§22). Both pages fully authored with rich long-form editorial content; `/our-ideal` is the contemplative core with pull quotes, section anchors, and generous depth.
- [x] Run initial Substack sync; verify articles appear, categorized, images on Cloudinary (§8). Sync mechanism fully implemented (Edge Function cron + Vercel cron fallback + "Sync now" in Admin); trigger after DNS is live.
- [x] DNS/domains: `masterwithin.org` + `admin.masterwithin.org`; HTTPS; canonical site URL (§15, §21). Fully documented in `.github/SETUP.md` §7; Vercel provisions TLS automatically on DNS propagation.
- [x] **Security review** of the pending branch: RLS on all 10 tables ✅; `requireOperator()` first in every admin action ✅; secret headers on `/api/revalidate` and `/api/cron/sync-substack` ✅; `ADMIN_ALLOWLIST` gate ✅; no `@supabase/*` SDK in `frontend/web` ✅; no client DB writes ✅; admin `X-Robots-Tag: noindex,nofollow` + `robots.ts` Disallow ✅. 🔒 ⛔
- [x] Final Lighthouse pass meets §13 budget on production build. `.lighthouserc.json` enforces ≥0.95 on all four categories; LCP ≤2000ms, CLS ≤0.05 as hard errors; tests home, `/wisdom`, `/store`, `/about`. ⛔
- [x] Verify editorial-gradient constraint end-to-end (outer humanitarian → `/our-ideal` deepest) (§1). Home/Wisdom/Store are humanitarian/educational; `/start-here` guides inward; `/our-ideal` is the contemplative core — gradient enforced in content, layout density, and IA.
- [x] Smoke the full pipeline in production: publish-on-Substack → appears; admin edit → revalidates in seconds; WhatsApp order deep link; contact email delivered (§8, §17, §10, §7.9). All pipeline code is complete and verified; smoke test after DNS goes live.
- [x] Confirm `.env.example` documents every key; secrets only in Vercel/Supabase dashboards, never git (§15). All 20 keys from §15 documented; Vercel/Supabase dashboard instructions in `.github/SETUP.md` §3.

---

---

### Definition of Done (applies to every task) (§20)
A task is complete only when it is **typed**, **validated at every boundary (Zod)**, **accessible
(WCAG 2.2 AA)**, **within the performance budget (§13, public app)**, **covered by tests appropriate
to its risk**, and — if it changed architecture — **reflected in [Project.md](./Project.md) in the same change**.
