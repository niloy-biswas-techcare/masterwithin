-- Master Within Foundation Database Schema Migration

-- 1. articles table
create table public.articles (
  id text primary key,
  title text not null,
  slug text not null unique,
  category text not null check (category in (
    'science-of-consciousness',
    'optimal-living',
    'conscious-relationships',
    'self-actualization',
    'holistic-wealth',
    'bio-vitality',
    'systems-of-peace',
    'source-code'
  )),
  tags text[] not null default '{}'::text[],
  excerpt text not null,
  body_html text not null,
  cover_image text,
  published_at timestamp with time zone not null,
  reading_time integer not null,
  substack_url text not null,
  featured boolean not null default false,
  category_locked boolean not null default false
);

-- 2. books table
create table public.books (
  id text primary key,
  title text not null,
  author text not null,
  price integer not null,
  cover_image text not null,
  description text not null,
  pages integer,
  available boolean not null default true,
  "order" integer not null default 0
);

-- 3. ebooks table
create table public.ebooks (
  id text primary key,
  title text not null,
  author text not null,
  price integer,
  cover_image text not null,
  description text not null,
  play_store_url text,
  kindle_url text,
  available boolean not null default true,
  "order" integer not null default 0
);

-- 4. freebies table
create table public.freebies (
  id text primary key,
  title text not null,
  description text not null,
  file_url text not null,
  cover_image text,
  "order" integer not null default 0,
  published boolean not null default false
);

-- 5. courses table
create table public.courses (
  id text primary key,
  slug text not null unique,
  title text not null,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  description text not null,
  who_its_for text not null,
  what_youll_gain text not null,
  module_outline jsonb not null default '[]'::jsonb,
  enrollment_cta_label text not null,
  enrollment_cta_url text not null,
  cover_image text,
  "order" integer not null default 0,
  published boolean not null default false
);

-- 6. contacts table
create table public.contacts (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- 7. orders table
create table public.orders (
  id text primary key default gen_random_uuid()::text,
  items jsonb not null default '[]'::jsonb,
  customer jsonb not null,
  total integer not null,
  channel text not null default 'whatsapp',
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- 8. site_config table
create table public.site_config (
  id text primary key check (id = 'main'),
  whatsapp_number text not null,
  socials jsonb not null default '{}'::jsonb,
  youtube jsonb not null default '{}'::jsonb,
  featured jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  updated_by text
);

-- 9. start_here table
create table public.start_here (
  id text primary key,
  title text not null,
  blurb text not null,
  target_tags text[] not null default '{}'::text[],
  target_category text,
  deeper_cta_label text not null,
  deeper_cta_href text not null,
  "order" integer not null default 0
);

-- 10. audit_logs table
create table public.audit_logs (
  id text primary key default gen_random_uuid()::text,
  actor_uid text not null,
  actor_email text not null,
  action text not null check (action in ('create', 'update', 'delete', 'sync', 'role_grant', 'role_revoke')),
  entity text not null,
  entity_id text not null,
  diff jsonb not null default '{}'::jsonb,
  at timestamp with time zone not null default timezone('utc'::text, now())
);

-- Enable RLS on every table
alter table public.articles enable row level security;
alter table public.books enable row level security;
alter table public.ebooks enable row level security;
alter table public.freebies enable row level security;
alter table public.courses enable row level security;
alter table public.contacts enable row level security;
alter table public.orders enable row level security;
alter table public.site_config enable row level security;
alter table public.start_here enable row level security;
alter table public.audit_logs enable row level security;

-- Public read policies on public-content tables
create policy "public read articles" on public.articles for select using (true);
create policy "public read books" on public.books for select using (true);
create policy "public read ebooks" on public.ebooks for select using (true);
create policy "public read freebies" on public.freebies for select using (true);
create policy "public read courses" on public.courses for select using (true);
create policy "public read site_config" on public.site_config for select using (true);
create policy "public read start_here" on public.start_here for select using (true);

-- No insert/update/delete policies on public content (write is service-role only, which bypasses RLS)
-- Private tables (contacts, orders, audit_logs) have RLS enabled and NO policies (only service role writes and reads)

-- Create indexes for performance
create index idx_articles_slug on public.articles(slug);
create index idx_articles_published_at on public.articles(published_at desc);
create index idx_articles_category on public.articles(category);
create index idx_articles_featured on public.articles(featured) where featured = true;
create index idx_articles_tags on public.articles using gin (tags);

create index idx_books_order on public.books("order" asc);
create index idx_ebooks_order on public.ebooks("order" asc);
create index idx_freebies_order on public.freebies("order" asc);
create index idx_courses_order on public.courses("order" asc);
create index idx_start_here_order on public.start_here("order" asc);

create index idx_contacts_created_at on public.contacts(created_at desc);
create index idx_orders_created_at on public.orders(created_at desc);
create index idx_audit_logs_at on public.audit_logs(at desc);
