// Centralized schema.org JSON-LD builders. Everything reads from FESTIVAL +
// SITE_URL, so a future festival gets correct structured data just by
// swapping lib/festival.ts — no schema code to touch. This is the AEO/GEO
// layer: the goal is content that Google AI Overviews, ChatGPT, Perplexity,
// and Claude can parse and cite directly, on top of the conventional
// title/description SEO each page already sets.
import { SITE_URL, DAY_META } from './constants';
import { FESTIVAL } from './festival';
import type { ArtistWithGenre } from './types';

/** Serializes a JSON-LD object for a `<script type="application/ld+json">
    dangerouslySetInnerHTML`. Escaping `<` prevents a `</script>` sequence
    inside any string value (an artist name/bio, a festival config string)
    from prematurely closing the script tag and injecting markup — standard
    hardening for this pattern (see OWASP's guidance on JSON-in-HTML
    contexts). Every page that renders one of this file's builders should use
    this instead of a bare `JSON.stringify`. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

// Stable @id anchors so the same Organization/WebSite entity resolves across
// every page that references it, instead of each page declaring an unlinked
// copy. websiteJsonLd() (rendered on the landing page) emits the full nodes;
// musicFestivalJsonLd() references the Organization by @id since it always
// renders alongside websiteJsonLd() on the same page. articleJsonLd() (used
// on standalone guide pages with no websiteJsonLd script present) inlines the
// full nodes with the same @id, so each of those pages is independently
// valid while still resolving to one entity site-wide.
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const AUTHOR_ID = `${SITE_URL}/#author`;

function organizationNode() {
  return {
    '@type': 'Organization' as const,
    '@id': ORG_ID,
    name: FESTIVAL.siteName,
    url: SITE_URL,
    logo: { '@type': 'ImageObject' as const, url: `${SITE_URL}/lineup.jpg` },
  };
}

function organizationRef() {
  return { '@id': ORG_ID };
}

function authorNode() {
  return { '@type': 'Person' as const, '@id': AUTHOR_ID, name: FESTIVAL.authorName };
}

function festivalPlace() {
  return {
    '@type': 'Place' as const,
    name: FESTIVAL.venue,
    address: {
      '@type': 'PostalAddress' as const,
      addressLocality: FESTIVAL.city,
      addressRegion: FESTIVAL.regionCode,
      addressCountry: FESTIVAL.country,
    },
  };
}

function artistToPerformer(artist: ArtistWithGenre) {
  const performer: Record<string, unknown> = { '@type': 'MusicGroup', name: artist.name };
  if (artist.spotify_url) performer.sameAs = [artist.spotify_url];
  return performer;
}

function isoDateTime(isoDate: string, time: string): string {
  return `${isoDate}T${time}:00${FESTIVAL.timezoneOffset}`;
}

function dayMusicEvent(day: number, dayArtists: ArtistWithGenre[]) {
  const isoDate = FESTIVAL.dayDates[day];
  const dayName = DAY_META[day].name; // 'THURSDAY' etc.
  const titleCased = dayName.charAt(0) + dayName.slice(1).toLowerCase();
  return {
    '@type': 'MusicEvent' as const,
    name: `${FESTIVAL.fullName} — ${titleCased}`,
    startDate: isoDateTime(isoDate, FESTIVAL.gatesTime),
    endDate: isoDateTime(isoDate, FESTIVAL.musicEndTime),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: festivalPlace(),
    performer: dayArtists.map(artistToPerformer),
  };
}

/** The WebSite + Organization entity graph — this site's own identity,
    distinct from the festival itself (see musicFestivalJsonLd). Rendered on
    the landing page only; a `@graph` (not two separate scripts) so the
    WebSite's `publisher` can reference the Organization by @id without
    duplicating it. Includes a SearchAction targeting /lineup's live search
    (see LineupExplorer.tsx's `?search=` param handling — this is a real,
    working deep link, not just a schema claim). */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: FESTIVAL.siteName,
        url: SITE_URL,
        description: `The complete ${FESTIVAL.fullName} lineup with direct streaming links, searchable by genre and day.`,
        publisher: organizationRef(),
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/lineup?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

/** The MusicFestival schema — dates, venue, and every artist as a
    performer, plus one MusicEvent sub-event per festival day so "who plays
    Saturday"-style queries have a direct, structured answer. This is the
    single highest-leverage AEO addition: none of this existed before.
    `organizer` references the Organization by @id — always paired with
    websiteJsonLd() on the same page (the landing page), which declares the
    full node. */
export function musicFestivalJsonLd(artists: ArtistWithGenre[]) {
  const days = Object.keys(FESTIVAL.dayDates).map(Number);
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicFestival',
    name: FESTIVAL.fullName,
    startDate: isoDateTime(FESTIVAL.startDate, FESTIVAL.gatesTime),
    endDate: isoDateTime(FESTIVAL.endDate, FESTIVAL.musicEndTime),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: festivalPlace(),
    image: [`${SITE_URL}/lineup.jpg`],
    url: SITE_URL,
    description: `${FESTIVAL.fullName} at ${FESTIVAL.venue}, ${FESTIVAL.city} — ${artists.length} artists across ${FESTIVAL.days} days and ${FESTIVAL.stages} stages.`,
    organizer: organizationRef(),
    performer: artists.map(artistToPerformer),
    subEvent: days.map((day) => dayMusicEvent(day, artists.filter((a) => a.day === day))),
    sameAs: FESTIVAL.sameAs,
  };
}

/** CollectionPage + ItemList for /lineup — the page itself (not the festival
    entity, which lives in musicFestivalJsonLd on the landing page). `isPartOf`
    carries enough of the WebSite node (name/url/@id) to stand alone on this
    page too, without re-declaring the full Organization graph here. */
export function collectionPageJsonLd(artists: ArtistWithGenre[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${FESTIVAL.fullName} — Full Lineup`,
    url: `${SITE_URL}/lineup`,
    description: `Complete ${FESTIVAL.fullName} lineup — ${artists.length} artists across ${FESTIVAL.days} days and ${FESTIVAL.stages} stages, searchable by name, day, and genre.`,
    isPartOf: { '@type': 'WebSite', '@id': WEBSITE_ID, name: FESTIVAL.siteName, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: artists.length,
      itemListElement: artists.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: artistToPerformer(a),
      })),
    },
  };
}

/** Replaces the `{{ARTIST_COUNT}}` token in FESTIVAL.faqs with the live
    artist count, so the FAQ answer never drifts from the actual Supabase
    data. Used by both the visible /faq page and faqPageJsonLd. */
export function resolveFaqs(faqs: { q: string; a: string }[], artistCount: number): { q: string; a: string }[] {
  return faqs.map((f) => ({ q: f.q, a: f.a.replaceAll('{{ARTIST_COUNT}}', String(artistCount)) }));
}

export function faqPageJsonLd(resolvedFaqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: resolvedFaqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export interface ArticleJsonLdOptions {
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  url: string;
  /** Defaults to the shared lineup poster if omitted. */
  image?: string;
  keywords?: string;
  articleSection?: string;
}

/** Replaces each guide page's inline `jsonLd` literal — same shape, but the
    publisher now correctly reads from SITE_URL instead of a hardcoded
    literal, and the author is centralized in FESTIVAL.authorName. Author and
    publisher are full nodes (not bare @id refs) since guide pages render this
    standalone, with no accompanying websiteJsonLd script on the same page —
    but they carry the same @id as the landing page's nodes so the entity
    still resolves to one thing site-wide. */
export function articleJsonLd(opts: ArticleJsonLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    image: [opts.image ?? `${SITE_URL}/lineup.jpg`],
    author: authorNode(),
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    publisher: organizationNode(),
    mainEntityOfPage: opts.url,
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
    ...(opts.articleSection ? { articleSection: opts.articleSection } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
