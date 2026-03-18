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

### Option A: Cloudflare Pages (recommended)
1. Push this repo to GitHub
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com) > Pages > Create a project
3. Connect your GitHub repo
4. Framework preset: None, build command: (leave blank), output directory: `/`
5. Deploy. Add your custom domain in the Pages settings.

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
