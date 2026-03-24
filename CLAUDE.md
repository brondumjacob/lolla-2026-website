# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project: Lolla 2026 Website

## Purpose
Unofficial fan site for the complete Lollapalooza 2026 lineup (172 artists) with Spotify, Apple Music, and YouTube Music streaming links.

## Status
Live / deployed. Single-page static site. AdSense pending approval. Affiliate links not yet implemented.

## Tech Stack
- Pure HTML/CSS/JS — no framework, no build tool, no npm
- `artists.js` — the single source of truth for all artist data
- Deployed via Cloudflare Pages (push to GitHub → auto-deploys)

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
- Entry point: `index.html` — the entire site
- Artist data: `artists.js`
- Styles: `styles.css` (some styles also inline in `index.html`)
- Supporting pages: `privacy.html`, `about.html`
- SEO: `sitemap.xml`, `robots.txt`
- Design explorations: `.ecc-design/redesign-previews/` (not deployed)

## Commands
| Task | Command |
|------|---------|
| Local preview | Open `index.html` directly in browser (no server needed) |
| Deploy | Push to GitHub → Cloudflare Pages auto-deploys |
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
- `currentDate` is injected by hook at session start

# currentDate
Today's date is 2026-03-24.
