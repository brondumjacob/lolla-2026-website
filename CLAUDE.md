# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project: Lolla 2026 Website

## Purpose
Unofficial fan site for the complete Lollapalooza 2026 lineup (172 artists) with Spotify, Apple Music, and YouTube Music streaming links.

## Status
Live / deployed. Multi-page static site with schedule builders. AdSense wired site-wide (`ca-pub-1043428205440255`). Affiliate links not yet implemented. "Golden Hour" visual redesign integrated (see Design System below) plus a new "My Lineup" favorites feature — star any artist, view/share your picks at `/my-lineup.html`, persisted via `localStorage`.

## Tech Stack
- Pure HTML/CSS/JS — no framework
- `artists.js` — the single source of truth for all artist data
- `build.js` — pre-renders the lineup into `dist/index.html` and copies an allowlist of static files into `dist/`
- Deployed with `wrangler` (v4, npm devDependency): `npm run build` → `dist/` → `npm run deploy` (`wrangler deploy`, see `wrangler.jsonc`)

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
