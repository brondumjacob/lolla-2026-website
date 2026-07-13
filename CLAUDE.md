# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project: Lolla 2026 Website

## Purpose
Unofficial fan site for the complete Lollapalooza 2026 lineup (172 artists) with Spotify, Apple Music, and YouTube Music streaming links.

## Status
Live / deployed (the repo-root static site). Multi-page static site with schedule builders. AdSense wired site-wide (`ca-pub-1043428205440255`). Affiliate links not yet implemented. "Golden Hour" visual redesign integrated (see Design System below) plus a new "My Lineup" favorites feature — star any artist, view/share your picks at `/my-lineup.html`, persisted via `localStorage`.

**Migration in progress:** a migration to Supabase (Postgres + Auth) + Next.js + Vercel for accounts, saved schedules, and multi-festival support — see `2026-07-09_lolla-accounts-migration-plan.md` for the full plan and current phase status. Phases 0–6 plus Final Phase verification are done and verified (schema/RLS, genre audit, Next.js scaffold, Google OAuth, favorites migration, multi-schedule export). The Next.js app (`web/`) is live at `lolla-2026-website.vercel.app` (a Vercel Pro preview domain, not yet the production domain fans use — no DNS/domain cutover has happened; Cloudflare stays DNS-only in front of Vercel per that decision). Google OAuth works end-to-end against the preview domain; **before a production domain goes live, the new domain's `/auth/callback` URL must be added to Supabase's Auth → URL Configuration redirect allowlist**, or sign-in will fail on that domain. Email/password sign-in is deliberately not built — Resend (chosen as the SMTP provider to lift Supabase's 2-email/hour cap) was never wired up; the site launches Google-OAuth-only by design.

**Merge History:** `expansion` (9 commits, including the Content Depth Initiative below) was merged into `main` on 2026-07-11. `main` had picked up one independent commit in the meantime (`16cd00c`, `/impeccable` audit/critique fixes — SVG icon sprite, WCAG contrast, touch targets, heading structure, aria-live announcements — to `index.html`/`schedule.html`) that `expansion` didn't have. The merge produced 4 real conflicts (both branches had edited the same `index.html`/`schedule.html` sections independently); resolved by hand to keep **both** main's accessibility/perf fixes and expansion's new content (search, artist descriptions, editorial paragraphs, `lolla-history.html`/`genre-guide.html` cross-links) — nothing from either side was dropped. Verified via `npm run build` (root) and `next build` (`web/`) both passing post-merge.

## Tech Stack
- Pure HTML/CSS/JS — no framework
- `artists.js` — the single source of truth for all artist data
- `build.js` — pre-renders the lineup into `dist/index.html` and copies an allowlist of static files into `dist/`
- Deployed with `wrangler` (v4, npm devDependency): `npm run build` → `dist/` → `npm run deploy` (`wrangler deploy`, see `wrangler.jsonc`)

## Next.js Migration (`web/`)
A separate Next.js 16 (App Router, TypeScript) project, deliberately isolated in its own subdirectory so it can be developed and deployed to Vercel independently while the repo-root static site keeps serving production via Cloudflare Pages unchanged. **`web/AGENTS.md` flags that this Next.js version has breaking changes vs. training data — read `web/node_modules/next/dist/docs/` before assuming an API.** One confirmed drift: `middleware.ts` is renamed to `proxy.ts` in Next.js 16 (exports a `proxy` function).
- `web/app/` — routes: `/`, `/about`, `/privacy`, `/terms`, `/contact`, `/who-to-see`, `/first-timers-guide`, `/undercard-picks`, `/schedule` (Phase 3 content pages), plus `/login`, `/account` (protected), `/auth/callback` (Phase 4 auth)
- `web/lib/data.ts` — fetches festivals/artists/artist_genres from Supabase at build time (public-read RLS tables, plain `@supabase/supabase-js` client via `web/lib/supabase.ts`'s `createBuildTimeClient()`, no cookies needed); Zod-validates every row
- `web/lib/supabase-browser.ts` / `web/lib/supabase-server.ts` — `@supabase/ssr` client factories for auth: browser client for Client Components (`AuthStatus`, `GoogleSignInButton`), server client (cookie-bound via `next/headers`) for the OAuth callback, sign-out action, and `/account`. Three Supabase clients total in this app, each scoped to a different concern — don't cross-use them.
- `web/proxy.ts` — refreshes the Supabase session cookie on every request and redirects unauthenticated visitors away from protected paths (`/account` today; extend the `PROTECTED_PREFIXES` array when `/my-lineup`/schedule builders are ported in Phase 5/6). Uses `getClaims()` (JWT-verified), not `getSession()`, for the auth decision.
- `web/components/LineupExplorer.tsx` — the index page's day/genre filtering, reimplemented as React state (was imperative DOM class-toggling in the static site)
- `web/components/AuthStatus.tsx` — client-side auth state in the nav (`onAuthStateChange`), deliberately kept out of the shared layout so content pages stay statically generated
- `web/public/favorites.js`, `web/public/schedule-data.js`, `web/public/schedule-planner.js` — vanilla JS kept close to its original form (favorites/star system, schedule fuzzy-planner), per the migration plan's explicit allowance not to force a premature React rewrite of code Phase 5 will replace anyway
- `web/next.config.ts` — CSP/security headers ported verbatim from `dist/_headers`
- `web/e2e/` + `web/playwright.config.ts` — Playwright E2E (first in this repo); `npm run test:e2e` in `web/`
- Requires `web/.env.local` (see `web/.env.local.example`) with real Supabase credentials — configured; `next build`/`next dev` work fully
- Connected to Vercel: `lolla-2026-website` project, Root Directory `web`, deployed and live at `lolla-2026-website.vercel.app`. Google OAuth sign-in needs a Google Cloud OAuth client + Supabase provider config (dashboard-only, no code) before it works end-to-end — see the migration plan's Phase 4 section for exact steps.

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
Each builder is a self-contained single-file HTML app with inline CSS + JS.
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
