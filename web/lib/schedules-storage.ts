export interface DraftSet {
  name: string;
  must: boolean;
}

const LOCAL_STORAGE_KEY = 'lolla-schedule-draft-v1';

function isValidDraftSet(x: unknown): x is DraftSet {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as DraftSet).name === 'string' &&
    typeof (x as DraftSet).must === 'boolean'
  );
}

// The anonymous-user store for the schedule builder: one working draft per
// festival day (not multiple named schedules — that's the signed-in
// benefit, per Phase 6's decision #2), keyed by day number so drafts for
// different days don't clobber each other in the same browser.
function readAllDrafts(): Record<string, DraftSet[]> {
  if (typeof window === 'undefined') return {};
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? '{}');
    if (typeof parsed !== 'object' || parsed === null) return {};
    const result: Record<string, DraftSet[]> = {};
    for (const [day, sets] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(sets)) result[day] = sets.filter(isValidDraftSet);
    }
    return result;
  } catch {
    return {};
  }
}

export function readLocalDraft(day: number): DraftSet[] {
  return readAllDrafts()[String(day)] ?? [];
}

export function writeLocalDraft(day: number, sets: DraftSet[]): void {
  if (typeof window === 'undefined') return;
  const all = readAllDrafts();
  all[String(day)] = sets;
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
}

export function clearLocalDraft(day: number): void {
  if (typeof window === 'undefined') return;
  const all = readAllDrafts();
  delete all[String(day)];
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all));
}
