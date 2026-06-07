# Master Within Foundation — Engineering Blueprint & Source of Truth

> This document is the single source of truth for the architecture, conventions, and product
> specification of the Master Within Foundation website. It describes **what the system is and how
> it is built** — not a schedule. Every engineering decision should trace back to a principle or
> specification stated here. When reality and this document disagree, fix one of them in the same
> change.

---

## 1. Product Overview

| Field | Value |
|---|---|
| **Project** | Master Within Foundation Website |
| **Domain** | `masterwithin.org` |
| **Core purpose** | A spiritual–philosophical knowledge hub: the most comprehensive English-language resource for deep life questions (meaning, purpose, dharma, relationships, inner growth). The central home for YouTube, podcast, courses, books, and community. |
| **Design references** | The Marginalian, Farnam Street, Substack editorial style |
| **Primary audience** | Thoughtful readers seeking depth; spans the philosophically curious to committed practitioners. |

### Editorial tone rule (a product constraint, not a preference)

The site reveals depth progressively. The **outer layer** (Home, Wisdom Library, Start Here, Store,
Courses) is humanitarian, educational, and free of religious language. **Philosophy deepens as the
visitor goes deeper** — the *Our Ideal* page is the contemplative core. This gradient is enforced in
copy, design density, and information architecture, not just intent.

### Product pillars

1. **Wisdom Library** — long-form articles, auto-ingested from Substack and shown **dynamically** on the site, organized into 8 categories.
2. **Guided entry** — *Start Here* routes newcomers to the right first reading.
3. **Courses** — structured learning paths.
4. **Store** — physical books (primary), eBooks, and free downloads, with a frictionless WhatsApp-first checkout.
5. **The founder & the ideal** — *About* and *Our Ideal* anchor trust and depth.

---

## 2. Architectural Principles

These principles govern every decision. They exist so that contributors can make consistent choices
without re-litigating them.

1. **Content is rendered on the server for SEO; navigation is instant on the client.** The site is a
   content product; SEO, social previews, and first-paint speed are core features. Pages are
   statically generated or incrementally regenerated (ISR/SSR) so crawlers and first-time visitors get
   fully-rendered HTML. **On top of that server layer**, the client runs a cache-first data layer
   (TanStack Query, §12) so that once a visitor is in the app, subsequent navigation feels like a
   native desktop app — cached, prefetched, no spinners.
2. **The backend is the source of content truth; the code is the source of structural truth.**
   Articles, books, courses, and freebies live in the **backend** (Supabase/Postgres today). Their
   *shape*, *routing*, and *rendering* live in typed code.
3. **One-way data flow, typed end to end.** Every external boundary (the backend, RSS, env vars,
   form input) is validated with a schema (Zod) and converted into a typed domain model before it
   touches the UI.
4. **Feature-first organization.** Code is grouped by feature/domain (`wisdom`, `store`, `courses`),
   not by technical type. A feature owns its components, data access, types, and logic.
5. **Abstractions at the volatile boundaries.** Anything likely to change — checkout method, content
   source, analytics provider, search backend, **and the backend itself** — sits behind an interface so
   it can be swapped without touching call sites. See §2a and §9.
6. **Accessibility and performance are acceptance criteria.** A feature is not "done" if it fails
   WCAG 2.2 AA or the performance budget in §13.
7. **Progressive enhancement.** Core content is readable without JavaScript. Interactivity layers on top.
8. **Anonymous-by-default for visitors; authenticated only for operators.** The public site requires
   no visitor accounts or sessions — reading, browsing, and ordering are all anonymous. The *only*
   authenticated surface is the **Admin Console** (§17), used by a small, fixed set of operators to
   manage all dynamic content (books, eBooks, courses, freebies, Substack/article curation, site
   config). Visitor-facing accounts (course progress, comments) remain deferred until a feature
   genuinely requires them.
9. **Content is operated, not hard-coded.** Anything an operator must change without a deploy —
   publishing a book, attaching a Substack link, featuring an article, editing the WhatsApp number —
   is editable through the Admin Console and stored in the backend. The repo holds *structure*; the
   console holds *content*. No content edit should require a code change or a developer.

### 2a. The three defining decisions

These four user-mandated decisions shape the whole repository and are restated here so they are never
quietly eroded:

- **Monorepo, perfectly separated.** One repository holds `backend/`, `frontend/web/` (customer), and
  `frontend/admin/` (operator console) as independent, deployable units that share code only through
  versioned `packages/*`. Admin code never ships to the public bundle; backend code never assumes a
  particular frontend.
- **Plug-and-play backend (ports & adapters).** The backend is consumed through **domain use-cases and
  repository interfaces (ports)**. Today those ports are implemented by a **Supabase adapter**. Moving
  to **FastAPI** (or anything else) means writing one new adapter and flipping `BACKEND_DRIVER` — *no
  change to the frontends, the domain, or the use-cases*. Frontends must never import the Supabase
  client directly; they import use-cases from `backend`.
- **Offline-first, desktop-smooth client.** The client is built so that revisiting a page, switching
  tabs, or following a link feels instant: data is served from cache first and revalidated in the
  background, navigation targets are **prefetched on user intent** (hover / mouse-down / focus / in
  viewport), and the query cache is **persisted** so the app keeps working offline. See §12.
- **Images on Cloudinary.** All image assets (covers, uploads, OG sources) live in Cloudinary and are
  delivered through its transformation CDN. Non-image downloadable files (freebie PDFs, eBook samples)
  use Supabase Storage signed URLs. See §3 and §17.7.

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Monorepo** | **pnpm workspaces + Turborepo** | One repo, independent apps (`frontend/web`, `frontend/admin`, `backend`), shared `packages/*`, cached task graph. |
| **Framework** | **Next.js 15 (App Router)** + React + TypeScript | Server Components + ISR/SSG give per-page SEO and fast LCP; client hydration enables the instant-nav layer. |
| **Language** | TypeScript (strict mode) | Type safety across the data → UI boundary. |
| **Styling** | Tailwind CSS + CSS custom properties (design tokens) | Utility-first, themeable, dark-mode-ready via tokens. Shared Tailwind preset in `packages/config`. |
| **UI primitives** | Radix UI primitives (headless) | Accessible, unstyled building blocks for menus, dialogs, tabs. Shared via `packages/ui`. |
| **Client UI state** | Zustand (with `persist`) | Cart + ephemeral UI state only. Server state is **not** held here. |
| **Server/remote state** | **TanStack Query (primary client data layer)** + React Server Components for first paint/SEO | RSC renders SEO-critical HTML and **prefetches into a dehydrated cache**; the client hydrates that cache and from then on serves data cache-first, prefetches on intent, persists offline, and does optimistic updates (§12). |
| **Backend (today)** | **Supabase** — Postgres + Auth + Edge Functions + Storage | Managed Postgres with row-level security, scheduled functions, and auth; low-ops. Consumed **only** through the backend ports (§9), never imported directly by the frontends. |
| **Backend boundary** | **Ports & adapters (hexagonal/clean architecture)** | Domain + use-cases + repository ports are backend-agnostic. A `supabase` adapter implements them now; a `fastapi`/`http` adapter can implement the same ports later. `BACKEND_DRIVER` selects the adapter at the composition root. |
| **Backend (future)** | **FastAPI** (or any service) behind the same ports | Swap is plug-and-play: write `adapters/http`, point `BACKEND_API_URL` at the FastAPI service, flip `BACKEND_DRIVER=fastapi`. Frontends unchanged. |
| **Image storage & delivery** | **Cloudinary** | All images (covers, uploads, OG sources). Signed uploads + on-the-fly transforms/format/quality + global CDN; served via `next/image` with a Cloudinary loader. |
| **File storage (downloads)** | **Supabase Storage** (signed URLs) | Non-image downloadable assets: freebie PDFs, eBook samples. Public-readable covers go to Cloudinary instead. |
| **Server access** | Supabase **service-role** client, server-only, **inside the Supabase adapter** | All privileged reads/writes happen server-side through the adapter, never in the browser. |
| **Admin auth** | **Supabase Auth** + SSR session cookies (`@supabase/ssr`) + role in JWT claims (RBAC) | Operator-only login for the Admin Console. Cookies are httpOnly/SSR-verifiable and revocable; roles ride on the JWT `app_metadata.role` claim (see §17). |
| **Admin UI** | Same design system + `@tanstack/react-table` (data tables), `dnd-kit` (drag-to-reorder), `sonner` (toasts) | Reuses shared tokens/primitives; lives in the separate `frontend/admin` app so the public site ships zero admin JS. |
| **Content ingestion** | Substack RSS → Supabase sync (scheduled) | Auto-ingest new posts; frontend never parses RSS in the browser (§8). |
| **Validation** | Zod | Runtime validation of every external input + schema-to-type inference. Shared schemas in `packages/types`. |
| **Forms** | React Hook Form + Zod resolver | Accessible, performant forms with typed validation. |
| **Offline / PWA** | TanStack Query persistence (IndexedDB) + service worker (Serwist) | Cache survives reloads; app shell + last-good content work offline. |
| **Deployment** | Vercel (both frontends) + Supabase (backend) | Native Next.js host: ISR, edge CDN, cron, preview deploys. Supabase hosts DB/Auth/Functions. |
| **CI/CD** | **GitHub Actions** (quality gates + Supabase migrations) + Vercel (build & host) | Actions run type-check/lint/test/contract/build, apply DB migrations, and deploy Edge Functions; Vercel builds and serves both apps with per-PR previews and instant rollback (§21). |
| **Commerce (launch)** | WhatsApp Click-to-Chat deep link | Zero-friction ordering, no payment integration required at launch. |
| **Commerce (future)** | Razorpay/Stripe behind a payment strategy | Drop-in online payments without restructuring (see §10). |
| **Search** | Client index (Fuse.js) at launch; Algolia/Typesense when corpus grows | Start cheap; swap behind a `SearchProvider` interface. |
| **Analytics** | Privacy-friendly (Plausible or GA4) behind an `analytics` wrapper | Consent-aware, provider-swappable. |
| **Email** | Resend (transactional) for contact form | Reliable delivery; submission also persisted to the backend. |
| **Fonts** | Lora (display) + DM Sans (body), self-hosted via `next/font` | Editorial feel, no layout shift, no third-party request. |
| **Icons** | Lucide React | Clean, consistent, tree-shakeable. |
| **Animation** | Framer Motion (selective) | Page transitions and scroll reveals, respecting `prefers-reduced-motion`. |
| **Long-form content** | MDX (for hand-authored pages like *Our Ideal*) | Rich, versioned editorial content in the repo. |
| **Testing** | Vitest + React Testing Library (unit/component), Playwright (E2E) | Fast unit loop, real-browser confidence for critical flows. |
| **Quality gates** | ESLint, Prettier, `tsc --noEmit`, Lighthouse CI | Enforced in CI on every PR, per-app via Turborepo. |

---

## 4. Brand & Design System

The design system is expressed as **tokens** (CSS custom properties) consumed by Tailwind, and shipped
as the shared `packages/ui` package consumed by both frontends. Tokens are the only source of color,
type, spacing, and radius values — no hard-coded hex in components. This is what makes theming (incl.
dark mode) and rebrands cheap.

### 4.1 Color tokens

```css
:root {
  /* Brand */
  --color-primary:   #1E9AE0;  /* Primary blue */
  --color-deep:      #1A5C8A;  /* Deep blue */
  --color-accent:    #1E9AE0;

  /* Neutrals */
  --color-dark:      #3D4858;  /* Dark charcoal */
  --color-text:      #2C3340;  /* Body text */
  --color-muted:     #C8CFDA;  /* Muted blue-grey */
  --color-bg:        #F7F8FA;  /* Page background */
  --color-surface:   #FFFFFF;  /* Cards, panels */
  --color-border:    #E3E7ED;

  /* Semantic */
  --color-success:   #2E8B57;
  --color-warning:   #C9892B;
  --color-danger:    #C0392B;

  /* Typography */
  --font-display: 'Lora', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;

  /* Radii & elevation */
  --radius-sm: 6px;  --radius-md: 10px;  --radius-lg: 16px;
  --shadow-sm: 0 1px 2px rgba(45,51,64,.06);
  --shadow-md: 0 4px 16px rgba(45,51,64,.08);
}

/* Dark mode is a token override, not a parallel stylesheet. */
[data-theme='dark'] {
  --color-bg:      #11161D;
  --color-surface: #1A2129;
  --color-text:    #E6EAF0;
  --color-muted:   #5C6573;
  --color-border:  #2A323C;
}
```

### 4.2 Typography scale

- **Type scale (px):** 14 / 16 / 18 / 22 / 28 / 36 / 48 / 64
- **Line height:** 1.7 body, 1.2 headings
- **Display font:** Lora (headers, hero, pull quotes)
- **Body font:** DM Sans (prose, UI)
- **Reading measure:** article body max-width **720px**; full-width sections **1200px**.

### 4.3 Design principles

- Contemplative, minimal, intellectual. Generous white space.
- No aggressive CTAs, no popup modals, no carousels, no clutter.
- Cool and precise palette — no gold, no warm tones.
- Mobile-first; every layout is designed at 360px first, then scaled up.
- Motion is subtle and always gated by `prefers-reduced-motion`.

### 4.4 Component layering

```
Tokens (CSS vars)
  → Primitives (Radix + styled wrappers: Button, Dialog, Tabs, Input)
    → UI components (Card, Badge, ArticleCard, BookCard)
      → Feature sections (FeaturedArticles, CartDrawer)
        → Page compositions (route segments)
```

A component may only import from layers below it. This keeps the dependency graph acyclic and the
system legible. Primitives + UI live in `packages/ui`; feature sections and pages live inside each app.

---

## 4a. UI/UX Excellence System

This section captures the **UI/UX enhancement specification** for the customer-facing site
(`frontend/web`). It defines how the site must *look*, *feel*, and *move* to create the deep emotional
resonance appropriate for a spiritual-philosophical knowledge hub. Every rule here is derived from three
design references — The Marginalian, Farnam Street, Substack editorial style — synthesised with
evidence-based psychological design patterns for trust, depth, and reader attraction.

> **Why this section exists:** The §4 design system specifies *tokens* — the raw materials. This section
> specifies *application* — how those tokens are composed into a distinctive, professional, emotionally
> compelling experience. Any component or page that doesn't follow these rules should be treated as a
> bug, not a style choice.

### 4a.1 Layout Grid & Spacing System (the core fix)

The single largest source of unprofessional appearance is **inconsistent horizontal margins and
uncontrolled vertical rhythm**. These rules are non-negotiable.

**Global Spacing Consistency:** Spacing across all pages must be strictly consistent. The Home page's layout, margin, padding, and vertical rhythm are the universal baseline standard. All pages, including sub-pages and dynamic route directories, must inherit these exact padding rules (`px-5 sm:px-8 lg:px-10` for horizontal boundaries) and named vertical rhythm classes. Custom padding values (such as hardcoded `px-6`) are forbidden.

#### Horizontal layout

Three named container widths are the only permitted content boundaries:

| Name | Max-width | Use |
|------|-----------|-----|
| `max-w-prose` | **720px** | Article body, MDX pages, single-column editorial text |
| `max-w-content` | **1120px** | Standard page sections, grids, card layouts |
| `max-w-wide` | **1320px** | Hero sections, full-bleed backgrounds (inner content still bounded) |

Every section uses one of these. **No `max-w-full` or unconstrained widths on text blocks.**

Horizontal padding (gutters) by breakpoint — applied to the bounding container:

| Breakpoint | Side padding |
|------------|-------------|
| `< 640px` (mobile) | `px-5` (20px) |
| `640px – 1023px` (tablet) | `px-8` (32px) |
| `≥ 1024px` (desktop) | `px-10` (40px) |
| `≥ 1280px` (large desktop) | `px-12` (48px) |

These are expressed as the shared `Container` component variant — never inline `px-6` in page files.

#### Vertical rhythm (section spacing)

Sections use a **named rhythm scale**, not arbitrary `py-*` values:

| Name | Mobile | Desktop | Use |
|------|--------|---------|-----|
| `section-sm` | `py-12` (48px) | `py-16` (64px) | Tight supplementary sections |
| `section-md` | `py-16` (64px) | `py-24` (96px) | Standard content sections |
| `section-lg` | `py-20` (80px) | `py-32` (128px) | Hero sections, major transitions |
| `section-xl` | `py-24` (96px) | `py-40` (160px) | Landing/editorial climax sections |

The **Our Ideal** page uses `section-xl` throughout. The Home hero uses `section-lg`.

#### Internal component spacing

All internal spacing follows the **8px grid** (multiples of 8: 8, 16, 24, 32, 40, 48, 64, 80, 96).
The one exception is micro-spacing within components: 4px (`gap-1`) for tight icon–label pairs.

### 4a.2 Enhanced Typography Application

The font tokens (`Lora` / `DM Sans`) are defined in §4.2. This section specifies **how** they are applied
across component types to create editorial authority and depth.

#### Type role mapping

| Role | Font | Weight | Size (desktop) | Line-height | Letter-spacing | Use |
|------|------|--------|----------------|-------------|----------------|-----|
| Hero display | Lora | 700 | `clamp(2.75rem, 5vw, 4rem)` | 1.1 | −0.02em | Home H1, Our Ideal H1 |
| Section title | Lora | 700 | `2rem – 2.5rem` | 1.2 | −0.01em | Section H2s |
| Article title | Lora | 600 | `1.75rem – 2.25rem` | 1.25 | −0.01em | Article page H1 |
| Subsection | Lora | 600 | `1.25rem – 1.5rem` | 1.3 | 0 | H3, pull quote attribution |
| Pull quote | Lora | 400 italic | `1.25rem – 1.5rem` | 1.6 | 0.01em | `<blockquote>` in Prose |
| Body prose | DM Sans | 400 | `1.0625rem` (17px) | 1.75 | 0 | Article body |
| UI body | DM Sans | 400 | `0.9375rem` (15px) | 1.5 | 0 | Cards, descriptions |
| Label / eyebrow | DM Sans | 600 | `0.6875rem` (11px) | 1.4 | 0.1em | Category badges, section labels |
| Caption | DM Sans | 400 | `0.8125rem` (13px) | 1.5 | 0 | Image captions, metadata |

**`clamp()` is mandatory for Hero display** — the heading scales fluidly, never jumps at breakpoints.

#### Editorial typography rules

1. **Drop caps** on the first paragraph of every article (CSS `::first-letter`, Lora bold, 3-line drop).
2. **Pull quotes** (`<blockquote>`) rendered with a left border in `--color-primary`, Lora italic, `1.5× body size`, `max-w-prose`.
3. **Eyebrow labels** above every section title: `11px`, `font-semibold`, `tracking-[0.1em]`, `text-primary`, all-caps. This single rule creates visual hierarchy that reads as "professional editorial".
4. **Section titles** are never the first thing the eye sees — the eyebrow label sets context first.
5. **Prose max-width is 720px always.** On desktop, the article column is centered, never edge-to-edge.
6. **Reading progress indicator** color matches `--color-primary`; height 2px; no border-radius; sits below the navbar.

### 4a.3 Animation & Motion Strategy (Framer Motion)

The site uses **Framer Motion** for all significant motion. CSS `transition` is used only for micro-states
(hover color, focus ring). The guiding principle: *motion reveals depth, not decoration*.

#### Motion tokens (defined in `packages/ui/motion.ts`)

```typescript
export const motionTokens = {
  // Durations
  fast:               0.15,  // micro-interactions (hover states)
  standard:           0.25,  // entrance/exit transitions
  deliberate:         0.45,  // page section entrances, hero reveals
  contemplative:      0.7,   // slow-reveal for Our Ideal; exit is 60% (0.42s)

  // Easings
  easeOut:      [0.16, 1, 0.3, 1],    // all entering elements
  easeIn:       [0.7, 0, 0.84, 0],    // all exiting elements
  spring:             { type: 'spring', stiffness: 80, damping: 20 },   // cards, hover
  contemplativeSpring:{ type: 'spring', stiffness: 35, damping: 18 },  // Our Ideal, CartDrawer

  // Variants (reusable) — pair with a duration from above when defining transition
  fadeUp:    { hidden: { opacity: 0, y: 24 },   visible: { opacity: 1, y: 0 } },
  fadeIn:    { hidden: { opacity: 0 },           visible: { opacity: 1 } },
  slideLeft: { hidden: { opacity: 0, x: -20 },  visible: { opacity: 1, x: 0 } }, // content enters from left
  scaleUp:   { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } },
} as const;
```

#### Animation inventory by component

| Component / Context | Animation | Trigger | Duration |
|---------------------|-----------|---------|----------|
| **Hero H1** | `fadeUp` (y: 32 → 0) | On mount | `deliberate` (0.45s) |
| **Hero subtitle** | `fadeUp` with 0.1s stagger | After H1 | `deliberate` |
| **Hero CTAs** | `fadeUp` with 0.2s stagger | After subtitle | `standard` |
| **Section titles** | `fadeUp` | Scroll enters viewport (IntersectionObserver) | `deliberate` |
| **Article cards** | `fadeUp` with 30ms stagger per card | Scroll enters viewport | `standard` |
| **Category cards** | `scaleUp` with 40ms stagger | Scroll enters viewport | `standard` |
| **Article body paragraphs** | No scroll animation — loads fully at once (reading flow must not interrupt) | — | — |
| **Pull quotes** | `slideLeft` | Scroll enters viewport | `deliberate` |
| **Navbar** | `y: -4 → 0, opacity` on condense-on-scroll | Scroll past 64px | `fast` |
| **Page transitions** | `fadeIn` on route change | Next.js layout shell | `standard` |
| **Cart drawer** | `x: 100% → 0` slide-in | Open | `deliberate` spring |
| **Book covers (store)** | `rotate(−6deg) scale(0.98) → rotate(0) scale(1)` | Hover | `standard` |
| **Hover on ArticleCard** | `y: 0 → −4px` + shadow deepens | Hover | `fast` |
| **Our Ideal page** | `fadeUp` with `contemplative` (0.7s) duration for each section | Scroll | `contemplative` |

**Rules:**

- Scroll-triggered animations use Framer Motion's `useInView` hook. Threshold is `0.15` (15% visible). **`once: true` is mandatory** — the reveal fires once and stays; re-triggering on scroll-back breaks the "unveiling" metaphor and reads as twitchy.
- **Stagger containers** use Framer Motion `variants` with `staggerChildren`. The stagger delay is `0.05s` for grids, `0.08s` for hero sequences.
- **`prefers-reduced-motion`:** when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is true, `AnimateOnScroll` renders children unwrapped — no `motion.div`, no variant. This is enforced in the component, not per-call-site.
- Animations never block interactivity. `willChange: 'transform, opacity'` only on actively animating elements.
- Exit animations are **60% the duration** of entrance animations (feels responsive).
- **CSS `transition` is removed** from any element that Framer Motion owns (hover, mount, scroll). Motion owns the property; dual-ownership causes jank.

#### `AnimateOnScroll` wrapper component

A shared `AnimateOnScroll` component wraps any block that should reveal on scroll:

```tsx
// packages/ui/components/AnimateOnScroll.tsx
<AnimateOnScroll variant="fadeUp" delay={0.1}>
  <SectionTitle>Featured Writings</SectionTitle>
</AnimateOnScroll>
```

This keeps animation concerns out of page code and ensures consistency.

### 4a.4 Psychological Design Patterns

These patterns are derived from three evidence-based frameworks — **Self-Determination Theory**
(Deci & Ryan), **Rogerian humanistic psychology**, and **cognitive psychology** (dual-process theory,
curiosity gap, availability heuristic) — applied to the specific context of a
**spiritual-philosophical knowledge hub**. The goal is *attraction through depth*, not urgency or
scarcity.

#### 4a.4.0 Visitor psychology framework

The MasterWithin visitor is operating at Maslow's **Esteem → Self-Actualization boundary**: life
basics are covered; they feel an unnamed gap and are searching for language to name it. Most are in
Erikson's Stage 6 (Intimacy vs. Isolation, 20s–40s) or Stage 8 (Integrity vs. Despair, 50s+) — both
asking *"Does my life mean something?"* The H1 already answers this. Every other design decision
should support that answer.

**Self-Determination Theory — three visitor needs mapped to design responses:**

| SDT Need | What the visitor feels arriving | Design response |
| --- | --- | --- |
| **Autonomy** | "I want to choose my own path — not be sold to" | Invitation-style CTAs only. No countdown timers, no pop-ups, no "limited spots". CTAs pull (invite); they never push. |
| **Competence** | "Am I intellectual/aware enough for this?" | Drop the barrier immediately — visually inclusive, no gatekeeping language. Article counts signal depth, not difficulty. |
| **Relatedness** | "Am I alone in seeking this?" | Founder presence, article corpus size, reading-time signals — social proof through *seriousness*, not testimonials. |

**Rogerian principles as design constraints (Unconditional Positive Regard, Empathy, Congruence):**

- **UPR → Visual openness.** Generous whitespace = "there is no rush here." No pop-ups, no
  urgency-scarcity patterns. Soft border radii (`--radius-lg`) signal non-threat. These are not style
  choices — they are design decisions that create a psychologically safe container.
- **Empathy → Copy that reflects the visitor's inner state first.** Every section header and page
  intro should *name the visitor's feeling* before naming the site's content. The empathic reflection
  pattern (§4a.4.1, §4a.6) is the primary implementation of this.
- **Congruence → Founder authenticity visible.** People trust individuals, not institutions. Souvik
  Ghosh's name, credential, and voice must be present on the Home page (inline credit) and above the
  fold on `/about`. The founder's presence is not decoration — it is the trust mechanism.

**Cognitive psychology levers:**

- **Dual-Process (Kahneman):** System 1 (fast, emotional) is triggered first by the hero animation
  reveal, the founder credit, pull quotes, and the book covers. System 2 (slow, logical) engages via
  article metadata, course structure, and category descriptions. The design triggers System 1 *first*
  to earn the attention that System 2 needs to evaluate.
- **Curiosity gap:** Each section title + eyebrow pair should create a *cognitive pull* — a gap
  between what the visitor knows and what they suspect the content will reveal. Eyebrow: `SCIENCE OF
  CONSCIOUSNESS` / Title: `Why Your Inner Experience Is Real` creates tension; `Blog Post #4` does not.
- **Availability heuristic:** What appears first is weighted most heavily. The Hero H1 is the single
  most important line of copy on the site. Everything else is amplification.
- **Progressive disclosure:** Each page tier is designed to pull the visitor one layer deeper:
  Home → "I wonder what's in the Library" → Library → "I wonder what's in this category" →
  Article → "I wonder what the next paragraph reveals" → Our Ideal → "I wonder who writes all of this."

#### 4a.4.1 Progressive depth revelation (the editorial gradient, §1)

The site is architected as a **visual journey inward**. Each layer of the site is visually and
typographically denser and more intimate than the last:

| Layer | Pages | Visual cues |
|-------|-------|-------------|
| **Outer** | Home, Wisdom Library, Courses, Store | Max whitespace; humanitarian framing; minimal color; friendly body font weight |
| **Middle** | Article pages, Start Here, About | Reduced whitespace; more Lora display use; pull quotes appear; category depth visible |
| **Inner** | Our Ideal | Near-maximum text density within `max-w-prose`; generous `section-xl` vertical space; contemplative animation timings; deepest philosophical language |

This gradient is enforced through CSS and component choices, not just copy — a first-time visitor
*feels* the depth increasing as they go deeper.

#### 4a.4.2 Trust through typography + authority signals

- **No testimonials, no star ratings.** Trust is built through visual seriousness (editorial typography, precise alignment, Lora display), not social proof metrics.
- **Founder presence on Home** — a one-sentence credit with Souvik Ghosh's name and credential (PhD researcher, author) placed *below the hero CTAs or in the hero subtitle area*. Not buried in the footer. No large photo on Home; full photo and bio on `/about` above the fold.
- **Empathic reflection block** — immediately below the hero section and before the Featured Articles grid, a single sentence in Lora italic that names the visitor's unspoken feeling back to them (e.g. *"If you've ever felt that the answers must go deeper than what you've been given — you're in the right place."*). This is the Rogerian "empathy" move in design form: the visitor feels seen before any content is consumed. See §4a.6 for placement spec.
- **"X articles in the library"** counter on the Wisdom Library page header — social proof through corpus size, not reviews.
- **Publication date + reading time** on every article — signals curation and respect for reader's time.
- **Attribution link to Substack** on every article — transparency builds trust.

#### 4a.4.3 Attention architecture (F-pattern and Z-pattern)

- **Home page:** Z-pattern layout. Hero → Featured Articles (left-right grid) → Full-width YouTube → Course teaser (left text, right CTA) → Store teaser.
- **Wisdom Library:** Hero-search pattern. Ambient gradient hero with large title + prominent centered search bar. Horizontal sticky category-filter pill bar below the hero (replaces the static category-card grid). Full-width article grid (no sidebar, no tag filter panel).
- **Article page:** Single-column reading column, centered, max 720px. No sidebars. Nothing competes with the text.
- **The above patterns mean:** on mobile, everything stacks correctly without cognitive cost.

#### 4a.4.4 Scarcity and exclusivity (depth-appropriate)

- **Depth signals, not urgency.** The site never uses countdown timers, "limited spots", or "don't miss out". Instead: subtle signals that this is a curated, considered body of work.
- **Category article counts** (`12 articles` under a category) signal a substantial library without overwhelming.
- **"Start Here" as a guide** — this page's entire function is psychological: it meets the visitor where they are emotionally and routes them to their first relevant experience.

#### 4a.4.5 Micro-copy and emotional resonance

Section eyebrow labels, CTAs, and empty states use vocabulary from the philosophy of the site — not
generic marketing. This is enforced site-wide; every occurrence of the "avoid" column must be replaced
with the "use" column.

| Context | Use | Avoid |
| --- | --- | --- |
| Section eyebrow | `Insights` | `Blog` |
| Article collection | `Writings` | `Posts`, `Articles` |
| Library CTA | `Explore the Library` | `See all`, `View more`, `Read more` |
| Entry path | `Guided Entry` | `Get Started`, `Onboarding` |
| About page | `The Foundation` | `About Us`, `Our Team` |
| Subscribe prompt | `Stay in the stream` | `Subscribe`, `Sign up` |
| Book purchase | `Bring this home` | `Add to cart`, `Buy now` |
| Empty cart | `Your shelf is waiting.` | `Your cart is empty` |
| Empty search | `The library is quiet here. Try a different path.` | `No results found` |
| Empty category | `The library is growing. Return soon.` | `No articles yet` |
| Course enroll | `Begin this path` | `Enroll now`, `Sign up` |
| Contact submit | `Send your message` | `Submit`, `Send` |
| Reading time | `6 min` | `6 min read` (redundant) |
| Start Here paths | Question-form headline in Lora italic (e.g. *"I feel lost and need direction"*) | Descriptive label (e.g. "Beginner path") |

**Anti-patterns never permitted:**

- Countdown timers, "limited spots", "don't miss out", "only X left" — any scarcity/urgency language.
- Pop-up modals requesting email subscription on first visit.
- "Sign up now" or "Register" as a CTA on any public page (the site is anonymous-by-default, §2).
- Star ratings or testimonial blocks (trust is built through editorial seriousness, not metrics).

### 4a.5 Component Visual Enhancement Specifications

These specs govern how the key visual components must be implemented. They supplement the functional
specs in §11.

#### ArticleCard

- **Aspect ratio:** cover image is `aspect-[16/9]` on hover, transitions from `aspect-[4/3]` on idle (Framer Motion layout animation).
- **Hover state:** `y: −4px`, shadow deepens from `shadow-sm` to `shadow-md`, cover image subtle `scale(1.03)` (overflow hidden on card).
- **Typography treatment:** title is Lora `font-semibold`; category badge left-aligned above title; reading time + date in `caption` role right-aligned.
- **Same Height Grid Consistency:** All article cards within a grid layout must be exactly the same height. This is standardized across the entire application based on the home page featured writings card.
- **Text Truncation & Ellipsis:** To maintain uniform card heights, use a flex layout where cards expand to fill the container height, and use CSS `line-clamp` / ellipsis (`...` / ellipsoid) for truncation if the content (such as title or excerpt) is larger than the card's visual boundaries (e.g. clamp title to `line-clamp-2` or excerpt to `line-clamp-3`).
- **Required metadata row:** `[CategoryBadge] · [ReadingTime] · [PublishedDate]`

#### CategoryCard

- **Icon:** SVG icon at 32px, `text-primary`, with a `bg-primary/8` circle behind it (40px circle).
- **Layout:** icon + title + description + article count. Never just icon + title.
- **Hover:** `scaleUp` spring animation, background shifts from `bg-surface` to `bg-primary/5`.

#### HeroSection

- **Background:** subtle radial gradient from `--color-primary` at 3% opacity at top-center, fading to `--color-bg`. No heavy gradients. No stock photo backgrounds.
- **Texture:** very-low-opacity grid lines (`0.025` opacity) for tactile depth without visual noise.
- **H1:** uses `clamp(2.75rem, 5vw, 4rem)`, Lora bold, tracking `-0.02em`. The word "Source Within" or equivalent philosophical phrase is in `text-primary` — one phrase, not the whole title.
- **Eyebrow:** above H1, 11px, DM Sans 600, `tracking-widest`, `text-primary`, pill shape with `bg-primary/10`.
- **Subtitle:** max-width `560px`, DM Sans 400, 17–18px, `text-text/80`, `leading-relaxed`.
- **CTA pair:** primary + secondary. Primary is `bg-primary text-white` with `shadow-sm`. Secondary is `border border-border bg-surface`. Gap between them `gap-4`. Both min-height 44px (touch target).
- **Founder credit:** one sentence in DM Sans 400, 14px, `text-text/60`, placed below the CTA pair with `mt-6`. Format: *"Founded by Souvik Ghosh, PhD — researcher, author, and practitioner."* No photo in the hero; the text alone signals human presence and authority.

#### Prose (article body)

The `Prose` component has two rendering modes:

**A. `substackNative` mode (default for Substack-sourced articles):**

- Article body preserves **Substack's original fonts, typography, sizes, spacing, and formatting** exactly as authored. Our design system does not override any visual styling within the article body.
- Layout-only concerns are applied: `max-w-[720px]` reading measure, `mx-auto` centering, responsive padding from the shared Container system.
- A dark-mode colour reset (`text-text` on the container) ensures readability when the site is in dark mode, since Substack's inline styles may use dark text that would be invisible on a dark background.
- Drop caps, pull-quote borders, custom heading sizes, and link overrides from the editorial mode are **not applied**.
- Substack's own `class` attributes and inline `style` attributes on elements are preserved through the sanitizer (§8b).

**B. Editorial mode (for MDX pages like *Our Ideal* and *About*):**

- Drop cap: `::first-letter` selector on the first `<p>` in `.prose`. Lora bold, font-size 4.5em, float left, line-height 0.8, padding-right 0.12em.
- Pull quotes: `<blockquote>` gets left border 3px `--color-primary`, Lora 400 italic, 1.4× body size, padded, max-width `prose`.
- Inline images: centered, max 100% width, `rounded-lg`, with optional caption in `caption` role below.
- Link styling: `text-primary`, no underline by default, underline on hover with `text-decoration-color: --color-primary/40`.
- Inter-paragraph spacing: `1.75em` (generous — contemplative pace).

#### Navbar

- **Scroll behaviour:** transparent (no `bg-surface`) when at top, transitions to `bg-surface/90 backdrop-blur-md` with `border-b border-border/40` after 64px scroll. Transition: 0.2s ease-out.
- **Height:** 64px desktop, 56px mobile.
- **Logo:** Lora font for the wordmark "Master Within", 15px, `tracking-tight`. An icon mark (lotus or circular SVG) 24px left of wordmark.
- **Nav links:** DM Sans 500, 14px, `text-text/80` idle, `text-text` hover with underline `text-decoration-color: --color-primary`.
- **Cart indicator:** badge with item count, bg `--color-primary`, white text, 18×18px, `rounded-full`, positioned at top-right of cart icon.
- **Mobile:** slide-in sheet from right, full-height, with the nav links stacked at 18px DM Sans 500.

#### Footer

- **Four-column layout** on desktop: Brand column (logo + tagline + socials), Navigation, Library (categories list), Subscribe (Substack embed link + brief copy).
- **Divider:** 1px `--color-border` line above footer, `section-sm` padding above.
- **Legal row:** 12px DM Sans 400, `text-text/50`. Substack attribution link.
- **No heavy backgrounds** — footer uses `bg-surface` or `bg-bg` (same as page). The separator line provides the visual distinction.

#### Button

- **Variants (all defined in `packages/ui/primitives/Button.tsx`):**
  - `primary`: `bg-primary text-white` shadow-sm, hover `bg-deep` (not opacity — true darkening to `--color-deep`).
  - `secondary`: `border border-border bg-surface text-text`, hover `bg-primary/5 border-primary/30`.
  - `ghost`: `text-primary`, no background, no border, hover `bg-primary/8 text-primary`.
  - `danger`: `bg-danger text-white`.
- **Size:** `sm` (32px height), `md` (40px height), `lg` (48px height). All meet WCAG touch target when used with adequate spacing.
- **Shape:** `rounded-lg` (`--radius-md`, 10px). Never pill shape on primary CTAs.
- **Icon+label:** icon always 16px, gap between icon and label `gap-2`.

### 4a.6 Page-Specific Visual Specifications

#### Home page visual hierarchy

The Home page must communicate three things in the first 3 seconds: (1) this is a serious, deep
resource, (2) it is about consciousness / inner mastery, (3) there are two clear paths (Library and
Start Here). Any design that obscures these three signals should be changed.

- **Hero:** `section-lg` padding. H1 no wider than `max-w-3xl`. H1 must include a philosophical phrase in `text-primary`. No stock photos. Background texture only. Founder credit below CTAs (see §4a.5 HeroSection spec).
- **Empathic reflection block:** between the Hero and the Featured Articles section — a single sentence in Lora 400 italic, `text-text/70`, centered, `max-w-xl mx-auto`, no background, no border. This sentence names the visitor's unspoken feeling (e.g. *"If you've ever felt that the answers must go deeper than what you've been given — you're in the right place."*). It is the psychological bridge between the mission statement above and the content below. Animate with `fadeIn` on mount, 0.3s delay after hero CTAs. Do not make this a prominent UI element — it should read as a quiet whisper, not a banner.
- **Featured Articles section:** 3-column card grid on desktop, single column on mobile. `section-md` padding. Section eyebrow `INSIGHTS` before title.
- **YouTube section:** alternating background (`bg-surface/40`). Lite-embed players in a 3-col grid. Section eyebrow `MEDIA` or `CONVERSATIONS`.
- **Course Teaser:** full-width banner inside `max-w-content`. Subtle gradient background (`from-primary/5`). Left-heavy layout with image or icon on right.
- **Store Teaser:** Two-column — left is text, right is the book covers stack. Book covers use the 3-card rotated stack pattern already in the code; enhance with Framer Motion spring on hover.

#### Wisdom Library visual hierarchy

- **Hero section:** ambient radial-gradient background + dot-grid texture at 3% opacity. Large Lora H1 (`clamp(2.75rem, 5vw, 4.5rem)`), sub-headline, centered `max-w-xl` search bar with icon + animated clear button, and a stats line ("X writings · 8 domains of inquiry"). Entrance: staggered `fadeUp` Framer Motion sequence.
- **Category filter bar:** sticky below the navbar (`top-[60px]`), horizontal overflow-scroll with `scrollbar-width: none`. Pills: "All writings" + one pill per category (icon + short label + count badge). Active pill: `bg-primary text-white shadow-sm ring-1`. Inactive: `border border-border/60`. No static category-card grid — the pill bar is the complete category navigation.
- **No tag-filter sidebar** — removed entirely. Tags remain filterable via the search bar (Fuse.js matches tag fields).
- **Results header:** animated `AnimatePresence` block that appears when a category or search query is active; shows category title + description, or search query + match count, plus a "Clear filters" button.
- **Article grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, full-width (no sidebar). Framer Motion stagger entrance (`staggerChildren: 0.06`, `cardVariants` fade-up).
- **Bottom CTA section** (visible only when no filters are active): contemplative italic pull-quote + "Find your guided entry" link to `/start-here`.

#### Article page

- **Reading column:** `max-w-prose` (720px), centered with `mx-auto`.
- **Article body uses Substack-native styling** (§8b). The `Prose` component renders Substack HTML in `substackNative` mode — only layout (max-width, centering, responsive padding, dark-mode colour reset) is applied; all typography, fonts, spacing, and formatting come from Substack's original HTML. Our design system does not override the article body's visual appearance.
- **Spacing and Margins:** The side spacing (gutters) and layout margins for both the header banner and the main reading body must strictly match the Home page standard (`px-5 sm:px-8 lg:px-10`). No custom page-specific gutters (such as hardcoded `px-6`) are allowed, to ensure consistency all over the app.
- **Above the fold:** Title (Lora 2rem+), byline with author + date + reading time (small caps DM Sans), cover image full-width of the reading column. *These header/banner elements use our design system; the article body below them uses Substack-native styling.*
- **Floating share buttons** on desktop: fixed left side at `top-50%`, vertical stack of 3 (Twitter/X, WhatsApp, copy-link). Fade in after 500px scroll.
- **Related articles:** 3-card grid below the article body, inside `max-w-content` (following the standardized same-height ArticleCard grid format). "You might also enjoy" heading.

#### Our Ideal page

This is the deepest, most contemplative page. Special rules:
- **Reading column:** `max-w-prose` with extra side padding (`md:px-8 lg:px-16`). This makes the column feel more like a printed book page.
- **Section anchors:** styled as small `text-primary` dots (•) in the left margin on desktop.
- **Pull quotes throughout** — every 400–600 words, a pull quote breaks the prose.
- **`contemplative` animation timing** (0.7s) for all scroll-reveals.
- **No categories, no tags, no share buttons** — this page is meant to be experienced, not catalogued.

---

## 5. Information Architecture & Routing

Routes map directly to Next.js App Router segments. SEO-critical routes are statically generated; the
cart/checkout and search are client-interactive within server-rendered shells. The **public site**
lives in `frontend/web`; the **Admin Console** is a separate app, `frontend/admin`, deployed on its own
subdomain (e.g. `admin.masterwithin.org`).

### 5.1 Public site (`frontend/web`)

| Route | Page | Rendering |
|---|---|---|
| `/` | Home | Static (ISR) + hydrated client cache |
| `/wisdom` | Wisdom Library (all articles, filters) | ISR + client filtering/prefetch |
| `/wisdom/[category]` | Category listing | ISR (per category) |
| `/wisdom/[category]/[slug]` | Article | SSG/ISR (per article) |
| `/start-here` | Guided entry | ISR |
| `/our-ideal` | Deep philosophy (MDX) | Static |
| `/courses` | Courses listing | ISR |
| `/courses/[slug]` | Course detail | ISR |
| `/store` | Store (books, eBooks, freebies) | ISR |
| `/store/cart` | Cart review + order form | Client (server shell) |
| `/store/order/confirmation` | Order confirmation | Client |
| `/about` | Founder page | Static |
| `/contact` | Contact form | Static shell + server action |
| `/api/revalidate` | On-demand ISR webhook | Route handler |
| `/api/cron/sync-substack` | Scheduled content sync (if hosted on Vercel) | Route handler (cron) |
| `/sitemap.xml`, `/robots.txt` | Generated | `sitemap.ts`, `robots.ts` |

### 5.2 Admin Console (`frontend/admin`)

| Route | Page | Rendering |
|---|---|---|
| `/login` | Operator sign-in | Dynamic (no cache), `noindex` |
| `/` | Dashboard (stats, recent activity, quick actions) | Dynamic, auth-gated, `noindex` |
| `/books`, `/books/new`, `/books/[id]` | Physical book CRUD | Dynamic, auth-gated |
| `/ebooks`, `/ebooks/[id]` | eBook CRUD (+ store links) | Dynamic, auth-gated |
| `/courses`, `/courses/[id]` | Course CRUD | Dynamic, auth-gated |
| `/freebies`, `/freebies/[id]` | Freebie CRUD (+ file upload) | Dynamic, auth-gated |
| `/articles`, `/articles/[id]` | Article curation: feature, category override, tags, manual Substack import, "Sync now" | Dynamic, auth-gated |
| `/start-here` | Edit the 4 guided-entry paths | Dynamic, auth-gated |
| `/orders` | Read-only order history + export | Dynamic, auth-gated |
| `/settings` | Site config (WhatsApp #, socials, YouTube, featured) + operator management | Dynamic, auth-gated (operator mgmt: `admin` role only) |
| `/api/upload-sign` | Issues short-lived **Cloudinary signed upload** params / Supabase Storage signed URLs (auth-gated) | Route handler |

The entire admin app is dynamic, `noindex`, and behind auth (§17).

**URL conventions:** all slugs are kebab-case and stable. Category slugs are fixed (see §6). Article
slugs are derived once on ingest and never change (changing a slug requires a 301 redirect entry).

---

## 6. Wisdom Library — Content Model

### The 8 categories (fixed taxonomy)

| # | Category | Slug |
|---|---|---|
| 1 | The Science of Consciousness | `science-of-consciousness` |
| 2 | Optimal Living & Micro-Habits | `optimal-living` |
| 3 | Conscious Relationships & Evolutionary Genetics | `conscious-relationships` |
| 4 | Self-Actualization & True Education | `self-actualization` |
| 5 | Holistic Wealth & Purpose-Driven Economics | `holistic-wealth` |
| 6 | Bio-Vitality & Natural Healing | `bio-vitality` |
| 7 | Systems of Peace & Social Architecture | `systems-of-peace` |
| 8 | The Source Code | `source-code` |

Categories are defined once in `packages/types/categories.ts` (id, slug, title, description, icon,
keyword set for auto-tagging). They are the canonical taxonomy used by routing, filtering, and the
Substack auto-categorizer.

### Cross-cutting tags

Tags are orthogonal to categories. An article has exactly one category but many tags. Searching
"burnout" surfaces articles across multiple categories via the tag/full-text index. Tags are
free-form, lower-cased, kebab-cased, and deduplicated on ingest.

---

## 7. Page Specifications

Each spec lists the user-facing intent and the components that compose it. Components are described in
§11.

### 7.1 Home
Intent: orient a first-time visitor and offer two clear next steps without selling.
- **Navbar** — logo left; nav right; cart indicator; mobile slide-in menu; sticky, condenses on scroll.
- **Hero** — mission statement, short tagline, two CTAs: *Explore the Library* and *Start Here*. Full-width with subtle texture. No carousel.
- **Featured Articles** — 3–6 latest/featured, read from the backend, kept fresh by the Substack sync.
- **YouTube section** — latest 3 videos (lite-embed: poster image + click-to-load to protect performance) or channel link.
- **Course teaser** — one calm banner.
- **Store teaser** — book covers, link to store.
- **Footer** — navigation, social, newsletter (Substack subscribe), legal.

### 7.2 Wisdom Library — `/wisdom`

- **Hero section** with ambient gradient background, large Lora H1, sub-headline, and a prominent centered search bar. Stats line: "X writings · 8 domains of inquiry."
- **Horizontal sticky category filter bar** (replaces the static 8-card grid): "All writings" pill + one pill per category (icon + short label + count). Active pill highlighted with primary colour. Horizontally scrollable on mobile with hidden scrollbar.
- No right-side tag filter panel. Tags are still searchable via the Fuse.js search bar (matches `tags` field).
- **Animated results header** (appears on active filter/search): category title + description or search query + match count + "Clear filters" button.
- Article cards: title, category badge, reading time, excerpt, date, cover. 3-column grid on desktop, 2-column on tablet, 1-column on mobile. Framer Motion stagger entrance.
- **Intent-prefetch:** hovering/touching a card prefetches the article into the TanStack Query cache and warms Next's route, so opening it feels instant (§12).
- Pagination (SEO-friendly, indexable `?page=`) rather than infinite scroll.
- **Bottom CTA** (when no filters active): contemplative pull-quote + "Find your guided entry" link to `/start-here`.

### 7.3 Article — `/wisdom/[category]/[slug]`
- Title, publish date, reading time, category badge, clickable tags.
- Reading-progress indicator.
- Sanitized Substack HTML rendered with **Substack-native styling preserved** (see §8b). The article body retains the original Substack fonts, typography, spacing, and visual formatting exactly as authored on Substack — our design system wraps the article (layout container, header, nav, footer, share buttons) but does not override the article body's own styling. In-body images are rewritten to Cloudinary URLs on ingest for optimized delivery.
- Related articles (same category + shared tags) — prefetched on viewport.
- Share buttons: X/Twitter, WhatsApp, copy link.
- "Read on Substack" attribution link.
- Structured data: `Article` + `BreadcrumbList` JSON-LD (see §13).

### 7.4 Start Here — `/start-here`
Four entry paths, each a card linking to a curated reading set + one deeper CTA:
1. *I feel lost* → purpose, direction, dharma.
2. *I want deeper meaning* → philosophy, consciousness.
3. *My relationships are struggling* → relationships, family, compatibility.
4. *I want to explore spirituality* → intro articles, *Our Ideal*.

Curation is data-driven: each path references article tags/ids in `start-here` backend config, so it
updates as new articles match — no hardcoded article lists in JSX.

### 7.5 Our Ideal — `/our-ideal`
The deepest, most contemplative page. Long-form editorial authored in **MDX** in the repo (not
Substack). Pull quotes, section anchors, generous spacing. This is the only page where philosophy is
fully foregrounded.

### 7.6 Courses — `/courses` and `/courses/[slug]`
- Listing: course cards (title, level badge, short description, CTA) + a learning-path visualization (beginner → advanced).
- Detail: full description, "who it's for", "what you'll gain", module outline, enrollment CTA (external platform or contact). Architected so a future authenticated "course progress" feature can attach without redesign.

### 7.7 Store — `/store`
Three sections:

**A. eBooks** — grid of cards (cover, title, description, price) with external "Google Play Books" and "Kindle" links.

**B. Freebies** — list/grid; "Download" streams a file from **Supabase Storage** via a signed URL. No account, no payment.

**C. Physical Books (primary focus)** — full commerce flow in §10.

### 7.8 About — `/about`
Founder page for **Souvik Ghosh** (PhD researcher, author, founder). Warm but serious, long-form,
personal. Authored in MDX.

### 7.9 Contact — `/contact`
Single-column form: Name, Email, Message. Submitted via a **server action** that (a) validates with
Zod, (b) persists through the backend `contacts` use-case, (c) sends a transactional email via Resend.
Honeypot + rate-limit instead of CAPTCHA clutter. Accessible error/success states.

---

## 8. Content Pipeline (Substack → Backend → Site, shown dynamically)

The Wisdom Library mirrors the Substack publication automatically: **whenever a new article is published
on Substack, it appears on the site on its own** — no deploy, no manual step. This is achieved by a
scheduled server-side sync into the backend plus on-demand revalidation, and a cache-first client that
revalidates in the background.

### Flow

```
Substack publishes
   → Scheduled job (Supabase Edge Function cron, hourly — or Vercel Cron → /api/cron/sync-substack)
      → Fetch + parse RSS (server)
         → Normalize + validate (Zod) + auto-categorize + sanitize HTML (preserve Substack styles, §8b)
            → Rewrite in-body/cover images to Cloudinary (fetch/upload) for optimized delivery
               → Upsert into backend `articles` (idempotent by stable post id)
                  → Trigger on-demand ISR revalidation for new/changed paths
                     → Next.js regenerates affected static pages
                        → Clients pick up changes on next focus/refetch (TanStack Query, §12)
```

The browser **never** fetches or parses RSS. All ingestion is server-side and idempotent.

### Why this design (and is "dynamic" possible? — yes)

- **It is fully dynamic.** New Substack posts surface automatically within the sync interval (hourly by
  default; can be tightened, or triggered manually via Admin → "Sync now"). No code change, no redeploy.
- **Idempotent upsert** by stable Substack post id → safe to run repeatedly, no duplicates.
- **Sanitization on ingest** (not on render) → store clean, safe HTML once; render is cheap and safe. The sanitizer preserves Substack's visual styling (CSS classes, inline styles) while stripping security-sensitive attributes (scripts, event handlers, dangerous URLs) — see §8b.
- **On-demand revalidation** → new articles appear within minutes while pages stay statically cached
  (best SEO + speed). The client's cache-first layer then refreshes lists in the background so a reader
  who is already on the site sees new posts on their next visit/focus without a hard reload.
- **Scheduling is backend-native (Supabase Edge Function cron).** Because the sync logic lives in
  `backend` behind a port, the *trigger* is swappable (Supabase cron now, Vercel Cron, or a FastAPI
  scheduler later) without touching the sync logic itself.

> **Why sync-to-DB instead of fetching Substack RSS on every request?** Rendering directly from RSS
> would be slow, fragile (Substack outages break the site), unindexable per-article, and impossible to
> curate (featuring, category overrides). Syncing into the backend gives stable per-article URLs, SEO,
> fast cached reads, offline support, and operator curation — while still being automatic.

### Article schema (backend table + Zod)

```typescript
// packages/types/article.schema.ts
import { z } from 'zod';

export const ArticleSchema = z.object({
  id: z.string(),                  // stable hash of Substack guid/link
  title: z.string(),
  slug: z.string(),                // URL-safe; immutable after first ingest
  category: z.string(),            // one of the 8 category slugs (auto or manual)
  tags: z.array(z.string()).default([]),
  excerpt: z.string(),
  bodyHtml: z.string(),            // sanitized HTML (Cloudinary-rewritten images)
  coverImage: z.string().url().optional(),  // Cloudinary URL
  publishedAt: z.string(),         // ISO string (serializable across RSC boundary)
  readingTime: z.number().int().positive(),
  substackUrl: z.string().url(),
  featured: z.boolean().default(false),
  categoryLocked: z.boolean().default(false), // true once an editor sets category manually
});

export type Article = z.infer<typeof ArticleSchema>;
```

### Auto-categorization
On ingest, if `categoryLocked` is false, match keywords from `categories.ts` against the title/body to
assign a category; default to a sensible fallback when ambiguous. An editor can override the category
in the Admin Console, which sets `categoryLocked = true` so future syncs never clobber the manual
choice.

### 8b. Substack-Native Article Styling

Articles are authored and published on Substack first; the site mirrors them. Because the content
originates from Substack's editor, the article body should **preserve Substack's original fonts,
typography, spacing, and visual formatting exactly as the author intended** — not be restyled into our
design system's typography.

#### Principle

The article body is the author's voice in visual form. Substack's editor produces styled HTML with
specific fonts, sizes, spacing, and formatting. Overriding these with our own `Prose` component
typography (Lora headings, DM Sans body, custom sizes, drop caps, pull-quote borders) alters the
author's intended reading experience. The correct approach is:

- **Our design system owns the wrapper** — page layout, header banner, breadcrumbs, navigation,
  reading progress, tags, share buttons, related articles, footer — all use our design tokens
  and component library.
- **Substack owns the article body** — the rendered HTML inside the reading column preserves the
  original Substack fonts, sizes, line-heights, spacing, colours, and inline styles exactly as
  they appear on the Substack publication.

#### What this means concretely

1. **Sanitizer (`backend/application/content/sanitize.ts`) preserves Substack styles.** The HTML
   allowlist is extended to pass through Substack-specific CSS classes, `class` attributes on
   elements, and inline `style` attributes that contribute to the article's visual appearance.
   Security-sensitive attributes (scripts, event handlers, dangerous URLs) are still stripped;
   visual styling attributes are kept.

2. **`Prose` component has a `substackNative` mode.** When rendering Substack-sourced article bodies,
   the Prose component applies only layout concerns (max-width container, horizontal centering,
   responsive padding) and does **not** apply any typography overrides — no `font-body`/
   `font-display` classes, no custom `text-[1.0625rem]`, no forced heading sizes, no drop-cap
   rules, no pull-quote borders, no link colour overrides. The Substack HTML's own styles render
   as-is.

3. **Only the reading column layout is ours.** The Prose component in `substackNative` mode sets:
   - `max-w-[720px]` (or the Substack-native reading width) for comfortable line measure
   - `mx-auto` for centering
   - Responsive padding from the shared Container system (`px-5 sm:px-8 lg:px-10`)
   - A basic `text-text` colour reset (so dark mode works — Substack's inline styles may use
     dark text that would be invisible on our dark background)

4. **The page chrome remains our design system.** Breadcrumbs, article title in the header banner,
   category badge, date/reading-time metadata, tag pills, share buttons, "Read on Substack" CTA,
   related articles section — all use our Lora/DM Sans typography and component specs per §4a.

5. **No conflict between our global CSS and Substack styles.** Ensure Tailwind's base/reset layer
   and our `globals.css` token declarations do not cascade into the Substack article body in a way
   that breaks Substack's intended styling. The `substackNative` container acts as a styling
   boundary.

#### Why this is the right approach

- **Author intent is preserved.** The author chose fonts, emphasis, spacing, and formatting on
  Substack. The reader should see exactly what the author wrote.
- **Zero maintenance for article styling.** Substack updates their editor and styles — we don't
  need to chase those changes. Our styling layer is thin and only handles layout.
- **Authenticity.** The article is a Substack publication; rendering it identically to how it
  appears on Substack creates trust and consistency for readers who follow the Substack link.
- **Clear separation of concerns.** Our design system owns the site shell; Substack owns the
  article body. No blurry boundary where both try to style the same elements.

---

## 9. Project Structure (Monorepo: backend + two frontends)

The repository is a **pnpm + Turborepo monorepo** with three deployable units and shared packages.
`frontend/web` and `frontend/admin` are independent Next.js apps; `backend` is the plug-and-play data
& domain layer; `packages/*` is everything shared.

```
master-within/                          # monorepo root (pnpm workspaces + turbo.json)
├── frontend/
│   ├── web/                            # ── CUSTOMER SITE (public) ──────────────────
│   │   ├── app/                        # App Router (routing + composition only)
│   │   │   ├── (marketing)/            # Home, start-here, our-ideal (mdx), about (mdx), contact
│   │   │   ├── wisdom/                 # /wisdom, [category], [category]/[slug]
│   │   │   ├── courses/                # /courses, [slug]
│   │   │   ├── store/                  # /store, cart, order/confirmation
│   │   │   ├── api/                    # revalidate, cron/sync-substack (if Vercel-hosted)
│   │   │   ├── sitemap.ts, robots.ts
│   │   │   ├── layout.tsx              # fonts, providers (QueryClient + persist), nav, footer
│   │   │   ├── not-found.tsx, error.tsx, global-error.tsx
│   │   ├── src/
│   │   │   ├── features/               # wisdom, store, courses, home (components/hooks/queries)
│   │   │   ├── providers/              # QueryProvider (TanStack), ThemeProvider, persist setup
│   │   │   ├── store/                  # Zustand: cartStore.ts, uiStore.ts (UI state only)
│   │   │   └── lib/                    # seo, analytics, search, prefetch helpers, env.ts
│   │   ├── content/                    # MDX (Our Ideal, About) versioned in git
│   │   ├── public/, next.config.ts, tailwind.config.ts (extends preset)
│   │
│   └── admin/                          # ── OPERATOR CONSOLE (separate app, noindex) ──
│       ├── app/                        # /login, /, /books, /ebooks, /courses, /freebies,
│       │   │                           #   /articles, /start-here, /orders, /settings
│       │   ├── actions/                # 'use server' admin mutations (auth-guarded)
│       │   │   ├── books.actions.ts, ebooks.actions.ts, courses.actions.ts,
│       │   │   ├── freebies.actions.ts, articles.actions.ts, settings.actions.ts,
│       │   │   └── session.actions.ts  # login (set cookie) / logout (revoke)
│       │   ├── api/upload-sign/route.ts # Cloudinary signed-upload params (auth-gated)
│       │   ├── layout.tsx              # verifies session + role; renders AdminShell
│       │   ├── loading.tsx, error.tsx
│       ├── middleware.ts               # edge gate: redirect to /login if no session cookie
│       ├── src/
│       │   ├── features/admin/         # AdminShell, AdminSidebar, DataTable, EntityForm,
│       │   │                           #   ImageUploader (Cloudinary), FileUploader (Supabase),
│       │   │                           #   ReorderableList, ConfirmDialog
│       │   └── lib/                    # query setup, env.ts
│       ├── next.config.ts, tailwind.config.ts
│
├── backend/                            # ── PLUG-AND-PLAY BACKEND (clean architecture) ──
│   ├── domain/                         # Pure domain layer — NO framework/IO deps
│   │   ├── entities/                   # Article, Book, Ebook, Course, Freebie, Order, Operator...
│   │   └── ports/                      # Repository INTERFACES (the contract every adapter implements)
│   │       ├── ArticleRepository.ts    #   list / getBySlug / upsert / setFeatured / overrideCategory
│   │       ├── BookRepository.ts, EbookRepository.ts, CourseRepository.ts,
│   │       ├── FreebieRepository.ts, OrderRepository.ts, ContactRepository.ts,
│   │       ├── SiteConfigRepository.ts, StartHereRepository.ts, AuditLogRepository.ts,
│   │       ├── AuthGateway.ts          #   sign-in / verify session / role / revoke
│   │       └── StorageGateway.ts       #   signed upload (images via Cloudinary, files via Supabase)
│   ├── application/                    # Use-cases (orchestration) — depend only on ports
│   │   ├── articles/ (listArticles, getArticle, syncSubstack, featureArticle, ...)
│   │   ├── store/ (listBooks, upsertBook, placeOrder, ...)
│   │   ├── content/ (sanitize.ts, autoCategorize.ts, substackRss.ts) # backend-agnostic
│   │   └── ...                         # one folder per domain area
│   ├── adapters/
│   │   ├── supabase/                   # ── CURRENT adapter: implements every port via Supabase ──
│   │   │   ├── client.ts               # service-role + ssr clients (server-only)
│   │   │   ├── *Repository.supabase.ts # one implementation per port
│   │   │   ├── auth.supabase.ts        # Supabase Auth gateway
│   │   │   └── storage.ts              # Cloudinary (images) + Supabase Storage (files)
│   │   └── http/                       # ── FUTURE adapter: implements the SAME ports via FastAPI ──
│   │       └── *Repository.http.ts     #   typed REST/RPC client; zero domain changes to swap
│   ├── infra/
│   │   └── supabase/                   # migrations/, policies (RLS), functions/ (edge cron), seed/
│   │       └── generated/types.ts      # `supabase gen types` output (DB → TS)
│   └── index.ts                        # COMPOSITION ROOT: reads BACKEND_DRIVER, wires adapter→use-cases,
│                                       #   exports use-cases as the ONLY public surface to frontends
│
├── packages/
│   ├── types/                          # Shared domain types + Zod schemas + categories/start-here consts
│   ├── ui/                             # Design system: tokens, primitives (Radix), UI components
│   ├── config/                         # Shared tsconfig, eslint, prettier, tailwind preset
│   └── utils/                          # slugify, formatters, pure helpers
│
├── tests/                              # cross-cutting e2e (Playwright); unit/component live per-package
├── turbo.json, pnpm-workspace.yaml, package.json
├── .env.example
└── README.md
```

### The plug-and-play guarantee (how the backend swap actually works)

1. **Frontends import use-cases, never a database client.** `frontend/web` and `frontend/admin` call
   `import { listArticles } from '@mw/backend'` — they have no idea whether the data came from Supabase
   or FastAPI. There is an ESLint boundary rule forbidding `@supabase/*` imports outside
   `backend/adapters/supabase`.
2. **Ports are the contract.** Every data operation the app needs is a method on a port interface in
   `backend/domain/ports`. Use-cases in `backend/application` depend only on those interfaces.
3. **Adapters implement the contract.** `adapters/supabase` is the current implementation.
   `adapters/http` (FastAPI) is a future implementation of the *same* interfaces.
4. **One switch.** `backend/index.ts` reads `BACKEND_DRIVER` (`supabase` | `fastapi`) and wires the
   chosen adapter into the use-cases. **Switching backends = write one adapter + flip one env var.** No
   change to domain, use-cases, or either frontend.

**Rule:** app `app/` folders contain routing and composition only. Real logic lives in `backend/*` and
in each app's `src/features/*`. A route file should read like a table of contents.

---

## 10. Commerce — Cart & Checkout (Payment-Ready)

The store launches with WhatsApp checkout but is architected so online payments drop in later without
touching the cart or UI. The volatile part — *how an order is fulfilled* — is hidden behind an
`OrderProvider` interface; persistence goes through the backend `OrderRepository` port.

### 10.1 Order abstraction

```typescript
// packages/types/order.ts  (consumed by frontend + backend)
import type { CartItem } from './cart';

export interface CustomerDetails {
  name: string;
  mobile: string;
  address: { line1: string; line2?: string; city: string; state: string; pin: string };
}

export interface Order {
  items: CartItem[];
  customer: CustomerDetails;
  total: number;
}

export interface OrderResult {
  status: 'redirected' | 'paid' | 'pending';
  reference?: string;   // WhatsApp deep link, payment id, or order id
}

/** Strategy boundary: WhatsApp now, Razorpay/Stripe later — same call site. */
export interface OrderProvider {
  submit(order: Order): Promise<OrderResult>;
}
```

The checkout UI calls `orderProvider.submit(order)` and reacts to `OrderResult`. Swapping providers (or
offering both) never changes the form or cart.

### 10.2 WhatsApp strategy (launch)

```typescript
// frontend/web/src/features/store/whatsapp.ts
import type { Order, OrderProvider } from '@mw/types/order';
import { env } from '@/lib/env';

function buildMessage(order: Order): string {
  const lines = order.items
    .map((it, i) => `${i + 1}. ${it.title} x${it.qty} — ₹${it.price * it.qty}`)
    .join('\n');
  const a = order.customer.address;
  const address = [a.line1, a.line2, a.city, a.state, a.pin].filter(Boolean).join(', ');

  return `Hello Master Within Foundation! 🙏

📦 *New Book Order*

*Books Ordered:*
${lines}

*Total: ₹${order.total}*

*Delivery Details:*
Name: ${order.customer.name}
Mobile: ${order.customer.mobile}
Address: ${address}

Please confirm availability and courier details. Thank you!`;
}

export const whatsAppOrderProvider: OrderProvider = {
  async submit(order) {
    const url = `https://wa.me/${env.WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(order))}`;
    return { status: 'redirected', reference: url };
  },
};
```

### 10.3 Checkout flow

1. Browse books (cover, title, author, price, description).
2. **Add to Cart** → persisted in `localStorage` via Zustand.
3. Navbar cart indicator shows item count.
4. Open cart drawer / cart page → review items, quantities, subtotal.
5. **Proceed to Order** → form: Full Name, Mobile, Address (Line 1/2, City, State, PIN). Validated with Zod + React Hook Form.
6. **Send Order via WhatsApp** → `orderProvider.submit()` returns the deep link; the app opens WhatsApp pre-filled.
7. (Optional, recommended) The order is also written through the backend `placeOrder` use-case for history/analytics — pseudonymous, no login.
8. Cart cleared; confirmation screen shown.

**Payment note shown on page:**
> Payment can be made via QR code / Bank Transfer / GPay / PhonePe to the details we share after
> WhatsApp confirmation.

### 10.4 Cart store (Zustand + persist)

```typescript
// frontend/web/src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '@mw/types/cart';

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          return existing
            ? { items: s.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)) }
            : { items: [...s.items, { ...item, qty: 1 }] };
        }),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((n, i) => n + i.qty, 0),
      totalPrice: () => get().items.reduce((n, i) => n + i.price * i.qty, 0),
    }),
    { name: 'mw-cart', version: 1 },
  ),
);
```

> **Note:** prices used for display come from the cart; the *authoritative* price is re-read from the
> backend at order construction so a stale cart can't misquote a total.

---

## 11. Component Inventory

Grouped by layer (see §4.4). Shared primitives/UI live in `packages/ui`; feature components live in
each app. Names are canonical.

- **Primitives (`packages/ui`):** `Button`, `IconButton`, `Dialog`, `Drawer`, `Tabs`, `Input`, `Textarea`, `Select`, `Badge`, `Spinner`, `Skeleton`.
- **UI (`packages/ui`):** `Card`, `ArticleCard`, `BookCard`, `CourseCard`, `CategoryCard`, `EmptyState`, `Prose` (renders sanitized article HTML in editorial style), `Pagination`, `CldImage` (Cloudinary-backed `next/image`).
- **Layout (web):** `Navbar`, `Footer`, `Container`, `PageHeader`, `Section`.
- **Shared (web):** `ShareButtons`, `ReadingProgress`, `LiteYouTube`, `SeoJsonLd`, `ThemeToggle`, `PrefetchLink` (intent-prefetch wrapper, §12).
- **Wisdom feature (web):** `CategoryGrid`, `ArticleList`, `TagFilter`, `SearchBar`, `RelatedArticles`.
- **Store feature (web):** `CartDrawer`, `CartItem`, `OrderForm`, `CheckoutSummary`, `FreebieList`, `EbookGrid`.
- **Home feature (web):** `HeroSection`, `FeaturedArticles`, `YouTubeSection`, `CourseTeaser`, `StoreTeaser`.
- **Admin feature (admin app):** `AdminShell`, `AdminSidebar`, `LoginForm`, `DataTable` (sortable/searchable/paginated), `EntityForm` (RHF + Zod, schema-driven), `ImageUploader` (cover art → **Cloudinary** signed upload), `FileUploader` (freebie files → **Supabase Storage**), `ReorderableList` (drag-to-set `order`), `PublishToggle`, `ConfirmDialog`, `StatCard`, `ActivityFeed`. Admin components live only in `frontend/admin` and are never imported by public pages.

---

## 12. Data Access & State Strategy (instant, offline-first feel)

This section is where the **desktop-smooth, offline-first** experience is engineered. The model is a
**hybrid**: the server renders SEO-critical HTML and seeds the client cache; from then on, **TanStack
Query** owns client data and makes navigation feel instant.

### 12.1 Read paths

| Data | Where it's read | Caching |
|---|---|---|
| Articles (lists, detail) | Server Components via `@mw/backend` use-cases → **dehydrated into TanStack Query** | ISR; revalidated on sync; client serves cache-first |
| Books / eBooks / freebies / courses | Server Components (use-cases) → dehydrated to client cache | ISR (e.g. revalidate hourly) |
| Search index | Prebuilt JSON generated at build/revalidate, fetched client-side | Static asset, CDN-cached |
| Cart / UI state | Zustand (client, `localStorage`) | Persisted locally |
| Contact / order submit | Server actions → backend use-cases | Not cached; optimistic in UI |

### 12.2 The "desktop feel" mechanics (the core requirement)

1. **Cache-first, revalidate in background (stale-while-revalidate).** Queries have a `staleTime`, so
   returning to a page or **switching browser tabs back** shows cached data *immediately* with no
   spinner, while TanStack Query refetches in the background and swaps in fresh data only if it changed.
   This is the "almost no loading" effect requested.
2. **Prefetch on user intent.** A shared `PrefetchLink` (and card hover handlers) fire on
   **`onMouseEnter`, `onMouseDown`/`onTouchStart`, and `onFocus`** to call
   `queryClient.prefetchQuery(...)` *and* `router.prefetch(href)`. Because the human gap between
   hovering/pressing and the click landing is enough to fetch over a warm CDN, the destination is
   usually already in cache when the navigation resolves — so it opens instantly. Links in the viewport
   are also prefetched via an `IntersectionObserver` (throttled, respects Save-Data).
3. **Offline-first persistence.** The `QueryClient` cache is persisted to **IndexedDB**
   (`persistQueryClient` + an idb persister). On reload or when offline, the app rehydrates from disk
   and renders last-known-good content; a **service worker (Serwist)** caches the app shell and static
   assets so the site loads and reads work without a network. Mutations made offline can be queued and
   replayed on reconnect.
4. **Optimistic updates.** Admin mutations (and any future visitor interactions) update the cache
   optimistically via `onMutate`, roll back on error, and reconcile on settle — the UI never waits on a
   round-trip to feel responsive.
5. **Smart defaults for content.** `refetchOnWindowFocus` is tuned (on for fast-changing lists, off for
   immutable article bodies), `gcTime` is long enough to keep recently-viewed pages warm, and query keys
   are structured (`['articles', filters]`, `['article', slug]`) so prefetch and invalidation are precise.

### 12.3 Hydration boundary (SEO + instant nav together)

Server Components fetch through `@mw/backend` use-cases, write the result into a per-request
`QueryClient`, and pass a **`<HydrationBoundary state={dehydrate(qc)}>`** to the client tree. Result:
crawlers and first paint get full SSR/ISR HTML (no SEO regression), and the client hydrates the *same*
data into TanStack Query — so the very first client navigation is already cache-warm. The backend swap
(Supabase → FastAPI) is invisible here because the use-cases are the same either way (§9).

### 12.4 Search

At launch, a compact index (`{id,title,excerpt,tags,category,slug}`) is generated when articles change
and served as a static asset; the client filters it with Fuse.js — fast, free, no backend. When the
corpus outgrows client search, implement `SearchProvider` with Algolia/Typesense; the `SearchBar` call
site does not change.

### 12.5 Server vs client boundary

Components are Server Components by default. A component becomes a Client Component (`'use client'`)
only when it needs state, effects, browser APIs, or the TanStack Query hooks (lists with client
filters, cart, prefetching, share). Keep client bundles small by pushing interactivity to leaf
components.

### 12.6 Routing-performance regression — root causes & remediation (instant navigation)

The instant-navigation contract in §12.2 was **specified but not honoured in the shipped code**.
Tab-to-tab and card-to-article navigation is slow — often appearing to do nothing for a beat — because
the app is performing **full-page browser reloads instead of client-side soft navigations**, and none
of the prefetch machinery described in §12.2 is actually wired up. The diagnosis below is the source of
truth; the fixes are tracked in **Tasks.md → "Phase 6b — Routing Performance: Instant Navigation"**.

**Why a React (Vite SPA) app felt instant and this does not.** A client-rendered SPA keeps one running
JS runtime and only swaps a view on navigation. Next.js App Router is the same *only when navigation is
a soft client transition* (`next/link` → RSC fetch → React reconcile). The moment a real `<a href>` is
used for an internal route, the browser does a **hard navigation**: it tears down the page, re-downloads
HTML, re-parses and re-executes the entire JS bundle, re-mounts every provider (QueryClient + IndexedDB
restore, ThemeProvider, Framer Motion), and re-hydrates from scratch. That is exactly the multi-hundred-
millisecond "nothing is happening, then a flash" symptom — and it is structural, not network jitter.

**Root cause 1 — design-system cards link with raw `<a href>` (PRIMARY).** `ArticleCard`,
`CourseCard`, and `CategoryCard` in `packages/ui` render `<a href={href}>…</a>`. Every article, course,
and category click is therefore a hard reload. Because `packages/ui` is intentionally framework-agnostic
(it must not import `next/link`), the cards need a **link-component injection point**: an optional
`linkComponent` prop (default `'a'`) that the web app fills with `next/link`'s `Link`. The existing
`anchorProps` escape hatch is the place to attach intent-prefetch handlers once the element is a real
`Link`.

**Root cause 2 — the prefetch layer is dead code.** `PrefetchLink` (`components/shared/PrefetchLink.tsx`)
and the `usePrefetch` hook were built per §12.2 but are **imported nowhere**. No card passes prefetch
handlers through `anchorProps`; no `router.prefetch` / `queryClient.prefetchQuery` ever fires on hover,
focus, touch, or viewport entry. So even after cards become soft links, the destination route and its
data are cold at click time — the human hover-to-click gap that §12.2 relies on is being wasted.

**Root cause 3 — no per-segment `loading.tsx`, so soft navigations have no instant feedback.** Only the
root `app/loading.tsx` exists. Data routes (`/wisdom/[category]`, `/wisdom/[category]/[slug]`, `/store`,
`/courses`, `/courses/[slug]`, `/start-here`) `await` backend use-cases (`listArticles`, `getArticle`,
…) directly in the Server Component. On a soft navigation Next streams the segment, but with no segment
-level `loading.tsx` there is no Suspense fallback, so the UI sits on the *old* page until the server
round-trip to Supabase resolves — reinforcing the "froze, then jumped" feel. Each data segment needs a
skeleton `loading.tsx` so navigation paints instantly and streams content in.

**Root cause 4 — navbar links never warm.** The `Navbar` uses plain `next/link` (correct for soft nav),
but Next only auto-prefetches links **in production builds**; in `next dev` every first visit to a route
also pays an on-demand compile. Tab-to-tab slowness while developing is partly this. It must be measured
on a production build (`next build && next start`) before drawing conclusions, and the nav links should
additionally warm their query data on intent so the destination is cache-hot, not just route-hot.

**Root cause 5 — self-reinforcing provider re-mount.** Because of Root cause 1, every navigation re-runs
`QueryProvider` (including the async IndexedDB `restoreClient`), re-creates the persisted cache, and
re-initialises Framer Motion / theme. None of this should happen on an in-app navigation; it all goes
away once cards are soft links (RC 1) and disappears as a cost the moment hard navigation is eliminated.

**Target behaviour after remediation.** All internal navigation is a soft client transition; route +
query data are prefetched on intent (hover/focus/touch) and on viewport entry (Save-Data respected);
every data segment paints an instant skeleton via `loading.tsx`; returning to a tab shows cached content
with zero spinner and revalidates in the background (§12.2.1). Verified on a **production build**, not
`next dev`.

---

## 13. SEO, Metadata & Structured Data

SEO is a first-class feature because discoverability *is* the product's reach. The client instant-nav
layer (§12) sits **on top of** server rendering and never replaces it.

- **Per-page metadata** via Next.js `generateMetadata` — real `<title>`, description, canonical, and
  OpenGraph/Twitter tags rendered server-side for every route (articles, categories, courses, store).
- **Dynamic OG images** via Next.js `ImageResponse` (title + category on brand background); Cloudinary
  can alternatively render branded OG variants via URL transforms.
- **Structured data (JSON-LD):** `Organization` (site-wide), `Article` + `BreadcrumbList` (articles),
  `Course` (course pages), `Product` (books). Built by `lib/seo`.
- **`sitemap.ts`** generates the sitemap from the backend (all articles, categories, courses, store) at
  build/revalidate. **`robots.ts`** controls crawl rules.
- **Canonical + attribution:** articles canonicalize to the site URL and link to the Substack original.
- **Slugs are immutable**; any change requires a redirect entry in `next.config.ts`.
- **Admin is invisible to search:** the entire `frontend/admin` app sets `robots: { index: false, follow: false }`, is `Disallow`-ed, and is on its own subdomain — it never enters the public sitemap.

### Performance budget (enforced via Lighthouse CI, public app only)

| Metric | Target |
|---|---|
| LCP | < 2.0s (mobile, p75) |
| CLS | < 0.05 |
| INP | < 200ms |
| Initial JS (route) | < 150KB gzipped (TanStack Query + persist adds a small, justified increment) |
| Lighthouse Performance/SEO/Best-Practices/A11y | ≥ 95 each |

Practices: self-hosted fonts via `next/font` (no layout shift), `next/image` with a **Cloudinary loader**
and explicit dimensions + lazy loading, lite YouTube embeds, route-level code splitting, Tailwind
content purging, and minimal client JS.

---

## 14. Accessibility (WCAG 2.2 AA — acceptance criteria)

- Semantic landmarks (`header`, `nav`, `main`, `footer`); one `h1` per page; logical heading order.
- All interactive elements keyboard-operable with visible focus rings; logical tab order.
- Radix primitives for menus/dialogs/tabs to get focus trapping, ARIA, and Esc handling for free.
- Color contrast ≥ 4.5:1 (verified against tokens in both themes).
- All images have meaningful `alt`; decorative images `alt=""`.
- Forms: associated `<label>`s, `aria-describedby` for errors, errors announced via live regions.
- `prefers-reduced-motion` disables non-essential animation.
- Automated checks (`axe`) run in component tests and Playwright E2E.

---

## 15. Configuration, Secrets & Environments

All environment variables are validated once at startup through a Zod schema (each app's
`src/lib/env.ts`, and `backend`'s own `env.ts`); the app **fails fast** with a clear error if a required
variable is missing or malformed. Code reads `env.X`, never `process.env` directly.

```
# ── Backend selection (plug-and-play) ─────────────────────────────────────────
BACKEND_DRIVER=supabase              # supabase | fastapi  → picks the adapter (§9)
BACKEND_API_URL=                     # only when BACKEND_DRIVER=fastapi (the FastAPI service base URL)

# ── Supabase (current backend) ────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # client-safe; only used for the admin login handshake
SUPABASE_SERVICE_ROLE_KEY=           # server-only; used ONLY inside backend/adapters/supabase
SUPABASE_JWT_SECRET=                 # server-only; verify session cookies / role claims

# ── Cloudinary (image storage & delivery) ─────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=                  # server-only (signing uploads)
CLOUDINARY_API_SECRET=               # server-only (signing uploads)
CLOUDINARY_UPLOAD_PRESET=mw_signed   # signed preset for admin uploads

# ── Public business config ────────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=https://masterwithin.org

# ── Server-only (never exposed to client) ─────────────────────────────────────
SUBSTACK_FEED_URL=https://masterwithin.substack.com/feed
WHATSAPP_NUMBER=91XXXXXXXXXX         # international format, no '+'
RESEND_API_KEY=
REVALIDATE_SECRET=                   # protects /api/revalidate
CRON_SECRET=                         # protects sync triggers against public calls

# ── Admin auth (server-only) ──────────────────────────────────────────────────
ADMIN_SESSION_COOKIE_NAME=mw_session # name of the httpOnly session cookie
ADMIN_SESSION_MAX_AGE_DAYS=5         # session cookie lifetime (re-login after expiry)
ADMIN_ALLOWLIST=ops@masterwithin.org # comma-separated emails permitted to hold operator roles
ADMIN_BOOTSTRAP_EMAIL=               # one-time: email granted `admin` role by the seed script
```

> **Note on auth keys:** the `NEXT_PUBLIC_SUPABASE_*` values configure the client used for the *login
> screen only* (to obtain a Supabase session, immediately verified and exchanged into a server-checked
> cookie via `@supabase/ssr`). Self-service signup is **disabled** in Supabase; operators are
> provisioned by the seed script / an existing `admin` (§17.6).

> **Note on the backend swap:** when `BACKEND_DRIVER=fastapi`, the `SUPABASE_*` and `CLOUDINARY_*` keys
> may move into the FastAPI service's environment instead; the frontends only need `BACKEND_API_URL` and
> public config. This is the env-level expression of the plug-and-play boundary (§9).

**Environments:** `production` (custom domains: `masterwithin.org`, `admin.masterwithin.org`),
`preview` (per-PR Vercel deploys with isolated config), `development` (local; `supabase start` for a
local Postgres/Auth/Storage stack). Secrets live in the Vercel/Supabase dashboards and `.env.local`,
never in git. `.env.example` documents every key.

---

## 16. Backend Data Model & Security (Supabase / Postgres)

> This section describes the **current Supabase adapter's** schema. The *domain entities* (§9) are the
> stable contract; this Postgres model is one implementation of it. A FastAPI backend would expose the
> same entities over HTTP and is free to use any storage.

### Tables

| Table | Purpose | Public read | Write |
|---|---|---|---|
| `articles` | Synced Substack posts | yes (RLS `select` public) | service role only |
| `books` | Physical books | yes | service role only |
| `ebooks` | eBook listings | yes | service role only |
| `freebies` | Free downloads (metadata) | yes | service role only |
| `courses` | Course listings | yes | service role only |
| `contacts` | Contact submissions | no | service role only (validated) |
| `orders` | Pseudonymous order records | no | service role only |
| `site_config` | Singleton config row (WhatsApp #, socials, YouTube, featured) | yes | service role only |
| `start_here` | The 4 guided-entry path definitions | yes | service role only |
| `audit_logs` | Append-only record of every admin mutation | no | service role only |

> **Operator identity uses Supabase Auth, not an app table.** Operators are `auth.users` carrying a
> role in `app_metadata.role` (`'admin' | 'editor'`), set server-side via the Supabase Admin API (§17.6).
> An optional `operators` table may mirror non-secret profile/display data for the settings screen.

### Row-Level Security (defense in depth)

**All privileged writes flow exclusively through the service-role client inside the Supabase adapter**,
which bypasses RLS. RLS is the backstop: public content is world-readable; submissions/orders/audit are
invisible to the anon and authenticated client roles. Writes are never allowed from the browser.

```sql
-- Enable RLS on every table
alter table articles      enable row level security;
alter table books         enable row level security;
-- ... (ebooks, freebies, courses, site_config, start_here)
alter table contacts      enable row level security;
alter table orders        enable row level security;
alter table audit_logs    enable row level security;

-- Public content: world-readable, never client-writable (writes via service role only).
create policy "public read"   on articles    for select using (true);
create policy "public read"   on books       for select using (true);
create policy "public read"   on ebooks      for select using (true);
create policy "public read"   on freebies    for select using (true);
create policy "public read"   on courses     for select using (true);
create policy "public read"   on site_config for select using (true);
create policy "public read"   on start_here  for select using (true);
-- (no insert/update/delete policies → denied for anon & authenticated roles)

-- Private: clients can never read or write (service role bypasses RLS for server writes).
-- contacts / orders / audit_logs: intentionally have NO permissive policies.

-- Optional operator profile mirror: readable only by operators.
create policy "operators read self-domain" on operators
  for select using ( (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin','editor') );
```

> Contact/order creation is intentionally not exposed to clients — these go through validated server
> actions using the service-role adapter, eliminating spam-write surface from the browser. The Admin
> Console writes the same way: the operator's *session* authorizes the server action, and the **server**
> performs the write with the service-role client. The browser never writes to the database.

### Row shapes (reference)

```jsonc
// books
{
  "id": "book-1",
  "title": "Book Title",
  "author": "Souvik Ghosh",
  "price": 299,                 // integer, INR
  "cover_image": "https://res.cloudinary.com/<cloud>/image/upload/.../cover.jpg",
  "description": "Short description",
  "pages": 220,
  "available": true,
  "order": 1                    // manual sort weight
}
```

```jsonc
// orders  — written server-side, pseudonymous
{
  "id": "uuid",
  "items": [{ "id": "book-1", "title": "...", "qty": 2, "price": 299 }],
  "total": 598,
  "customer": { "name": "...", "mobile": "...", "address": { /* ... */ } },
  "channel": "whatsapp",
  "created_at": "<ISO>"
}
```

---

## 17. Admin Console, Authentication & Authorization

The Admin Console (`frontend/admin`, a separate app) is the **operator surface** for everything dynamic
on the site: publishing physical books and eBooks, managing courses and freebies, curating articles
(featuring, category overrides, attaching/importing Substack links), editing the four *Start Here*
paths, reviewing orders, and editing site-wide config (WhatsApp number, social links, YouTube, featured
selections). It is a purpose-built, role-secured, accessible UI that writes through the **same backend
use-cases and service-role pattern** the rest of the system trusts.

### 17.1 Design goals (why it's built this way)

| Goal | How it's met |
|---|---|
| **Zero impact on public performance** | Admin is a **separate app** on its own subdomain/chunk. It is fully **dynamic** (never cached/ISR), `noindex`, and ships **zero** admin JS to the public site. The performance budget (§13) is a public-app concern. |
| **Same security model as the rest of the app** | Operators never write to the database directly. The browser authorizes a **server action**; the **server** validates with Zod and writes via the backend service-role adapter — identical to contact/order writes (§16). |
| **Least privilege** | Role-based access (`admin`, `editor`) on the Supabase JWT `app_metadata.role`; every action re-checks the role server-side. No self-service signup. |
| **Instant publish** | Every successful mutation triggers **on-demand ISR revalidation** of exactly the affected public paths, so changes appear in seconds without a redeploy. |
| **Great operator UX** | One consistent shell: searchable/sortable data tables, schema-driven forms with inline validation, drag-to-reorder, image/file uploads with preview, optimistic updates (§12.2), toasts, and explicit confirms for destructive actions. Fully keyboard-accessible (WCAG 2.2 AA, §14). |
| **Auditable** | Every create/update/delete writes an append-only `audit_logs` entry (who, what, when, diff). |

### 17.2 Authentication — server-verified session cookies

```
Operator visits /login (admin app)
  → Supabase Auth signs in (email+password or OAuth) → returns a session (client, ephemeral)
     → POST to session.actions.ts (server action)
        → Server verifies the session + checks email ∈ ADMIN_ALLOWLIST and has a role claim
           → @supabase/ssr sets an httpOnly, Secure, SameSite=Lax session cookie (~5d)
              → client session discarded from JS-reachable storage
                 → all later admin requests authenticate via the cookie, verified server-side
```

**Why server-verified cookies:** they are `httpOnly` (invisible to JS → no XSS token theft), verifiable
in Server Components / middleware / server actions for SSR-correct gating, and **revocable**
server-side (revoke the user's sessions → cookie rejected on next check).

`backend/domain/ports/AuthGateway.ts` defines `signIn`, `verifySession` (returns the typed operator or
null), and `revoke`; the Supabase adapter implements it. Logout clears the cookie and revokes the
user's sessions.

### 17.3 Authorization — RBAC via JWT role claim, enforced in depth

Two roles at launch (extensible): **`admin`** (everything, including managing other operators and site
settings) and **`editor`** (all content CRUD, but not operator management or destructive settings).

Defense in depth — a request must pass **all** layers:

1. **`middleware.ts` (edge, admin app):** a request to any route except `/login` without a session
   cookie is redirected to `/login`. Cheap UX bounce — *not* the security boundary.
2. **`app/layout.tsx` (server):** calls `verifySession()`; no valid session → redirect. Loads the
   operator into context for the shell.
3. **Every server action & admin loader:** calls `requireOperator(role?)` from the auth use-case first.
   This re-verifies the cookie and role on each mutation — the real boundary.
4. **RLS:** the final backstop (§16) — clients can't write regardless.

> Rule: **no admin server action runs a line of logic before `requireOperator()` returns.** Authorization
> is the first statement, not a wrapper that can be forgotten.

### 17.4 Write path (one pattern for every entity)

```
Operator submits EntityForm (RHF + Zod, client)
  → 'use server' action (e.g. books.actions.ts → upsertBook)
     1. requireOperator('editor')                 // authz first, always
     2. parse input with the entity's Zod schema  // reject malformed before any write
     3. call backend use-case (upsertBook) → service-role adapter writes to the DB
     4. writeAuditLog(actor, action, 'book', diff)
     5. revalidatePath('/store') + affected detail paths   // instant publish
     6. return typed ActionResult → toast + optimistic UI settles
```

This mirrors the existing server-write discipline (§12, §16). The form never touches the database; the
client SDK is used **only** for the login handshake. Because step 3 goes through a use-case, the same
admin works unchanged when the backend becomes FastAPI.

### 17.5 What each screen manages

- **Dashboard (`/`):** counts (books, articles, orders), recent activity feed (from `audit_logs`),
  last Substack sync result, quick actions ("Add book", "Sync now").
- **Books / eBooks:** full CRUD. Fields per §16 shape + a `published` toggle (drives `available`),
  **cover upload to Cloudinary**, drag-to-reorder (`order`). eBooks add external store links (Google
  Play Books, Kindle).
- **Courses:** CRUD for title, level, description, "who it's for", "what you'll gain", module outline,
  enrollment CTA.
- **Freebies:** CRUD + **file upload to Supabase Storage** (see 17.7); the stored download URL is saved
  on the freebie row.
- **Articles (curation, not authoring):** articles remain Substack-sourced and are **never hand-created**
  here (§8, §21). Operators may: toggle `featured`; override `category` (sets `categoryLocked = true` so
  future syncs don't clobber it); edit `tags`/`excerpt`; **attach or correct the `substackUrl`**;
  **manually import a single post by Substack URL** (on-demand ingest through the `syncSubstack`
  use-case); and trigger **"Sync now"** (runs the same sync logic as the cron, secret-protected).
- **Start Here:** edit the four guided-entry paths (title, blurb, target tags/category, deeper CTA) →
  `start_here` row. Stays data-driven (§7.4) — no JSX edits.
- **Orders:** read-only, paginated, searchable list + CSV export. No editing (orders are records).
- **Settings:** `admin`-only. Site config (`site_config` singleton): WhatsApp number, social links,
  YouTube channel/video IDs, featured selections. Plus **operator management** — invite/grant/revoke
  roles (17.6).

### 17.6 Operator provisioning (no public signup)

Supabase self-service signup is **disabled**. Operators are created two ways, both server-side via the
Supabase Admin API:

- **Bootstrap:** a one-time `scripts/grant-admin.ts` grants the `admin` role (`app_metadata.role`) to
  `ADMIN_BOOTSTRAP_EMAIL`. Run once at setup.
- **In-app (admin only):** Settings → "Add operator" creates the Auth user (or links an existing one
  whose email is in `ADMIN_ALLOWLIST`) and sets the role claim. Revoking a role clears the claim and
  revokes the user's sessions, ending active sessions.

Claims are read from the verified session on every request, so role changes take effect on the
operator's next action (and immediately for revocation).

### 17.7 Uploads — direct-to-provider, signed

Uploads do **not** stream through the server.

- **Images (covers, article images) → Cloudinary.** `POST /api/upload-sign` (auth-gated) returns a
  **short-lived signature** for the signed `CLOUDINARY_UPLOAD_PRESET`; the browser uploads bytes
  **directly to Cloudinary**, then the resulting secure URL (with transformations) is saved on the
  entity via the normal server action. Covers are served through `CldImage`/`next/image` with explicit
  dimensions (no CLS) and automatic format/quality.
- **Downloadable files (freebie PDFs) → Supabase Storage.** The same endpoint issues a short-lived
  **signed upload URL**; the browser uploads directly, and a signed/public download URL is saved on the
  freebie row. Storage policies permit writes only via signed URLs.

This keeps server functions light and supports large files.

### 17.8 Abuse & hardening

- **Login rate-limiting** (per-IP + per-email) and generic error messages (no account enumeration).
- **Session cookie:** `httpOnly`, `Secure`, `SameSite=Lax`, finite lifetime; rotated on privilege change.
- **CSRF:** Next.js server actions are origin-checked POSTs; the session cookie is `SameSite`.
- **Allowlist gate:** even a valid Supabase user without an allowlisted email + role claim is rejected.
- **Audit log** is append-only and server-only (§16); destructive actions require an explicit confirm.
- **2FA** (TOTP) is a future drop-in via Supabase Auth MFA — the session-cookie boundary doesn't change.

### 17.9 Reference row shapes (admin-managed)

```jsonc
// site_config (singleton row) — server-written, public-readable
{
  "id": "main",
  "whatsapp_number": "919876543210",  // international, no '+'
  "socials": { "youtube": "https://...", "instagram": "https://...", "substack": "https://..." },
  "youtube": { "channel_id": "UC...", "featured_video_ids": ["...", "..."] },
  "featured": { "article_ids": ["..."], "book_ids": ["..."] },
  "updated_at": "<ISO>", "updated_by": "<uid>"
}

// audit_logs — append-only, server-only
{
  "actor_uid": "...", "actor_email": "ops@masterwithin.org",
  "action": "update",                 // create | update | delete | sync | role_grant | role_revoke
  "entity": "book", "entity_id": "book-1",
  "diff": { "price": { "from": 299, "to": 349 } },
  "at": "<ISO>"
}
```

---

## 18. Error Handling, Loading & Resilience

- **Route-level boundaries:** every dynamic segment provides `loading.tsx` (skeletons) and `error.tsx`
  (recoverable error UI). Root `not-found.tsx` and `global-error.tsx` cover the rest.
- **Empty states:** lists (search, category, cart) render a designed `EmptyState`, never a blank page.
- **Graceful content degradation:** if the backend is unreachable at request time, ISR serves the last
  good static render and the client serves its **persisted cache** (§12.3); the sync job retries on its
  next tick.
- **Idempotent + retry-safe sync:** the content job tolerates partial failures and re-runs cleanly.
- **Input validation everywhere:** every server action/use-case validates with Zod before doing work.
- **Sanitization:** all third-party HTML (Substack) is sanitized against an allowlist on ingest.
- **Abuse protection:** contact/order endpoints use a honeypot field + per-IP rate limiting; cron and
  revalidate endpoints require a secret header.

---

## 19. Observability & Analytics

- **Product analytics** behind an `analytics()` wrapper (provider-agnostic): page views, key funnel
  events (`article_read`, `add_to_cart`, `checkout_started`, `order_sent`). Consent-aware; no PII.
- **Web Vitals** reported from the client to the analytics sink to track real-user LCP/CLS/INP.
- **Error monitoring** via Sentry (or equivalent) on both server and client, wired into the error
  boundaries.
- **Sync health:** the sync function logs counts (fetched / new / updated / skipped) for each run.

---

## 20. Testing Strategy

| Level | Tool | Scope |
|---|---|---|
| Unit | Vitest | Pure logic: WhatsApp message builder, auto-categorizer, cart math, Zod schemas, slugify, `requireOperator` role logic, audit-diff builder, **backend use-cases against an in-memory adapter**. |
| Component | Vitest + React Testing Library + `axe` | UI behavior + accessibility for cards, forms, cart drawer, admin `EntityForm`/`DataTable`, prefetch/hydration behavior. |
| E2E | Playwright | Critical journeys: browse → article; add to cart → order via WhatsApp; contact submit; search/filter; **offline reload still reads cached content**. **Admin:** login → create/edit/publish a book → it appears on `/store`; unauthenticated admin routes redirect to login; `editor` is denied operator-management. |
| Contract | Vitest | **Every backend adapter is run against a shared port-contract test suite**, so the Supabase adapter (and a future FastAPI adapter) are proven interchangeable. |
| Quality gates | ESLint, Prettier, `tsc --noEmit`, Lighthouse CI | Run per-app via Turborepo on every PR; block merge on failure. |

**Definition of done:** typed, validated at boundaries, accessible, within performance budget, covered
by tests appropriate to its risk, and reflected in this document if it changes architecture.

---

## 21. CI/CD & Deployment

**Division of labor:** **GitHub Actions** owns the *quality gates* and the *Supabase side* (DB
migrations, type generation, Edge Function deploys). **Vercel's native Git integration** owns the
*frontend build & host* (per-PR preview deploys, production promote on merge, immutable rollbacks).
Neither re-implements the other: Actions never `vercel deploy` the apps, and Vercel never touches the
database. This keeps the pipeline simple and each tool in its strength.

- **Hosts:** Vercel hosts both frontends (`frontend/web` → `masterwithin.org`; `frontend/admin` →
  `admin.masterwithin.org`); Supabase hosts the database, Auth, Storage, and Edge Functions. Every PR →
  isolated Vercel preview deploys (one per app).
- **Monorepo builds:** Turborepo's task graph builds/tests only affected packages; **remote caching**
  (`TURBO_TOKEN`/`TURBO_TEAM`) is shared between GitHub Actions and Vercel so a hash built in CI is
  reused by the Vercel build.
- **Branch strategy:** `main` (production) + `feature/*` (work) → PR → merge to `main`. Vercel maps
  `main` → production domains; every `feature/*` PR gets an ephemeral Vercel preview. There is a
  **single Supabase project** (production); migrations apply on merge to `main`. (A staging
  branch/project can be added later without changing the workflow shape — see §21.5.)

### 21.1 Pipeline at a glance

```text
PR opened / pushed ─────────────────────────────────────────────────────────
  GitHub Actions  → ci.yml: typecheck · lint · unit+component+contract · build
                            · Playwright smoke · Lighthouse CI (web)   [required checks]
  Vercel (Git)    → preview deploy of web + admin  (comment with URLs)

Merge to main ──────────────────────────────────────────────────────────────
  GitHub Actions  → db-migrate.yml: supabase db push · gen-types drift · deploy functions
  Vercel (Git)    → production deploy (immutable; one-click rollback)
```

> **Ordering note:** migrations run on merge *in parallel* with the Vercel build. Because every change
> is **backward-compatible by policy** (expand-then-contract: add columns/tables before code uses them,
> remove only after deploys stop referencing them), the order of the two is safe. Breaking schema
> changes are split across two PRs.

### 21.2 CI gate — `.github/workflows/ci.yml`

Runs on every PR; all jobs are **required status checks** to merge. Uses pnpm + Turborepo affected
builds with remote caching.

```yaml
name: CI
on:
  pull_request:
    branches: [main]

concurrency:                      # cancel superseded runs on the same PR
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }          # full history → turbo affected diff
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile

      - name: Type-check
        run: pnpm turbo run typecheck
      - name: Lint
        run: pnpm turbo run lint
      - name: Unit + component + adapter-contract tests
        run: pnpm turbo run test
      - name: Build (all apps/packages)
        run: pnpm turbo run build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - name: Playwright smoke (critical journeys)
        run: pnpm turbo run test:e2e

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - name: Lighthouse CI (web app only — §13 budget)
        run: pnpm dlx @lhci/cli autorun --collect.startServerCommand="pnpm --filter web start"
```

### 21.3 Database & functions — `.github/workflows/db-migrate.yml`

Applies Supabase migrations and deploys Edge Functions **after** merge to `main`, against the single
production project. Uses the Supabase CLI authenticated by `SUPABASE_ACCESS_TOKEN` (a personal/CI access
token), with the project ref and DB password from the `production` environment's secrets.

```yaml
name: DB & Functions
on:
  push:
    branches: [main]
    paths:                                 # only run when backend infra changes
      - 'backend/infra/supabase/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: production
    env:
      SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
        with: { version: latest }

      - name: Link project
        run: supabase link --project-ref "${{ secrets.SUPABASE_PROJECT_REF }}"

      - name: Apply migrations
        run: supabase db push                # runs backend/infra/supabase/migrations
        env:
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}

      - name: Verify generated types are in sync (drift check)
        run: |
          supabase gen types typescript --linked \
            > backend/infra/supabase/generated/types.ts
          git diff --exit-code backend/infra/supabase/generated/types.ts \
            || (echo "::error::generated/types.ts is stale — run 'pnpm db:types' and commit" && exit 1)

      - name: Deploy Edge Functions (incl. syncSubstack cron)
        run: supabase functions deploy --project-ref "${{ secrets.SUPABASE_PROJECT_REF }}"
```

> The **drift check** keeps `generated/types.ts` honest: if a migration changed the schema but the
> committed types weren't regenerated, the job fails. Locally, `pnpm db:types` regenerates them.

### 21.4 Secrets & variables (GitHub → environments)

Stored under a single `production` **GitHub Environment** (so deploys can be protected with required
reviewers if desired), plus repo-level secrets/vars for shared values. **No app secret is duplicated
into Vercel by Actions** — Vercel holds its own copy of the runtime env (§15); Actions only hold what
the CLI/tests need.

| Scope | Key | Used by |
|---|---|---|
| repo secret | `TURBO_TOKEN` | Turborepo remote cache (CI + Vercel) |
| repo var | `TURBO_TEAM` | Turborepo remote cache |
| env secret | `SUPABASE_ACCESS_TOKEN` | Supabase CLI auth (migrate/deploy) |
| env secret | `SUPABASE_PROJECT_REF` | which Supabase project (prod vs staging) |
| env secret | `SUPABASE_DB_PASSWORD` | `supabase db push` |
| Vercel dashboard | runtime env (§15) | the deployed apps at request time |

- **DB migrations:** Supabase migrations in `backend/infra/supabase/migrations` are applied via
  `db-migrate.yml` on merge; the drift check keeps `generated/types.ts` in sync.
- **Content sync:** Supabase Edge Function cron runs `syncSubstack` hourly (or Vercel Cron hits
  `/api/cron/sync-substack`), secret-protected. The function is (re)deployed by §21.3.
- **On-demand revalidation:** `/api/revalidate` (secret-protected) regenerates affected pages when
  content changes, so publishing is near-instant without a redeploy.
- **Rollbacks:** Vercel immutable deployments allow instant rollback to any previous build; DB
  migrations are forward-fixed (roll *forward* with a new migration, never destructively down in prod).

### 21.5 Adding a staging environment later (optional)

The single-environment setup scales up without reshaping the workflows: add a `develop` branch, a second
Supabase project, and a `staging` GitHub Environment, then (a) add `develop` to the `ci.yml` and
`db-migrate.yml` branch lists, (b) restore the per-branch `environment:` selector
(`github.ref_name == 'main' && 'production' || 'staging'`), and (c) point Vercel's `develop` branch at a
staging alias. No job logic changes — only the branch/environment mapping.

---

## 22. Content Operations (Non-Engineer Workflow)

Operators do everything through the **Admin Console (§17)** at `admin.masterwithin.org` — no database
console and no developer required for day-to-day content.

- **Articles** — write/publish on Substack; the hourly sync ingests them automatically and they appear
  on the site dynamically. In Admin → Articles, an operator can feature an article, override its
  category (locks it against future syncs), edit tags/excerpt, attach/correct the Substack link, import
  a single post by URL, or hit **"Sync now"**. Articles are never hand-created.
- **Books / eBooks / courses / freebies** — full CRUD in the Admin Console: create, edit, set price,
  publish/unpublish, drag-to-reorder, **upload covers to Cloudinary**, and (freebies) upload the
  downloadable file to Supabase Storage. Changes publish to the live site within seconds via on-demand
  revalidation.
- **Site config** — WhatsApp number, social/Substack links, YouTube channel & featured videos, and
  featured book/article selections are edited in Admin → Settings (`admin` role).
- **Operators** — invited and role-managed in Admin → Settings by an `admin`; no public signup (§17.6).
- **Editorial pages** (*Our Ideal*, *About*) — remain long-form MDX in `frontend/web/content/`,
  authored/reviewed via PR (deliberately code-versioned, not console-edited).

---

## 23. Extensibility Roadmap (How Each Future Feature Slots In)

The architecture is designed so each of these is additive, not invasive:

| Future feature | How it slots in |
|---|---|
| **Swap Supabase → FastAPI backend** | Implement `backend/adapters/http` against the existing ports; point `BACKEND_API_URL` at the FastAPI service; set `BACKEND_DRIVER=fastapi`. Domain, use-cases, and **both frontends are unchanged** (§9). |
| Online payment for books | Implement a payment strategy against the `OrderProvider` interface; checkout UI unchanged. |
| Full-text search at scale | Implement `SearchProvider` with Algolia/Typesense (or Postgres FTS); `SearchBar` call site unchanged. |
| Operator 2FA | Enable TOTP/MFA in Supabase Auth; the session-cookie boundary (§17.2) is unchanged. |
| More granular roles | Extend the `role` claim + `requireOperator` checks (§17.3); no structural change. |
| User accounts + course progress | Reuse the Supabase Auth foundation already in place for admin; courses are structured to attach progress state. |
| Newsletter signup | Substack embed or provider behind the existing analytics/email wrappers. |
| Multi-language (Bengali) | Adopt `next-intl`; routing already segment-based and content data-driven. |
| Blog comments | Add a comments provider component to the article template; isolated, opt-in. |
| Dark mode | Already a token override + `ThemeToggle`; flip on when ready. |
| Full PWA / installable | Persistence + service worker (§12) already in place; add a manifest and install prompt. |

---

## 24. Naming & Coding Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `ArticleCard.tsx` |
| Hooks | camelCase, `use` prefix | `useCart.ts`, `useArticleQuery.ts` |
| Zustand stores | camelCase, `Store` suffix | `cartStore.ts` |
| Types/interfaces | PascalCase | `Article`, `CartItem`, `OrderProvider` |
| Ports (interfaces) | PascalCase + `Repository`/`Gateway` | `ArticleRepository`, `AuthGateway` |
| Adapters | `<Port>.<driver>.ts` | `ArticleRepository.supabase.ts`, `ArticleRepository.http.ts` |
| Use-cases | camelCase verb phrase | `listArticles`, `syncSubstack`, `placeOrder` |
| Zod schemas | PascalCase + `Schema` | `ArticleSchema` |
| Constants | SCREAMING_SNAKE_CASE | `WHATSAPP_NUMBER` |
| Routes / slugs | kebab-case | `/wisdom/source-code` |
| DB tables/columns | snake_case | `site_config`, `cover_image` |
| Workspace packages | `@mw/<name>` | `@mw/backend`, `@mw/ui`, `@mw/types` |
| Server-only modules | inside `backend/adapters/*`, never imported into Client Components | `adapters/supabase/client.ts` |

Additional rules:
- Strict TypeScript; no `any` (use `unknown` + narrowing).
- Imports use workspace aliases (`@mw/*`) and per-app `@/`; no deep relative chains.
- A module crosses a layer boundary only downward (§4.4); the domain depends on nothing outward.
- **Frontends never import `@supabase/*` or `cloudinary` SDKs directly** — only via `@mw/backend`
  use-cases (enforced by an ESLint boundary rule). This is the plug-and-play guarantee in code.
- Every external value is validated before use; no unchecked `process.env`, RSS, or form data.

---

## 25. Quick Start

```bash
# Install (monorepo)
git clone <repo-url> master-within && cd master-within
pnpm install

# Configure
cp .env.example .env.local          # fill Supabase, Cloudinary, WhatsApp number, secrets, BACKEND_DRIVER

# Local backend (Supabase: Postgres + Auth + Storage)
pnpm supabase start                 # spins up local stack
pnpm db:migrate && pnpm db:seed     # apply migrations + seed (incl. bootstrap admin)

# Develop (Turborepo runs the apps you ask for)
pnpm dev                            # all apps
pnpm dev --filter web               # customer site only
pnpm dev --filter admin             # admin console only

# Quality (per-app via turbo)
pnpm typecheck                      # tsc --noEmit across the graph
pnpm lint
pnpm test                           # Vitest (incl. adapter-contract suite)
pnpm test:e2e                       # Playwright

# Build / preview
pnpm build && pnpm start
```

---

## 26. Developer Handoff Notes

1. **Monorepo, three units.** `frontend/web` (customer), `frontend/admin` (operator console), and
   `backend` (data + domain) are independent and share code only via `packages/*`. Admin ships **no** JS
   to the public site.
2. **The backend is plug-and-play.** Frontends import use-cases from `@mw/backend`, never a DB client.
   To swap Supabase → FastAPI: implement `backend/adapters/http`, set `BACKEND_API_URL`, flip
   `BACKEND_DRIVER=fastapi`. Domain, use-cases, and both frontends stay the same (§9, §23).
3. **WhatsApp number** lives in `WHATSAPP_NUMBER` (server) in international format without `+` (e.g.
   `919876543210`). The deep link is built server-side via the `OrderProvider`.
4. **Substack feed URL** is configured via `SUBSTACK_FEED_URL`; sync logic lives in
   `backend/application/content` behind a use-case and is trigger-agnostic (Supabase Edge cron now,
   Vercel Cron or a FastAPI scheduler later). New posts appear on the site automatically (§8).
5. **Category mapping** for auto-import lives in `packages/types/categories.ts`. Manual overrides via
   Admin → Articles set `categoryLocked = true` and survive future syncs.
6. **All article content** flows from Substack via the sync use-case — never hand-create article rows.
   Operators *curate* (feature, recategorize, import-by-URL, "Sync now") in Admin, but don't author
   articles there.
7. **Privileged writes** (content, contacts, orders, config) go through validated server actions →
   backend use-cases → the **service-role adapter**; clients — even logged-in operators — never write to
   the database directly.
8. **Visitors are anonymous; operators authenticate.** The Admin Console uses **Supabase Auth** +
   server-verified session cookies + role-claim RBAC (`admin`/`editor`). Self-service signup is
   disabled; bootstrap the first `admin` with `scripts/grant-admin.ts` (`ADMIN_BOOTSTRAP_EMAIL`).
9. **Every admin server action calls `requireOperator()` first** (authz before logic) and ends by
   triggering on-demand revalidation of the affected public paths so edits go live in seconds.
10. **Images go to Cloudinary; downloadable files go to Supabase Storage.** Uploads are direct-to-provider
    via signed params/URLs issued by `/api/upload-sign` (auth-gated); covers render via `CldImage`/
    `next/image` with explicit dimensions (no CLS) — §17.7.
11. **The client is offline-first and instant-feel.** TanStack Query serves data cache-first, prefetches
    on hover/mouse-down/focus/in-viewport, persists to IndexedDB, and does optimistic updates — on top of
    SSR/ISR for SEO. Don't bypass it with ad-hoc `fetch` in client components (§12).
12. **Cart** persists in `localStorage` under `mw-cart`; the authoritative price is re-read from the
    backend when an order is built.
13. **Secrets** never enter git. `cron` and `revalidate` endpoints require their secret headers; admin
    endpoints/actions require a valid operator session.
14. **Accessibility and the performance budget (§13–14) are merge-blocking**, enforced in CI; admin
    screens must meet WCAG 2.2 AA (§14) even though they're exempt from the public perf budget.
15. **This document is the source of truth.** Any architectural change must update it in the same PR.
