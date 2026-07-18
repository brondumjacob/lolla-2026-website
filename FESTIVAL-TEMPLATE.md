# FESTIVAL-TEMPLATE.md — reference for the `festival-site-builder` agent

> **Read by** `~/.claude/agents/festival-site-builder.md` when standing up a new festival site
> from this repo. **Update this file in the same commit whenever `build.js`, `artists.js`'s
> schema, the page set, or the Supabase seed scripts change** — the agent treats a stale copy
> as an error.

## Staleness canary

`build.js` injects exactly these markers into `index.html` (via `inject()`, build.js:191):

```
<!-- BUILD:headliners -->   <!-- /BUILD:headliners -->
<!-- BUILD:majors -->       <!-- /BUILD:majors -->
<!-- BUILD:undercards -->   <!-- /BUILD:undercards -->
<!-- BUILD:hero-img -->     <!-- /BUILD:hero-img -->
```

If `build.js` no longer matches this list, or the `staticAssets`/`staticPages` arrays below
have drifted, this doc is stale: re-derive facts from `CLAUDE.md` + `build.js` + `artists.js`
directly and flag the drift to Jacob.

## 1. Copy allowlist — what goes into a new festival repo

Copy ONLY these files. Never `cp -r` the whole repo.

**Build & config:** `build.js`, `package.json`, `package-lock.json`, `wrangler.jsonc`,
`.gitignore`, `index.html`

**Static assets** (build.js `staticAssets`, line 256): `styles.css`, `robots.txt`,
`sitemap.xml`, `ads.txt`, `artists.js`, `lineup.png`, `nav.js`, `schedule-data.js`,
`favorites.js`

**Static pages** (build.js `staticPages`, line 266): `about.html`, `privacy.html`,
`contact.html`, `terms.html`, `who-to-see.html`, `first-timers-guide.html`,
`undercard-picks.html`, `lolla-history.html`, `genre-guide.html`, `schedule.html`,
`schedule-thursday.html`, `schedule-friday.html`, `schedule-saturday.html`,
`schedule-sunday.html`, `my-lineup.html`

**Seed tooling** (adapted, not run as-is): `scripts/gen-seed.mjs`, `scripts/genre-audit.mjs`

**NEVER copy:** `dist/`, `node_modules/`, `web/` (the shared Next.js app — extended in place,
never duplicated), `supabase/` (migrations belong to the shared DB, not per-festival repos),
`_backup/`, `data/`, `design-system/`, `.ecc-design/`, `.impeccable/`, `.claude/`, `.git/`,
screenshots/`*.png` other than `lineup.png`, planning `.md` notes, `CLAUDE.md`,
`PRODUCT.md`, `DESIGN.md`, this file.

Schedule-related files (`schedule*.html`, `schedule-data.js`) are copied as engine templates
but usually launch **disabled** — see §6.

## 2. `artists.js` field spec

`window.ARTISTS = [ {...} ]` with a `window` shim at the top so Node can `require()` it
(artists.js:5–6). Every artist has ALL 9 fields:

| Field | Meaning | Rules |
|---|---|---|
| `n` | name | Exact billing name from the official lineup |
| `t` | tier | `headliner` \| `major` \| `undercard` — matches Supabase `artists_tier_check` |
| `d` | day | Integer 1–N (Lolla used 1–4; adjust to the festival's day count) |
| `g` | genre | Single primary genre string, **verified** (Spotify/MusicBrainz), never guessed |
| `p` | popularity | 1–100, banded by tier: headliner 90–100, major 50–89, undercard 1–49 |
| `sp` | Spotify URL | Real artist page `https://open.spotify.com/artist/<id>`; fallback `https://open.spotify.com/search/<Name>` |
| `am` | Apple Music URL | Real artist page `https://music.apple.com/us/artist/<id>`; fallback `https://music.apple.com/us/search?term=<Name>` |
| `yt` | YouTube Music URL | ALWAYS search form: `https://music.youtube.com/search?q=<Name>` |
| `desc` | description | 1–2 sentence ORIGINAL bio. Code treats it as optional (`getDesc()` falls back), but the quality bar is 100% coverage — generic filler descriptions caused an AdSense "low value content" rejection |

Description exemplars (the tone to match — specific facts, no templates):
- `"New Jersey solo project of songwriter-producer JohnAnthony, blending synth-pop hooks into one-man-band bedroom production."`
- `"Irish folk trio formed in 2022, spinning contemporary storytelling songs indebted to Luke Kelly and John Prine."`

## 3. `build.js` edit map — every festival-specific location

Zero-dependency Node script; everything else in it is generic. Line anchors as of this commit:

| Location | What to change |
|---|---|
| `DAY_META` (build.js:9–14) | Day count, short labels (`THU 7/30`), full names. Everything downstream (badges, `getDesc`, OG poster) reads this |
| `getDesc()` fallback (build.js:29–32) | Hardcodes "Lollapalooza 2026 in Grant Park, Chicago" |
| `heroImgHTML` (build.js:97–99) | Poster alt text (festival name, artist count, venue, dates) |
| `generateOgSvg()` (build.js:102–188) | `days` array (line 103), `DAY_COLORS`/`DAY_LABELS` (132–133), header title + subtitle (144–145), footer domain (181) |
| `_headers` CSP (build.js:224–230) | Generic — keep. CSP stays **Report-Only** until AdSense domains confirmed for the new site |
| `staticAssets` / `staticPages` (build.js:256, 266) | Trim to the pages that actually exist at launch (rename `lolla-history.html` → `<festival>-history.html`; drop schedule pages if deferred) |

## 4. Page-by-page content brief

| Page | Data-driven vs hand-written | New-festival work |
|---|---|---|
| `index.html` | Artist cards injected by build.js; the shell is hand-written | Rewrite: `<title>`/meta/canonical/OG tags, JSON-LD (`MusicFestival` schema), hero copy, countdown target date, editorial intro (2 always-visible paragraphs + expandable body), footer disclaimer |
| `who-to-see.html`, `first-timers-guide.html`, `undercard-picks.html`, `lolla-history.html`, `genre-guide.html` | 100% hand-written editorial (~800–900 words each) | **Full rewrites grounded in the actual researched roster** — near-duplicate or templated pages are what AdSense flags. `genre-guide` must cite real per-tier/day counts from the new `artists.js` |
| `about/privacy/terms/contact.html` | Boilerplate + festival references | Update festival name, promoter disclaimer ("unofficial fan guide, not affiliated with <festival>, <promoter>"), contact email |
| `my-lineup.html` | Structural (rendered by `favorites.js`) | Only nav branding + the localStorage key (see §8) |
| `schedule*.html` | See §6 | See §6 |
| `robots.txt`, `sitemap.xml`, `ads.txt` | — | New domain in sitemap URLs; `ads.txt` stays placeholder-commented until AdSense approves the new domain |

All pages share `nav.js` (hamburger) and `favorites.js` (stars) — generic, no edits beyond the
storage key. Every place artist data meets `innerHTML` already routes through an `esc()`
helper (build.js:17, favorites.js, schedule pages) — preserve that pattern in any new code.

## 5. Popularity / tier conventions

Tier is a **presentation decision** (headliners = full-width rows, majors = card grid,
undercards = numbered list), inferred from poster font-size bands and reconciled against the
official announcement. `p` sorts within tiers and orders the OG poster; keep it inside the
tier's band or validation should fail.

## 6. Schedule spec (two independent data sources!)

Set times are usually announced **months after** the lineup poster. Default launch mode: no
schedule — remove `schedule*.html` from `staticPages`, remove SCHEDULE nav links (or point the
nav item at a "set times TBA" note), and skip `schedule-data.js` content (an empty
`window.SCHEDULE = []` is fine since it's in `staticAssets`).

When set times drop, TWO things are authored **separately** (the builders do NOT read
`schedule-data.js`):

1. **`schedule-data.js`** → feeds `schedule.html`'s fuzzy "Plan My Schedule" widget.
   `window.SCHEDULE = [{name, day, dayName, stage, start, end, region, open, disp}]` —
   `start`/`end` are minutes since midnight (720 = 12 PM); `region` is a zone code
   (Lolla: S/M/N south/mid/north; define zones per venue); `open` = closing set flag;
   `disp` = display time string.
2. **Per-day builder payloads** inside each `schedule-<day>.html` (~90% of the file is a
   generic engine — tap-select, must-see stars, conflict detection, greedy lane packing,
   printable route). The per-day parts: the inline set grid (`.col` per stage, `.set` buttons
   with `data-name/-stage/-s/-e/-region/-open/-disp`, positioned `top=(start-GS)*SC`,
   `height=(end-start)*SC` with `GS=720, GE=1320, SC=1.50` — adjust GS/GE to gate hours), the
   `DAY={big,date,tix,mode,modeword,note}` object, a unique ~40-word `day-editorial` naming
   that day's real headliners (AdSense: four near-identical pages get flagged), and the
   `.skey` stage-region legend naming actual stages.

Ticket-mode toggle (GA/walking vs VIP/golf-cart) is generic engine; only the `note` copy
names stages.

## 7. Supabase seed (shared DB — no schema changes ever)

Schema (`supabase/migrations/0001_init.sql`) is multi-festival from day one: `festivals`
(unique `slug`) ← `artists` (FK `festival_id`, `unique(festival_id, slug)`, tier CHECK) ←
`artist_genres` (many-to-many, `source` citation column). User tables (`user_favorites`,
`user_schedules`, `schedule_artists`) are festival-agnostic. Public-read RLS on the three
content tables; writes only via seed scripts/service role.

**New festival = data only:**
1. Check slug collision: `select slug from festivals;`
2. Adapt `scripts/gen-seed.mjs`: `FESTIVAL_SLUG` + `FESTIVAL_ID_PLACEHOLDER` (lines 30–31)
   and the festival `insert` values (name/year/location/dates, lines 62–66). It reads the
   new repo's `artists.js` → emits `seed.sql` (1 festival insert + N artist inserts + N
   primary-genre rows sourced `'artists.js (pre-audit)'`).
3. Adapt `scripts/genre-audit.mjs` (MusicBrainz, 1 req/sec, mandatory User-Agent with
   contact email) → emits `seed_genres.sql` with per-row `source` citations and regenerates
   `artists.js` `g:` values in place. Slugify logic must stay identical between the two
   scripts (it is — both copies must be taken together).
4. Execute against the shared project via Supabase MCP `execute_sql`; verify with count
   queries (`artists` and `artist_genres` counts must match `artists.js` length).

**No new Supabase project. No migrations.** The Next.js `web/` app picks the festival up
later by extending `web/lib/festival.ts` + routes — out of scope for a festival-site build.
(As of the 2026-07-18 5-Second Rule / AEO-GEO pass, festival identity for `web/` lives entirely
in `web/lib/festival.ts`'s `FESTIVAL` config — name, wordmark, tagline, venue, dates, stats,
entity `sameAs` links, and FAQ copy — not scattered across components/metadata/JSON-LD anymore.
Picking up a new festival in `web/` means editing that one file plus `DAY_META` in
`web/lib/constants.ts`, which `FESTIVAL.dayDates` must stay in sync with. See CLAUDE.md's
"5-Second Rule / AEO-GEO Pass" section for the full rundown.)

## 8. Per-festival identifiers checklist

Every one of these must be festival-unique:

- [ ] `wrangler.jsonc` → `name` (Cloudflare project; domain attaches in the CF dashboard, not in config)
- [ ] `package.json` → `name`
- [ ] `favorites.js` → localStorage key (`lolla-my-lineup-v1` → `<slug>-my-lineup-v1`)
- [ ] Supabase `festivals.slug` (`<festival>-<year>`)
- [ ] Domain in `sitemap.xml`, canonical/OG tags, `generateOgSvg()` footer
- [ ] Nav wordmark text in every page's header (e.g. "LOLLA 2026")
- [ ] AdSense `ca-pub` id (per-site approval; keep placeholders until approved)

## 9. Redesign surface

The `design-system/` package proved a **full re-theme requires zero JS/HTML structural
changes**: `styles.css` keeps its selectors and swaps values. The theming API is the
`:root` block (styles.css:8–38): palette (`--lime`, `--pink`, `--orange`, `--cyan`, `--red`,
`--card-bg`, `--black`, `--page-bg*`, `--bg-stop-*`), brand service colors (`--sp/--am/--yt`
— keep), type (`--font-display`, `--font-body` + the Google Fonts `<link>` in each page),
shape (`--radius-*`, `--shadow-*`, `--border*`), plus the `body` background gradient. Pages
with embedded `<style>` blocks (index, schedule builders) define their own local variables
(e.g. day-badge colors, region colors `--rS/--rM/--rN`) — restyle those in place. Also
re-derive `build.js` `DAY_COLORS` and the OG-SVG header/footer colors from the new palette.

**Layout caveat (2026-07):** this template's homepage *structure* predates the "Prompt 2"
IA redesign that went into `web/` after Reddit feedback (busy hero, sidebar, endless mobile
scroll). The corrected IA — compact hero (wordmark + subhead + one CTA + info box), one
sticky filter bar (search/day/genre) at every width, headliner feature row above a single
unified major+undercard card grid, complete mobile nav, `content-visibility: auto` instead
of list virtualization — lives in `web/components/LineupExplorer.tsx`, `ArtistCard.tsx`,
`Nav.tsx`, and `web/app/globals.css`. New festival sites restructure the copied
`index.html`/`build.js` card templates to that IA (agent Phase 4 step 4) before re-theming;
the zero-structural-change guarantee above applies to *theming only*. If the redesign is
ever ported back into this template's static files, delete this caveat.

## 10. Umbrella-domain mode (the planned direction)

Jacob's expansion plan (2026-07): all festivals consolidate onto one festival-neutral
**umbrella domain**, each festival living at a path (`<hub-domain>/<slug>/`) — one AdSense
approval inherited by every festival, compounding SEO authority, and alignment with the
planned all-festivals scheduler app. Own-domain-per-festival remains supported for one-offs.
`lolla2026lineup.com` stays untouched until after the 2026 festival (Aug 2), then 301s into
the umbrella.

What changes vs. own-domain mode:

- **Base path — the big one.** This template uses root-relative URLs everywhere
  (`/styles.css`, `/lineup.png`, `href="/about.html"`, `favorites.js` fetch paths,
  `heroImgHTML` in build.js). Under `/<slug>/` these all silently resolve to the hub root.
  Introduce a `BASE_PATH` constant in `build.js` and prefix every generated/static URL
  (or convert pages to relative links). **Audit before deploy:** `grep -rn 'href="/\|src="/'
  dist/` must show only intentionally-absolute (prefixed) URLs.
- **Cloudflare routing:** the festival's Worker attaches to the route
  `<hub-domain>/<slug>/*` on the hub zone instead of getting its own domain. The Worker's
  static-assets serving must strip the prefix or the build must emit files under
  `dist/<slug>/`. `wrangler.jsonc` still gets a unique `name`.
- **robots.txt / ads.txt live at the DOMAIN root only** — they belong to the hub, not the
  festival build. Do not ship them from a festival repo in umbrella mode; instead ensure
  the hub's robots.txt doesn't block the new path and its ads.txt already covers the
  AdSense property.
- **Sitemap:** festival build emits `/<slug>/sitemap.xml` with fully-qualified prefixed
  URLs; the hub root maintains a **sitemap index** referencing each festival's sitemap.
  Canonical/OG/JSON-LD URLs all include the path prefix.
- **AdSense:** the hub's existing approval covers new paths — no new application. Ad units
  can go live at launch (still keep CSP Report-Only until confirmed for the new pages).
- **localStorage:** same-origin means all festivals share storage — the per-festival key
  (`<slug>-my-lineup-v1`, §8) is what keeps favorites from colliding. Never drop the slug
  from the key in umbrella mode.
- **Hub homepage** (built once, separately): a festival index linking each `/<slug>/`
  section — also the natural home for the sitemap index and cross-festival editorial.
- Long-term: the Next.js `web/` app + Supabase (already multi-festival) is the natural
  endpoint of this consolidation; per-festival static builds under paths are the
  transitional form.
