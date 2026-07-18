// Single source of truth for festival identity — name, wordmark, venue, dates,
// facts, and FAQ copy. Everything here was previously hardcoded/duplicated
// across ~20 files (hero, metadata, JSON-LD, Countdown). Standing up the next
// festival on this template should mean editing this file (plus DAY_META in
// constants.ts, which must stay in sync with `dayDates` below) — not hunting
// through components. See CLAUDE.md's AEO/GEO + multi-festival notes and
// FESTIVAL-TEMPLATE.md.

export interface FestivalConfig {
  /** Supabase `festivals.slug` — scopes every artist/favorites/schedule query. */
  slug: string;
  /** The festival's own name, no year — 'Lollapalooza'. */
  name: string;
  year: number;
  /** 'Lollapalooza 2026' — used in schema.org, article copy, page titles. */
  fullName: string;
  /** 'Lolla 2026' — shorter form for nav/countdown/tight UI spaces. */
  shortName: string;
  /** This website's own brand name (distinct from the festival's name) —
      'Lolla Lineup 2026'. Used as schema.org WebSite/Organization name. */
  siteName: string;
  /** Hero wordmark: `text` is the full glyph string rendered in the display
      font; `accent` is the first-matching substring rendered in lime. */
  wordmark: { text: string; accent: string };
  /** Hero subhead, split around the dynamic artist count so the sentence
      reads naturally: `{taglineBeforeCount} {artists.length} {taglineAfterCount}`. */
  taglineBeforeCount: string;
  taglineAfterCount: string;
  venue: string;
  city: string;
  region: string;
  regionCode: string;
  country: string;
  /** ISO date, no time — drives the countdown target and MusicFestival schema. */
  startDate: string;
  endDate: string;
  /** UTC offset for the venue's timezone during the festival, e.g. '-05:00'. */
  timezoneOffset: string;
  /** 24h HH:MM, local to the venue. */
  gatesTime: string;
  musicEndTime: string;
  gatesTimeDisplay: string;
  musicEndTimeDisplay: string;
  /** Pre-formatted display string for the info-box, e.g. 'JUL 30 – AUG 2, 2026'. */
  datesDisplay: string;
  stages: number;
  days: number;
  /** ISO date per festival day (1-4) — must stay in sync with DAY_META's
      `date` field in constants.ts; that one is a short display string, this
      one is the full ISO date the MusicEvent sub-events need. */
  dayDates: Record<number, string>;
  /** The festival's real, official site — referenced in the "is this
      official" FAQ answer. */
  officialSite: string;
  /** Entity-disambiguation links (Wikipedia, Wikidata) for the MusicFestival
      schema's `sameAs`. */
  sameAs: string[];
  /** Article/FAQ JSON-LD author — was duplicated identically across every
      guide page's inline jsonLd literal. */
  authorName: string;
  /** FAQ copy, reused for both the visible /faq page and its FAQPage schema.
      `{{ARTIST_COUNT}}` is replaced with the live artist count at render time
      (see lib/structured-data.ts's `resolveFaqs`) — kept out of this file so
      the count never drifts from the actual Supabase data. */
  faqs: { q: string; a: string }[];
}

export const FESTIVAL: FestivalConfig = {
  slug: 'lollapalooza-2026',
  name: 'Lollapalooza',
  year: 2026,
  fullName: 'Lollapalooza 2026',
  shortName: 'Lolla 2026',
  siteName: 'Lolla Lineup 2026',
  wordmark: { text: 'LOLLAPALOOZA', accent: 'PA' },
  taglineBeforeCount: 'Hear all',
  taglineAfterCount:
    'artists, get direct Spotify, Apple Music & YouTube links, and build a real day-by-day schedule — no app, no login.',
  venue: 'Grant Park',
  city: 'Chicago',
  region: 'Illinois',
  regionCode: 'IL',
  country: 'US',
  startDate: '2026-07-30',
  endDate: '2026-08-02',
  timezoneOffset: '-05:00',
  gatesTime: '11:00',
  musicEndTime: '22:00',
  gatesTimeDisplay: '11:00 AM',
  musicEndTimeDisplay: '10:00 PM',
  datesDisplay: 'JUL 30 – AUG 2, 2026',
  stages: 8,
  days: 4,
  dayDates: {
    1: '2026-07-30',
    2: '2026-07-31',
    3: '2026-08-01',
    4: '2026-08-02',
  },
  officialSite: 'https://www.lollapalooza.com',
  sameAs: ['https://en.wikipedia.org/wiki/Lollapalooza', 'https://www.wikidata.org/wiki/Q745738'],
  authorName: 'Jacob Brondum',
  faqs: [
    {
      q: 'When is Lollapalooza 2026?',
      a: 'Lollapalooza 2026 runs Thursday, July 30 through Sunday, August 2, 2026. Gates typically open at 11:00 AM and music runs until 10:00 PM each day.',
    },
    {
      q: 'Where is Lollapalooza 2026 held?',
      a: "Lollapalooza takes place at Grant Park in downtown Chicago, Illinois — the festival's home venue since it became a destination festival in 2005.",
    },
    {
      q: 'Who is headlining Lollapalooza 2026?',
      a: "Lollapalooza 2026's headliners are listed on this site's homepage, sorted by day — the lineup spans pop, rock, hip-hop, and electronic acts across all four days.",
    },
    {
      q: 'How many artists are playing Lollapalooza 2026?',
      a: '{{ARTIST_COUNT}} artists are confirmed across four days and eight stages, from headliners to undercard acts.',
    },
    {
      q: 'What time do gates open and music end at Lollapalooza?',
      a: 'Gates typically open at 11:00 AM, and music runs until 10:00 PM each day, with after-shows at venues across Chicago running later into the night.',
    },
    {
      q: 'Can I stream the Lollapalooza 2026 lineup before the festival?',
      a: 'Yes — every artist on this site links directly to their Spotify, Apple Music, and YouTube Music pages, so you can start listening before you build your schedule.',
    },
    {
      q: 'Is there a way to plan a Lollapalooza schedule and avoid set-time conflicts?',
      a: "Yes — this site's schedule builder lets you pick sets across all four days and automatically flags overlapping set times so you can plan around conflicts.",
    },
    {
      q: 'Is this the official Lollapalooza website?',
      a: 'No — this is an independent, unofficial fan site. It is not affiliated with Lollapalooza, C3 Presents, or Live Nation. For tickets and official announcements, visit lollapalooza.com.',
    },
  ],
};

/** Splits `wordmark.text` around the first occurrence of `wordmark.accent`
    into [pre, accent, post], for rendering the accent-colored middle span.
    Falls back to [text, '', ''] if the accent string isn't found. */
export function wordmarkParts(wordmark: FestivalConfig['wordmark']): [string, string, string] {
  const index = wordmark.text.indexOf(wordmark.accent);
  if (index === -1) return [wordmark.text, '', ''];
  return [
    wordmark.text.slice(0, index),
    wordmark.text.slice(index, index + wordmark.accent.length),
    wordmark.text.slice(index + wordmark.accent.length),
  ];
}
