# Lolla 2026 Website — Accounts, Multi-Festival Schema & Genre Audit
**Plan date:** 2026-07-09 | **Author:** Cowork planning session | **For execution in:** Claude Code (`do` skill, subagents encouraged for Phases 2 and 3 in parallel)

## Status (updated 2026-07-11)
- **Phase 0 (Discovery):** Done.
- **Phase 1 (Supabase schema + RLS):** Done AND deployed. Live Supabase project created ("Festival Builder"), `0001_init.sql` applied via SQL Editor, `seed.sql` (festivals + 172 artists + PRE-AUDIT placeholder genres) applied via direct `psql` connection (web SQL editor paste was corrupting apostrophes in artist descriptions — root cause not fully diagnosed, worked around via psql + `.pgpass`). Artist/festival row counts confirmed by Jacob.
- **Phase 2 (Genre audit):** Done AND applied. `artists.js` corrected, `data/genre-diff.md`/`genres.json` generated, `seed_genres.sql` written, verified correct, and **confirmed applied to the live database by Jacob (2026-07-11)**. The live `artist_genres` table now reflects the cited, audited genres (Worship corrected, etc.), not the pre-audit placeholders. The build-time cross-check safety net added during Phase 3 (see below) is now expected to pass silently — if it warns after this point, that's a real signal something drifted, not stale-doc noise.
- **Phase 3 (Next.js + Vercel scaffold):** Done and **deployed live**. Scaffolded, builds cleanly, fully verified end-to-end with real Supabase data as of 2026-07-11 (172 artists render correctly, Worship confirmed showing corrected "Electronic" genre live), Vercel dashboard settings updated (Root Directory `web`, framework defaults), and **confirmed live in production at `lolla-2026-website.vercel.app`**: all 9 routes return 200 with matching security headers, and the same real-data checks (172 artists, correct tier breakdown, Worship → Electronic) pass against the deployed site, not just locally. Details in the dedicated Phase 3 section.
- **Phase 4 (Auth UI):** Done AND fully verified. Google OAuth wired end-to-end via `@supabase/ssr` — `proxy.ts` (Next.js 16 renamed `middleware.ts`), browser/server client factories, `/login`, `/auth/callback`, `/account` (protected), sign-out action, and nav auth status. `next build` passes with content pages still static; Playwright E2E confirms anonymous `/account` redirects to `/login`. Google Cloud OAuth client + Supabase provider dashboard config completed, and **live sign-in confirmed working end-to-end by Jacob (2026-07-11)** — real Google account → consent screen → `/auth/callback` → `/account`. Details in the dedicated Phase 4 section.
- **Phases 5-6 (favorites migration, multi-schedule export):** Not started.
- **Both loose threads closed (2026-07-11):** (1) Worship's `description` corrected to reflect the audited "Electronic"/Drum & Bass genre — sourced from the same MusicBrainz disambiguation used for the genre fix ("Drum & Bass supergroup composed of Sub Focus, Dimension, Culture Shock, and 1991"). Fixed in `artists.js` (live static site source) and `supabase/seed.sql`; a standalone `supabase/fix_worship_description.sql` (same apply pattern as `seed_genres.sql`) is written and **pending being run against the live Supabase database** — not yet applied there. (2) Vercel deployment timestamp anomaly — **confirmed a non-issue by Jacob (2026-07-11).**

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
