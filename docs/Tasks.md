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
- [ ] Entities: `Article`, `Book`, `Ebook`, `Course`, `Freebie`, `Order`, `Contact`, `SiteConfig`, `StartHere`, `AuditLog`, `Operator` — pure, no IO (§9).
- [ ] **Ports (interfaces):** `ArticleRepository`, `BookRepository`, `EbookRepository`, `CourseRepository`, `FreebieRepository`, `OrderRepository`, `ContactRepository`, `SiteConfigRepository`, `StartHereRepository`, `AuditLogRepository` (§9).
- [ ] `AuthGateway` port: `signIn`, `verifySession`, `revoke`, role lookup (§17.2). 🔒
- [ ] `StorageGateway` port: signed image upload (Cloudinary) + signed file upload (Supabase Storage) (§17.7).

### 2.2 Application use-cases (`backend/application`) — depend only on ports
- [ ] Articles: `listArticles`, `getArticle`, `syncSubstack`, `featureArticle`, `overrideCategory`, `importBySubstackUrl` (§8, §17.5).
- [ ] Store: `listBooks`/`upsertBook`, `listEbooks`/`upsertEbook`, `listFreebies`/`upsertFreebie`, `listCourses`/`upsertCourse`, `placeOrder` (§10.3, §17.5).
- [ ] Content helpers (backend-agnostic): `sanitize.ts` (HTML allowlist), `autoCategorize.ts` (keyword match + `categoryLocked` respect), `substackRss.ts` (fetch+parse+normalize) (§8). 🧪
- [ ] Config/curation: `getSiteConfig`/`updateSiteConfig`, `getStartHere`/`updateStartHere` (§17.5).
- [ ] Contacts: `submitContact` (validate → persist → email hook) (§7.9).
- [ ] Audit: `writeAuditLog` (actor, action, entity, diff) (§17.4, §17.9). 🔒
- [ ] Auth use-case: `requireOperator(role?)` — re-verify cookie + role, the real authz boundary (§17.3). 🔒
- [ ] Authoritative-price re-read in `placeOrder` (cart price is display-only) (§10.4).

### 2.3 In-memory adapter + contract suite
- [ ] In-memory implementation of every port (for tests + local dev fallback) (§20).
- [ ] **Shared port-contract test suite** any adapter must pass (proves interchangeability) (§20). 🧪 ⛔
- [ ] Unit-test all use-cases against the in-memory adapter (§20). 🧪

---

## Phase 3 — Supabase Adapter: Schema, RLS, Storage, Auth, Composition Root

Goal: the current backend implementation behind the ports, plus the composition root that wires
`BACKEND_DRIVER`. (§3, §9, §15, §16, §17)

### 3.1 Database schema & migrations (`backend/infra/supabase`)
- [ ] Migrations for all tables in §16: `articles`, `books`, `ebooks`, `freebies`, `courses`, `contacts`, `orders`, `site_config`, `start_here`, `audit_logs` (+ optional `operators` mirror).
- [ ] Row shapes match §16/§17.9 (books, orders, site_config, audit_logs).
- [ ] Indexes for list queries, slug lookups, and tag/full-text search (§6, §12.4).
- [ ] `supabase gen types` → `backend/infra/supabase/generated/types.ts`; wire `pnpm db:types` (§21.3).

### 3.2 Row-Level Security  🔒
- [ ] Enable RLS on every table (§16).
- [ ] Public-read policies on public-content tables; **no** insert/update/delete policies (writes via service role only) (§16).
- [ ] `contacts`/`orders`/`audit_logs`: no permissive policies (private) (§16).
- [ ] Optional `operators` read policy gated on JWT role claim (§16).

### 3.3 Supabase adapter (`backend/adapters/supabase`)
- [ ] `client.ts`: service-role (server-only) + SSR clients; never importable by frontends (§3, §24). 🔒
- [ ] One `*Repository.supabase.ts` per port, validated against §16 schema.
- [ ] `auth.supabase.ts`: implements `AuthGateway` via Supabase Auth + `@supabase/ssr` cookies (§17.2). 🔒
- [ ] `storage.ts`: Cloudinary signed image upload + Supabase Storage signed file URLs (§17.7).
- [ ] **Run the Supabase adapter through the Phase 2 contract suite** — must pass unchanged (§20). 🧪 ⛔

### 3.4 Composition root & operator provisioning
- [ ] `backend/index.ts`: read `BACKEND_DRIVER`, wire adapter → use-cases, export **use-cases as the only public surface** (§9). ⛔
- [ ] Stub `backend/adapters/http` directory + README for the future FastAPI adapter (interfaces only) (§9, §23).
- [ ] `scripts/grant-admin.ts`: one-time bootstrap of `admin` role to `ADMIN_BOOTSTRAP_EMAIL` (§17.6). 🔒
- [ ] Disable Supabase self-service signup; enforce `ADMIN_ALLOWLIST` gate in `signIn`/`verifySession` (§15, §17.6). 🔒
- [ ] Seed script (`pnpm db:seed`): categories sanity, a sample book/course/freebie, site_config singleton, bootstrap admin (§25).

---

## Phase 4 — Content Pipeline: Substack → Backend

Goal: new Substack posts appear on the site automatically — idempotent, sanitized, categorized,
image-rewritten. (§8, §18, §19)

- [ ] `substackRss` fetch+parse runs **server-side only**; browser never touches RSS (§8). 🔒
- [ ] Normalize → Zod-validate → derive stable `id` (hash of guid/link) + immutable `slug` (§8).
- [ ] Auto-categorize via `categories.ts` keywords; respect `categoryLocked`; sensible fallback (§8).
- [ ] Sanitize body HTML against allowlist **on ingest** (store clean once) (§8, §18). 🔒
- [ ] Rewrite in-body + cover images to Cloudinary on ingest (§8, §2a).
- [ ] **Idempotent upsert** by stable id (safe to re-run; no duplicates) (§8, §18). 🧪
- [ ] Trigger on-demand ISR revalidation for new/changed paths after upsert (§8).
- [ ] Supabase Edge Function cron (hourly) calling `syncSubstack`; secret-protected (§8, §21.4). 🔒
- [ ] Vercel-cron fallback route `/api/cron/sync-substack` (secret-protected) (§5.1, §21.4). 🔒
- [ ] Sync health logging: fetched / new / updated / skipped counts per run (§19).
- [ ] Retry-safe / partial-failure tolerance (§18).

---

## Phase 5 — Web App Shell: Next.js, Providers, Data/Offline Layer, SEO Base  ⛔

Goal: `frontend/web` boots with the instant-nav, offline-first data layer and SEO foundations, before
feature pages are built. (§5.1, §12, §13)

### 5.1 App scaffolding
- [ ] Next.js 15 App Router app with strict TS, Tailwind preset, fonts, Lucide icons (§3).
- [ ] `layout.tsx`: providers (QueryClient + persist), `ThemeProvider`, `Navbar`, `Footer` (§9).
- [ ] Route-tree segments per §5.1 (marketing group, wisdom, courses, store, api, sitemap/robots).
- [ ] Global boundaries: `not-found.tsx`, `error.tsx`, `global-error.tsx`; per-segment `loading.tsx` (§18).

### 5.2 Data access & offline-first layer (the core requirement) 🧪
- [ ] `QueryProvider`: TanStack Query client with tuned `staleTime`/`gcTime`/`refetchOnWindowFocus` defaults (§12.2, §12.5).
- [ ] Structured query keys (`['articles', filters]`, `['article', slug]`) for precise prefetch/invalidate (§12.2).
- [ ] **Hydration boundary:** RSC fetch via `@mw/backend` → dehydrate → `<HydrationBoundary>` (SEO + cache-warm first nav) (§12.3).
- [ ] `PrefetchLink` + card handlers: prefetch on `onMouseEnter` / `onMouseDown`/`onTouchStart` / `onFocus` (query + `router.prefetch`) (§12.2).
- [ ] Viewport prefetch via throttled `IntersectionObserver`, respecting `Save-Data` (§12.2).
- [ ] **IndexedDB persistence** (`persistQueryClient` + idb persister) — rehydrate offline (§12.3).
- [ ] **Service worker (Serwist):** app shell + static asset caching; offline reads (§12.3). 🧪 (offline E2E later)
- [ ] Offline mutation queue + replay-on-reconnect scaffolding (§12.3).
- [ ] Zustand stores: `cartStore` (persist `localStorage`, §10.4) + `uiStore` (UI state only — no server state) (§3, §12.1).

### 5.3 SEO & metadata foundation
- [ ] `lib/seo`: `generateMetadata` helpers (title/desc/canonical/OG/Twitter) (§13).
- [ ] JSON-LD builders: `Organization` (site-wide), reusable `Article`/`BreadcrumbList`/`Course`/`Product` (§13).
- [ ] Dynamic OG image route via `ImageResponse` (title + category on brand bg) (§13).
- [ ] `sitemap.ts` (from backend: articles/categories/courses/store) + `robots.ts` (§13).
- [ ] Slug-redirect map in `next.config.ts` for any immutable-slug changes (§13).
- [ ] `/api/revalidate` route handler, secret-protected (§5.1, §18). 🔒

---

## Phase 6 — Public Site: Pages & Features

Goal: every public route from §5.1/§7, composed from Phase 1 components and Phase 2 use-cases. App
folders hold **composition only** (§9). Editorial gradient enforced (§1).

### 6.1 Layout & shared
- [ ] `Navbar` (sticky, condense-on-scroll, cart indicator, mobile slide-in), `Footer` (nav, social, Substack subscribe, legal) (§7.1).
- [ ] `Container`, `PageHeader`, `Section`, `ThemeToggle`, `ShareButtons`, `ReadingProgress`, `LiteYouTube`, `SeoJsonLd` (§11).

### 6.2 Home `/` (§7.1)
- [ ] `HeroSection` (mission, tagline, two CTAs: Explore Library / Start Here — no carousel).
- [ ] `FeaturedArticles` (3–6 from backend, kept fresh by sync).
- [ ] `YouTubeSection` (latest 3, lite-embed poster + click-to-load).
- [ ] `CourseTeaser` (single calm banner) + `StoreTeaser` (covers → store).
- [ ] ISR + hydrated client cache.

### 6.3 Wisdom Library (§7.2, §7.3)
- [ ] `/wisdom`: `CategoryGrid` (8 cards w/ counts), `SearchBar` + `TagFilter` (client Fuse.js over prebuilt index), `ArticleList`, indexable pagination (`?page=`) + optional "load more".
- [ ] Build-time/revalidate **search index** JSON (`{id,title,excerpt,tags,category,slug}`) as static asset behind a `SearchProvider` interface (§12.4).
- [ ] `/wisdom/[category]`: per-category ISR listing.
- [ ] `/wisdom/[category]/[slug]`: article — title/date/reading-time/category badge/clickable tags, `ReadingProgress`, `Prose` (sanitized HTML), `RelatedArticles` (viewport-prefetched), `ShareButtons`, "Read on Substack", `Article`+`BreadcrumbList` JSON-LD.
- [ ] Intent-prefetch on cards (hover/touch → article into cache + warm route) (§7.2, §12.2).

### 6.4 Start Here `/start-here` (§7.4)
- [ ] Four data-driven entry-path cards from `start_here` config (no hardcoded article lists in JSX).

### 6.5 Editorial (MDX) (§7.5, §7.8)
- [ ] `/our-ideal`: long-form MDX, pull quotes, section anchors, generous spacing (contemplative core).
- [ ] `/about`: founder page (Souvik Ghosh) in MDX.
- [ ] MDX pipeline + `content/` versioned in git (§9, §22).

### 6.6 Courses (§7.6)
- [ ] `/courses`: `CourseCard` grid + beginner→advanced learning-path visualization.
- [ ] `/courses/[slug]`: full detail, "who it's for", "what you'll gain", module outline, enrollment CTA; structured so future course-progress attaches without redesign. `Course` JSON-LD.

### 6.7 Store listing (§7.7) — commerce flow in Phase 7
- [ ] `/store`: `EbookGrid` (external Play/Kindle links), `FreebieList` (signed-URL download, no account), Physical `BookCard` grid. `Product` JSON-LD for books.

### 6.8 Contact (§7.9)
- [ ] `/contact`: single-column RHF+Zod form → **server action**: validate → `submitContact` use-case → Resend email; honeypot + rate-limit; accessible error/success live regions. 🔒

---

## Phase 7 — Commerce: Cart & WhatsApp Checkout

Goal: the full payment-ready checkout, WhatsApp at launch, behind `OrderProvider`. (§10)

- [ ] `cartStore` add/remove/updateQty/clear + totals (already scaffolded §5.2; finalize) (§10.4).
- [ ] `CartDrawer` + `/store/cart`: review items/qty/subtotal; `EmptyState` when empty (§10.3, §18).
- [ ] `OrderForm` (RHF+Zod): Full Name, Mobile, Address (line1/2, city, state, PIN) (§10.3).
- [ ] `whatsAppOrderProvider.submit()` builds deep link server-side from `WHATSAPP_NUMBER` (§10.2). 🔒
- [ ] **Authoritative price re-read** from backend at order construction (stale cart can't misquote) (§10.4). 🧪
- [ ] Optional `placeOrder` write for history/analytics (pseudonymous, no login) (§10.3).
- [ ] Payment note copy on page (QR/Bank/GPay/PhonePe after confirmation) (§10.3).
- [ ] `/store/order/confirmation`: clear cart + confirmation screen (§5.1, §10.3).
- [ ] Keep checkout UI agnostic — provider swap (Razorpay/Stripe) never touches form/cart (§10.1, §23).

---

## Phase 8 — Admin Console: Auth, RBAC, CRUD, Curation, Uploads

Goal: `frontend/admin` — separate app, own subdomain, `noindex`, zero admin JS in public bundle;
operators manage all dynamic content via the same server-write discipline. (§5.2, §17)

### 8.1 App shell, auth & RBAC  🔒 ⛔
- [ ] Separate Next.js app, dynamic (never cached/ISR), `noindex` site-wide, own Tailwind/query setup (§17.1, §13).
- [ ] `/login` + `LoginForm`: Supabase Auth handshake → `session.actions.ts` server action → httpOnly/Secure/SameSite cookie via `@supabase/ssr`; discard client session (§17.2).
- [ ] `middleware.ts` (edge): redirect non-`/login` routes without cookie → `/login` (UX bounce, not the boundary) (§17.3).
- [ ] `app/layout.tsx`: `verifySession()` → redirect if invalid; load operator into shell context (§17.3).
- [ ] `requireOperator(role?)` as the **first statement** of every action/loader — re-verify cookie + role (§17.3). ⛔
- [ ] Allowlist + role-claim gate; reject valid Supabase users not in `ADMIN_ALLOWLIST` / without role (§17.8).
- [ ] Login rate-limiting (per-IP + per-email), generic errors (no enumeration) (§17.8).
- [ ] `AdminShell` + `AdminSidebar`; `loading.tsx`/`error.tsx` (§9, §11).

### 8.2 Shared admin write pattern (§17.4) ⛔
- [ ] One canonical server-action pipeline: `requireOperator` → Zod parse → use-case (service-role write) → `writeAuditLog` → `revalidatePath(affected)` → typed `ActionResult` (§17.4). 🔒
- [ ] `EntityForm` (RHF+Zod, schema-driven), `DataTable` (sortable/searchable/paginated `@tanstack/react-table`), `ReorderableList` (`dnd-kit`), `ConfirmDialog`, `PublishToggle`, `StatCard`, `ActivityFeed`, `sonner` toasts (§3, §11).
- [ ] Optimistic updates (`onMutate`/rollback/settle) on admin mutations (§12.2).

### 8.3 Uploads — direct-to-provider, signed (§17.7) 🔒
- [ ] `/api/upload-sign` (auth-gated): short-lived Cloudinary signed params **and** Supabase Storage signed upload URLs.
- [ ] `ImageUploader`: browser → Cloudinary direct; save secure URL via server action; preview, explicit dims (no CLS).
- [ ] `FileUploader`: browser → Supabase Storage direct (signed); save download URL on freebie row.
- [ ] Storage policies allow writes only via signed URLs.

### 8.4 Screens (§17.5)
- [ ] **Dashboard `/`**: counts (books/articles/orders), `ActivityFeed` from `audit_logs`, last sync result, quick actions (Add book / Sync now).
- [ ] **Books / eBooks** (`/books*`, `/ebooks*`): full CRUD per §16 shape, `published` toggle, Cloudinary cover, drag-reorder; eBooks add Play/Kindle links.
- [ ] **Courses** (`/courses*`): CRUD (title, level, description, who-it's-for, what-you'll-gain, module outline, enrollment CTA).
- [ ] **Freebies** (`/freebies*`): CRUD + Supabase Storage file upload → save download URL.
- [ ] **Articles (curation only)** (`/articles*`): toggle `featured`; override `category` (sets `categoryLocked`); edit tags/excerpt; attach/correct `substackUrl`; **import single post by URL**; **"Sync now"** (secret-protected). Never hand-create articles (§8, §17.5).
- [ ] **Start Here** (`/start-here`): edit the 4 paths → `start_here` row (data-driven, no JSX edits).
- [ ] **Orders** (`/orders`): read-only, paginated, searchable + CSV export. No editing.
- [ ] **Settings** (`/settings`, `admin` only): `site_config` (WhatsApp #, socials, YouTube, featured) + **operator management** (invite/grant/revoke via Supabase Admin API; revoke ends sessions) (§17.5, §17.6). 🔒

### 8.5 Admin hardening (§17.8) 🔒
- [ ] Append-only, server-only audit log; destructive actions require explicit confirm.
- [ ] Session cookie rotated on privilege change; finite lifetime (`ADMIN_SESSION_MAX_AGE_DAYS`).
- [ ] CSRF posture: server actions origin-checked; `SameSite` cookie verified.
- [ ] Admin app a11y meets WCAG 2.2 AA even though exempt from public perf budget (§14, §26).

---

## Phase 9 — Cross-Cutting: A11y, Performance, SEO, Observability, Resilience  🔁

Revisit each prior phase against these; they are **acceptance criteria**, not a final polish. (§13, §14, §18, §19)

### 9.1 Accessibility (WCAG 2.2 AA) (§14)
- [ ] Semantic landmarks; one `h1`/page; logical heading order on every route.
- [ ] All interactive elements keyboard-operable; visible focus rings; logical tab order.
- [ ] Radix for menus/dialogs/tabs (focus trap, ARIA, Esc).
- [ ] Meaningful `alt` (decorative `alt=""`); forms with labels + `aria-describedby` + live-region errors.
- [ ] `prefers-reduced-motion` disables non-essential animation (§4.3).
- [ ] `axe` checks in component tests + Playwright (§14, §20).

### 9.2 Performance budget (public app) (§13)
- [ ] LCP < 2.0s p75 mobile · CLS < 0.05 · INP < 200ms · route JS < 150KB gz · Lighthouse ≥ 95 each.
- [ ] `next/image` + Cloudinary loader, explicit dims, lazy-load; lite YouTube; route-level code splitting; Tailwind purge; minimal client JS.
- [ ] Lighthouse CI wired as required check (§21.2).

### 9.3 SEO finalization (§13)
- [ ] Per-page `generateMetadata` on all routes; canonical + Substack attribution on articles.
- [ ] JSON-LD present and valid on Org/Article/Course/Product pages.
- [ ] Admin excluded from sitemap; `robots: index:false,follow:false`; `Disallow`; own subdomain (§13).

### 9.4 Observability (§19)
- [ ] `analytics()` wrapper (provider-agnostic, consent-aware, no PII): page views + `article_read`, `add_to_cart`, `checkout_started`, `order_sent`.
- [ ] Web Vitals reported to analytics sink (real-user LCP/CLS/INP).
- [ ] Sentry (or equiv) on server + client, wired into error boundaries.
- [ ] Sync-health logs surfaced (counts per run) (§19).

### 9.5 Resilience & error handling (§18)
- [ ] Designed `EmptyState` for every list (search/category/cart) — never blank.
- [ ] Graceful degradation: backend down → ISR last-good + persisted client cache; sync retries next tick.
- [ ] Zod validation on every server action/use-case input; HTML sanitized on ingest.
- [ ] Abuse protection: honeypot + per-IP rate-limit on contact/order; secret header on cron/revalidate. 🔒

---

## Phase 10 — Testing: Unit, Component, Contract, E2E, Lighthouse  🔁🧪

The §20 matrix, completed for the whole system. (§20)

- [ ] **Unit (Vitest):** WhatsApp message builder, auto-categorizer, cart math, Zod schemas, `slugify`, `requireOperator` role logic, audit-diff builder, use-cases vs in-memory adapter.
- [ ] **Component (Vitest + RTL + axe):** cards, forms, cart drawer, admin `EntityForm`/`DataTable`, prefetch/hydration behavior.
- [ ] **Contract (Vitest):** every adapter (Supabase now, http later) passes the shared port-contract suite (interchangeability proof). ⛔
- [ ] **E2E (Playwright):** browse → article; add-to-cart → WhatsApp order; contact submit; search/filter; **offline reload still reads cached content**.
- [ ] **E2E admin:** login → create/edit/publish a book → appears on `/store`; unauthenticated admin routes redirect to `/login`; `editor` denied operator-management. 🔒
- [ ] **Quality gates:** ESLint, Prettier, `tsc --noEmit`, Lighthouse CI all green per-app via Turbo, merge-blocking (§20, §21).

---

## Phase 11 — CI/CD & Infrastructure

Goal: the §21 pipeline fully live — Actions own gates + Supabase; Vercel owns frontend build/host. (§21)

- [ ] `ci.yml` finalized: typecheck · lint · unit+component+contract · build · Playwright smoke · Lighthouse — all **required checks** (§21.2). ⛔
- [ ] `db-migrate.yml` finalized: `supabase db push` · **gen-types drift check** · deploy Edge Functions, on merge to `main` (§21.3). 🔒
- [ ] Vercel Git integration: `frontend/web` → `masterwithin.org`, `frontend/admin` → `admin.masterwithin.org`; per-PR previews (one per app) (§21).
- [ ] Turbo remote cache hash shared CI ↔ Vercel (§21).
- [ ] GitHub Environments/secrets per §21.4; **no app secret duplicated into Vercel by Actions**.
- [ ] Vercel runtime env populated per §15 for production + preview (isolated) (§15, §21).
- [ ] Supabase Edge Function cron deployed + scheduled (hourly sync) (§21.4).
- [ ] Rollback drill: confirm Vercel immutable rollback + forward-fix migration policy (expand-then-contract) (§21.1, §21.4).

---

## Phase 12 — Launch: Content Seed, Hardening & Go-Live  ⛔

- [ ] Bootstrap first `admin` via `scripts/grant-admin.ts` (`ADMIN_BOOTSTRAP_EMAIL`) (§17.6). 🔒
- [ ] Seed real content via Admin: books, eBooks, courses, freebies, `site_config` (WhatsApp #, socials, YouTube, featured), 4 Start-Here paths (§22).
- [ ] Author/review `/our-ideal` and `/about` MDX via PR (§22).
- [ ] Run initial Substack sync; verify articles appear, categorized, images on Cloudinary (§8).
- [ ] DNS/domains: `masterwithin.org` + `admin.masterwithin.org`; HTTPS; canonical site URL (§15, §21).
- [ ] **Security review** of the pending branch: RLS, auth gates, secret headers, allowlist, no client DB writes, no `@supabase/*` in frontends (§16, §17, §24). 🔒 ⛔
- [ ] Final Lighthouse pass meets §13 budget on production build. ⛔
- [ ] Verify editorial-gradient constraint end-to-end (outer humanitarian → `/our-ideal` deepest) (§1).
- [ ] Smoke the full pipeline in production: publish-on-Substack → appears; admin edit → revalidates in seconds; WhatsApp order deep link; contact email delivered (§8, §17, §10, §7.9).
- [ ] Confirm `.env.example` documents every key; secrets only in Vercel/Supabase dashboards, never git (§15).

---

## Phase 13 — Post-Launch / Extensibility Backlog (deferred)

Tracked, not built at launch — each is additive per §23.

- [ ] FastAPI backend: implement `backend/adapters/http` against existing ports; run it through the contract suite; flip `BACKEND_DRIVER=fastapi` (§9, §23).
- [ ] Online payments: implement a payment strategy against `OrderProvider` (Razorpay/Stripe) (§10, §23).
- [ ] Search at scale: `SearchProvider` with Algolia/Typesense or Postgres FTS (§12.4, §23).
- [ ] Operator 2FA (TOTP) via Supabase Auth MFA (§17.8, §23).
- [ ] More granular roles (extend `role` claim + `requireOperator`) (§23).
- [ ] Visitor accounts + course progress (reuse Supabase Auth foundation) (§23).
- [ ] Newsletter signup wrapper; blog comments provider; multi-language (Bengali via `next-intl`) (§23).
- [ ] Full installable PWA (manifest + install prompt; persistence/SW already in place) (§23).
- [ ] Dark mode flip (token override + `ThemeToggle` already built) (§4.1, §23).
- [ ] Optional staging environment (`develop` branch + 2nd Supabase project + `staging` env) (§21.5).

---

### Definition of Done (applies to every task) (§20)
A task is complete only when it is **typed**, **validated at every boundary (Zod)**, **accessible
(WCAG 2.2 AA)**, **within the performance budget (§13, public app)**, **covered by tests appropriate
to its risk**, and — if it changed architecture — **reflected in [Project.md](./Project.md) in the same change**.
