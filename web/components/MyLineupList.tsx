'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ArtistWithGenre } from '@/lib/types';
import { DAY_META } from '@/lib/constants';
import { soundcloudUrlForArtist } from '@/lib/soundcloud';
import { useFavorites } from './FavoritesProvider';
import StarToggle from './StarToggle';
import StreamingLinks from './StreamingLinks';

interface MyLineupListProps {
  artists: ArtistWithGenre[];
  /** Whether the festival has ended — see ArtistCard's prop of the same name. */
  festivalIsOver: boolean;
}

export default function MyLineupList({ artists, festivalIsOver }: MyLineupListProps) {
  const { favorites } = useFavorites();
  const [toast, setToast] = useState<string | null>(null);

  const picks = useMemo(
    () => artists.filter((a) => favorites.has(a.name)).sort((a, b) => a.day - b.day || a.name.localeCompare(b.name)),
    [artists, favorites]
  );

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  async function handleShare() {
    if (picks.length === 0) {
      showToast('Star some artists first!');
      return;
    }

    const text = 'My Lolla 2026 Lineup:\n' + picks.map((a) => `• ${a.name} (${a.genre}, Day ${a.day})`).join('\n');

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
      } catch {
        showToast('Copy failed — select the text manually.');
      }
    } else {
      showToast('Copy not supported on this browser.');
    }
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 8,
        }}
      >
        <div>
          <h1>My Lineup</h1>
          <div className="tag">Your starred artists</div>
        </div>
        <button type="button" className="share-btn" onClick={handleShare}>
          Share / Copy My Lineup
        </button>
      </div>

      {picks.length === 0 ? (
        <div className="mylineup-empty">
          <div className="me-title">You haven&#39;t starred anything yet</div>
          <div className="me-desc">
            Browse the <Link href="/lineup">full lineup</Link> and tap a ★ on any artist to build your personal set list.
          </div>
        </div>
      ) : (
        picks.map((a) => (
          <div className="mylineup-row" key={a.id}>
            <span className="ml-day">{DAY_META[a.day].short.split(' ')[0]}</span>
            <span className="ml-name">{a.name}</span>
            <span className="ml-genre">{a.genre}</span>
            <StreamingLinks
              artistName={a.name}
              spotifyUrl={a.spotify_url}
              appleUrl={a.apple_url}
              youtubeUrl={a.youtube_url}
              soundcloudUrl={soundcloudUrlForArtist(a, festivalIsOver)}
            />
            <StarToggle artistName={a.name} />
          </div>
        ))
      )}

      <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(28,21,38,0.5)' }}>
        Tap the ★ on any artist from the <Link href="/lineup">full lineup</Link> to add them here. Saved to this browser —
        and to your account too, once you sign in.
      </p>

      {toast && <div className="toast show">{toast}</div>}
    </>
  );
}
