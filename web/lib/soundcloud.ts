// SoundCloud search link — generated, not stored. Unlike spotify_url/apple_url/
// youtube_url (direct artist-page URLs pulled from Supabase), this is a plain
// SoundCloud search query built from the artist's name, so no new DB column or
// migration is needed. Scoped to the genres where fan-uploaded DJ set
// recordings are actually common; other genres get no SoundCloud button at
// all (StreamingLinks already only renders a button when its url prop is
// truthy, so returning null here is enough to hide it).
import { FESTIVAL } from './festival';
import type { ArtistWithGenre } from './types';

/** Genres where SoundCloud live-set / festival-rip uploads are common enough
    to be worth linking. Extend this set (e.g. add 'R&B') if that changes —
    no other code needs to change. */
const SOUNDCLOUD_GENRES = new Set(['Electronic', 'EDM', 'Hip-Hop']);

function soundcloudSearchUrl(query: string): string {
  return `https://soundcloud.com/search?${new URLSearchParams({ q: query })}`;
}

/** Returns the SoundCloud search URL for this artist, or `null` if their
    genre isn't in SOUNDCLOUD_GENRES (no button should render). Before the
    festival ends the query is "<Artist> live" (surfaces existing live sets);
    afterward it's "<Artist> <FESTIVAL.fullName>" (surfaces rips of this
    year's actual set). */
export function soundcloudUrlForArtist(
  artist: Pick<ArtistWithGenre, 'name' | 'genre'>,
  festivalIsOver: boolean
): string | null {
  if (!SOUNDCLOUD_GENRES.has(artist.genre)) return null;
  const query = festivalIsOver ? `${artist.name} ${FESTIVAL.fullName}` : `${artist.name} live`;
  return soundcloudSearchUrl(query);
}
