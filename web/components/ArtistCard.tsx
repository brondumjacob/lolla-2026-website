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
      <div className="ac-top">
        <span className="ac-name">{artist.name}</span>
        <span className={`day-badge day-${artist.day}`}>{DAY_META[artist.day].short}</span>
      </div>
      <span className="ac-genre">{artist.genre}</span>
      {artist.description && <p className="ac-desc">{artist.description}</p>}
      <div className="ac-bottom">
        <StarToggle artistName={artist.name} />
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
