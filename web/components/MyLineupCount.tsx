'use client';

import { useFavorites } from './FavoritesProvider';

export default function MyLineupCount() {
  const { count } = useFavorites();
  return <span className="mylineup-count">{count}</span>;
}
