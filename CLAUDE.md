# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project: Lolla 2026 Website

## Purpose
Unofficial fan site for the complete Lollapalooza 2026 lineup (172 artists) with Spotify, Apple Music, and YouTube Music streaming links.

## Status
Live / deployed (the repo-root static site). Multi-page static site with schedule builders. AdSense wired site-wide (`ca-pub-1043428205440255`). Affiliate links not yet implemented. "Golden Hour" visual redesign integrated (see Design System below) plus a new "My Lineup" favorites feature — star any artist, view/share your picks at `/my-lineup.html`, persisted via `localStorage`.

**Migration in progress:** a migration to Supabase (Postgres + Auth) + Next.js + Vercel for accounts, saved schedules, and multi-festival support — see `2026-07-09_lolla-accounts-migration-plan.md` for the full plan and current phase status. Phases 0–6 plus Final Phase verification are done and verified (schema/RLS, genre audit, Next.js scaffold, Google OAuth, favorites migration, multi-schedule export). **The DNS/domain cutover has happened** (confirmed 2026-07-15 via DNS + response headers): `www.lolla2026lineup.com` now resolves directly to Vercel's edge with no Cloudflare proxy in front of it (`server: Vercel`, no `cf-*` headers), and `lolla2026lineup.com` (apex) 308-redirects to the `www` host. The Next.js app is the live production site fans see at the real domain — this supersedes the repo-root static site there; that Cloudflare/wrangler deployment is no longer what's served at lolla2026lineup.com (its `npm run deploy` command still exists and works, it's just not attached to this domain anymore). The Vercel project also still answers at its original `lolla-2026-website.vercel.app` URL. Vercel's GitHub integration auto-deploys on every push to `main` — confirmed via GitHub commit status checks (`context: "Vercel"`); no manual `vercel deploy`/dashboard step is needed for either current or future changes. `https://www.lolla2026lineup.com/auth/callback` is confirmed present in Supabase's Auth → URL Configuration redirect allowlist (Jacob confirmed 2026-07-15) — Google sign-in works on the production domain. Email/password sign-in is deliberately not built — Resend (chosen as the SMTP provider to lift Supabase's 2-email/hour cap) was never wired up; the site launches Google-OAuth-only by design.

**Merge History:** `expansion` (9 commits, including the Content Depth Initiative below) was merged into `main` on 2026-07-11. `main` had picked up one independent commit in the meantime (`16cd00c`, `/impeccable` audit/critique fixes — SVG icon sprite, WCAG contrast, touch targets, heading structure, aria-live announcements — to `index.html`/`schedule.html`) that `expansion` didn't have. The merge produced 4 real conflicts (both branches had edited the same `index.html`/`schedule.html` sections independently); resolved by hand to keep **both** main's accessibility/perf fixes and expansion's new content (search, artist descriptions, editorial paragraphs, `lolla-history.html`/`genre-guide.html` cross-links) — nothing from either side was dropped. Verified via `npm run build` (root) and `next build` (`web/`) both passing post-merge.

## Tech Stack
- Pure HTML/CSS/JS — no framework
- `artists.js` — the single source of truth for all artist data
- `build.js` — pre-renders the lineup into `dist/index.html` and copies an allowlist of static files into `dist/`
- Deployed with `wrangler` (v4, npm devDependency): `npm run build` → `dist/` → `npm run deploy` (`wrangler deploy`, see `wrangler.jsonc`)

## Next.js Migration (`web/`)
A separate Next.js 16 (App Router, TypeScript) project, deliberately isolated in its own subdirectory so it can be developed and deployed to Vercel independently while the repo-root static site keeps serving production via Cloudflare Pages unchanged. **`web/AGENTS.md` flags that this Next.js version has breaking changes vs. training data — read `web/node_modules/next/dist/docs/` before assuming an API.** One confirmed drift: `middleware.ts` is renamed to `proxy.ts` in Next.js 16 (exports a `proxy` function).
- `web/app/` — routes: `/`, `/about`, `/privacy`, `/terms`, `/contact`, `/who-to-see`, `/first-timers-guide`, `/undercard-picks`, `/genre-guide`, `/lolla-history`, `/faq` (new, see 5-Second Rule / AEO-GEO Pass below), `/this-week`, `/schedule`, `/schedule/[day]` (noindex), plus `/login`, `/account` (protected), `/my-lineup` (noindex), `/auth/callback` (Phase 4 auth)
- `web/lib/festival.ts` — **the single source of truth for festival identity** (name, wordmark, tagline, venue, dates, stats, FAQ copy) — the per-festival swap point for this template. Absorbed what used to be hardcoded across ~20 files (hero copy, metadata, JSON-LD, Countdown target) plus the old `constants.ts` `FESTIVAL_SLUG`. `constants.ts` now stays pure infra (`SITE_URL`, `ADSENSE_CLIENT`, `DAY_META`).
- `web/lib/structured-data.ts` — centralized schema.org JSON-LD builders (`websiteJsonLd`, `musicFestivalJsonLd`, `faqPageJsonLd`, `articleJsonLd`, `breadcrumbJsonLd`), all reading from `FESTIVAL` — see 5-Second Rule / AEO-GEO Pass below.
- `web/lib/data.ts` — fetches festivals/artists/artist_genres from Supabase at build time (public-read RLS tables, plain `@supabase/supabase-js` client via `web/lib/supabase.ts`'s `createBuildTimeClient()`, no cookies needed); Zod-validates every row
- `web/lib/supabase-browser.ts` / `web/lib/supabase-server.ts` — `@supabase/ssr` client factories for auth: browser client for Client Components (`AuthStatus`, `GoogleSignInButton`), server client (cookie-bound via `next/headers`) for the OAuth callback, sign-out action, and `/account`. Three Supabase clients total in this app, each scoped to a different concern — don't cross-use them.
- `web/proxy.ts` — refreshes the Supabase session cookie on every request and redirects unauthenticated visitors away from protected paths (`/account` today; extend the `PROTECTED_PREFIXES` array when `/my-lineup`/schedule builders are ported in Phase 5/6). Uses `getClaims()` (JWT-verified), not `getSession()`, for the auth decision.
- `web/components/LineupExplorer.tsx` — the homepage's hero + info-box + sticky filter-bar (search/day/genre, all React state, unchanged filter logic since Prompt 1) + headliner feature row + unified major/undercard `.artist-grid`. Rebuilt in the Prompt 2 layout redesign — see below; the old two-column sidebar layout is gone.
- `web/components/AuthStatus.tsx` — client-side auth state in the nav (`onAuthStateChange`), deliberately kept out of the shared layout so content pages stay statically generated
- `web/public/favorites.js`, `web/public/schedule-data.js`, `web/public/schedule-planner.js` — vanilla JS kept close to its original form (favorites/star system, schedule fuzzy-planner), per the migration plan's explicit allowance not to force a premature React rewrite of code Phase 5 will replace anyway
- `web/next.config.ts` — CSP/security headers ported verbatim from `dist/_headers`
- `web/e2e/` + `web/playwright.config.ts` — Playwright E2E (first in this repo); `npm run test:e2e` in `web/`
- Requires `web/.env.local` (see `web/.env.local.example`) with real Supabase credentials — configured; `next build`/`next dev` work fully
- Connected to Vercel: `lolla-2026-website` project, Root Directory `web`. Production-domain/deployment status (what's live where, auto-deploy behavior) is covered in "Migration in progress" above — kept in one place to avoid the two sections drifting out of sync. Google OAuth sign-in needs a Google Cloud OAuth client + Supabase provider config (dashboard-only, no code) before it works end-to-end — see the migration plan's Phase 4 section for exact steps.

## Design Context
`PRODUCT.md` (register: product, web) and `DESIGN.md` (North Star: "The Golden Hour Set") capture the strategic and visual design system for the `impeccable` skill — read before any design work (`/impeccable critique|audit|polish|...`). Positioning: most accurate/curated way to explore the lineup and build a real schedule, direct streaming links, cited genre data. `.impeccable/design.json` sidecar + `.impeccable/live/config.json` (live variant mode, glob `*.html` at repo root) are also configured.

## Architecture

### Data flow
`artists.js` → `index.html` (inline JS reads `window.ARTISTS`) → rendered DOM

`artists.js` exports `window.ARTISTS` — an array of objects with:
- `n` (name), `t` (tier: headliner/major/undercard), `g` (genre), `d` (day 1–4), `p` (popularity 1–100)
- `sp` (Spotify URL), `am` (Apple Music URL), `yt` (YouTube Music search URL)

### index.html structure
The entire app lives in one file. Key sections in order:
1. **CSS** — custom properties, layout, `stream-btn` styling, day-badge colors
2. **Data constants** — `DAY_META`, `GENRE_LIST`, icon SVGs (`SPOTIFY_ICON`, `APPLE_ICON`, `YOUTUBE_ICON`)
3. **State** — `activeDay` (0 = all), `activeGenre` ('' = all)
4. **Three render functions** — `renderHeadliners()`, `renderMajors()`, `renderUndercards()` — each filters by `artistPassesFilter()` and rebuilds DOM
5. **Filter UI handlers** — day pills, genre pills, search input all call `renderAll()` which calls all three renderers
6. **Tiers rendered separately** — headliners as full-width rows, majors as a card grid, undercards as a numbered list

### Artist tiers
- **Headliners** (~5): Full-width horizontal rows with accent bar
- **Majors** (~40): Card grid, 2–4 cols responsive
- **Undercards** (~127): Numbered list with genre + day badge

## Key Paths
- Entry point: `index.html` — main lineup page
- Artist data: `artists.js`
- Styles: `styles.css` (shared across all pages; builders also have inline CSS)
- Schedule hub: `schedule.html`
- Schedule builders: `schedule-thursday.html`, `schedule-friday.html`, `schedule-saturday.html`, `schedule-sunday.html`
- Supporting pages: `about.html`, `privacy.html`, `contact.html`, `terms.html`, `who-to-see.html`, `first-timers-guide.html`, `undercard-picks.html`
- My Lineup (favorites) page: `my-lineup.html` — `noindex`, shows starred artists grouped by day + a share/copy button
- Shared nav JS: `nav.js` (hamburger toggle + editorial collapse)
- Favorites JS: `favorites.js` — wires every `.star-toggle` button site-wide, persists to `localStorage` (`lolla-my-lineup-v1`), updates the nav counter, renders `my-lineup.html`
- Schedule data: `schedule-data.js` (191 sets from all 4 days, `window.SCHEDULE`)
- SEO: `sitemap.xml`, `robots.txt`
- Security headers: `build.js` emits `dist/_headers` (nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, and a Content-Security-Policy that is currently **report-only** until AdSense domain requirements are confirmed)
- Design explorations: `.ecc-design/redesign-previews/` (not deployed)
- Redesign source package: `design-system/` (the "Golden Hour" drop-in package this restyle was integrated from; kept in the repo for reference, not deployed)

## Navigation Structure
4-item nav across all pages: **LINEUP · GUIDE · SCHEDULE · ABOUT**
Builder pages also show a day switcher strip (THU / FRI / SAT / SUN) below the nav.

## Design System — "Golden Hour" (current)
Full site restyle integrated from a Claude-generated redesign package (`design-system/` folder,
see `design-system/HANDOFF.md` for the original handoff notes). CSS/fonts only — no JS logic
changed; same selectors throughout, so no HTML structural rewrite was needed beyond the new
My Lineup feature markup.
- `--page-bg: #FFD9C2` → `--bg-stop-4: #FF9478` (warm peach/cream gradient background)
- `--card-bg: #2B1B14` (dark warm-brown cards, e.g. hero band, guide cards)
- `--lime: #CFE23E` (CTAs, interactive, nav home)
- `--pink: #E85BB8`, `--teal`/`--cyan: #2FA79C`, `--red: #E6432E`, `--orange: #E8912B`
- `--font-display: 'Righteous'`; `--font-body: 'Manrope'`
- Soft rounded cards (`--radius-card: 20px`, `--radius-pill: 999px`), blurred shadows
  (`--shadow-sm`/`--shadow-lift`) — no hard borders, no neo-brutalist offset shadows anymore.
- `.stream-btn` (circular Spotify/Apple/YouTube icon button) lives in the shared `styles.css`
  (moved there during integration so any page — not just `index.html` — can use it).
- Builder pages (`schedule-*.html`) keep their own distinct sub-aesthetic per their embedded
  `<style>` blocks, restyled to the new palette but structurally unchanged.

## Schedule Builder Architecture

### `/schedule` "Plan My Schedule" fuzzy planner (`web/` only, 2026-07-18 fix + upgrade)
The floating ⚡ PLAN MY SCHEDULE widget on `web/app/schedule/page.tsx` (markup) +
`web/public/schedule-planner.js` (vanilla JS, fuzzy-matches free-text artist names against
`window.SCHEDULE` from `web/public/schedule-data.js`) had a CSS regression from the Next.js port:
`.planner-panel` used `border-radius: 999px` (a pill radius) instead of the legacy site's
`var(--radius-card)` (20px), which on a tall rectangular panel clipped the header/input/results —
fixed in `web/app/globals.css`. Also fixed a co-located contrast bug (`.planner-input` was
`rgba(255,255,255,0.5)` bg with white text, nearly invisible; now `#3C2D27`). Along with the fix,
the planner gained: **per-query search feedback** (a "Found X of Y artists" summary + lime
matched-chip / outlined not-found-chip row — the typed `queries` array was already threaded into
`renderResults()` but never rendered before this pass), **typeahead** (custom suggestion dropdown,
not `<datalist>`, matches the in-progress comma/`"and"`-separated token against a deduped
`window.SCHEDULE` name list), **★ favorites prefill** (reads the same `lolla-my-lineup-v1`
localStorage key as `web/lib/favorites-storage.ts`, hidden when empty), a **clear button**, and
a11y/robustness (`aria-expanded`/`aria-controls` on the FAB, `aria-live` results, Escape-to-close
with focus return, a Tab focus trap, and a **mobile bottom-sheet** layout at `max-width:600px` so
the panel can never clip the viewport). Covered by 7 new tests in `web/e2e/schedule.spec.ts`
(`Smart schedule planner` describe block). Legacy root `schedule.html` was left untouched — it's
not served at the production domain and didn't have the radius regression.

Each per-day builder is a self-contained single-file HTML app with inline CSS + JS.
- Timeline grid: `GS=720` (12 PM), `GE=1320` (10 PM), `SC=1.50` px/min
- Artist block: `top=(start_min-720)*1.5`, `height=(end_min-start_min)*1.5`
- Features: tap to select, star must-sees, conflict detection, printable route
- Ticket toggle: GA/Walking ↔ VIP/Golf Cart (all 4 days)
- Route modes: `foot` (GA) and `cart` (VIP)

## Commands
| Task | Command |
|------|---------|
| Local preview | Open `index.html` directly in browser (no server needed) |
| Build | `npm run build` (runs `node build.js` → outputs to `dist/`, incl. `dist/_headers`) |
| Deploy | `npm run deploy` (build + `wrangler deploy` serving `dist/`) |
| Validate JS | `node -e "$(cat artists.js | sed 's/window\.ARTISTS/const ARTISTS/'); console.log(ARTISTS.length + ' artists')"` |

## Updating Artist Data
All changes go in `artists.js`. Each artist entry must have all 8 fields (`n`, `t`, `g`, `d`, `p`, `sp`, `am`, `yt`). Artists without a direct streaming artist page use search URLs:
- Spotify search: `https://open.spotify.com/search/ArtistName`
- Apple Music search: `https://music.apple.com/us/search?term=ArtistName`
- YouTube Music (all): `https://music.youtube.com/search?q=ArtistName`

## Monetization (Pending)
- Google AdSense: replace `ca-pub-XXXXXXX` placeholders, uncomment AdSense script tags
- Ticketmaster affiliate: replace ticket CTA links
- Amazon Associates: festival gear section (not yet built)

## Known Issues / Deferred Work
- AdSense approval pending
- No analytics yet
- `spotify.html` and `apple-music.html` deleted (replaced by unified `index.html`)
- Lineup may update as festival approaches
- CSP is report-only (`Content-Security-Policy-Report-Only` in `dist/_headers`) — observe AdSense domains before enforcing

## Security Hardening (2026-07)
- HTML escaping (`esc()` helper) added to `favorites.js`, `schedule.html` planner, and all four `schedule-*.html` builders — artist/stage/region data is escaped before flowing into `innerHTML`
- `localStorage` payload validation in `favorites.js` `getSaved()` (only arrays of strings accepted)
- `build.js` writes `dist/_headers` with security headers (CSP report-only for now)
- `wrangler` bumped to `^4`

## Content Depth Initiative (2026-07) — phases 1–5 done
Driven by a repeat Google AdSense "low value content" rejection. All 5 phases of the plan (search + full artist descriptions + content depth) are complete, committed, and pushed to `origin/expansion` (`746c4f7`); merged into `main` 2026-07-11 (see Merge History below).
- **All 172 artists now have a `desc`/`description`** — previously only 45 (headliners + majors) did; the 127 undercards were the gap. Researched via web search, written as short original bios (not AI-generic filler), cross-checked against existing site copy where available (`undercard-picks.html`).
- Static: `artists.js` (`desc` field) + `build.js`'s `undercardItem()` now renders it via the existing `getDesc()` fallback helper, same pattern as `headlinerCard`/`majorCard`. Markup is a two-row `<li>` (`.undercard-row` + `.undercard-desc`) instead of the old single flex row — see `index.html`'s inline `<style>` around `.undercard-item`.
- Next.js: Supabase `artists.description` column populated for all undercards (migration `undercard_descriptions_and_genre_fixes`); `LineupExplorer.tsx`'s undercard `<li>` mirrors the same two-row markup, styled in `web/app/globals.css`.
- Along the way, found and fixed 4 pre-existing genre mistags in `artists.js`/Supabase (verified against the artists' actual Spotify pages, not guessed): Kim Theory (Electronic→Rock), Jackie Hollander (Indie→EDM), KWN (Electronic→R&B). A 4th candidate (Know Good) was investigated and left unchanged — Supabase already had a correctly-sourced MusicBrainz genre tag that a shallower check would have overwritten.
- `supabase/seed.sql` and `supabase/seed_genres.sql` kept in sync with the live DB (both the pre-audit and upsert-tracked genre rows, so a fresh reseed doesn't reintroduce stale duplicates).
- **Artist name search** (net-new — day/genre pills were previously the only filters). `activeSearch` state (static: `index.html`, plain JS) / `searchQuery` state (Next.js: `LineupExplorer.tsx`, React) does a case-insensitive substring match against artist name, combined with (not replacing) the existing day/genre filters. New `data-name` attribute added to every card template in `build.js` (headliner/major/undercard) so the static site's DOM-toggling render functions can match without re-reading the artist array. `.artist-search`/`.artist-search-clear` CSS added to both `index.html`'s inline `<style>` and `web/app/globals.css`, kept visually identical. Genre pill counts intentionally stay day-scoped only (not narrowed by search), matching pre-existing genre-count behavior on both sites.
- **Phase 5 — content depth**: two new long-form original articles, `lolla-history.html` ("The History of Lollapalooza", ~900 words, Perry Farrell's 1991 farewell-tour origin through the 2026 Grant Park lineup) and `genre-guide.html` ("The Complete Genre Guide to Lollapalooza 2026", ~880 words, a genre-by-genre breakdown grounded in real per-artist tier/day data pulled from `artists.js`, not fabricated). Both follow the existing `.article-wrap`/`.article-body`/`.tip-box` template from `who-to-see.html`, added to `build.js`'s static-page copy allowlist, and mirrored 1:1 as `web/app/lolla-history/page.tsx` and `web/app/genre-guide/page.tsx`. Wired into: the footer of all 14 static pages + the shared Next.js `Footer.tsx` component, `sitemap.xml`, and one cross-link each from the homepage editorial, `who-to-see.html`/`page.tsx`, and `first-timers-guide.html`/`page.tsx`.
- Homepage editorial intro (`index.html` + `web/app/page.tsx`) gained a second always-visible paragraph (venue/stage/ticket-tier facts, no longer hidden behind READ MORE) plus a new paragraph inside the expandable body linking out to the two new articles.
- Schedule hub (`schedule.html` + `web/app/schedule/page.tsx`) gained a short `.sched-editorial` paragraph between the day-picker grid and "How It Works" explaining why the builder exists. The 4 static day builders (`schedule-thursday/friday/saturday/sunday.html`) each got a unique ~40-word `.day-editorial` blurb naming that day's actual headliners/majors (sourced from real schedule data, not templated filler) — this also de-duplicates what were previously four near-identical pages, one of the specific patterns AdSense reviewers flag. The Next.js dynamic route `web/app/schedule/[day]/page.tsx` (rendered by the shared `ScheduleBuilder.tsx` client component) was deliberately left as-is: it's already `robots: {index: false}` from earlier work, so per-day editorial text there would have zero SEO/AdSense value.

## Layout & IA Redesign — "Prompt 2" (2026-07) — `web/` only
Driven by Reddit feedback on the live Next.js site: visually busy, endless mobile scroll, fails
the 5-second test. Structural redesign of the homepage/lineup/nav, **not** a re-theme — same
Golden Hour palette/fonts/tokens throughout. Static repo-root site untouched.
- **Homepage simplified**: `web/app/page.tsx` dropped the old `.editorial-intro` essay and the
  4 large `.guide-cards` boxes in favor of a compact `.explore-strip` pill row. That prose wasn't
  deleted — it already had a fuller, more specific treatment on the destination guide pages
  (who-to-see's day-by-day sections, first-timers-guide's "The Basics", lolla-history's 1991
  origin story, genre-guide's genre breakdown); rather than duplicate near-identical paragraphs
  across pages (a duplicate-content SEO risk), `who-to-see`, `genre-guide`, and `undercard-picks`
  got small additive expansions for the handful of framing sentences that were homepage-exclusive,
  and `about/page.tsx`'s stale "static site, no framework, no build process" claim was corrected.
- **`LineupExplorer.tsx` rebuilt**: hero is now just wordmark + one-line subhead + one CTA
  (`Build your schedule →`); the old poster image (`.hero-og-img`) is gone, replaced by a compact
  `.info-box` (dates/venue/stats). Day+genre filters + search moved into one sticky `.filter-bar`
  shown at every width (replaces the old sidebar's day-panels/genre-list/quick-filters and the
  old mobile-only `.genre-strip`). The `<aside className="sidebar">` is gone entirely — its
  content (live countdown + day-by-day headliner cards) moved to a new page, `/this-week`.
- **Lineup is a unified grid**: `web/components/ArtistCard.tsx` (new) replaces the old separate
  major-card/undercard-row templates with one reusable card (`variant: 'major' | 'undercard'`),
  used for both tiers in one `.artist-grid` (`repeat(auto-fill, minmax(210px,1fr))` — 2 cols on
  phones, ≥4 from ~1000px up). Headliners stay a distinct `.headliner-feature` row above it.
  `content-visibility: auto` on `.artist-card` skips layout/paint for off-screen cards — chosen
  over list virtualization specifically to keep every artist's name/genre/description in the
  server-rendered HTML (this site's whole SEO value is the crawlable long-tail undercard
  content the Content Depth Initiative built; a virtua-style windowed list would un-mount most
  of it post-hydration, which Googlebot's rendered-DOM snapshot would likely miss). Measured
  DOM node count on `/`: ~3298 vs. the Reddit audit's cited baseline of 3557 (~7% raw-count
  cut) — modest, because unifying the grid intentionally gave undercards the same card richness
  as majors (consistent design > raw count); the larger, real win is `content-visibility`'s
  rendering-cost skip, which a node count doesn't capture, plus removing the sidebar/editorial
  entirely.
- **`/this-week`** (new, indexable): `web/app/this-week/page.tsx` + `web/components/Countdown.tsx`
  (extracted from the old sidebar). Live countdown + 4 day cards (headliners, artist count,
  link into `/schedule/[day]`) — adds another substantial indexable page rather than just moving
  chrome into the already-busy `/schedule` hub.
- **Nav rebuilt** (`Nav.tsx` + new `NavDropdown.tsx`): desktop shows `LINEUP · THIS WEEK ·
  SCHEDULE` inline plus `GUIDES ▾`/`ABOUT ▾` click-toggle dropdowns; `.nav-mylineup`/`AuthStatus`
  keep their own always-visible pills (pre-existing pattern, unchanged). The hamburger's mobile
  panel (`.nav-links-mobile`) lists **every** route grouped under Lineup/Guides/Plan/About —
  including `/my-lineup` and `/account`, which aren't in the desktop dropdowns — with a real
  focus trap (Tab/Shift+Tab cycle, focus-to-first on open, focus-restore-to-button on close) on
  top of the pre-existing Escape/outside-click/aria-expanded behavior. Covered by
  `web/e2e/menu.spec.ts`. On mobile the "My Lineup" pill drops its text label (icon+count only,
  `.nav-mylineup-label { display:none }`) so the nav row doesn't wrap the hamburger onto a
  second line at narrow widths.
- **Accessibility pass found and fixed 5 real WCAG AA contrast failures** introduced by the new
  components (measured via computed-style contrast math against the actual rendered backgrounds,
  not assumed): `.info-box-venue`/`.info-stat-label`/`.hl-feature-desc`/`.ac-desc` were all
  ~3.2–3.8:1 at their original text-opacity (bumped rgba alpha 0.5–0.55 → 0.68, now 5.6–5.7:1);
  `.ac-genre` used `--teal` directly at ~2.5:1 (new `--teal-text: #19615B` CSS var, 6.2:1) —
  `--teal` itself is unchanged and still used elsewhere for large text/icons/dividers, which
  don't carry the same 4.5:1 requirement. Also found the pre-existing Four-Day Rule colors
  (`--pink`/`--orange`/`--teal`/purple) fail 4.5:1 with white text on the new `.day-pill.is-active`
  states (2.8–4.2:1) — scoped a fix to just these new pills (black text; purple lightened
  `#8B5CF6→#9469F7` to clear 4.5:1 with black text too), left `.day-badge` itself untouched
  (pre-existing, out of scope for a layout redesign). Also added a skip-to-content link
  (`layout.tsx`) and gave `/schedule` its first real `<h1>` (was a styled `<div>` — a pre-existing
  gap, not introduced by this pass, but fixed while confirming heading order site-wide).
- **CSS**: `web/app/globals.css`'s old two-col/sidebar/card system (`.two-col`, `.sidebar` +
  `.day-panel*`/`.genre-list`/`.quick-filter*`, `.majors-grid`/`.major-card*`,
  `.undercards-list`/`.undercard-*`, `.headliner-row*`, `.genre-strip*`, `.editorial-intro`,
  `.guide-cards`) was retired; `.countdown-block`/`.cd-*` were kept (now used by `/this-week`
  instead of the old sidebar) and `.day-badge`/`.stream-btn`/`.star-toggle`/`.article-*`/
  `.sched-*`/`.sb-*` are unchanged.
- **E2E**: `web/e2e/homepage.spec.ts` (new) and `web/e2e/menu.spec.ts` (new) cover the rebuilt
  homepage (hero/info-box/grid, search/day/genre filters, mobile 2-col grid geometry) and nav
  completeness/focus-trap/Escape. All pre-existing specs (`auth`, `favorites`, `schedule`,
  `full-journey`) still pass unmodified — the redesign didn't touch `.star-toggle`,
  `.nav-mylineup .mylineup-count`, or any schedule-builder markup.

## Mobile UX Pass (2026-07-18) — `web/` homepage/lineup only
First-hand phone evaluation (Playwright, 320/390/430×844, against production) after Jacob reported
the mobile site felt clunky/cluttered/scroll-heavy. Same Golden Hour tokens; no re-theme.
- **Fixed two real mobile bugs**: (1) the ≤767px 2-col `.artist-grid` blew out past the viewport —
  grid items default `min-width:auto` and each card's 44px star + 3×44px stream buttons couldn't
  shrink to a ~173px track, so the right column rendered clipped off-screen with unreachable
  buttons (the old e2e 2-col test compared row positions only and never caught it); (2) the hero
  wordmark clipped to "LOLLAPALOO" at 390px (`15vw` clamp → now `clamp(2rem, 11.5vw, 4rem)`,
  verified 320–430). Also found+fixed a footer overflow at ≤340px: `.site-footer-links` anchors
  render with no whitespace between them (JSX), so the inline row could only break mid-link-text —
  now a flex-wrap row.
- **`ArtistCard.tsx` restructured** (both viewports, matches `.hl-feature-card`'s grammar): day
  marker + star in `.ac-top`, then full-width name (long one-word names — Neighbourhood,
  Beabadoobee — wrap cleanly now), genre, desc, streams-only `.ac-bottom`. Day inside cards is a
  colored dot (Four-Day-Rule hue, non-text) + day text in ink (11.6:1+) instead of the
  white-on-color `.day-badge` pill (which was part of the width blowout; `.day-badge` itself still
  used in headliner cards/elsewhere, unchanged). On mobile, in-card star is 36px and stream
  buttons 38px (WCAG 2.1 AA 2.5.8 ≥24px met; 44px kept everywhere outside the dense grid cards —
  documented deviation from the site's 44px aspiration, which is the AAA bar).
- **Top-of-page decluttered**: `.explore-strip` moved from above the hero (where it wrapped to 3
  pill rows/144px before the brand was visible) to below the info-box via a new
  `exploreSlot?: ReactNode` prop on `LineupExplorer` (page.tsx passes the nav; note the `key` on
  the slot element — RSC-deserialized elements in a client child list otherwise trigger React's
  dev key warning). Mobile: single swipeable pill row (50px); its nowrap rules must stay *after*
  the base `.explore-strip` rule in globals.css (same specificity, cascade order decides). Info-box
  compressed on mobile (~133→70px, dates+venue one line, stats inline). Hero tightened.
- **Sticky filter bar 176→120px on mobile**: day + genre pills collapse into ONE combined
  horizontal chip row (`.filter-bar-chips`: `display:contents` on desktop so the two groups stay
  stacked rows, flex scroll row + `.chip-divider` on phones). Sticky bg 0.92→0.97 + bottom
  hairline (content visibly ghosted through while scrolling). Desktop filter layout unchanged.
- **Headliners on mobile = CSS scroll-snap carousel** (`flex: 0 0 82%`, snap x mandatory, edge
  peek as affordance, hidden scrollbar): 1,857px of stacked cards → 255px row; all 8 cards stay
  in the SSR DOM (no display:none — crawl-safe). Desktop wrap row unchanged.
- **Measured after (390×844)**: zero horizontal overflow at 320/390/430 (was: clipped column),
  chrome before lineup 854→606px, sticky 176→120px (21%→14% of screen), headliner section
  −86%, total scrollHeight 22,088→20,251px. `contain-intrinsic-size` retuned 190→210px (desktop
  median 206, mobile 225). Contrast (computed over the deepest gradient stop): `.ac-day` 11.6:1,
  `.ac-genre` 4.76:1, `.ac-desc` 5.05:1 — all AA.
- **E2E**: 4 new regression tests in `homepage.spec.ts` (no-horizontal-overflow incl. right-column
  containment + hero-fits, carousel scrolls + last card reachable, hero-before-explore-strip);
  full suite 24 passed / 1 pre-existing skip (`full-journey`, needs service-role env).
- ≤340px fallback: grid drops to 1 column (compact 2-col genuinely can't fit a 3-button
  streaming row per column there).

## 5-Second Rule / AEO-GEO Pass (2026-07-18) — `web/` only
Driven by a request to sharpen the homepage's "can a visitor grasp the site's draw in 5
seconds" read, raise AEO/GEO (getting cited by Google AI Overviews, ChatGPT, Perplexity, Claude),
and make both changes template cleanly across the planned multi-festival future. Same Golden Hour
tokens; no re-theme; no layout/structure teardown of the Prompt 2 hero.
- **Central festival config — `web/lib/festival.ts`**: new `FESTIVAL` object is now the single
  source of truth for festival identity (name, wordmark split, tagline, venue, city, dates, gate
  times, stage/day counts, entity `sameAs` links, FAQ copy). Absorbed strings that were previously
  hardcoded/duplicated across ~20 files (`LOLLA`/`PA`/`LOOZA` wordmark split, "172", dates, venue,
  stage/day counts, the 5 guide pages' identical `Person`/`Organization` JSON-LD literals) plus the
  old `constants.ts` `FESTIVAL_SLUG` (moved to `FESTIVAL.slug`; `constants.ts` now stays pure infra
  — `SITE_URL`, `ADSENSE_CLIENT`, `DAY_META`). Next festival on this template = edit this one file
  (plus `DAY_META`, which `FESTIVAL.dayDates` must stay in sync with).
- **Hero — sharpen + prove** (`web/components/LineupExplorer.tsx`): subhead rewritten to lead with
  the website's differentiated draw (direct streaming links + real schedule builder, not just "the
  lineup") and is now fully config/data-driven (`FESTIVAL.taglineBeforeCount`/`taglineAfterCount`
  around the live `{artists.length}`, killing the hardcoded "172"). New `.hero-headliners` proof
  line — top 4 headliners by `popularity`, "Headlined by X · Y · Z · W + N more artists." — is the
  actual 5-second-rule fix: instant lineup credibility where the poster image used to be, fully
  server-rendered (confirmed via `curl`'d production HTML, not client-injected) so it's crawlable
  by both search and AI answer engines. Eyebrow, wordmark (via `wordmarkParts()` splitting
  `FESTIVAL.wordmark.text` around `.accent`), and the info-box's dates/venue/stage/day counts all
  now read from `FESTIVAL` too. `Countdown.tsx`'s target date also moved to `FESTIVAL.startDate` +
  `.gatesTime` (was a hardcoded noon target one hour after the real 11 AM gate-open time — now
  correct by default for the next festival too).
- **Full GEO package — `web/lib/structured-data.ts`** (new): centralized JSON-LD builders
  (`websiteJsonLd`, `musicFestivalJsonLd`, `faqPageJsonLd`, `articleJsonLd`, `breadcrumbJsonLd`),
  all reading from `FESTIVAL`/`SITE_URL` so a future festival's structured data is correct with no
  schema code to touch.
  - **`MusicFestival` schema** (homepage, alongside the existing `WebSite` block): dates, venue
    (`Place`/`PostalAddress`), all 172 artists as `MusicGroup` performers (with `sameAs: spotify_url`
    when present), 4 `MusicEvent` sub-events (one per festival day, each with that day's performer
    subset), and `sameAs` links to Wikipedia/Wikidata for entity disambiguation. This is the
    highest-leverage AEO addition — none of it existed before. Verified via production HTML: 1
    `MusicFestival`, 4 `MusicEvent`, 344 `MusicGroup` (172 in the main performer array + 172 across
    the 4 day sub-events).
  - **`FAQPage` schema + a new visible `/faq` page** (`web/app/faq/page.tsx`): 8 questions/answers
    live in `FESTIVAL.faqs`, grounded in facts already on the site (gate/music times, GA/GA+/VIP,
    "is this official"). The artist-count answer uses a `{{ARTIST_COUNT}}` token resolved at render
    time from live data (`resolveFaqs()`) so it never drifts from Supabase — verified in the built
    HTML (0 literal tokens left, resolved to the real count). Wired into `sitemap.ts`, the
    homepage's `EXPLORE_LINKS` strip, `Nav.tsx`'s `GUIDE_LINKS` (flows into both the desktop
    dropdown and the mobile panel automatically), and `Footer.tsx`.
  - **`BreadcrumbList` schema** on `/faq` and all 5 guide pages (`who-to-see`, `genre-guide`,
    `lolla-history`, `undercard-picks`, `first-timers-guide`) — schema only, no visible breadcrumb
    UI added (kept out of scope to avoid touching layout).
  - **AI-crawler robots allowlist** (`web/app/robots.ts`): explicit `allow` rules for GPTBot,
    OAI-SearchBot, ChatGPT-User, ClaudeBot, anthropic-ai, Claude-Web, PerplexityBot,
    Perplexity-User, Google-Extended, CCBot, Applebot-Extended, Amazonbot, cohere-ai, and
    Meta-ExternalAgent, alongside the existing `*` rule — same private-path disallow list for all.
  - **Sitemap freshness**: `web/app/sitemap.ts` now sets `lastModified` (a bumpable
    `CONTENT_LAST_MODIFIED` constant) on every route, plus the new `/faq` entry.
  - **Article/OG polish**: the 5 guide pages' `Article` JSON-LD now routes through
    `articleJsonLd()` — fixes a pre-existing bug where `publisher.url` was a hardcoded string
    literal instead of `SITE_URL`, and centralizes the author name (`FESTIVAL.authorName`, was
    duplicated identically 5 times). Each guide page's `openGraph.images`/`twitter.card` was
    upgraded to include `/lineup.png` and `summary_large_image` (previously text-only, small card).
- **E2E**: `web/e2e/homepage.spec.ts` gained a headliner-proof-line regression test; new
  `web/e2e/faq.spec.ts` covers question count, the resolved artist-count token, FAQPage +
  BreadcrumbList JSON-LD shape, and reachability from nav/footer/homepage. Full suite: 35 passed /
  1 pre-existing skip (`full-journey`, needs service-role env) — all pre-existing specs
  (`auth`, `favorites`, `schedule`, `menu`) pass unmodified, confirming the hero/config refactor
  didn't touch unrelated markup.
- **Verified multi-festival-clean**: grepped `LineupExplorer.tsx`, `Countdown.tsx`, and
  `structured-data.ts` for `Lollapalooza`/`Grant Park`/`Chicago`/`172`/`LOLLA` literals post-change
  — zero matches. Everything in the hero and the new schema layer now reads from `FESTIVAL`.
- **Out of scope** (deliberately deferred): the 5 editorial/legal essay pages' prose itself
  (`lolla-history`, `first-timers-guide`, etc.) stays hardcoded narrative — festival-specific by
  nature, not worth templating; the umbrella single-domain multi-festival routing (`/<slug>/`
  paths) per the "don't migrate until after the 2026 festival" plan — `festival.ts` is structured
  so it can grow into a slug-keyed `Record` lookup later without changing its consumers; the
  static repo-root site (`index.html`/`build.js`), not served at the production domain.

## Available Tools (Project Level)

### MCP Servers
| Server | Use for |
|--------|---------|
| `context7` | Library/framework docs lookup |
| `repomix` | Codebase packing and analysis |
| `filesystem` | File operations across `/Users/jacobbrondum` |
| `github` | GitHub API, PRs, issues |
| `mcp-server-firecrawl` | Web scraping and content extraction |
| `figma` | Design file access and token extraction |
| `Neon` | PostgreSQL (not used in this project) |
| `sequential-thinking` | Step-by-step reasoning chains |

### Plugins (Skills)
All user-level plugins are active: `ui-ux-pro-max`, `claude-mem`, `superpowers`, `everything-claude-code`, `prompt-improver`, `playwright-skill`, `cli-anything`, `context7-plugin`, `frontend-design`, `repomix-commands`.

See `~/.claude/CLAUDE.md` for full skill routing table.

## Reusing This Project for Other Festivals
This repo doubles as the **template** for standing up new festival sites. A user-level agent,
`~/.claude/agents/festival-site-builder.md`, takes a lineup poster image and recreates the
product for a new festival (new repo + new Cloudflare project + custom design + a seed into
the shared multi-festival Supabase DB). It reads `FESTIVAL-TEMPLATE.md` (repo root) for the
line-level facts: copy allowlist, `artists.js` field spec, `build.js` edit map, schedule spec,
seed procedure. **Keep `FESTIVAL-TEMPLATE.md` updated in the same commit whenever `build.js`,
the `artists.js` schema, the page set, or the seed scripts change.**

## Notes
- Global skill routing and coding standards are in `~/.claude/CLAUDE.md`
- Arsenal index (skills, agents, MCPs): `~/.claude/skills/INDEX.md`
- `currentDate` is injected by hook at session start

# currentDate
Today's date is 2026-03-24.

## Arsenal (Global)
Skills, agents, and MCP servers are available in every session via `~/.claude/CLAUDE.md`.
Full index with trigger conditions: `~/.claude/skills/INDEX.md`

Key skills active in this project:
- **brand-voice** — marketing copy, messaging, tone review
- **frontend-design** — UI implementation, component design, visual polish
- **canvas-design** — posters, design artifacts, visual systems
- **theme-factory** — apply color/font themes to any artifact
- **figma-automation** — Figma files, tokens, exports via MCP
- **shadcn** — shadcn/ui components and design systems
- **emil-design-eng** — UI polish, animation, micro-interaction guidance
- **userinterface-wiki** — CSS, animation, typography, UX pattern review
- **brand-guidelines** — user-facing copy, error messages, empty states
- **escalation** — incidents and decisions needing executive action
- **context7-mcp** — library/framework documentation lookup
- **neon-postgres** — Neon Serverless Postgres tasks

## Personal Memory MCP

**Server:** `https://memory.jacobmemory.dev/mcp`

- **Session start**: call `search_memory` with keywords relevant to this project or the current task
- **During session**: call `save_memory` when the user shares preferences, decisions, project context, or facts worth retaining long-term — not one-off remarks
- Use tags: `work`, `preferences`, `projects/lolla-2026`, etc.
- Tools: `save_memory` · `search_memory` · `list_memories` · `delete_memory`
