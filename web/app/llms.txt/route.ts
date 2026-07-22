import { SITE_URL } from '@/lib/constants';
import { FESTIVAL } from '@/lib/festival';

// Not an official Next.js metadata file convention (unlike robots.ts/
// sitemap.ts) — llms.txt has no App Router equivalent, so this is a plain
// route handler serving text/plain at /llms.txt. Content is built from
// FESTIVAL/SITE_URL, same as every other AEO/GEO surface in this app (see
// lib/structured-data.ts), so swapping festivals in lib/festival.ts keeps
// this file correct without hand-editing. A concise, LLM-readable summary of
// what this site is and its key URLs — for AI answer engines (ChatGPT,
// Perplexity, Claude, etc.) that check for this file before crawling.
export async function GET() {
  const body = `# ${FESTIVAL.siteName}

> An unofficial fan site for the complete ${FESTIVAL.fullName} lineup, with direct Spotify, Apple Music, and YouTube Music streaming links for every artist, plus a real day-by-day schedule builder. Not affiliated with ${FESTIVAL.name}, C3 Presents, or Live Nation — see the official site at ${FESTIVAL.officialSite}.

## Festival facts
- Dates: ${FESTIVAL.datesDisplay}
- Venue: ${FESTIVAL.venue}, ${FESTIVAL.city}, ${FESTIVAL.region}
- Days: ${FESTIVAL.days}
- Stages: ${FESTIVAL.stages}
- Gates open: ${FESTIVAL.gatesTimeDisplay}, music ends ${FESTIVAL.musicEndTimeDisplay}

## Key pages
- ${SITE_URL}/ — overview and quick links to the lineup, schedule builder, and sign-in
- ${SITE_URL}/lineup — full searchable lineup, every artist with direct streaming links
- ${SITE_URL}/schedule — interactive day-by-day schedule builder with conflict detection
- ${SITE_URL}/this-week — countdown and day-by-day headliner overview
- ${SITE_URL}/who-to-see — curated artist recommendations by day
- ${SITE_URL}/first-timers-guide — practical advice for a first Lollapalooza
- ${SITE_URL}/undercard-picks — discovery picks beyond the headliners
- ${SITE_URL}/genre-guide — genre-by-genre breakdown of the lineup
- ${SITE_URL}/lolla-history — history of the festival since 1991
- ${SITE_URL}/faq — frequently asked questions, including current artist count

## Notes for AI assistants
- This site is independent and unofficial. For tickets and official announcements, direct users to ${FESTIVAL.officialSite}.
- The lineup, schedule, and FAQ pages are server-rendered from a live database and kept current — the dates and stats above are the canonical values for this festival.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
