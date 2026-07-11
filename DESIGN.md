---
name: Lolla Lineup 2026
description: An unofficial fan site for the complete Lollapalooza 2026 lineup — golden-hour festival warmth, direct streaming links, and a real schedule builder.
colors:
  stage-light-lime: "#CFE23E"
  neon-pink: "#E85BB8"
  neon-pink-deep: "#C73C98"
  sunset-orange: "#E8912B"
  afterglow-teal: "#2FA79C"
  signal-red: "#E6432E"
  backstage-brown: "#2B1B14"
  ink-black: "#211611"
  paper-white: "#FFFFFF"
  golden-hour-bg: "#FFD9C2"
  golden-hour-bg-2: "#FFB89C"
  golden-hour-bg-stop-1: "#FFF0E4"
  golden-hour-bg-stop-4: "#FF9478"
  day-1-violet: "#8B5CF6"
  day-2-pink: "#E85BB8"
  day-3-orange: "#F97316"
  day-4-teal: "#2FA79C"
  spotify-green: "#1DB954"
  apple-red: "#FC3C44"
  youtube-red: "#FF0000"
typography:
  display:
    fontFamily: "'Righteous', cursive"
    fontSize: "clamp(3rem, 8vw, 6.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
  headline:
    fontFamily: "'Righteous', cursive"
    fontSize: "clamp(32px, 6vw, 52px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0"
  title:
    fontFamily: "'Righteous', cursive"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0.02em"
  body:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "'Manrope', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  sm: "12px"
  md: "20px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "32px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink-black}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-primary-hover:
    backgroundColor: "#382a49"
  button-secondary:
    backgroundColor: "{colors.stage-light-lime}"
    textColor: "{colors.ink-black}"
    rounded: "{rounded.pill}"
    padding: "0.55rem 1.2rem"
  button-secondary-hover:
    backgroundColor: "#c3d62e"
  chip-day-1:
    backgroundColor: "{colors.day-1-violet}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
  chip-day-2:
    backgroundColor: "{colors.day-2-pink}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
  chip-day-3:
    backgroundColor: "{colors.day-3-orange}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
  chip-day-4:
    backgroundColor: "{colors.day-4-teal}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.pill}"
  card-major:
    backgroundColor: "rgba(255,255,255,0.55)"
    rounded: "{rounded.md}"
    padding: "1.1rem 1.3rem"
  card-guide:
    backgroundColor: "{colors.backstage-brown}"
    textColor: "{colors.stage-light-lime}"
    rounded: "{rounded.md}"
    padding: "18px 18px"
---

# Design System: Lolla Lineup 2026

## 1. Overview

**Creative North Star: "The Golden Hour Set"**

The whole system reads as warm sunset light hitting a festival crowd right before the headliner walks out: a peach-to-coral sky gradient behind everything, dark stage-lit cards for the moments that matter most (headliner rows, guide cards), and lime/pink/teal accents cutting through like stage lighting. The palette was pulled directly from the real 2026 official Lollapalooza lineup poster, so the site should feel like an extension of that print artifact rather than a generic web template wearing festival colors.

This system explicitly rejects: generic ticketing/corporate sterility (no Ticketmaster-style flatness, no stock-photo festival marketing), cluttered fan-wiki density (172 artists and four days of content must still read clean, never crammed or ad-choked), and the generic AI-SaaS look (no cream/beige near-white defaults, no gradient text, no identical card grids, no tiny uppercase eyebrow-above-every-section scaffolding).

**Key Characteristics:**
- Warm gradient sky as the constant background, never a flat neutral
- Dark "backstage" surfaces reserved for the highest-priority content (headliners, guide cards)
- Four festival days each carry their own signature hue (violet / pink / orange / teal) used consistently everywhere a day is represented
- Fully rounded pills and soft-cornered cards throughout — nothing sharp-edged
- Shadows are soft, diffuse, and only appear as a response to hover/interaction

## 2. Colors

Warm and saturated where it counts (accents, day colors), soft and translucent where it needs to recede (card backgrounds float at partial opacity over the gradient sky rather than sitting on flat white).

### Primary
- **Stage Light Lime** (#CFE23E): the site's signature accent — CTAs, the "MY LINEUP" star, active filter states, countdown numbers on dark surfaces. Used sparingly against dark backgrounds for maximum pop.
- **Neon Pink** (#E85BB8) / **Neon Pink Deep** (#C73C98): secondary accent for editorial emphasis (article pull-quotes, spotlight labels) and Day 2's signature color.
- **Afterglow Teal** (#2FA79C): the "informational" accent — section labels, links, focus rings, tip boxes, Day 4's signature color.

### Secondary
- **Sunset Orange** (#E8912B): Day 3's signature color, used sparingly elsewhere.
- **Signal Red** (#E6432E): reserved for the "My Lineup" day marker and high-attention moments — used narrowly, not as a general accent.

### Neutral
- **Backstage Brown** (#2B1B14): the dark card surface — headliner cards, guide cards, the hero band, footer, countdown blocks, day-panel default. This is the "stage-lit" surface the whole system pivots around.
- **Ink Black** (#211611): primary text color and the site's near-black — used for body copy and as the "black" UI surface (nav pills, buttons) distinct from Backstage Brown.
- **Paper White** (#FFFFFF): text-on-dark and the lightest surface tint (translucent white cards floating over the gradient).
- **Golden Hour Gradient** (#FFF0E4 → #FFD9C2 → #FFB89C → #FF9478): the constant page background, a four-stop vertical gradient plus two soft radial highlights (lime-tinted top-left, teal-tinted top-right) — this never becomes a flat color.

### Day Colors (Named Rule)
**The Four-Day Rule.** Every one of the four festival days has exactly one signature hue, applied identically everywhere that day appears — day badges, sidebar day panels, quick-filter buttons, mobile genre strip. Day 1 is violet (#8B5CF6), Day 2 is Neon Pink (#E85BB8), Day 3 is Sunset Orange (#F97316), Day 4 is Afterglow Teal (#2FA79C). Never reassign these or introduce a fifth ad-hoc day color.

### Named Rules
**The Translucent Float Rule.** Cards sitting on the gradient background use `rgba(255,255,255,0.4–0.55)` at rest, brightening to `0.7–0.9` on hover — never flat opaque white. This keeps every surface visibly part of the same warm sky rather than a white card punched through it.

## 3. Typography

**Display Font:** 'Righteous', cursive
**Body Font:** 'Manrope', sans-serif

**Character:** Righteous is a bold, rounded, poster-style display face — it carries all the "festival poster" energy (hero title, headliner names, section headers, countdown numbers). Manrope is a clean, warm-geometric sans that stays completely out of the way for body copy, labels, and UI chrome. The pairing is a deliberate contrast: loud/decorative display against quiet/functional body, never two similar sans-serifs competing.

### Hierarchy
- **Display** (400, `clamp(3rem, 8vw, 6.5rem)`, line-height 1): the hero "LOLLAPALOOZA" title only — the single loudest moment on the page.
- **Headline** (400, `clamp(32px, 6vw, 52px)`, line-height 1.1): article/guide page titles.
- **Title** (400, ~1.2–2.1rem depending on context, line-height 1.1–1.2): headliner names, major artist card names, sidebar/section titles, countdown numbers, guide card titles — Righteous used at a conversational size wherever an artist or section needs to stand out.
- **Body** (500, 16px, line-height 1.7): all Manrope prose. Article body copy runs at 16–18px with a 1.7–1.8 line-height; cap at ~70ch for the editorial article-wrap column.
- **Label** (700, 0.7–0.85rem, letter-spacing 0.06–0.18em, uppercase): genre tags, day labels, section eyebrows, button/pill text, countdown unit labels — always uppercase, always tracked wide, always Manrope bold.

### Named Rules
**The One Display Face Rule.** Righteous never appears at body-copy sizes or in dense paragraph text — it's reserved for names, titles, and numbers that need poster-level presence. Reaching for it in a caption or a paragraph is a misuse of the hierarchy.

## 4. Elevation

Soft-lifted: surfaces are flat and translucent at rest, and elevation only appears as a response to interaction — hover lifts an element upward (`translateY(-2px)` to `translateY(-4px)`) while its shadow grows from a tight ambient glow to a larger, softer one. There are no hard drop shadows or sharp-edged elevation anywhere in the system; every shadow uses a low-opacity, warm-tinted `rgba(28,21,38,…)` so it reads as ambient light, not a cast shadow.

### Shadow Vocabulary
- **Ambient (`shadow-sm`)** (`0 6px 16px rgba(28,21,38,0.14)`): the resting-state shadow on any card, pill, or button that has one — cards, streaming-link buttons, quick-filter buttons, countdown boxes.
- **Lifted (`shadow-lift`)** (`0 14px 28px rgba(28,21,38,0.24)`): the hover-state shadow, paired with an upward `translateY` — headliner cards, major cards, guide cards, ticket cards, the back-to-top button, nav's My Lineup pill.

### Named Rules
**The Interaction-Only Elevation Rule.** Nothing gets a heavy shadow at rest. Depth is earned by hovering, tapping, or being active — the resting UI stays visually calm against the busy gradient background.

## 5. Components

### Buttons
- **Shape:** fully rounded pill (`border-radius: 999px`) — there are no rectangular or sharp-cornered buttons anywhere in the system.
- **Primary (dark):** Ink Black background, white text, used for the highest-commitment actions (nav's "My Lineup" pill, back-to-top, share button uses Afterglow Teal instead as its own primary-adjacent variant). Padding ~12px 20–22px.
- **Secondary (lime):** Stage Light Lime background, Ink Black text — used for in-content toggles like "Read more" (editorial-toggle). Darkens slightly to `#c3d62e` on hover.
- **Hover / Focus:** all buttons lift (`translateY(-2px)`) and gain the Lifted shadow on hover; focus-visible gets a 3px Afterglow Teal outline with 2px offset — never a browser-default outline, never no visible focus state.

### Chips / Pills (Day Badges & Filters)
- **Style:** fully rounded pill, solid day-color background, white text, no border — used for day badges on artist rows and for quick-filter/genre-strip pills.
- **State:** unselected quick-filters and genre pills sit on translucent white (`rgba(255,255,255,0.6)`); the active state switches to the relevant day's solid color (or Ink Black for the "all" filter) with the Lifted shadow.

### Cards / Containers
- **Corner Style:** 20px radius (`--radius-card`) for primary content cards (headliner rows, major cards, guide cards, ticket cards, artist-spotlight); 12px (`--radius-sm`) for smaller/denser elements (countdown boxes, undercard rows, ad slots).
- **Background:** two families — translucent white float (`rgba(255,255,255,0.4–0.55)`) for most content cards on the gradient background, and Backstage Brown solid for the highest-priority cards (headliner cards, guide cards) which need to visually anchor against the busy sky.
- **Shadow Strategy:** see Elevation — Ambient at rest, Lifted on hover, always paired with an upward translate.
- **Border:** none anywhere in the system (`--border: none`) except a single 1px hairline (`rgba(28,21,38,0.1)`) used only for structural dividers (nav bottom border, article header rule) — never as a decorative accent, and never as a colored side-stripe.

### Inputs / Fields
- **Style:** search/filter inputs inherit the translucent-white, fully-rounded treatment consistent with pills; no visible border at rest.
- **Focus:** 3px Afterglow Teal outline, 2px offset — same focus treatment as buttons and interactive pills, kept consistent across every focusable element.

### Navigation
- Sticky top nav at 56px height, translucent cream background (`rgba(255,240,228,0.75)`) with a 14px backdrop-blur, Righteous wordmark on the left. Nav links are Manrope bold, uppercase-feeling via letter-spacing, with a soft background highlight on hover/active — no underlines. The "My Lineup" link breaks from the flat nav pattern entirely as a solid black pill button with a lime star icon, visually promoted above the other nav items. Mobile collapses into a hamburger that reveals a full-width dropdown panel; touch targets expand to 44px minimum per the site's own accessibility rule.

### Day Panel (Signature Component)
The sidebar's day-selector cards are the system's signature UI element: each of the four days renders as its own solid-color block (using that day's signature hue), showing the day name, date, artist count, and headliner names, with an active-state indicator bar. On mobile these collapse into a horizontally-scrollable, snap-scrolling strip. This component is where the Four-Day color rule is most visible and should be treated as a template for any future per-day UI (e.g. a future schedule-builder day switcher).

## 6. Do's and Don'ts

### Do:
- **Do** keep the four-stop peach/coral gradient (`#FFF0E4 → #FFD9C2 → #FFB89C → #FF9478`) as the constant page background across every page — never swap it for a flat neutral.
- **Do** use fully rounded pills (999px) for every button, badge, and filter chip — no exceptions.
- **Do** apply each festival day's signature color (violet / pink / orange / teal) consistently everywhere that day is represented, per the Four-Day Rule.
- **Do** reserve Righteous for names, titles, and numbers; keep Manrope for everything read as running text.
- **Do** keep shadows soft, warm-tinted, and interaction-only (Ambient at rest, Lifted on hover) — never introduce a hard, dark, or resting-state heavy shadow.
- **Do** maintain WCAG 2.1 AA contrast, especially body text against the warm gradient background — check contrast specifically where translucent white cards sit over the lighter gradient stops.

### Don't:
- **Don't** build a generic ticketing/corporate look — no Ticketmaster/AXS-style sterile flatness, no stock-photo festival marketing imagery.
- **Don't** let the site read as a cluttered fan-wiki or forum — despite 172 artists and four days of content, every list and grid must stay legible and breathing, never ad-choked or dense.
- **Don't** default to the generic AI-generated SaaS look: no cream/beige near-white background as the base surface (the gradient replaces it), no `background-clip: text` gradient headlines, no identical repeating card grids, no tiny uppercase tracked eyebrow line stacked above every single section.
- **Don't** use a colored `border-left`/`border-right` as a decorative accent stripe on any card or list item — the system uses solid backgrounds and pills for emphasis, never side-stripes.
- **Don't** introduce a fifth day color or reassign an existing day's color — the Four-Day Rule is fixed.
- **Don't** use Righteous below ~15px or inside a paragraph of running text — it's a display face, not a body face.
