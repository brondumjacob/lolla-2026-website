'use client';

import { useCallback, useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from './supabase-browser';
import { readLocalDraft, writeLocalDraft, type DraftSet } from './schedules-storage';
import {
  listSchedules,
  createSchedule,
  saveSchedule,
  deleteSchedule,
  type ScheduleWithSets,
} from '@/app/schedule/actions';

// Deliberately a plain hook, not a context/provider — unlike FavoritesProvider
// (wrapped around every page in layout.tsx), schedule state is only needed by
// the /schedule/[day] builder route. Scoping it there keeps every other
// content page statically generated, with no auth read anywhere near the
// root layout.
export function useSchedules(day: number) {
  const [signedIn, setSignedIn] = useState(false);
  const [saved, setSaved] = useState<ScheduleWithSets[]>([]);
  // null activeId = editing an unsaved draft (anonymous, or a signed-in user
  // who hasn't saved yet); a non-null id = editing one of `saved`.
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState('My Schedule');
  const [sets, setSets] = useState<DraftSet[]>([]);
  const [loading, setLoading] = useState(true);

  // Bootstraps from either localStorage (anonymous) or the server actions
  // (signed in), same hydration-safe shape as FavoritesProvider: initial
  // state is empty (matches SSR markup), every setState happens inside a
  // promise/event callback, never synchronously in the effect body. Depends
  // on `day` directly (not a ref) so navigating between /schedule/[day]
  // routes — which Next.js may keep this component mounted across, since
  // they share a layout — correctly re-bootstraps for the new day instead
  // of reusing the previous day's fetched state.
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    // Tracks the identity bootstrap() last ran for. Supabase fires
    // onAuthStateChange for token refreshes and tab-visibility events too,
    // not just genuine sign-in/out — without this guard, every one of those
    // re-fetches the saved schedule list and overwrites `sets`, silently
    // discarding whatever the user had just selected but not yet saved.
    // Caught via manual testing: selections kept vanishing a few seconds
    // after being made, with no user action to explain it.
    let lastUserId: string | null | undefined = undefined;

    async function bootstrap(userId: string | null) {
      setSignedIn(!!userId);

      if (!userId) {
        setSaved([]);
        setActiveId(null);
        setName('My Schedule');
        setSets(readLocalDraft(day));
        setLoading(false);
        return;
      }

      const schedules = await listSchedules(day);
      setSaved(schedules);

      if (schedules.length > 0) {
        setActiveId(schedules[0].id);
        setName(schedules[0].name);
        setSets(schedules[0].sets);
      } else {
        // No saved schedules yet — stage any local draft as an unsaved
        // schedule rather than auto-creating a DB row on the user's behalf.
        // Unlike favorites (a single flat set, safe to auto-merge),
        // schedules are named objects and multiple can exist, so an
        // explicit "Save" click is what actually creates one.
        setActiveId(null);
        setName('My Schedule');
        setSets(readLocalDraft(day));
      }
      setLoading(false);
    }

    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id ?? null;
      lastUserId = userId;
      bootstrap(userId);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id ?? null;
      if (userId === lastUserId) return; // same identity — a token refresh, not a sign-in/out
      lastUserId = userId;
      bootstrap(userId);
    });

    return () => subscription.unsubscribe();
  }, [day]);

  const persistDraft = useCallback(
    (next: DraftSet[]) => {
      if (!signedIn) writeLocalDraft(day, next);
    },
    [signedIn, day]
  );

  const toggleSet = useCallback(
    (setName: string) => {
      setSets((prev) => {
        const exists = prev.some((s) => s.name === setName);
        const next = exists ? prev.filter((s) => s.name !== setName) : [...prev, { name: setName, must: false }];
        persistDraft(next);
        return next;
      });
    },
    [persistDraft]
  );

  const toggleMust = useCallback(
    (setName: string) => {
      setSets((prev) => {
        const next = prev.map((s) => (s.name === setName ? { ...s, must: !s.must } : s));
        persistDraft(next);
        return next;
      });
    },
    [persistDraft]
  );

  const clearSelection = useCallback(() => {
    setSets([]);
    persistDraft([]);
  }, [persistDraft]);

  // Creates a new saved schedule (signed-in only) from the current working
  // sets and switches the active schedule to it.
  const saveAsNew = useCallback(
    async (scheduleName: string) => {
      const result = await createSchedule(day, scheduleName, sets);
      const schedules = await listSchedules(day);
      setSaved(schedules);
      setActiveId(result.scheduleId);
      setName(scheduleName);
      return result;
    },
    [day, sets]
  );

  // Saves changes to the currently active saved schedule.
  const saveActive = useCallback(async () => {
    if (!activeId) return saveAsNew(name);
    const result = await saveSchedule(activeId, name, sets);
    const schedules = await listSchedules(day);
    setSaved(schedules);
    return result;
  }, [activeId, name, sets, day, saveAsNew]);

  const selectSchedule = useCallback(
    (id: string | null) => {
      if (id === null) {
        setActiveId(null);
        setName('My Schedule');
        setSets([]);
        return;
      }
      const target = saved.find((s) => s.id === id);
      if (!target) return;
      setActiveId(id);
      setName(target.name);
      setSets(target.sets);
    },
    [saved]
  );

  const removeSchedule = useCallback(
    async (id: string) => {
      await deleteSchedule(id);
      const schedules = await listSchedules(day);
      setSaved(schedules);
      if (activeId === id) {
        selectSchedule(schedules[0]?.id ?? null);
      }
    },
    [day, activeId, selectSchedule]
  );

  return {
    loading,
    signedIn,
    saved,
    activeId,
    name,
    // Plain state setter for a controlled name input — deliberately does NOT
    // write through to the server on every keystroke. Renaming is persisted
    // as part of saveActive()/saveAsNew() (both call server actions that
    // update `user_schedules.name` alongside the set list), matching how a
    // "Save" button is expected to behave.
    setName,
    sets,
    toggleSet,
    toggleMust,
    clearSelection,
    saveAsNew,
    saveActive,
    selectSchedule,
    removeSchedule,
  };
}
