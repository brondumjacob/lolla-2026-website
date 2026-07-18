import type { ArtistWithGenre } from '@/lib/types';
import { DAY_META } from '@/lib/constants';
import StarToggle from './StarToggle';
import StreamingLinks from './StreamingLinks';

interface ArtistCardProps {
  artist: ArtistWithGenre;
  variant: 'major' | 'undercard';
}

// Single card template shared by the major-act and undercard tiers (Prompt 2
// redesign — previously two separate templates in LineupExplorer.tsx, one of
// which had a redundant wrapper div and both of which used inline styles for
// the description/meta rows instead of classes). variant only changes sizing
// via CSS (.is-major / .is-undercard) — markup is identical, which is what
// lets both tiers render into one .artist-grid. content-visibility on
// .artist-card (see globals.css) is what actually cuts main-thread cost for
// the long tail; every artist's name/genre/description still lands in the
// server-rendered HTML so nothing here hurts crawlability.
export default function ArtistCard({ artist, variant }: ArtistCardProps) {
  return (
    <div className={`artist-card is-${variant}`} role="listitem">
      {/* Same top-row grammar as .hl-feature-card: day marker left, star
          right, then the name on its own full-width line — long one-word
          names ("Neighbourhood", "Beabadoobee") need the whole card width to
          wrap cleanly in a 2-col phone grid. Day is a small colored dot
          (Four-Day-Rule hue, non-text) + the day name in ink — not the
          white-on-color .day-badge pill, whose min-content width was one of
          the things blowing the grid past the viewport edge. */}
      <div className="ac-top">
        <span className={`ac-day ac-day-${artist.day}`}>{DAY_META[artist.day].short}</span>
        <StarToggle artistName={artist.name} />
      </div>
      <span className="ac-name">{artist.name}</span>
      <span className="ac-genre">{artist.genre}</span>
      {artist.description && <p className="ac-desc">{artist.description}</p>}
      <div className="ac-bottom">
        <StreamingLinks
          artistName={artist.name}
          spotifyUrl={artist.spotify_url}
          appleUrl={artist.apple_url}
          youtubeUrl={artist.youtube_url}
        />
      </div>
    </div>
  );
}
