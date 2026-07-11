import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { ScheduleSetSchema, type ScheduleSet } from './types';

// Reads public/schedule-data.js's window.SCHEDULE (191 sets across 4 days) at
// build time, the same node:vm technique lib/data.ts uses for artists.js —
// see that file's comment for why (Turbopack can't resolve a require() path
// computed at runtime, vm.runInContext sidesteps module resolution entirely
// for this one-off trusted local file read). This keeps public/schedule-data.js
// the single source of truth (schedule-planner.js, the vanilla fuzzy planner,
// still loads it directly in the browser) rather than duplicating the data.
//
// Cached at module scope: this file is read once per build/dev-server
// process, not once per request — schedule-data.js doesn't change at runtime.
let cachedSets: ScheduleSet[] | null = null;

function loadScheduleSets(): ScheduleSet[] {
  if (cachedSets) return cachedSets;

  const scheduleDataPath = path.join(process.cwd(), 'public', 'schedule-data.js');
  const source = fs.readFileSync(scheduleDataPath, 'utf8');

  const sandbox: { window: { SCHEDULE?: unknown[] } } = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: scheduleDataPath });

  const raw = sandbox.window.SCHEDULE ?? [];
  cachedSets = raw.map((row) => ScheduleSetSchema.parse(row));
  return cachedSets;
}

export function getScheduleSets(): ScheduleSet[] {
  return loadScheduleSets();
}

// Preserves the source file's original ordering (filtered to one day) rather
// than re-sorting by time — schedule-data.js's rows are already grouped
// contiguously by stage in the same left-to-right order the original static
// builders rendered their grid columns, and re-sorting by start time here
// would interleave stages and break that column grouping. See
// groupSetsByStage in ScheduleBuilder.tsx, which relies on this ordering.
export function setsForDay(day: number): ScheduleSet[] {
  return loadScheduleSets().filter((s) => s.day === day);
}
