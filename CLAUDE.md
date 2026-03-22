# Project: Lolla 2026 Website

## Purpose
Unofficial fan site listing the complete Lollapalooza 2026 lineup (172 artists) with direct Spotify and Apple Music links.

## Status
Live / deployed. Static site — no build step. AdSense pending approval. Affiliate links not yet implemented.

## Tech Stack
- Pure HTML/CSS/JS — no framework, no build tool
- `artists.js` is the data source (artist list + streaming links)
- Deployed via Cloudflare Pages (recommended) or GitHub Pages

## Key Paths
- Entry point: `index.html` (landing page, links to both streaming versions)
- Spotify version: `spotify.html`
- Apple Music version: `apple-music.html`
- Artist data: `artists.js`
- Styles: `styles.css`
- Supporting pages: `privacy.html`, `about.html`
- SEO: `sitemap.xml`, `robots.txt`

## Commands
| Task | Command |
|------|---------|
| Local preview | Open `index.html` in browser directly (no server needed) |
| Deploy (Cloudflare) | Push to GitHub → Cloudflare Pages auto-deploys |

## Monetization (Pending)
- Google AdSense: replace `ca-pub-XXXXXXX` in each HTML file with publisher ID, then uncomment AdSense script tags
- Ticketmaster affiliate: replace ticket CTA links with affiliate links
- Amazon Associates: add festival gear recommendations

## Known Issues / Deferred Work
- AdSense approval pending — `ca-pub-XXXXXXX` placeholder still in place
- No analytics implemented yet
- Artist data may need updates as lineup is confirmed/changed

## Notes
- This is a static site — no server-side code, no npm, no dependencies
- All artist data lives in `artists.js` — update this file when the lineup changes
- Global skill routing and coding standards are in `~/.claude/CLAUDE.md`
