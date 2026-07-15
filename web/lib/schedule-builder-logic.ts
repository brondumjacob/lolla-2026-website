import type { ScheduleSet } from './types';
import type { DraftSet } from './schedules-storage';

// Pure timeline/conflict-detection functions for the schedule builder —
// extracted from ScheduleBuilder.tsx to keep that file focused on
// rendering. This is a React reimplementation of the algorithms in the
// static site's schedule-thursday/friday/saturday/sunday.html (all four
// were byte-identical in their <script> block), not a verbatim port — see
// Phase 6's decision #1 in 2026-07-09_lolla-accounts-migration-plan.md.
// Grid constants match the original exactly (GS=720/GE=1320/SC=1.50,
// documented in the repo root CLAUDE.md's Schedule Builder Architecture
// section) so the visual layout is pixel-identical.
export const GS = 720; // 12:00 PM, minutes since midnight
export const GE = 1320; // 10:00 PM
export const SC = 1.5; // px per minute

export function timeTop(minutes: number): number {
  return (minutes - GS) * SC;
}

// h>12 branch, not h>=13, matches the original fmt() exactly (so noon
// itself prints "12:00 PM", not "0:00 PM").
export function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const hh = h > 12 ? h - 12 : h;
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${hh}:${mm < 10 ? '0' + mm : mm} ${ap}`;
}

export function hourLabel(minutes: number): string {
  const h = minutes / 60;
  const hh = h > 12 ? h - 12 : h;
  return `${hh} PM`; // every hour mark between GS and GE (noon-10pm) is PM
}

export function regionName(region: string): string {
  if (region === 'S') return 'South end';
  if (region === 'M') return 'Mid-park';
  if (region === 'N') return 'North end';
  return '';
}

export function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

export interface StageColumn {
  stage: string;
  region: string;
  sets: ScheduleSet[];
}

// Groups a day's sets into grid columns, preserving schedule-data.js's
// original row order (stage-contiguous, verified against the source file)
// rather than re-sorting — see the comment on setsForDay in schedule-data.ts.
export function groupSetsByStage(sets: ScheduleSet[]): StageColumn[] {
  const columns: StageColumn[] = [];
  const byStage = new Map<string, StageColumn>();
  for (const s of sets) {
    let col = byStage.get(s.stage);
    if (!col) {
      col = { stage: s.stage, region: s.region, sets: [] };
      byStage.set(s.stage, col);
      columns.push(col);
    }
    col.sets.push(s);
  }
  return columns;
}

export interface Pick extends ScheduleSet {
  must: boolean;
  clash: string[];
  lane: number;
  tag: '' | 'must' | 'partial' | 'head';
}

// Resolves the working selection (name + must-see flags) against the day's
// full set list, sorts chronologically, computes pairwise time clashes,
// greedily lane-packs concurrent picks (for side-by-side board columns),
// and tags each pick must/partial/head for styling — mirrors the original's
// picks.sort + overlaps() double loop + laneEnds greedy packer exactly.
export function computePicks(selection: DraftSet[], allSets: ScheduleSet[]): Pick[] {
  const byName = new Map(allSets.map((s) => [s.name, s]));

  const base = selection
    .map((d) => {
      const s = byName.get(d.name);
      return s ? { ...s, must: d.must } : null;
    })
    .filter((p): p is ScheduleSet & { must: boolean } => p !== null)
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const picks: Pick[] = base.map((p) => ({ ...p, clash: [], lane: 0, tag: '' }));

  for (let i = 0; i < picks.length; i++) {
    for (let j = i + 1; j < picks.length; j++) {
      if (overlaps(picks[i], picks[j])) {
        picks[i].clash.push(picks[j].name);
        picks[j].clash.push(picks[i].name);
      }
    }
  }

  const laneEnds: number[] = [];
  for (const p of picks) {
    let placed = -1;
    for (let k = 0; k < laneEnds.length; k++) {
      if (laneEnds[k] <= p.start) {
        placed = k;
        break;
      }
    }
    if (placed < 0) {
      placed = laneEnds.length;
      laneEnds.push(0);
    }
    p.lane = placed;
    laneEnds[placed] = p.end;
  }

  for (const p of picks) {
    p.tag = p.must ? 'must' : p.clash.length > 0 ? 'partial' : p.open ? 'head' : '';
  }

  return picks;
}

export function laneCount(picks: Pick[]): number {
  return Math.max(1, ...picks.map((p) => p.lane + 1));
}

interface Cluster {
  items: Pick[];
  maxEnd: number;
}

// Sweep-merge of chronologically-sorted picks into overlap clusters — the
// original's `cur && p.s<cur.maxe` scan, a standard merge-overlapping-
// intervals pass over an already (start,end)-sorted list.
function computeClusters(picks: Pick[]): Cluster[] {
  const clusters: Cluster[] = [];
  let cur: Cluster | null = null;
  for (const p of picks) {
    if (cur && p.start < cur.maxEnd) {
      cur.items.push(p);
      cur.maxEnd = Math.max(cur.maxEnd, p.end);
    } else {
      cur = { items: [p], maxEnd: p.end };
      clusters.push(cur);
    }
  }
  return clusters;
}

export interface ConflictPill {
  mid: number;
}

// One CONFLICT pill per cluster that actually contains 2+ clashing picks
// (a cluster can include a pick chained in by proximity to a neighbor
// without directly overlapping every other member), positioned at the
// midpoint of the clashing members' shared overlap window.
export function computeConflictPills(picks: Pick[]): ConflictPill[] {
  const clusters = computeClusters(picks);
  const pills: ConflictPill[] = [];
  for (const c of clusters) {
    const clashItems = c.items.filter((p) => p.clash.length > 0);
    if (clashItems.length < 2) continue;
    const lo = Math.max(...clashItems.map((p) => p.start));
    const hi = Math.min(...clashItems.map((p) => (p.open ? GE : p.end)));
    const mid = hi <= lo ? lo : (lo + hi) / 2;
    pills.push({ mid });
  }
  return pills;
}

// South-to-north geographic order — NOT alphabetical (M < S < N alphabetically
// would garble the pair keys below). Keys must be built from this order, not
// a plain .sort() on the two letters, or "M-S" (alphabetical) would never
// match the "S-M" (geographic) key stored in ZONE_MINUTES.
const ZONE_ORDER = ['S', 'M', 'N'];

// Rough walk/cart time between two Grant Park zones, keyed "S", "S-M", etc.
// Foot estimates: same zone ~3 min, adjacent zone (S<->M or M<->N) ~7 min, far
// zone (S<->N) ~13 min. Cart estimates are roughly half those on foot.
const ZONE_MINUTES: Record<'foot' | 'cart', Record<string, number>> = {
  foot: { S: 3, M: 3, N: 3, 'S-M': 7, 'M-N': 7, 'S-N': 13 },
  cart: { S: 2, M: 2, N: 2, 'S-M': 4, 'M-N': 4, 'S-N': 7 },
};

// Estimated walk/cart time between two stages, purely from their Grant Park
// zone (S/M/N). Only defined when BOTH stages have a confirmed zone — stages
// with no 2026 location yet (Tito's, Airbnb, Kidzapalooza) get no estimate
// rather than a misleading guess.
export function estimateWalkMinutes(regionA: string, regionB: string, mode: 'foot' | 'cart'): number | null {
  if (!regionA || !regionB) return null;
  if (regionA === regionB) return ZONE_MINUTES[mode][regionA] ?? null;
  const [i, j] = [ZONE_ORDER.indexOf(regionA), ZONE_ORDER.indexOf(regionB)].sort((a, b) => a - b);
  if (i < 0 || j < 0) return null;
  const key = `${ZONE_ORDER[i]}-${ZONE_ORDER[j]}`;
  return ZONE_MINUTES[mode][key] ?? null;
}

export interface Transfer {
  gap: number;
  tight: boolean;
  overlap: boolean;
  icon: string;
  direction: string;
  pillText: string;
  walkMins: number | null;
}

// Transfer note between two consecutive picks in the route list — "tight"
// only applies on foot (GA) between different stages under 15 minutes;
// cart transfers are never flagged tight except literal overlaps. Left
// entirely as-is; walkMins is additive info alongside it.
export function computeTransfer(prev: Pick, next: Pick, mode: 'foot' | 'cart'): Transfer {
  const gap = next.start - prev.end;
  const icon = mode === 'cart' ? '🛒' : '🚶';
  const sameStage = prev.stage === next.stage;
  const walkMins = sameStage ? null : estimateWalkMinutes(prev.region, next.region, mode);

  if (gap < 0) {
    return {
      gap,
      tight: true,
      overlap: true,
      icon,
      direction: `${prev.stage} / ${next.stage} clash`,
      pillText: 'overlap',
      walkMins: null,
    };
  }

  const tight = mode === 'foot' && gap < 15 && !sameStage;
  return {
    gap,
    tight,
    overlap: false,
    icon,
    direction: sameStage ? `Stay at ${prev.stage}` : `${prev.stage} → ${next.stage}`,
    pillText: gap === 0 ? 'back-to-back' : `${gap} min gap`,
    walkMins,
  };
}
