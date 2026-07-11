'use client';

import { useFavorites } from './FavoritesProvider';

interface StarToggleProps {
  artistName: string;
}

export default function StarToggle({ artistName }: StarToggleProps) {
  const { has, toggle } = useFavorites();
  const saved = has(artistName);

  return (
    <button
      type="button"
      className={`star-toggle${saved ? ' saved' : ''}`}
      aria-label={`${saved ? 'Remove' : 'Save'} ${artistName} ${saved ? 'from' : 'to'} your lineup`}
      title={saved ? 'Remove from My Lineup' : 'Save to My Lineup'}
      onClick={(e) => {
        e.preventDefault();
        toggle(artistName);
      }}
    >
      ★
    </button>
  );
}
