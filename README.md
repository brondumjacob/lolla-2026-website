# Lolla Lineup 2026

The complete Lollapalooza 2026 lineup with direct Spotify and Apple Music links for all 172 artists.

## Files

| File | Description |
|------|-------------|
| `index.html` | Landing page with links to both versions |
| `spotify.html` | Full lineup with Spotify links |
| `apple-music.html` | Full lineup with Apple Music links |
| `privacy.html` | Privacy policy (required for AdSense) |
| `about.html` | About page with disclaimers |

## Deploy

### Option A: Wrangler (current setup)
1. `npm install` (installs `wrangler`)
2. `npm run build` — runs `node build.js`, which pre-renders the lineup from `artists.js` and writes the full site to `dist/` (including `dist/_headers`, which carries the security headers: nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, and a report-only CSP)
3. `npm run deploy` — builds and then runs `wrangler deploy`, serving `dist/` via Cloudflare (see `wrangler.jsonc`)

If a Cloudflare Pages Git integration is (re)connected, it must use build command `node build.js` with output directory `dist` — the old "no build, output `/`" setup no longer applies.

### Option B: Netlify
1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag the entire folder onto the page
3. Add custom domain in Site settings > Domain management

### Option C: GitHub Pages
1. Push to GitHub
2. Settings > Pages > Source: Deploy from branch > Main > Root
3. Your site will be at `https://username.github.io/repo-name/`

## Ads Setup (Google AdSense)
1. Sign up at [adsense.google.com](https://adsense.google.com)
2. Verify site ownership (add their meta tag to each HTML `<head>`)
3. Wait for approval (days to weeks)
4. In each HTML file, find `ca-pub-XXXXXXX` and replace with your publisher ID
5. Uncomment the AdSense script tags
6. Replace `AD SPACE` placeholder divs with your ad unit code

## Affiliate Opportunities
- **Ticketmaster Affiliate Program** — replace the ticket CTA link with your affiliate link
- **Amazon Associates** — add festival gear recommendations
- **Spotify/Apple affiliate links** — some artists may have affiliate-eligible content

## License
This is an unofficial fan project. Not affiliated with Lollapalooza, C3 Presents, or Live Nation.
