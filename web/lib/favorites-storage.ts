const LOCAL_STORAGE_KEY = 'lolla-my-lineup-v1';

// Same key/shape/validation as the retired public/favorites.js: a
// JSON array of artist name strings. Kept as the anonymous-user store and as
// a mirror of the authenticated state, so the static site's own reads of
// this key (if ever revisited) stay compatible.
export function readLocalFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function writeLocalFavorites(names: string[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(names));
}
