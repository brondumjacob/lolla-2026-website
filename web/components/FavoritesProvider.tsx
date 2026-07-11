'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import { readLocalFavorites, writeLocalFavorites } from '@/lib/favorites-storage';
import { syncFavorites, setFavorite } from '@/app/favorites/actions';

interface FavoritesContextValue {
  favorites: Set<string>;
  has: (name: string) => boolean;
  toggle: (name: string) => void;
  count: number;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    // Every setFavorites call below runs inside a promise/event callback
    // (never synchronously in the effect body) so the client's first paint
    // still matches the server's empty-favorites markup — no hydration
    // mismatch — mirroring AuthStatus's getUser().then()/onAuthStateChange
    // bootstrap pattern.
    //
    // syncFavorites() runs on every resolved sign-in (mount + each
    // SIGNED_IN event), not just "the first time this browser has ever
    // logged in" — the (user_id, artist_id) unique constraint makes the
    // upsert idempotent, so this never creates duplicates, and it's the
    // only way to pick up local stars added since a previous session's
    // merge (e.g. starred anonymously, signed in again later).
    async function handleUser(userId: string | null) {
      userIdRef.current = userId;
      const localNames = readLocalFavorites();

      if (!userId) {
        setFavorites(new Set(localNames));
        return;
      }

      const result = await syncFavorites(localNames);
      setFavorites(new Set(result.favorites));
      writeLocalFavorites(result.favorites);
    }

    supabase.auth.getUser().then(({ data }) => handleUser(data.user?.id ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleUser(session?.user.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggle = useCallback((name: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      const willBeOn = !next.has(name);
      if (willBeOn) next.add(name);
      else next.delete(name);
      writeLocalFavorites([...next]);

      if (userIdRef.current) {
        // Best-effort: localStorage already reflects intent immediately;
        // if this fails, the next sign-in's syncFavorites() call retries it.
        void setFavorite(name, willBeOn);
      }

      return next;
    });
  }, []);

  const value: FavoritesContextValue = {
    favorites,
    has: (name: string) => favorites.has(name),
    toggle,
    count: favorites.size,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within a FavoritesProvider');
  return ctx;
}
