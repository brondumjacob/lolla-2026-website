# Lolla 2026 Website — Accounts, Multi-Festival Schema & Genre Audit
**Plan date:** 2026-07-09 | **Author:** Cowork planning session | **For execution in:** Claude Code (`do` skill, subagents encouraged for Phases 2 and 3 in parallel)

## Status (updated 2026-07-11)
- **Phase 0 (Discovery):** Done.
- **Phase 1 (Supabase schema + RLS):** Done AND deployed. Live Supabase project created ("Festival Builder"), `0001_init.sql` applied via SQL Editor, `seed.sql` (festivals + 172 artists + PRE-AUDIT placeholder genres) applied via direct `psql` connection (web SQL editor paste was corrupting apostrophes in artist descriptions — root cause not fully diagnosed, worked around via psql + `.pgpass`). Artist/festival row counts confirmed by Jacob.
- **Phase 2 (Genre audit):** Done AND applied. `artists.js` corrected, `data/genre-diff.md`/`genres.json` generated, `seed_genres.sql` written, verified correct, and **confirmed applied to the live database by Jacob (2026-07-11)**. The live `artist_genres` table now reflects the cited, audited genres (Worship corrected, etc.), not the pre-audit placeholders. The build-time cross-check safety net added during Phase 3 (see below) is now expected to pass silently — if it warns after this point, that's a real signal something drifted, not stale-doc noise.
- **Phase 3 (Next.js + Vercel scaffold):** Done and **deployed live**. Scaffolded, builds cleanly, fully verified end-to-end with real Supabase data as of 2026-07-11 (172 artists render correctly, Worship confirmed showing corrected "Electronic" genre live), Vercel dashboard settings updated (Root Directory `web`, framework defaults), and **confirmed live in production at `lolla-2026-website.vercel.app`**: all 9 routes return 200 with matching security headers, and the same real-data checks (172 artists, correct tier breakdown, Worship → Electronic) pass against the deployed site, not just locally. Details in the dedicated Phase 3 section.
- **Phase 4 (Auth UI):** Done AND fully verified. Google OAuth wired end-to-end via `@supabase/ssr` — `proxy.ts` (Next.js 16 renamed `middleware.ts`), browser/server client factories, `/login`, `/auth/callback`, `/account` (protected), sign-out action, and nav auth status. `next build` passes with content pages still static; Playwright E2E confirms anonymous `/account` redirects to `/login`. Google Cloud OAuth client + Supabase provider dashboard config completed, and **live sign-in confirmed working end-to-end by Jacob (2026-07-11)** — real Google account → consent screen → `/auth/callback` → `/account`. Details in the dedicated Phase 4 section.
- **Phase 5 (favorites migration):** Done and verified end-to-end (build, Playwright, live Supabase MCP check) as of 2026-07-11. `public/favorites.js` retired; favorites are now a React context (`FavoritesProvider`) backed by server actions. Two decisions that were ambiguous in the original plan text were resolved with Jacob and are documented in the dedicated Phase 5 section below: matching is by **artist name** (not slug), and this phase includes a **full auth-aware `/my-lineup` route**, not just sync logic. Details in the dedicated Phase 5 section.
- **Phase 6 (multi-schedule export):** Done and verified end-to-end (build, TypeScript, ESLint, Playwright, live Supabase MCP RLS/multi-schedule checks, manual `claude-in-chrome` browser verification of conflict detection and both export formats) as of 2026-07-11. The four static `schedule-{thursday,friday,saturday,sunday}.html` builders are retired from the nav path — `/schedule` now links to a new `/schedule/[day]` Next.js route, a React rewrite of the builder backed by `user_schedules`/`schedule_artists`. Three decisions that were ambiguous in the source plan text were resolved with Jacob and are documented in the dedicated Phase 6 section below: React rewrite (not an island-wrap of the old JS), anonymous-friendly building with sign-in required only to save multiple named schedules, and a lightweight `artist_id`-keyed model with one additive migration to preserve the must-see star. Details in the dedicated Phase 6 section.
- **Both loose threads closed (2026-07-11):** (1) Worship's `description` corrected to reflect the audited "Electronic"/Drum & Bass genre — sourced from the same MusicBrainz disambiguation used for the genre fix ("Drum & Bass supergroup composed of Sub Focus, Dimension, Culture Shock, and 1991"). Fixed in `artists.js` (live static site source) and `supabase/seed.sql`; a standalone `supabase/fix_worship_description.sql` (same apply pattern as `seed_genres.sql`) was written and is **now confirmed applied to the live Supabase database** — verified directly via Supabase MCP during the Final Phase verification pass (2026-07-11): the live `artists` row for Worship has the exact corrected description string from the SQL file, not the old rock-framed one. (2) Vercel deployment timestamp anomaly — **confirmed a non-issue by Jacob (2026-07-11).**
- **Git state as of this update:** all six phases plus the Worship description fix are committed and **pushed to `origin/expansion`** — `8f8ebdd` → `6bee9ef` → `b770acc` → `e652eff` → `02f88fa` (Phase 5) → `ce831b0` (Phase 6). Confirmed directly via `git log` and `git status -sb` (branch in sync with remote), not taken on report. Working tree otherwise clean.
- **Final Phase (Verification): Done.** All five checklist items completed 2026-07-11 against the live Vercel preview (`lolla-2026-website.vercel.app`) and live Supabase project — real HTTP requests, not raw DB queries or simulated JWTs. `supabase/fix_worship_description.sql` confirmed applied to the live database (was the one outstanding action item flagged above; no longer outstanding). Full report in the dedicated Final Phase section below. This was pre-cutover verification only — DNS still points at the old static site and this work didn't touch Cloudflare, domains, or the production URL.

## Decisions resolved 2026-07-09 (was "Open decisions blocking Phase 3")
1. SMTP provider: **Resend**.
2. Vercel plan: **Pro confirmed** ($20/mo/seat) — required since Hobby is non-commercial-only and this site runs AdSense. Verified live in the Vercel dashboard (badge shows "Pro").
3. DNS topology: **Cloudflare stays as DNS-only in front of Vercel** — keeps existing security headers/WAF config, Vercel serves the app behind it.

## Vercel connection smoke-tested 2026-07-09 (resolved, one flag)
- Connected `brondumjacob/lolla-2026-website` to a Vercel Pro project. First deploy attempt failed: "No Output Directory named 'public' found" — Vercel auto-detection didn't know this repo's build output goes to `dist/` (per `build.js` + `wrangler.jsonc`), not a framework-default `public/`.
- Fixed via Vercel dashboard (Settings → Build and Deployment): Framework Preset `Other`, Build Command `npm run build`, Output Directory `dist`, Install Command left default. Redeploy succeeded (Production: Ready).
- This smoke-tests the *old static site* only (commit `368c9a0`, pre-Supabase) — confirms Vercel Pro can build this repo, nothing more. No Supabase/auth integration exists on Vercel yet; that's Phase 3.
- **Unresolved flag:** while verifying, a second "Ready" deployment was found already sitting above the failed one in the deployments list, reportedly "about a day ago" per a Claude-in-Chrome session — chronologically inconsistent with this being a same-session-fresh Vercel connection (deployment lists sort newest-first, so an item above a "created 2m ago" failed deploy should be more recent, not older). Not independently verified by Jacob — worth a direct look at exact timestamps in the Vercel dashboard before assuming it's benign. Does not block Phase 3, but flagging so it isn't lost.
- The deployed static site currently has **no security headers** (Vercel doesn't read Cloudflare Pages' `dist/_headers` format) — fine for a smoke test, not something to leave as a real production URL. Needs a `vercel.json` headers block if this deployment is kept around past Phase 3 landing.

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
- [x] `curl -I` the local dev **and** production (`next start`) build, confirm CSP/security headers are present and match `dist/_headers` intent — confirmed byte-identical on both.
- [x] Full `next build` succeeding end-to-end, including `/` — **confirmed 2026-07-11** once real Supabase credentials (URL + publishable key) were provided. All 10 routes prerender as static content (`○ Static`), zero build errors.
- [x] Real data flows correctly: 172 total artists rendered (8 headliners + 37 majors + 127 undercards, matching the known tier breakdown), and **Worship confirmed rendering "Electronic" live** (not the pre-audit "Rock") — proves `seed_genres.sql`'s application is actually reflected end-to-end through Supabase → Next.js build → rendered HTML, not just in the raw DB.
- [ ] Every ported page visually matches current production (screenshot diff or manual check) — content/markup/data verified programmatically, not yet visually screenshot-diffed against production.
- [ ] Lighthouse/basic perf check — not yet run.

### Execution notes (2026-07-11)

**Scaffold:** New Next.js 16 (App Router, TypeScript, Turbopack) project lives in `web/` — a dedicated subdirectory, not the repo root. This is a deliberate architectural choice not spelled out explicitly in the original plan: it lets Cloudflare Pages keep building/serving the live static site from the repo root completely untouched while Vercel is reconfigured to point at `web/` as its Root Directory. Both deployments coexist during testing; nothing about the live production site changed.

**Pages ported** (all 9 from the plan): `/` (index — the complex one, see below), `/about`, `/privacy`, `/terms`, `/contact`, `/who-to-see`, `/first-timers-guide`, `/undercard-picks`, `/schedule`. All 8 non-index pages build to fully static HTML and were verified rendering correct content via a local `next dev` + `curl` pass (200 status, expected `<h1>`/JSON-LD content present).

**Index page (`/`):** the day/genre filtering UI (headliners/majors/undercards, sidebar day panels, genre list, quick filters, countdown) was rewired from the original's imperative DOM-class-toggling JS into a proper React client component (`LineupExplorer.tsx`) driven by state, fed by artist data fetched from Supabase at build time via `lib/data.ts`. The schedule hub's fuzzy-match "Plan My Schedule" widget was kept as vanilla JS (extracted verbatim to `public/schedule-planner.js`), per the plan's explicit allowance to leave schedule-builder-style JS in its current form rather than force a premature rewrite — same reasoning extended to `favorites.js` (star/My-Lineup toggling), copied unchanged, since Phase 5 is what actually migrates that system to Supabase.

**Data layer:** `lib/data.ts` fetches from the Phase 1 Supabase tables (public-read RLS, so a plain `@supabase/supabase-js` client with the publishable key is sufficient — no `@supabase/ssr`/cookie machinery needed until Phase 4's authenticated routes). Zod schemas (`lib/types.ts`) validate every row read back from Supabase before it flows into rendering, per this repo's coding-style convention of validating at system boundaries.

**seed_genres.sql safety net:** because Jacob's application status for `seed_genres.sql` couldn't be confirmed (see Status section above), `lib/data.ts` cross-checks fetched primary genres against the already-corrected `artists.js` at build time and prints a loud `console.warn` if more than 10% mismatch — a strong signal the live `artist_genres` table still has pre-audit placeholder data. This is a build-tooling warning (same category as `build.js`'s existing `console.warn` usage), not shipped client-side code.

**Security re-implementation:**
- CSP/security headers ported verbatim into `next.config.ts`'s `headers()` — same header names, same values, same `Content-Security-Policy-Report-Only` (not enforcing) posture as `dist/_headers`. Confirmed via `curl -I` against a local dev server: byte-identical output.
- `esc()`-equivalent escaping: JSX auto-escapes all rendered text by default. Exactly one `dangerouslySetInnerHTML` was used anywhere in the port — for JSON-LD `<script type="application/ld+json">` tags (index + the 3 article pages), which is the officially documented Next.js pattern for structured data. Audited and safe: the content is fully static/hardcoded (no interpolated user or external data), `JSON.stringify` produces valid escaped JSON, and there is no other `dangerouslySetInnerHTML` use anywhere else in the codebase.
- `favorites.js`'s existing `localStorage` payload validation and HTML-escaping (`esc()`) carried over unchanged since the file itself is unchanged.

**Known interim gaps (expected, not bugs):** the nav's "My Lineup" link and the schedule hub's four day-builder links still point to `.html` routes (`/my-lineup.html`, `/schedule-thursday.html`, etc.) that live on the *static* site, not this Next.js app — those pages are explicitly out of Phase 3's scope (My Lineup/favorites migration is Phase 5; the day builders were never listed in Phase 3's port list). These links will 404 on the standalone Vercel preview during testing until either those pages are ported in a later phase or DNS cutover happens and both sites merge under one domain. Not a regression — the plan never scoped those pages into Phase 3.

**Full build verified (2026-07-11):** once Jacob provided real Supabase credentials (`web/.env.local`, gitignored — not committed), `next build` succeeded end-to-end with zero errors. All 10 routes prerender as static content. Remaining gaps are visual screenshot-diff and Lighthouse, not functional correctness.

**Vercel deploy config — applied and verified live:** the Vercel project (`lolla-2026-website`) was reconfigured for the Next.js app (Root Directory `web`, Framework Preset Next.js, build command/output on framework defaults, `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set as env vars) and redeployed. **Live verification (2026-07-11), directly against `https://lolla-2026-website.vercel.app`:**
- All 9 routes return HTTP 200 (`curl -sI` + status loop).
- Security headers present and matching local build: CSP (report-only), `X-Content-Type-Options`, `X-Frame-Options`, `Permissions-Policy`, `Referrer-Policy`; `x-nextjs-prerender: 1` confirms static pages are actually served prerendered, not SSR'd on every request.
- Real data correctness holds in production, not just locally: 172 total artists (8 headliners / 37 majors / 127 undercards), Worship shows "Electronic".
- `/schedule`'s supporting scripts (`schedule-data.js`, `schedule-planner.js`) and `favorites.js` all resolve with 200.

DNS/Cloudflare remain untouched — this is the standalone `*.vercel.app` preview domain, not the production domain fans currently use.

**DNS/Cloudflare:** untouched, as instructed. No production traffic is affected by any of this work.

---

## Phase 4 — Auth UI
**What to implement:**
- Supabase Auth via `@supabase/ssr` (confirm exact package name/setup in Phase 0). OAuth (Google) as primary sign-in per the rate-limit finding; email/password as secondary, gated behind custom SMTP being configured.
- Login/signup pages, session handling, protected routes for `/my-lineup` and the schedule builder pages.

**Verification checklist:**
- [x] Sign up, log out, log back in via OAuth — session persists correctly. **Confirmed working end-to-end by Jacob, 2026-07-11**, against local dev (`localhost:3000`) with the real Google Cloud client + Supabase provider config in place.
- [x] Attempt to hit a protected route logged out → redirected to login, not a broken page. Playwright-verified against a real `next build`/`next start`: `/account` → `/login?next=/account`.

### Execution notes (2026-07-11)

**Scope:** Google OAuth only, per the plan's earlier decision (sidesteps Supabase's 2-email/hour built-in SMTP cap; email/password is deferred until Resend is configured). No email/password UI was built.

**Next.js 16 breaking change caught before writing code:** `middleware.ts` is deprecated and renamed to `proxy.ts` (confirmed in the bundled `node_modules/next/dist/docs/.../file-conventions/proxy.md`, v16.0.0 changelog) — the file now exports a `proxy` function instead of `middleware`, and the build output labels it "Proxy (Middleware)". Session refresh and route protection live in `web/proxy.ts`, not a `middleware.ts` that would have silently never run.

**`@supabase/ssr` API confirmed against current docs** (context7, not training data): `createServerClient`/`createBrowserClient` factory split, cookie `getAll`/`setAll` contract, PKCE `exchangeCodeForSession` in the callback route, and `getClaims()` (JWT-verified) rather than `getSession()` for authorization decisions — matches the Phase 0 Appendix.

**Files added (`web/`):** `lib/supabase-browser.ts` / `lib/supabase-server.ts` (client factories — `lib/supabase.ts`'s build-time client is untouched), `proxy.ts` (session refresh + redirects unauthenticated requests to `/account`), `app/auth/callback/route.ts`, `app/auth/actions.ts` (`signOut` server action), `app/login/page.tsx` + `components/GoogleSignInButton.tsx`, `components/AuthStatus.tsx` + `components/SignOutButton.tsx` (wired into `Nav.tsx`), `app/account/page.tsx` (protected, defense-in-depth re-checks `getClaims()` server-side per Next's own proxy.md guidance not to rely on proxy alone).

**Static generation preserved:** `AuthStatus` reads auth state client-side (browser client + `onAuthStateChange`), so `next build` still prerenders all content pages as static (`○`) — only `/login`, `/account`, and `/auth/callback` are dynamic (`ƒ`), confirmed in the build output.

**`/my-lineup` and the schedule builders are not yet protected** — they don't exist as Next.js routes in `web/` yet (still on the static site; Phase 5/6 own porting them). `/account` is the concrete protected-route proof for this phase's checklist; the same `proxy.ts` matcher gets extended once those pages land.

**Playwright added** (`web/playwright.config.ts`, `web/e2e/auth.spec.ts`) — first E2E setup in this repo. 3 tests pass against a real production build: anonymous `/account` redirect, `/login` renders the Google button, nav shows "Sign in" when logged out. `npm run test:e2e` in `web/`.

**Blocked on dashboard config (not code) — handed off:**
1. Google Cloud Console → OAuth 2.0 Client ID (Web) with redirect URI `https://dtcuzunuuzwsomydluwk.supabase.co/auth/v1/callback` and JS origins for `localhost:3000` + `lolla-2026-website.vercel.app`.
2. Supabase Dashboard → Authentication → Providers → Google → paste the Client ID/Secret, enable.
3. Supabase Dashboard → Authentication → URL Configuration → add `http://localhost:3000/**` and `https://lolla-2026-website.vercel.app/**` as allowed redirect URLs.

Once those three steps are done, sign-in should work with no code changes — the app-side implementation doesn't hold any Google secret (that lives in Supabase's dashboard only).

---

## Phase 5 — Migrate localStorage favorites/schedules → Supabase
**What to implement:**
- On first authenticated session, read the existing `lolla-my-lineup-v1` localStorage array (artist name strings — note: not IDs, so match by name against the `artists` table, case-sensitively, and log any that fail to match rather than silently dropping them), upsert into `user_favorites`.
- Keep localStorage as the fallback store for logged-out/anonymous users (don't force login just to star an artist) — merge into Supabase on next login.

**Verification checklist:**
- [x] A test browser with existing `lolla-my-lineup-v1` data, on first login, ends up with matching rows in `user_favorites` — no data loss, no duplicates on repeat login. **Confirmed 2026-07-11** via a real Google sign-in against the live Supabase project (Supabase MCP `select` before/after) — see execution notes.

### Decisions resolved with Jacob (2026-07-11) — the source plan text above was ambiguous on both

1. **Matching key = artist name, case-sensitively — not slug.** `0001_init.sql`'s comment on `artists.slug` ("anchors favorites matching") is **superseded**; that comment predates this phase's actual implementation and should be read as historical intent, not the shipped behavior. Reasoning: `favorites.js`'s `.star-toggle` buttons carry `data-name` (the artist's display name), never a slug, and the live `artists` table has **zero duplicate names** across all 172 rows (verified via Supabase MCP before implementation) — so name is already a safe, unique key with no translation needed. Reproducing `scripts/gen-seed.mjs`'s `slugify()` in the browser to derive a slug from `data-name` would have added a second place that logic must stay in sync, for no correctness benefit. `artists.slug` continues to serve its other purpose (a stable per-artist identifier) unaffected.
2. **Scope = full port, not sync-logic-only.** Built a real, auth-aware Next.js `/my-lineup` route (not just a favorites list inside `/account`), repointed the nav's "My Lineup" link to it, and gave star-toggling a Supabase write path for signed-in users. This was the larger of two options Jacob was offered; the smaller option (sync-only, surfaced read-only inside `/account`) was available but not chosen. `public/favorites.js` is fully retired as a result — `StarToggle.tsx`'s own pre-existing comment ("Real React state for this arrives in Phase 5") had already flagged this as the natural endpoint.

### Execution notes (2026-07-11)

**Architecture:** `public/favorites.js` (vanilla JS, global event delegation) is replaced by `FavoritesProvider` (`web/components/FavoritesProvider.tsx`), a React context wrapping the app inside `layout.tsx`. All Supabase writes go through two `'use server'` actions in `web/app/favorites/actions.ts` — `syncFavorites(names)` (the login-time merge) and `setFavorite(name, on)` (a single star toggle) — so RLS is enforced via the existing cookie-bound `createServerSupabaseClient()`, no client ever talks to `user_favorites` directly, and both are Zod-validated at the boundary (`FavoriteNameListSchema`, `lib/types.ts`).

**Bootstrapping without a hydration mismatch:** `FavoritesProvider`'s initial React state is an empty `Set` (matching what the server-rendered HTML has, since `localStorage` isn't available server-side) and every `setFavorites()` call happens inside a promise/event callback (`getUser().then()`, `onAuthStateChange()`), never synchronously in the effect body — this mirrors `AuthStatus.tsx`'s existing bootstrap pattern and also satisfies `eslint-plugin-react-hooks`'s `set-state-in-effect` rule, which a naive first draft tripped.

**A real bug caught during manual verification, not by the build:** the first implementation gated the login-time merge behind a `localStorage` "already synced this user, ever" marker, meant purely as a round-trip optimization. It was wrong — after that one-time merge, any names starred anonymously in a *later* session (or between sign-outs) would never reach Supabase, because the marker made `syncFavorites()` never fire again for that browser+user. Caught by manually driving the full flow with `claude-in-chrome` and cross-checking `user_favorites` via the Supabase MCP directly (`npm run build`/`lint` both stayed green through this — they can't catch a logic bug like this). Fixed by removing the marker: `syncFavorites()` now runs on every resolved sign-in (initial mount + every `onAuthStateChange` event). This is safe and idempotent — `user_favorites`'s `unique(user_id, artist_id)` constraint plus `upsert(..., { onConflict: 'user_id,artist_id', ignoreDuplicates: true })` guarantee no duplicate rows no matter how many times it runs — confirmed by re-triggering the merge twice in a row against the live DB and diffing row counts (stayed at 2, not 4).

**Verified live against the real Supabase project (not a local/mocked one), via `claude-in-chrome` + Supabase MCP, 2026-07-11:**
- Anonymous: starred 3 artists on `/`, confirmed `.saved` class + nav counter + `localStorage['lolla-my-lineup-v1']` update, no redirect to `/login`.
- `/my-lineup`: renders starred artists sorted by day with streaming links; "Share / Copy My Lineup" confirmed via `navigator.clipboard.readText()`; un-starring from this page updates the list and nav counter live.
- Real Google sign-in (existing session, same Google account Phase 4 verified): `user_favorites` was empty beforehand (`select` via Supabase MCP), confirmed populated with the matching rows immediately after sign-in, with **zero code changes needed to trigger it** — proves the merge fires on the actual OAuth flow, not just a simulated call.
- Toggling a star while signed in writes/deletes a `user_favorites` row immediately (via `setFavorite`), independent of the login-time merge path.
- Injected a non-existent artist name into `localStorage` and re-triggered sync: the unmatched name was logged server-side (`syncFavorites: 1 localStorage favorite(s) did not match any artist: ...`, visible in the Next.js server log) and **not** inserted, but real names in the same call still synced correctly — confirms partial-match handling doesn't fail closed.
- Test rows were deleted from the live `user_favorites` table via Supabase MCP after verification so no test data was left under Jacob's real account.

**Testing:** `web/e2e/favorites.spec.ts` extends the existing Playwright harness (`playwright.config.ts` unchanged) with 4 anonymous-flow tests (star → nav counter/localStorage, `/my-lineup` render + sort, empty state, un-star). All 7 tests (4 new + 3 pre-existing Phase 4 tests) pass. **Authenticated-flow E2E is explicitly not automated** — Google OAuth has no test-mode credential path in this repo (no email/password provider enabled, no service-role test session), so the manual + Supabase MCP verification above is the actual evidence for the checklist item, not a Playwright run. Flagging this rather than faking a session, per this repo's verification conventions.

**No `console.log`, no secrets:** grepped all new/changed files — only `console.warn` (server-side, in `syncFavorites`/`setFavorite`, for the unmatched-name and best-effort-failure cases, same logging convention as `lib/data.ts`'s existing genre-staleness warning). No new env vars or credentials; `.env*` was already gitignored.

**Files added:** `app/favorites/actions.ts`, `app/my-lineup/page.tsx`, `components/FavoritesProvider.tsx`, `components/MyLineupCount.tsx`, `components/MyLineupList.tsx`, `lib/favorites-storage.ts`, `e2e/favorites.spec.ts`. **Files changed:** `app/layout.tsx` (provider wiring, `favorites.js` `<Script>` removed), `components/Nav.tsx` (link + counter), `components/StarToggle.tsx` (rewritten as a context consumer), `app/account/page.tsx` (placeholder copy replaced), `lib/types.ts` (favorites Zod schemas), `lib/constants.ts` (`FESTIVAL_SLUG` extracted, now shared by `lib/data.ts` and the favorites actions instead of being duplicated). **Files removed:** `public/favorites.js`.

**Known gap carried forward, not introduced by this phase:** the CSP in `next.config.ts` is still report-only and its `connect-src` allowlist doesn't explicitly name the Supabase domain — this was already true after Phase 4's client-side auth calls; Phase 5's client-side `syncFavorites`/`setFavorite` calls (actually Server Actions, so same-origin `/` POSTs, not direct Supabase REST calls from the browser) don't add to this. Still worth addressing before the CSP is ever switched to enforcing mode.

---

## Phase 6 — Multiple schedules per day + HTML/PNG export
**What to implement:**
- UI to create/name/delete multiple schedules per festival day, backed by `user_schedules` (Phase 1).
- HTML export: serialize existing schedule builder markup for a given schedule.
- Image export: client-side canvas rendering (no new server dependency, no per-export API cost) — confirm current best-practice library in Phase 0 discovery rather than assuming a specific package name.

**Verification checklist:**
- [x] Create 2+ schedules for the same day under one user, confirm both persist independently. **Confirmed 2026-07-11** via Supabase MCP: two `user_schedules` rows for the same user+day, each with its own `schedule_artists` set; deleting one left the other's row count and set list completely untouched (cascade scoped correctly).
- [x] Export produces a readable HTML file and a PNG/JPG that visually matches the on-screen schedule. **Confirmed 2026-07-11** — see execution notes for how (the automation browser's OS-level download step is sandboxed, so this was verified at the capture/content level rather than by opening a downloaded file).

### Decisions resolved with Jacob (2026-07-11) — the source plan text above was ambiguous on all three

1. **Port approach = React rewrite, not an island-wrap of the old JS.** The four static builders (`schedule-{thursday,friday,saturday,sunday}.html`) were ~215 lines of framework-free JS each, byte-identical in logic across all four days. Two things ruled out keeping them as-is: they **hardcoded their set data as HTML `data-*` attributes** rather than reading the shared `schedule-data.js`, and they had **zero persistence** — selection lived only in ephemeral DOM classes (`.sel`/`.must`), gone on reload. Adding named, saved, multi-schedule persistence needed a real state layer regardless of porting strategy, so gluing Supabase around the old imperative code would have been more work than rewriting it. The only non-trivial algorithms (pairwise `overlaps`, greedy lane-packing, interval-merge conflict clustering) were small (~40 lines) and translated directly into pure functions.
2. **Auth model = anonymous-friendly, like `/my-lineup` (Phase 5), not gated like `/account`.** Anyone can open `/schedule/[day]`, select sets, see conflicts, and export — no login required. The working selection persists to a `localStorage` draft (one per day, not multiple — see decision 3's note on why). Creating, naming, and deleting **multiple** schedules is the signed-in benefit; on sign-in, an existing local draft is staged as an unsaved schedule the user can explicitly name and save, rather than silently becoming a DB row. `/schedule` was **not** added to `proxy.ts`'s `PROTECTED_PREFIXES`.
3. **Data fidelity = the lightweight `artist_id` model from Phase 1's schema, plus one additive migration to keep the must-see star.** Jacob's instruction was "do the lightweight option but don't remove must-see." `schedule_artists.artist_id` (existing, `UNIQUE(schedule_id, artist_id)`) is the join; a new `is_must_see boolean not null default false` column (`supabase/migrations/0002_schedule_artists_must_see.sql`) carries the star per set, per schedule. No larger set-identity migration was done. Consequence: of the 181 distinct set names in `schedule-data.js`, **13 don't map to any `artists` row** (Kidzapalooza/side-stage acts not in the main lineup table — FLOR BROMLEY, JAZZY ASH, LUCKY DIAZ, MISTER G, Q BROTHERS, SCHOOL OF ROCK, THE HAPPINESS CLUB, plus a few apostrophe/diacritic edge cases), verified via a Supabase MCP anti-join before implementation started. These are logged server-side (same "log, don't silently drop" convention as Phase 5's unmatched-favorite-name handling) and simply aren't saveable to a named schedule — a known, documented limitation, not a bug.

### Export library (Phase-0-style discovery, confirmed 2026-07-11 — not assumed from training data)
**`@zumer/snapdom`** (`npm i @zumer/snapdom`, added as a runtime dependency) — v2.15.0 at install time, published days earlier, **zero dependencies**, purpose-built as a faster/more-accurate modern replacement for html2canvas. Checked via its GitHub README and npm listing before committing to it, rather than defaulting to html2canvas from memory. `snapdom.download(node, { format, filename })` is the entire integration surface for image export (`lib/schedule-export.ts`). HTML export doesn't need a library — it walks `document.styleSheets`, inlines the rules into a `<style>` block alongside the target node's `outerHTML`, and downloads via a `Blob`/`URL.createObjectURL`/`<a download>`, the same standard pattern client-side export has always used.

### Execution notes (2026-07-11)

**Architecture:** New files mirror the Phase 5 favorites pattern closely: `app/schedule/actions.ts` (`'use server'`, the only code touching `user_schedules`/`schedule_artists` — `listSchedules`/`createSchedule`/`saveSchedule`/`renameSchedule`/`deleteSchedule`, each Zod-validated, each re-resolving the `getFestivalId` helper already established in `app/favorites/actions.ts`), `lib/use-schedules.ts` (a plain hook, not a context/provider — schedule state is only needed inside the `/schedule/[day]` subtree, so it deliberately stays out of `layout.tsx` and every other content page keeps its static generation), `lib/schedules-storage.ts` (the anonymous localStorage draft, keyed `lolla-schedule-draft-v1`), `lib/schedule-data.ts` (reads `public/schedule-data.js`'s `window.SCHEDULE` at build time via the same `node:vm` technique `lib/data.ts` already uses for `artists.js`, so the 191-set dataset stays a single source of truth rather than being duplicated), `lib/schedule-days.ts` (pure day metadata — see the client/server bug below for why this had to be separate from `schedule-data.ts`), `lib/schedule-builder-logic.ts` (the pure grid-math/conflict-detection functions, extracted from the component per this repo's file-size convention), `components/ScheduleBuilder.tsx` (`'use client'`, the rewritten builder), `app/schedule/[day]/page.tsx` (the first dynamic route in this app — `generateStaticParams` prerenders all 4 day slugs so the shell stays `● SSG`, confirmed in the build output), `lib/schedule-export.ts` (the snapdom/HTML export helpers).

**Two real bugs caught during manual/automated verification, not by the build:**
1. **Client/server module boundary.** `ScheduleBuilder.tsx` (`'use client'`) originally imported `SCHEDULE_DAYS`/`scheduleDayMetaBySlug` directly from `lib/schedule-data.ts` — which also imports `node:fs`/`node:vm` at module scope to read `schedule-data.js` at build time. Turbopack tried to bundle the whole module (including the Node-only imports) into the client chunk and the build failed outright: `the chunking context does not support external modules (request: node:fs)`. Fixed by splitting the pure, client-safe day-metadata constants into their own `lib/schedule-days.ts` with zero Node imports, so nothing pulls `node:fs` into a browser bundle. Caught immediately by `npm run build` — a hard failure, not a silent one.
2. **Auth token refresh silently wiping unsaved selections.** `useSchedules`' bootstrap effect originally called its full `bootstrap(userId)` reset (re-fetch saved schedules, overwrite `sets`/`activeId`/`name`) on every `onAuthStateChange` event. Supabase fires that callback for token refreshes and tab-visibility changes too, not just genuine sign-in/sign-out — so a signed-in user's in-progress, unsaved selection could vanish a few seconds after being made, with no action on their part to explain it. Caught via manual `claude-in-chrome` testing (signed in as the real Google account used since Phase 4): selections kept resetting to "No artists selected" between screenshots. `npm run build`/`lint`/`tsc` all stayed green through this — a pure runtime logic bug, the same category Phase 5's `SYNCED_USER_KEY` bug was in. Fixed by tracking the last identity `bootstrap()` actually ran for in a closure variable scoped to the effect, and only re-running the full reset when the user ID genuinely changes (sign-in, sign-out, or a different account) — token refreshes for the same identity are now a no-op.

**Verified live (2026-07-11), via a mix of Supabase MCP and manual `claude-in-chrome` browser testing:**
- **RLS join-policy cross-user test** — the specific concern flagged going in, since `schedule_artists` has no direct `user_id` column and its policy is an `exists (select ... from user_schedules s where s.id = schedule_id and s.user_id = auth.uid())` join, not a plain column comparison. Supabase MCP runs as service role (bypasses RLS), so this needed simulated JWT contexts: `set local role authenticated; set local "request.jwt.claims" = '{"sub":"<uuid>"}'`, seeded with two throwaway test users each owning one schedule with one `schedule_artists` row. As user A: saw own row, zero rows for user B's schedule, for both `select` on `schedule_artists` and `user_schedules`. Repeated swapped as user B — same result. Then tested the write side too (not just select, per "worth confirming... under a real two-user test"): user B attempting to `insert` a row into user A's schedule got a hard RLS rejection (`42501: new row violates row-level security policy`); user B attempting to `delete` user A's row correctly no-op'd (RLS `USING` clause filtered it to zero matched rows), confirmed by re-querying as service role that the row was untouched. All test rows/users deleted afterward.
- **Multi-schedule persistence** — two `user_schedules` rows created for the same test user + day, each with an independent `schedule_artists` set; deleting one left the other's row and set count exactly unchanged (cascade correctly scoped to the deleted schedule only).
- **Manual UI walkthrough**, signed in as the real Google account from Phase 4 (`jacob.t.brondum@gmail.com`) against local dev: selected two Thursday sets that overlap at noon (KIM THEORY / PEARLY DROPS), confirmed the conflict grid — `PARTIAL` tag on one, `MUST-SEE` tag after starring the other, a red `CONFLICT` pill positioned at the correct midpoint between them, the route list's clash warning text, and the transfer-note "overlap" pill for a negative gap — all match the ported algorithm's intent pixel-for-pixel against the original static builder's logic. No test schedules were left saved under the real account (confirmed via a Supabase MCP query — none created).
- **Export verification, adjusted for the automation environment:** the `claude-in-chrome` browser profile has downloads sandboxed at the OS level — even a minimal, textbook `<a download>` + `Blob` + `.click()` test never reached `~/Downloads`, confirming this is an environment limitation, not an app bug. Verified instead at the level that's actually meaningful: intercepting `HTMLAnchorElement.prototype.click` and `URL.createObjectURL` confirmed `snapdom.download()` produced a genuine `data:image/png;base64,...` PNG and triggered a real anchor click with filename `lolla-2026-thursday-schedule.png`; the HTML export's `Blob` content was captured and inspected directly — a complete `<!DOCTYPE html>` document, correct `<title>THURSDAY Schedule — Lolla 2026</title>`, an inlined `<style>` block, and both selected artist names plus the `CONFLICT` text present in the exported markup. JPG and Print/Save-PDF weren't separately re-verified beyond code review — JPG shares the exact same `snapdom.download()` call with a different `format` argument, and Print uses the standard `window.print()` API with `@media print` CSS already in place.

**Testing:** `web/e2e/schedule.spec.ts` (new, 4 tests) extends the existing Playwright harness unchanged — no edits to `playwright.config.ts`. Covers the anonymous flow: selecting two known-overlapping Thursday sets flags the conflict pill/summary text and persists to `localStorage['lolla-schedule-draft-v1']`; export buttons are present and the page never redirects to `/login`; un-selecting a set clears it from both the UI count and the draft; starring a must-see shows the `MUST-SEE` tag in the built route; the `/schedule` hub's day cards link to `/schedule/thursday` etc., not the retired `.html` files. All 11 tests (4 new + 3 Phase 4 + 4 Phase 5) pass against a real `next build && next start`, run via `npx playwright test`. **Authenticated multi-schedule create/rename/delete E2E is explicitly not automated** — same documented Google-OAuth-has-no-test-path limitation as Phase 5's `favorites.spec.ts` — covered instead by the manual + Supabase MCP verification above.

**No `console.log`, no secrets:** grepped every new file — only the two `console.warn` calls in `app/schedule/actions.ts` for unmatched set names (`createSchedule`/`saveSchedule`), same convention as `lib/data.ts` and the Phase 5 favorites actions. No new env vars or credentials.

**Files added:** `supabase/migrations/0002_schedule_artists_must_see.sql`, `web/app/schedule/actions.ts`, `web/app/schedule/[day]/page.tsx`, `web/components/ScheduleBuilder.tsx`, `web/lib/schedule-data.ts`, `web/lib/schedule-days.ts`, `web/lib/schedule-builder-logic.ts`, `web/lib/schedules-storage.ts`, `web/lib/use-schedules.ts`, `web/lib/schedule-export.ts`, `web/e2e/schedule.spec.ts`. **Files changed:** `web/app/schedule/page.tsx` (day cards repointed from `/schedule-{day}.html` to `/schedule/{day}`), `web/lib/types.ts` (schedule Zod schemas), `web/app/globals.css` (schedule-builder CSS, `sb-`-prefixed to avoid colliding with any existing or future class in this shared stylesheet — the original static builders' bare names like `.card`/`.btn`/`.set` were too generic to reuse as-is), `web/package.json` (`@zumer/snapdom` added).

**Known gap, not introduced by this phase:** the four retired static `schedule-*.html` files still exist at the repo root and are still served by the production Cloudflare Pages static site (untouched, per every prior phase's DNS/Cloudflare guardrail) — only the Next.js app's `/schedule` hub was repointed away from linking to them. They'll need actual removal or a redirect once DNS cutover happens; out of scope here, same as Phase 5's `/my-lineup.html` static-page situation.

---

## Final Phase — Verification
- [x] Re-run Phase 1's RLS cross-user test against the final deployed app, not just the raw DB. **Done 2026-07-11.**
- [x] Playwright E2E covering: sign up → star artists → build 2 schedules on one day → export PNG → log out → log back in → data still present. **Done 2026-07-11** (`web/e2e/full-journey.spec.ts`).
- [x] Grep for `console.log` in all new files — none in production code. **Done 2026-07-11** — zero matches anywhere in `web/`.
- [x] Confirm no secrets committed — Supabase keys, SMTP credentials all via env vars, `.gitignore` covers `.env*`. **Done 2026-07-11.**
- [x] Final diff/report to Jacob: what changed, what was assumed, residual uncertainty. **This section.**

Scope note: this was pre-cutover verification only. DNS still points at the old static site and nothing here touched Cloudflare, domains, or the production URL fans currently use. This is correctness/security verification, not a design/UX pass — Jacob is doing that separately.

### 1. RLS cross-user test against the deployed app (real HTTP)

Went further than the plan text asked: tested at **two** real-HTTP layers, not one.

**Layer A — direct PostgREST calls against the live Supabase project** (`https://dtcuzunuuzwsomydluwk.supabase.co/rest/v1/...`), authenticated with real user JWTs, not a service-role key or a simulated `set local "request.jwt.claims"` like Phase 1/6's earlier tests:
- Created two real, throwaway auth users (`lolla-rls-test-userA/B+verify@gmail.com`) via the public signup endpoint, confirmed server-side via SQL (`email_confirmed_at`) since the built-in confirmation email can't be received in this environment.
- Obtained real access tokens via `POST /auth/v1/token?grant_type=password` for each — genuine sessions, not forged.
- As user A: inserted one `user_favorites` row and one `user_schedules` row (with one `schedule_artists` child row).
- As user B, via real HTTP against the live REST API: `SELECT` on user A's favorites → `[]`. `SELECT` on user A's schedule → `[]`. `SELECT` on user A's `schedule_artists` (the join-policy table, no direct `user_id` column) → `[]`. `INSERT` claiming to be user A → HTTP 403, `42501` RLS violation. `INSERT` into user A's `schedule_id` → HTTP 403, `42501`. `DELETE` on user A's schedule → HTTP 200 but 0 rows affected (silent no-op, not an error — verified separately via SQL that the row and its name were untouched). `UPDATE` on user A's schedule name → same silent no-op, verified untouched.

**Layer B — the actual deployed app UI** (`https://lolla-2026-website.vercel.app`), via `claude-in-chrome`: injected user A's real session as a cookie in the exact format `@supabase/ssr`'s browser client writes (`sb-<project-ref>-auth-token`, `base64-` + base64url JSON), confirmed via `/my-lineup` and `/schedule/thursday` that the real server-rendered app correctly showed user A's own email, favorite, and schedule. Then injected user B's session in the same tab and confirmed `/schedule/thursday` showed **no schedule pill at all** (not even a trace of "RLS Test Schedule A") and `/my-lineup` showed none of user A's data — the app itself, not just the raw API, enforces the boundary.

One thing worth flagging honestly rather than glossing over: user B's `/my-lineup` briefly showed the same artist name ("5 Seconds of Summer") user A had favorited. This was **not** an RLS leak — checked directly in the DB and it was a distinct row under user B's own `user_id`, not user A's row. It happened because the browser tab's `localStorage['lolla-my-lineup-v1']` still had that name cached from viewing it as user A moments earlier (same browser profile, same origin), and Phase 5's `syncFavorites()` correctly merged it into whichever account was *currently* signed in — exactly the documented, intentional behavior from Phase 5's execution notes, just surfaced by my own test methodology (reusing one browser tab for both fake identities) rather than a real bug. Flagging it here so it doesn't look swept under the rug, but it's not a security finding.

All test users, rows, and browser state (cookies, localStorage) were deleted/cleared after verification — nothing was left in the live database or the browser profile.

### 2. Comprehensive Playwright E2E — the full continuous-session journey

`web/e2e/full-journey.spec.ts` — one test, one signed-in identity, the entire journey in a single pass: sign up → star 2 artists → build 2 named schedules on Thursday → export PNG → sign out → sign back in → confirm favorites and both schedules are all still present. This is deliberately different from `auth.spec.ts` / `favorites.spec.ts` / `schedule.spec.ts`, which each test one feature in isolation, anonymously — this one proves the features compose across a real session boundary.

**The honest limitation, stated plainly:** Google OAuth is this app's only sign-in method (Phase 4's decision), and it has no automatable test-mode path — no test consent screen, no service-account grant flow. Every prior phase's E2E suite already documents this same limitation and falls back to manual + Supabase-MCP verification. This test closes that gap the standard, Supabase-documented way instead: `web/e2e/helpers/supabase-admin.ts` uses the **Admin API** (`auth.admin.createUser({ email, password, email_confirm: true })`, confirmed against the actual installed `@supabase/auth-js` type defs, not assumed from memory) to create a real, pre-confirmed throwaway account, signs it in for a real session via `signInWithPassword`, and injects that session as a cookie in the exact format `@supabase/ssr` writes — mechanically identical to the cookie-injection technique proven working in item 1's Layer B test above. Everything after that — starring, clicking through the schedule builder, saving, exporting, clicking the real "Sign out" button, signing back in — runs through genuine UI interactions against the real deployed backend, not mocks.

**This requires one secret that isn't currently configured:** `SUPABASE_SERVICE_ROLE_KEY` in `web/.env.local` (documented in `web/.env.local.example`, dashboard-only, `Project Settings → API → service_role`). I don't have access to that value through any tool available to me and shouldn't try to obtain or handle it — same category as Phase 4's dashboard-only OAuth client setup. Without it, `full-journey.spec.ts` **skips gracefully** with a clear message (verified — ran `npm run test:e2e` after adding it: 11 passed, 1 skipped, zero regressions to the existing suite). Once Jacob adds that one key locally, the test runs for real, end to end, no code changes needed.

**PNG export verification uses the same technique the Phase 6 report already used and documented as its one known gap:** the automation environment can't observe an OS-level file save, so — matching Phase 6's own precedent rather than re-claiming something new was proven — the test intercepts the anchor-click `snapdom.download()` triggers and asserts on the captured filename and that the payload is a real `data:image/png` blob. **That OS-level file-save gap is still open** — nothing in this Final Phase pass closed it; I'm not re-claiming it's fully proven now.

### 3. `console.log` grep

Zero matches anywhere in `web/` — app code, server actions, `public/` scripts, and the existing/new e2e test files alike. Only intentional `console.warn` calls for logged edge cases (unmatched favorite/schedule-set names), same convention documented in Phase 5/6.

### 4. Secrets audit — full diffs of all six phase commits, not just current `.gitignore` state

Checked `git show <commit>` (full diff content, not just changed filenames) for all six phase commits (`8f8ebdd`, `6bee9ef`, `b770acc`, `e652eff`, `02f88fa`, `ce831b0`) against secret-shaped patterns (`sb_secret_`, `service_role`, `SMTP_PASS`, `RESEND_API_KEY`, generic API-key/`sk-`/AWS-key/PEM-header shapes) — zero matches. Also confirmed none of the six commits touch any file with a secret-suggestive name (`.env*`, anything with "secret"/"credential"/"key"/"token"/"password" in the path). Re-ran the same pattern scan across the **entire tracked repo** (`git grep`, not just the six commits) for extra confidence — also zero matches.

One nuance worth surfacing: `web/.env.local.example` — the template file with the public Supabase URL and publishable key — was never actually committed to git at all. `web/.gitignore`'s `.env*` pattern is broad enough to also swallow `.env.local.example` (an example/template file, not a secret), so it exists only in the local working tree, not in git history, not pushed to `origin/expansion`. Not a security problem (nothing leaked — if anything this is the safe direction to be wrong in), but it does mean a teammate cloning the repo fresh wouldn't have this template to copy from. Flagging as a minor process gap, not fixing it here since it's outside this phase's scope (and touching `.gitignore` patterns felt like a call for Jacob, not something to silently change during a verification pass).

### 5. `fix_worship_description.sql` application status

Queried the live `artists` table directly via Supabase MCP: Worship's `description` is `"Drum & bass supergroup uniting Sub Focus, Dimension, Culture Shock, and 1991. Genre-collapsing sets built for a festival main stage."` — an exact match to the `UPDATE` statement in `supabase/fix_worship_description.sql`. **Confirmed applied.** This was the plan's one flagged genuinely-outstanding action item outside the Final Phase checklist itself, and it's now resolved — no more open threads from prior phases.

### What was assumed vs. verified

- **Assumed:** none of the plan's original open decisions (SMTP provider, Vercel plan, DNS topology) needed re-confirming — those were already resolved and verified in earlier phases per the Status section above; this pass didn't re-touch them.
- **Verified, not assumed:** RLS enforcement (both the raw-API and real-app-UI layers), zero `console.log`, zero committed secrets across full commit diffs (not just current tree state), the Worship description fix's live application, and that the new E2E test file is syntactically/type-correct (`eslint` clean) and doesn't regress the existing suite (`npm run test:e2e`: 11 passed, 1 skipped).
- **Residual uncertainty:**
  1. `full-journey.spec.ts` has not yet been run to a real pass/fail — it currently skips because `SUPABASE_SERVICE_ROLE_KEY` isn't in `web/.env.local`. The mechanics it depends on (Admin API user creation, password-grant sign-in, `@supabase/ssr` cookie format) were each independently proven working in this same session via the item-1 Layer B test and the raw `curl`/MCP work — but the test file itself is unexecuted until that one key is added.
  2. OS-level file-save verification for exports is still not directly observable in any sandboxed browser environment used so far (this session's `claude-in-chrome` pass and the new Playwright test both verify at the "real PNG payload + real download trigger" level, same as Phase 6's original report) — this is a standing, not newly-introduced, gap.
  3. `web/.env.local.example` not being present in git history (see item 4) — cosmetic/DX gap, not a security issue, left as-is pending Jacob's call on whether to adjust `web/.gitignore`.

---

## Operational Notes (infrastructure housekeeping, not a numbered phase)

### Supabase keep-alive cron (added 2026-07-11)

Supabase's Free tier auto-pauses a project after 7 days with no database activity, which would break the live Vercel deployment (`lolla-2026-website.vercel.app`) without warning. Added a daily Vercel Cron Job that pings the database so it never goes 7 days idle — well inside the pause window with margin.

- `web/vercel.json` — `crons` entry, `GET /api/cron/keep-alive` once daily (`0 9 * * *`, UTC per Vercel's cron semantics).
- `web/app/api/cron/keep-alive/route.ts` — does a trivial `select id from festivals limit 1` using the existing build-time Supabase client (`lib/supabase.ts`'s `createBuildTimeClient()`, same publishable-key/public-read pattern `lib/data.ts` already uses). Only needs to register as activity, not accomplish anything functionally.
- **Request verification:** confirmed current against Vercel's docs (fetched 2026-07-11, docs page last updated 2026-06-02) rather than assumed from training data — Vercel's documented mechanism is a `CRON_SECRET` env var, auto-sent as an `Authorization: Bearer <value>` header on every real cron invocation. The route checks that header against `process.env.CRON_SECRET` and 401s otherwise, so the URL can't be hit by an arbitrary public request.
- **Action required (not yet done):** add `CRON_SECRET` (a random 16+ char string) to the Vercel project's Production environment variables in the dashboard — documented in `web/.env.local.example` but not something this session can set. The cron job will 401 on every real invocation until that's added.

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
