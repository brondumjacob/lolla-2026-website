// Centralized schema.org JSON-LD builders. Everything reads from FESTIVAL +
// SITE_URL, so a future festival gets correct structured data just by
// swapping lib/festival.ts — no schema code to touch. This is the AEO/GEO
// layer: the goal is content that Google AI Overviews, ChatGPT, Perplexity,
// and Claude can parse and cite directly, on top of the conventional
// title/description SEO each page already sets.
import { SITE_URL, DAY_META } from './constants';
import { FESTIVAL } from './festival';
import type { ArtistWithGenre } from './types';

function organization() {
  return { '@type': 'Organization' as const, name: FESTIVAL.siteName, url: SITE_URL };
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

/** The WebSite schema — this site's own identity, distinct from the
    festival itself (see festivalJsonLd). */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: FESTIVAL.siteName,
    url: SITE_URL,
    description: `The complete ${FESTIVAL.fullName} lineup with direct streaming links, searchable by genre and day.`,
    publisher: organization(),
  };
}

/** The MusicFestival schema — dates, venue, and every artist as a
    performer, plus one MusicEvent sub-event per festival day so "who plays
    Saturday"-style queries have a direct, structured answer. This is the
    single highest-leverage AEO addition: none of this existed before. */
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
    image: [`${SITE_URL}/lineup.png`],
    url: SITE_URL,
    description: `${FESTIVAL.fullName} at ${FESTIVAL.venue}, ${FESTIVAL.city} — ${artists.length} artists across ${FESTIVAL.days} days and ${FESTIVAL.stages} stages.`,
    organizer: organization(),
    performer: artists.map(artistToPerformer),
    subEvent: days.map((day) => dayMusicEvent(day, artists.filter((a) => a.day === day))),
    sameAs: FESTIVAL.sameAs,
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
}

/** Replaces each guide page's inline `jsonLd` literal — same shape, but the
    publisher now correctly reads from SITE_URL instead of a hardcoded
    literal, and the author is centralized in FESTIVAL.authorName. */
export function articleJsonLd(opts: ArticleJsonLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    author: { '@type': 'Person', name: FESTIVAL.authorName },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified,
    publisher: organization(),
    mainEntityOfPage: opts.url,
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
