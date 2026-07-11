-- Lolla 2026 Website — Foundation schema (multi-tenant / multi-festival from day one)
-- Source: 2026-07-09_lolla-accounts-migration-plan.md, Phase 1
-- Applied via `supabase db push` or pasted into the Supabase SQL editor.
--
-- Design notes:
--   * Multi-tenant: every artist/schedule row hangs off `festival_id`, even though only
--     Lollapalooza 2026 launches — see plan Decision #3.
--   * `artist_genres` replaces the old single-string `g` field on artists.js with a
--     proper many-to-many table (an artist can carry multiple subgenres).
--   * RLS: four separate policies per user-scoped table (select/insert/update/delete),
--     no `for all`, per Supabase's current best-practice guidance (see plan Appendix).
--   * Auth calls are wrapped in `(select auth.uid())` rather than bare `auth.uid()` —
--     this lets Postgres cache the value per-statement instead of re-evaluating per-row.

-- ============================================================================
-- festivals — the multi-tenant root
-- ============================================================================
create table festivals (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  year        integer not null,
  location    text,
  start_date  date,
  end_date    date,
  created_at  timestamptz not null default now()
);

comment on table festivals is 'One row per festival edition. Only Lollapalooza 2026 launches; schema supports more.';

-- ============================================================================
-- artists — one row per artist per festival (an artist playing two festivals
-- in the schema gets two rows, each with its own tier/day/popularity, since
-- those are festival-specific, not artist-global facts)
-- ============================================================================
create table artists (
  id            uuid primary key default gen_random_uuid(),
  festival_id   uuid not null references festivals(id) on delete cascade,
  slug          text not null,                 -- stable identifier, derived from name; anchors favorites matching (see Phase 5 of source plan)
  name          text not null,                 -- artists.js: n
  tier          text not null,                 -- artists.js: t  (headliner | major | undercard)
  day           integer not null,              -- artists.js: d  (1-4)
  popularity    integer,                       -- artists.js: p
  description   text,                          -- artists.js: desc
  spotify_url   text,                          -- artists.js: sp
  apple_url     text,                          -- artists.js: am
  youtube_url   text,                          -- artists.js: yt
  created_at    timestamptz not null default now(),

  unique (festival_id, slug),
  constraint artists_tier_check check (tier in ('headliner', 'major', 'undercard'))
);

create index artists_festival_id_idx on artists(festival_id);

comment on table artists is 'Migrated from artists.js. tier/day/popularity are festival-scoped facts, not artist-global.';

-- ============================================================================
-- artist_genres — many-to-many, replaces artists.js's single-string `g` field
-- ============================================================================
create table artist_genres (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references artists(id) on delete cascade,
  genre       text not null,
  is_primary  boolean not null default false,
  source      text,                            -- e.g. 'musicbrainz:<mbid>' or 'lastfm:<tag>', per Phase 2's citation requirement
  created_at  timestamptz not null default now(),

  unique (artist_id, genre)
);

create index artist_genres_artist_id_idx on artist_genres(artist_id);

comment on table artist_genres is 'Replaces artists.js single-string g. Each row cites its source per Phase 2 verification checklist.';

-- ============================================================================
-- user_favorites — starred artists (per user)
-- ============================================================================
create table user_favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  artist_id   uuid not null references artists(id) on delete cascade,
  created_at  timestamptz not null default now(),

  unique (user_id, artist_id)
);

create index user_favorites_user_id_idx on user_favorites(user_id);

-- ============================================================================
-- user_schedules — multiple named schedules per user, per festival day
-- ============================================================================
create table user_schedules (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  festival_id   uuid not null references festivals(id) on delete cascade,
  day           integer not null,
  name          text not null,
  created_at    timestamptz not null default now()
);

create index user_schedules_user_id_idx on user_schedules(user_id);

comment on table user_schedules is 'Supports multiple named schedules per day per user (source plan Phase 6 requirement).';

-- ============================================================================
-- schedule_artists — artists placed on a given schedule
-- ============================================================================
create table schedule_artists (
  id            uuid primary key default gen_random_uuid(),
  schedule_id   uuid not null references user_schedules(id) on delete cascade,
  artist_id     uuid not null references artists(id) on delete cascade,
  added_at      timestamptz not null default now(),

  unique (schedule_id, artist_id)
);

create index schedule_artists_schedule_id_idx on schedule_artists(schedule_id);

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- Public-read tables: festivals, artists, artist_genres. No user data, safe to
-- expose to anon + authenticated. RLS is still enabled (Supabase requires it
-- for any table exposed via the API) but the policy is permissive read-only.
alter table festivals enable row level security;
alter table artists enable row level security;
alter table artist_genres enable row level security;

create policy "public read festivals" on festivals
  for select to anon, authenticated
  using ( true );

create policy "public read artists" on artists
  for select to anon, authenticated
  using ( true );

create policy "public read artist_genres" on artist_genres
  for select to anon, authenticated
  using ( true );

-- No insert/update/delete policies on these three for any client role —
-- writes happen only via the seed scripts / service role, never from the app.

-- user_favorites — strictly owner-scoped, four separate policies
alter table user_favorites enable row level security;

create policy "select own favorites" on user_favorites
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "insert own favorites" on user_favorites
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "update own favorites" on user_favorites
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "delete own favorites" on user_favorites
  for delete to authenticated
  using ( (select auth.uid()) = user_id );

-- user_schedules — strictly owner-scoped, four separate policies
alter table user_schedules enable row level security;

create policy "select own schedules" on user_schedules
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "insert own schedules" on user_schedules
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "update own schedules" on user_schedules
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "delete own schedules" on user_schedules
  for delete to authenticated
  using ( (select auth.uid()) = user_id );

-- schedule_artists — owner-scoped via a join to user_schedules, since this
-- table has no direct user_id column. Four separate policies, same pattern.
alter table schedule_artists enable row level security;

create policy "select own schedule_artists" on schedule_artists
  for select to authenticated
  using (
    exists (
      select 1 from user_schedules s
      where s.id = schedule_artists.schedule_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "insert own schedule_artists" on schedule_artists
  for insert to authenticated
  with check (
    exists (
      select 1 from user_schedules s
      where s.id = schedule_artists.schedule_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "update own schedule_artists" on schedule_artists
  for update to authenticated
  using (
    exists (
      select 1 from user_schedules s
      where s.id = schedule_artists.schedule_id
        and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from user_schedules s
      where s.id = schedule_artists.schedule_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "delete own schedule_artists" on schedule_artists
  for delete to authenticated
  using (
    exists (
      select 1 from user_schedules s
      where s.id = schedule_artists.schedule_id
        and s.user_id = (select auth.uid())
    )
  );
