# Lolla 2026 Website — Accounts, Multi-Festival Schema & Genre Audit
**Plan date:** 2026-07-09 | **Author:** Cowork planning session | **For execution in:** Claude Code (`do` skill, subagents encouraged for Phases 2 and 3 in parallel)

## Decisions confirmed with Jacob (2026-07-09)
1. **Stack:** Supabase (Auth + Postgres) + Vercel + Next.js. This is a deliberate migration off the current framework-free static HTML/Cloudflare Pages setup — see Risk Register below for what that costs.
2. **Genre audit:** Automated pull (MusicBrainz + Last.fm) with Claude doing best-guess research/synthesis per artist; Jacob spot-checks later rather than reviewing all 172 upfront.
3. **Schema scope:** Build multi-tenant (multi-festival) from day one, even though only Lollapalooza 2026 launches.
4. **Sequencing:** Genre audit and auth/accounts build run as parallel phases; use subagents in Claude Code to work them concurrently.

## Confirmed facts (sources checked 2026-07-09, do not re-derive from training data — verify again at implementation time since these products change fast)
- Supabase built-in email provider: **2 emails/hour project-wide** (signup confirm, password reset, magic link). Must configure custom SMTP (Resend/SendGrid) before any real launch traffic, or launch OAuth-only. OTP defaults to 30/hour, customizable. Source: supabase.com/docs/guides/auth/rate-limits.
- OAuth sign-in (Google, etc.) is not subject to the email cap — make it the primary sign-in method.
- Vercel Hobby (free) plan ToS: personal/non-commercial use only. This site runs AdSense site-wide already → commercial use → **requires Vercel Pro, $20/mo/seat**, not Hobby. Source: vercel.com/docs/limits, vercel.com/pricing.
- Spotify Web API `genres` field on artist objects has been unreliable/incomplete since ~March 2025, with further endpoint deprecations in the Feb/March 2026 changelogs. Do not use it as sole genre source.
- Current codebase (verified by reading files, 2026-07-09):
  - `artists.js`: 192 lines, `window.ARTISTS` array, one object per artist, single-string genre field `g`, no cited data source.
  - `favorites.js`: vanilla JS, localStorage key `lolla-my-lineup-v1`, stores an array of artist name strings (not IDs), validated as array-of-strings on read. Wires any `.star-toggle` button site-wide via event delegation; renders `#mylineup-root` on `my-lineup.html`.
  - `build.js`: hand-rolled static site generator — reads `artists.js`, string-templates HTML, writes `dist/`. No framework.
  - `schedule-data.js` (38KB) + 4 `schedule-*.html` builder pages: self-contained single-file apps, own inline CSS/JS, timeline-grid math (`GS=720`, `GE=1320`, `SC=1.50`), star/conflict-detection logic already exists client-side.
  - Deploy: `wrangler deploy` → Cloudflare Pages, `dist/_headers` sets security headers including a CSP (report-only).
  - `package.json` has zero runtime dependencies beyond `wrangler` (devDependency only).

## Risk Register (carried forward from analysis — accept and mitigate, not blockers)
| Risk | Mitigation |
|---|---|
| Next.js migration is a real rewrite, not additive — `build.js`'s hand-rolled templating has no direct Next.js equivalent | Phase 3 ports content pages incrementally using Next.js static generation so behavior stays identical; don't attempt a big-bang rewrite of all ~20 pages in one PR |
| Vercel Pro cost ($20+/mo) vs. current $0 Cloudflare Pages hosting | Confirm with Jacob before Phase 3 starts — this plan assumes he's accepted it per his answer, but the executor should not assume the AdSense revenue currently covers it |
| Losing existing security hardening (`esc()` HTML escaping, CSP headers, localStorage payload validation) during migration | Phase 3 explicitly re-implements each of these in the Next.js equivalent, verified via the checklist in that phase, not just "ported" |
| DNS/domain topology after moving off Cloudflare Pages (keep Cloudflare as DNS-only in front of Vercel, or move DNS to Vercel entirely) | Flag as an open question for Jacob before Phase 3's deploy step — do not silently pick one |

---

## Phase 0 — Documentation Discovery (required before Phase 1 code)
Deploy a subagent to fetch and record, with exact citations:
1. Current `supabase-js` v2 client API for: `auth.signInWithOAuth`, `auth.signInWithPassword`, `auth.onAuthStateChange`, `.from(table).select/insert/update`, and Row Level Security policy syntax (`auth.uid()` in SQL policies). Do not assume method names from memory — confirm against supabase.com/docs at execution time, since Supabase's SDK surface changes.
2. Current Next.js (App Router) + Vercel deployment docs for: `@supabase/ssr` server/client helper setup (Supabase's currently-recommended package for Next.js, replacing the deprecated `auth-helpers-nextjs`), static generation (`generateStaticParams`) for the artist/content pages.
3. Confirm MusicBrainz API rate limit and required `User-Agent` header format (was ~1 req/sec, unauthenticated), and Last.fm API key signup requirements.

**Anti-pattern guard:** do not invent Supabase or Next.js APIs that "should" exist. If the subagent can't confirm a method against current docs, flag it rather than guessing.

**Output:** an "Allowed APIs" note appended to this file before Phase 1 begins.

---

## Phase 1 — Supabase project + multi-tenant schema
**What to implement:**
- New Supabase project. Tables (Postgres, multi-tenant from day one per Jacob's decision):
  - `festivals` (id, slug, name, year, location, start_date, end_date) — seed one row: Lollapalooza 2026.
  - `artists` (id, festival_id FK, name, tier, day, popularity, description, spotify_url, apple_url, youtube_url) — migrated from `artists.js`.
  - `artist_genres` (artist_id FK, genre text) — many-to-many, replaces the single `g` string so artists can carry multiple subgenres (addresses the Worship-style single-genre limitation).
  - `user_favorites` (user_id FK → `auth.users`, artist_id FK, created_at).
  - `user_schedules` (id, user_id FK, festival_id FK, day, name, created_at) — supports **multiple named schedules per day**, per Jacob's requirement.
  - `schedule_artists` (schedule_id FK, artist_id FK, added_at).
- RLS policies on every user-scoped table: `user_id = auth.uid()` for select/insert/update/delete. No table should be readable cross-user.

**Verification checklist:**
- [ ] As two different test users, confirm user A cannot `select` user B's `user_favorites` or `user_schedules` rows (this is the concrete RLS test, not just "policies exist").
- [ ] `artists` + `artist_genres` seeded from current `artists.js`, row count = 172, spot-check 5 random artists match source data exactly.

---

## Phase 2 — Genre audit (parallel with Phase 1/3, per Jacob's sequencing choice)
**What to implement:**
- Script: for each of the 172 artists, query MusicBrainz (respect rate limit + User-Agent header from Phase 0) and Last.fm, collect candidate genre tags.
- Claude synthesizes a best-guess primary + secondary genre list per artist from the candidates (not a raw dump of noisy tags — Last.fm tags especially need filtering).
- Write results into `artist_genres` (Phase 1 table) and regenerate a corrected `artists.js` `g` field (first/primary genre, for backward compatibility with any code not yet migrated) so the static site and the new DB stay consistent during the transition.
- Explicitly re-check the known bug: Worship (line 174, currently `Rock`) should resolve to drum and bass / electronic.

**Verification checklist:**
- [ ] Every one of the 172 artists has at least one genre with a cited source (MusicBrainz ID or Last.fm tag reference), no silent "Pop" defaults.
- [ ] Worship confirmed corrected.
- [ ] Output a diff report (old genre → new genre) for Jacob's later spot-check, per his instruction — don't require his review before shipping, but make the diff easy to scan.

---

## Phase 3 — Next.js + Vercel scaffold
**What to implement:**
- New Next.js (App Router) project. Port `index.html`, `about.html`, `privacy.html`, `terms.html`, `contact.html`, `who-to-see.html`, `first-timers-guide.html`, `undercard-picks.html`, `schedule.html` as static-generated routes pulling from the Phase 1 Supabase tables (or a build-time export of them) instead of `artists.js` directly.
- Re-implement, don't drop: `esc()`-equivalent escaping (React does this by default for JSX text, but any `dangerouslySetInnerHTML` use must be audited), the CSP/security headers currently in `dist/_headers` (via `next.config.js` headers or Vercel config), and the four `schedule-*.html` builder apps' existing conflict-detection/star logic — these can stay closer to their current self-contained JS form inside Next.js pages rather than being forced into React state if that's faster and lower-risk.
- Configure Vercel project (Pro plan), environment variables for Supabase URL/anon key, custom SMTP provider credentials (Resend or SendGrid — pick one, needed before Phase 4 email flows go live).
- Leave the DNS/Cloudflare-vs-Vercel topology decision to Jacob before this phase's deploy step (see Risk Register).

**Verification checklist:**
- [ ] Every ported page visually matches current production (screenshot diff or manual check).
- [ ] `curl -I` the deployed site, confirm CSP/security headers are present and match current `dist/_headers` intent.
- [ ] Lighthouse/basic perf check — static generation should keep this fast; flag if it regresses vs. current Cloudflare Pages static site.

---

## Phase 4 — Auth UI
**What to implement:**
- Supabase Auth via `@supabase/ssr` (confirm exact package name/setup in Phase 0). OAuth (Google) as primary sign-in per the rate-limit finding; email/password as secondary, gated behind custom SMTP being configured.
- Login/signup pages, session handling, protected routes for `/my-lineup` and the schedule builder pages.

**Verification checklist:**
- [ ] Sign up, log out, log back in via OAuth — session persists correctly.
- [ ] Attempt to hit a protected route logged out → redirected to login, not a broken page.

---

## Phase 5 — Migrate localStorage favorites/schedules → Supabase
**What to implement:**
- On first authenticated session, read the existing `lolla-my-lineup-v1` localStorage array (artist name strings — note: not IDs, so match by name against the `artists` table, case-sensitively, and log any that fail to match rather than silently dropping them), upsert into `user_favorites`.
- Keep localStorage as the fallback store for logged-out/anonymous users (don't force login just to star an artist) — merge into Supabase on next login.

**Verification checklist:**
- [ ] A test browser with existing `lolla-my-lineup-v1` data, on first login, ends up with matching rows in `user_favorites` — no data loss, no duplicates on repeat login.

---

## Phase 6 — Multiple schedules per day + HTML/PNG export
**What to implement:**
- UI to create/name/delete multiple schedules per festival day, backed by `user_schedules` (Phase 1).
- HTML export: serialize existing schedule builder markup for a given schedule.
- Image export: client-side canvas rendering (no new server dependency, no per-export API cost) — confirm current best-practice library in Phase 0 discovery rather than assuming a specific package name.

**Verification checklist:**
- [ ] Create 2+ schedules for the same day under one user, confirm both persist independently.
- [ ] Export produces a readable HTML file and a PNG/JPG that visually matches the on-screen schedule.

---

## Final Phase — Verification
- [ ] Re-run Phase 1's RLS cross-user test against the final deployed app, not just the raw DB.
- [ ] Playwright E2E covering: sign up → star artists → build 2 schedules on one day → export PNG → log out → log back in → data still present (per this repo's testing convention: Playwright for critical user flows).
- [ ] Grep for `console.log` in all new files — none in production code (per coding-style rule).
- [ ] Confirm no secrets committed — Supabase keys, SMTP credentials all via env vars (per security rule), `.gitignore` covers `.env*`.
- [ ] Final diff/report to Jacob: what changed, what was assumed (DNS topology, SMTP provider choice if not specified), residual uncertainty.

---

## Appendix — Allowed APIs (Phase 0 output, confirmed 2026-07-09)

Everything below was verified against live docs today. Do not deviate from these without re-checking — this appendix exists specifically so the executor doesn't invent API surface from training data.

### `@supabase/ssr` + Next.js App Router
Source: [supabase.com/docs/guides/auth/server-side/nextjs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- Install: `npm install @supabase/supabase-js @supabase/ssr` (NOT the deprecated `@supabase/auth-helpers-nextjs`).
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (current naming — publishable key, not just "anon key," reflects Supabase's newer API-key model).
- Two client types needed: `createBrowserClient` (from `@supabase/ssr`, for Client Components) and `createServerClient` (for Server Components/Actions/Route Handlers — requires cookie handling since Server Components can't write cookies).
- **Middleware is required**: it must refresh tokens and shuttle cookies between `request.cookies` and `response.cookies`.
- **Important correction vs. common assumption**: use `supabase.auth.getClaims()` to protect pages/user data — the docs explicitly warn against relying on `getSession()` in server code for authorization decisions. Confirm `getClaims()` still exists at implementation time (fast-moving surface).
- Migration mapping from the old auth-helpers (if any legacy code is encountered): `createMiddlewareClient → createServerClient`, `createClientComponentClient → createBrowserClient`, `createServerComponentClient → createServerClient`, `createRouteHandlerClient → createServerClient`. Do not mix `auth-helpers` and `@supabase/ssr` in the same app.

### Supabase RLS policy syntax
Source: [supabase.com/docs/guides/database/postgres/row-level-security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Write **four separate policies** per table (select/insert/update/delete) — do not use `FOR ALL`.
- `SELECT`/`DELETE` policies use `USING (...)`; `INSERT` uses `WITH CHECK (...)`; `UPDATE` needs both, and also requires a corresponding `SELECT` policy to function.
- Always scope with `TO authenticated` (or the relevant role) on each policy.
- Perf best practice: wrap auth calls in a `select` — write `(select auth.uid()) = user_id` rather than bare `auth.uid() = user_id`, so Postgres caches it per-statement instead of re-evaluating per-row.
- Example shape for `user_favorites`:
  ```sql
  create policy "select own favorites" on user_favorites
    for select to authenticated
    using ( (select auth.uid()) = user_id );

  create policy "insert own favorites" on user_favorites
    for insert to authenticated
    with check ( (select auth.uid()) = user_id );
  ```

### MusicBrainz API
Source: [musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting)
- Hard rule: never exceed **1 request/second** per client. (Properly identified apps get up to 300 req/s pooled capacity server-side, but the per-client contract is still 1/s — build the script to that limit, not the pool ceiling.)
- `User-Agent` header is **mandatory**, format: `AppName/Version ( contact-url-or-email )`, e.g. `LollaGenreAudit/1.0 ( jacob.t.brondum@gmail.com )`. Missing/generic User-Agents risk throttling independent of the rate limit.

### Last.fm API
Source: [last.fm/api/show/artist.getTopTags](https://www.last.fm/api/show/artist.getTopTags)
- `artist.getTopTags` needs `artist` (or `mbid`) + `api_key` + `format=json` as query params. No OAuth needed for this read-only call.
- API key signup: [last.fm/api/account/create](https://www.last.fm/api/account/create) — requires a Last.fm account. **Blocking dependency on Jacob** if not already held; script falls back to MusicBrainz-only + Claude synthesis if the key isn't available in time (see execution plan's Open Dependencies).
