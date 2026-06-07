-- Phase 6d: YouTube Media Library — videos and playlists tables (§16, §8c)

-- videos table
create table if not exists videos (
  id             text primary key,                    -- YouTube video ID (stable)
  title          text not null,
  description    text not null default '',
  thumbnail      text not null,                       -- Cloudinary URL
  duration       integer not null check (duration >= 0), -- seconds
  published_at   timestamptz not null,
  channel_id     text not null,
  language       text not null check (language in ('en', 'bn', 'hi')),
  category       text not null,
  category_locked boolean not null default false,
  playlist_ids   text[] not null default '{}',
  featured       boolean not null default false,
  hidden         boolean not null default false,
  is_short       boolean not null default false,      -- duration < 60 seconds
  youtube_url    text not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- playlists table
create table if not exists playlists (
  id             text primary key,                    -- YouTube playlist ID
  title          text not null,
  description    text not null default '',
  thumbnail      text not null,                       -- Cloudinary URL
  video_count    integer not null default 0,
  channel_id     text not null,
  language       text not null check (language in ('en', 'bn', 'hi')),
  published_at   timestamptz not null,
  featured       boolean not null default false,
  hidden         boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Indexes for list queries (§16)
create index if not exists videos_channel_id_idx     on videos (channel_id);
create index if not exists videos_category_idx       on videos (category);
create index if not exists videos_language_idx       on videos (language);
create index if not exists videos_featured_idx       on videos (featured);
create index if not exists videos_is_short_idx       on videos (is_short);
create index if not exists videos_hidden_idx         on videos (hidden);
create index if not exists videos_published_at_idx   on videos (published_at desc);
create index if not exists playlists_language_idx    on playlists (language);
create index if not exists playlists_featured_idx    on playlists (featured);

-- Enable RLS (§3.2)
alter table videos   enable row level security;
alter table playlists enable row level security;

-- Public read (non-hidden rows only); all writes via service role (§3.2, §16)
create policy "public read non-hidden videos"
  on videos for select
  using (hidden = false);

create policy "public read non-hidden playlists"
  on playlists for select
  using (hidden = false);
