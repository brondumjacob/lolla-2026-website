'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { ScheduleSet } from '@/lib/types';
import type { ScheduleDayMeta } from '@/lib/schedule-days';
import { SCHEDULE_DAYS } from '@/lib/schedule-days';
import { useSchedules } from '@/lib/use-schedules';
import { exportScheduleImage, exportScheduleHtml } from '@/lib/schedule-export';
import {
  GS,
  GE,
  SC,
  timeTop,
  fmt,
  hourLabel,
  regionName,
  groupSetsByStage,
  computePicks,
  computeConflictPills,
  computeTransfer,
  laneCount,
} from '@/lib/schedule-builder-logic';

const STAR_POINTS = '50,2 60,38 97,38 67,60 78,96 50,73 22,96 33,60 3,38 40,38';
const HOUR_MARKS = Array.from({ length: (GE - GS) / 60 + 1 }, (_, i) => GS + i * 60);

interface ScheduleBuilderProps {
  dayMeta: ScheduleDayMeta;
  sets: ScheduleSet[];
}

export default function ScheduleBuilder({ dayMeta, sets }: ScheduleBuilderProps) {
  const schedules = useSchedules(dayMeta.day);
  const [mode, setMode] = useState<'foot' | 'cart'>(dayMeta.defaultMode);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);
  // Hides the right-edge scroll-fade once there's nothing left to reveal —
  // either the grid doesn't overflow at all, or the user has scrolled to the
  // far right. Re-checked on scroll and on resize (rotating a phone changes
  // whether the grid overflows).
  const [scrollAtEnd, setScrollAtEnd] = useState(false);

  const updateScrollFade = useCallback(() => {
    const el = gridScrollRef.current;
    if (!el) return;
    setScrollAtEnd(el.scrollWidth - el.clientWidth <= el.scrollLeft + 4);
  }, []);

  useEffect(() => {
    updateScrollFade();
    window.addEventListener('resize', updateScrollFade);
    return () => window.removeEventListener('resize', updateScrollFade);
  }, [updateScrollFade]);

  const stageColumns = useMemo(() => groupSetsByStage(sets), [sets]);
  const selectedNames = useMemo(() => new Set(schedules.sets.map((s) => s.name)), [schedules.sets]);
  const mustNames = useMemo(
    () => new Set(schedules.sets.filter((s) => s.must).map((s) => s.name)),
    [schedules.sets]
  );

  // Mobile stage-by-stage list state — see the .sb-mobile-only block below
  // for why this exists. Defaults to the first stage in the day's column
  // order (same order the desktop grid uses).
  const [mobileStage, setMobileStage] = useState<string>(stageColumns[0]?.stage ?? '');
  const mobileStageColumn = useMemo(
    () => stageColumns.find((col) => col.stage === mobileStage) ?? stageColumns[0],
    [stageColumns, mobileStage]
  );
  // groupSetsByStage preserves schedule-data.js's original row order, which is
  // stage-contiguous but not guaranteed time-sorted within a stage — sort
  // defensively so the mobile list always reads top-to-bottom chronologically.
  const mobileSets = useMemo(
    () => (mobileStageColumn ? [...mobileStageColumn.sets].sort((a, b) => a.start - b.start) : []),
    [mobileStageColumn]
  );

  // Live-recomputed from current selection rather than snapshotted at
  // "Build my route" click time (the original static builder's behavior) —
  // an intentional improvement, since React state makes this cheap and it
  // means the results panel never goes stale if the grid is edited after
  // opening it.
  const picks = useMemo(() => computePicks(schedules.sets, sets), [schedules.sets, sets]);
  const conflictPills = useMemo(() => computeConflictPills(picks), [picks]);
  const hasClash = picks.some((p) => p.clash.length > 0);
  // Names with a cross-stage time clash in the current selection. The desktop
  // grid surfaces this for free via spatial overlap in the timeline; the
  // mobile list (one stage at a time) has no equivalent, so this drives a
  // per-item indicator there — and the count is shown in .sb-actionbar for
  // both viewports, so picking on mobile doesn't have to wait until "Build
  // my route" to learn about a conflict.
  const clashingNames = useMemo(() => new Set(picks.filter((p) => p.clash.length > 0).map((p) => p.name)), [picks]);
  const clashCount = clashingNames.size;
  const nLanes = laneCount(picks);
  const boardHeight = (GE - GS) * SC;
  // Whether at least one transfer in the route has a zoned walk-time estimate
  // (both stages have a confirmed S/M/N region) — gates the disclaimer so it
  // doesn't show on a route with no estimates to disclaim.
  const hasWalkEstimates = useMemo(
    () => picks.some((p, idx) => idx > 0 && computeTransfer(picks[idx - 1], p, mode).walkMins !== null),
    [picks, mode]
  );

  const mustCount = mustNames.size;
  const tix = mode === 'cart' ? 'PLATINUM VIP · GOLF CART' : 'GENERAL ADMISSION · WALKING';
  const dayNote =
    mode === 'cart'
      ? 'Platinum VIP — transfers are by golf cart, so short gaps between nearby stages are easy. A red CONFLICT means the sets genuinely run at the same time.'
      : "General Admission — you're on foot, so a small gap between far-apart stages can be tight (the far stage is a longer walk). A red CONFLICT means the sets overlap in time.";

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2400);
  }

  function handleClear() {
    schedules.clearSelection();
    setResultsOpen(false);
  }

  async function handleSave() {
    try {
      if (schedules.activeId) {
        await schedules.saveActive();
      } else {
        await schedules.saveAsNew(schedules.name);
      }
      showToast('Schedule saved');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save schedule');
    }
  }

  async function handleExportImage(format: 'png' | 'jpg') {
    if (!resultsRef.current) return;
    try {
      await exportScheduleImage(resultsRef.current, `lolla-2026-${dayMeta.slug}-schedule.${format}`, format);
    } catch {
      showToast('Export failed — try again');
    }
  }

  async function handleExportHtml() {
    if (!resultsRef.current) return;
    try {
      await exportScheduleHtml(
        resultsRef.current,
        `${dayMeta.big} Schedule — Lolla 2026`,
        `lolla-2026-${dayMeta.slug}-schedule.html`
      );
    } catch {
      showToast('Export failed — try again');
    }
  }

  return (
    <div className="sb-frame">
      <div className="sb-day-switcher">
        {SCHEDULE_DAYS.map((d) => (
          <Link key={d.slug} href={`/schedule/${d.slug}`} className={`sb-ds-day${d.slug === dayMeta.slug ? ' active' : ''}`}>
            {d.slug.slice(0, 3).toUpperCase()}
          </Link>
        ))}
      </div>

      <div className="sb-card">
        <header className="sb-mast">
          <svg className="sb-star-svg" style={{ top: 14, right: 18 }} viewBox="0 0 100 100" aria-hidden="true">
            <polygon points={STAR_POINTS} fill="#E6432E" />
          </svg>
          <svg className="sb-star-svg" style={{ top: 44, right: 52, width: 18, height: 18 }} viewBox="0 0 100 100" aria-hidden="true">
            <polygon points={STAR_POINTS} fill="#E6432E" />
          </svg>
          <span className="sb-word">
            <span className="sb-w1">LOLLAPALOOZA</span>
            <span className="sb-w2">{dayMeta.big}</span>
          </span>
          <div className="sb-when">{dayMeta.dateLine}</div>
          <span className="sb-tixbadge">Your ticket: {tix}</span>
          <div className="sb-tix-toggle">
            <button
              type="button"
              className={`sb-tix-opt${mode === 'foot' ? ' active' : ''}`}
              onClick={() => setMode('foot')}
            >
              GA · WALKING
            </button>
            <button
              type="button"
              className={`sb-tix-opt${mode === 'cart' ? ' active' : ''}`}
              onClick={() => setMode('cart')}
            >
              VIP · GOLF CART
            </button>
          </div>
        </header>

        {schedules.signedIn ? (
          <div className="sb-switcher">
            {schedules.saved.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`sb-switcher-item${schedules.activeId === s.id ? ' active' : ''}`}
                onClick={() => schedules.selectSchedule(s.id)}
              >
                {s.name}
                <span
                  className="sb-switcher-del"
                  role="button"
                  aria-label={`Delete ${s.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    void schedules.removeSchedule(s.id);
                  }}
                >
                  ✕
                </span>
              </button>
            ))}
            <button type="button" className="sb-switcher-item" onClick={() => schedules.selectSchedule(null)}>
              + New
            </button>
            <input
              value={schedules.name}
              onChange={(e) => schedules.setName(e.target.value)}
              placeholder="Schedule name"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                borderRadius: 999,
                border: '2px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: '#fff',
                padding: '5px 12px',
              }}
            />
            <button type="button" className="sb-btn sb-go" style={{ padding: '6px 14px', fontSize: 11 }} onClick={handleSave}>
              {schedules.activeId ? 'Save' : 'Save as new'}
            </button>
          </div>
        ) : (
          <div className="sb-signin-prompt">
            Building without an account — <Link href={`/login?next=/schedule/${dayMeta.slug}`}>sign in</Link> to save
            multiple named schedules.
          </div>
        )}

        <div className="sb-howto">
          <b>Tap an artist</b> to add them. On a selected artist, <b>tap the ★</b> to mark it a must-see. Tap the
          artist again to remove it. Then hit <b>Build my route</b>.
        </div>
        <div className="sb-skey">
          <b>
            What <span className="sb-kb sb-region-s">S</span>
            <span className="sb-kb sb-region-m">M</span>
            <span className="sb-kb sb-region-n">N</span> mean — a stage&rsquo;s spot in Grant Park:
          </b>{' '}
          <b>S</b> = south end, <b>M</b> = mid-park, <b>N</b> = north end. The bigger the jump between one set and
          the next, the longer the walk or cart ride. Stages with no letter don&rsquo;t have a confirmed 2026
          location yet.
        </div>
        <div className="sb-scrollhint">Scroll sideways to see all {stageColumns.length} stages →</div>

        {/* Mobile-native reflow: the desktop grid below is an
            ~stageColumns.length*116px-wide horizontal-scroll timetable that
            only shows ~3 of 8 stages at once on a phone, competing with the
            page's own scroll. Below 768px this replaces it — pick a stage,
            then scroll its sets vertically like a normal list. Both views
            render in the DOM (this route is noindex, so there's no SEO cost)
            and are toggled purely by CSS (@media max-width:767px in
            globals.css) rather than JS, so there's no hydration mismatch
            from branching on viewport width. */}
        <div className="sb-mobile-only">
          <div className="sb-stage-select-wrap">
            <label className="sb-stage-select-label" htmlFor="sb-stage-select">
              Stage
            </label>
            <select
              id="sb-stage-select"
              className="sb-stage-select"
              value={mobileStageColumn?.stage ?? ''}
              onChange={(e) => setMobileStage(e.target.value)}
            >
              {stageColumns.map((col) => (
                <option key={col.stage} value={col.stage}>
                  {col.stage}
                  {col.region ? ` (${col.region})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="sb-mobile-list" role="list" aria-label={`${mobileStageColumn?.stage ?? ''} sets`}>
            {mobileSets.map((s) => {
              const isSel = selectedNames.has(s.name);
              const isMust = mustNames.has(s.name);
              const isClash = isSel && clashingNames.has(s.name);
              return (
                <button
                  key={`${s.name}-${s.start}`}
                  type="button"
                  role="listitem"
                  className={`sb-ml-item${isSel ? ' sel' : ''}${isMust ? ' must' : ''}`}
                  aria-pressed={isSel}
                  onClick={() => schedules.toggleSet(s.name)}
                >
                  <span className="sb-ml-time">{s.disp}</span>
                  <span className="sb-ml-name">{s.name}</span>
                  {isClash && (
                    <span className="sb-ml-clash" title="Time conflict with another selected set">
                      ⚠ Conflict
                    </span>
                  )}
                  <span
                    className="sb-ml-mustbtn"
                    role="button"
                    aria-label="Mark as must-see"
                    title="Mark as must-see"
                    onClick={(e) => {
                      e.stopPropagation();
                      schedules.toggleMust(s.name);
                    }}
                  >
                    ★
                  </span>
                </button>
              );
            })}
            {mobileSets.length === 0 && <p className="sb-ml-empty">No sets for this stage.</p>}
          </div>
        </div>

        <div className={`sb-gridouter${scrollAtEnd ? ' sb-scroll-end' : ''}`}>
          <div className="sb-gridwrap" ref={gridScrollRef} onScroll={updateScrollFade}>
            <div className="sb-grid">
              <div className="sb-gutter">
                <div className="sb-ghead" />
                <div className="sb-gtrack">
                  {HOUR_MARKS.map((m) => (
                    <span key={m} className="sb-hr" style={{ top: timeTop(m) }}>
                      {hourLabel(m)}
                    </span>
                  ))}
                </div>
              </div>
              {stageColumns.map((col) => (
                <div className="sb-col" key={col.stage}>
                  <div className="sb-chead">
                    {col.region && <span className={`sb-hreg sb-region-${col.region.toLowerCase()}`}>{col.region}</span>}
                    <span className="sb-sname">{col.stage}</span>
                  </div>
                  <div className="sb-track">
                    {col.sets.map((s) => {
                      const isSel = selectedNames.has(s.name);
                      const isMust = mustNames.has(s.name);
                      return (
                        <button
                          key={`${s.name}-${s.start}`}
                          type="button"
                          className={`sb-set${isSel ? ' sel' : ''}${isMust ? ' must' : ''}`}
                          style={{ top: timeTop(s.start), height: (s.end - s.start) * SC }}
                          aria-pressed={isSel}
                          onClick={() => schedules.toggleSet(s.name)}
                        >
                          <span className="sb-snm">{s.name}</span>
                          <span className="sb-stm">{s.disp}</span>
                          <span
                            className="sb-mustbtn"
                            role="button"
                            aria-label="Mark as must-see"
                            title="Mark as must-see"
                            onClick={(e) => {
                              e.stopPropagation();
                              schedules.toggleMust(s.name);
                            }}
                          >
                            ★
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {resultsOpen && picks.length > 0 && (
          <section className="sb-results show" aria-live="polite" ref={resultsRef}>
            <div className="sb-rmast">
              <svg className="sb-rstar" style={{ top: 10, right: 16 }} viewBox="0 0 100 100">
                <polygon points={STAR_POINTS} fill="#E6432E" />
              </svg>
              <div className="sb-reb">LOLLAPALOOZA 2026 · MY ROUTE MAP</div>
              <div className="sb-rbig">{dayMeta.big}</div>
              <div className="sb-rdate">{dayMeta.dateLine}</div>
            </div>

            <div className="sb-rbar">
              <span className="sb-rtix">{tix}</span>
              <div className="sb-rlegend">
                <span>
                  <span className="sb-lsw" style={{ background: 'var(--lime)', borderColor: 'var(--card-bg)' }} />
                  In plan
                </span>
                <span>
                  <span className="sb-lsw" style={{ background: 'var(--lime)', borderColor: 'var(--red)', borderWidth: 2 }} />
                  Must-see
                </span>
                <span>
                  <span className="sb-rbadge" style={{ background: 'var(--orange)' }}>
                    PARTIAL
                  </span>
                  Time clash
                </span>
                <span>
                  <span className="sb-rbadge" style={{ background: 'var(--card-bg)' }}>
                    HEADLINER
                  </span>
                  Closer
                </span>
                <span style={{ marginLeft: 4 }}>
                  Stage: <span className="sb-rbadge sb-region-s">S</span> <span className="sb-rbadge sb-region-m">M</span>{' '}
                  <span className="sb-rbadge sb-region-n">N</span>
                </span>
              </div>
              <div className="sb-rkey">
                <span className="sb-rbadge sb-region-s">S</span> south end · <span className="sb-rbadge sb-region-m">M</span>{' '}
                mid-park · <span className="sb-rbadge sb-region-n">N</span> north end. The bigger the jump between a set
                and the next, the longer the trip. Unbadged stages have no confirmed 2026 location.
              </div>
            </div>

            <div className="sb-ticketnote">{dayNote}</div>

            <div className="sb-summ">
              {picks.length} set{picks.length === 1 ? '' : 's'} · first at {fmt(picks[0].start)} · last at{' '}
              {fmt(picks[picks.length - 1].start)} · {hasClash ? '⚠ contains time clashes' : '✓ no time clashes'}
            </div>

            <div className="sb-rboard">
              <div className="sb-rgut">
                {HOUR_MARKS.map((m) => (
                  <span key={m} className="sb-rhr" style={{ top: timeTop(m) }}>
                    {hourLabel(m)}
                  </span>
                ))}
              </div>
              <div className="sb-rlanes" style={{ height: boardHeight }}>
                {HOUR_MARKS.map((m) => (
                  <div key={m} className="sb-rline" style={{ top: timeTop(m) }} />
                ))}
                {picks.map((p) => {
                  const top = timeTop(p.start);
                  const end = p.open ? GE : p.end;
                  const height = Math.max(40, (end - p.start) * SC - 4);
                  const left = `calc(${(p.lane * 100) / nLanes}% + 3px)`;
                  const width = `calc(${100 / nLanes}% - 6px)`;
                  const time = p.open ? `${fmt(p.start)} →` : `${fmt(p.start)} – ${fmt(p.end)}`;
                  const tagText = p.tag === 'must' ? 'MUST-SEE' : p.tag === 'partial' ? 'PARTIAL' : p.tag === 'head' ? 'HEADLINER' : '';
                  return (
                    <div
                      key={p.name}
                      className={`sb-rset${p.must ? ' must' : ''}`}
                      style={{ top, height, left, width }}
                    >
                      {tagText && <span className={`sb-rtag ${p.tag}`}>{tagText}</span>}
                      <div className="sb-rn">
                        {p.must ? '★ ' : ''}
                        {p.name}
                      </div>
                      <div className="sb-rmeta">
                        {p.region && <span className={`sb-rreg sb-region-${p.region.toLowerCase()}`}>{p.region}</span>}
                        {p.stage} · {time}
                      </div>
                    </div>
                  );
                })}
                {conflictPills.map((pill, i) => (
                  <div key={i} className="sb-rconf" style={{ top: timeTop(pill.mid) }}>
                    CONFLICT
                  </div>
                ))}
              </div>
            </div>

            <div className="sb-route">
              <div className="sb-rhead">YOUR ROUTE</div>
              {hasWalkEstimates && (
                <div className="sb-rdisclaimer">
                  Walk/cart times below are rough estimates based on stage zone (S/M/N), not measured distances.
                </div>
              )}
              {picks.map((p, idx) => {
                const transfer = idx > 0 ? computeTransfer(picks[idx - 1], p, mode) : null;
                const spineCls = p.must ? 'must' : p.clash.length > 0 ? 'partial' : '';
                const time = p.open ? `${fmt(p.start)} (close)` : `${fmt(p.start)}–${fmt(p.end)}`;
                return (
                  <div key={p.name}>
                    {transfer && (
                      <div className={`sb-xfer${transfer.tight ? ' tight' : ''}`}>
                        <span className="sb-xi">{transfer.icon}</span>
                        <span>
                          {transfer.overlap ? '' : `${mode === 'cart' ? 'Cart' : 'Walk'} · `}
                          {transfer.direction}
                          {transfer.tight && !transfer.overlap ? ' · tight on foot' : ''}
                        </span>
                        <span className="sb-xmeta">
                          {transfer.walkMins !== null && <span className="sb-xwalk">~{transfer.walkMins} min</span>}
                          <span className="sb-xpill">{transfer.pillText}</span>
                        </span>
                      </div>
                    )}
                    <div className="sb-rstep">
                      <div className="sb-rtime">{time}</div>
                      <div className={`sb-rspine ${spineCls}`} />
                      <div className="sb-rcont">
                        <div className="sb-rcname">
                          {p.must ? '★ ' : ''}
                          {p.name}
                        </div>
                        <div className="sb-rcstage">
                          {p.region && <span className={`sb-rreg sb-region-${p.region.toLowerCase()}`}>{p.region}</span>}
                          {p.stage}
                          {p.region ? ` · ${regionName(p.region)}` : ''}
                        </div>
                        {p.clash.length > 0 ? (
                          <div className="sb-rnote warn">⚠ Clashes with {p.clash.join(', ')} — split or choose.</div>
                        ) : p.open ? (
                          <div className="sb-rnote">Closing set — runs to the end of the night.</div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="sb-ractions">
                <button
                  type="button"
                  className="sb-btn sb-ghost"
                  style={{ borderColor: '#bbb', color: '#333' }}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Edit selection
                </button>
                <button type="button" className="sb-btn sb-go" onClick={() => handleExportImage('png')}>
                  Export PNG
                </button>
                <button type="button" className="sb-btn sb-go" onClick={() => handleExportImage('jpg')}>
                  Export JPG
                </button>
                <button type="button" className="sb-btn sb-go" onClick={handleExportHtml}>
                  Export HTML
                </button>
                <button type="button" className="sb-btn sb-go" onClick={() => window.print()}>
                  Print / Save PDF
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      <div className="sb-actionbar">
        <span className="sb-count">
          {schedules.sets.length === 0 ? (
            'No artists selected'
          ) : (
            <>
              <b>{schedules.sets.length}</b> selected{mustCount > 0 ? <> · <i>{mustCount} must-see</i></> : null}
              {clashCount > 0 ? (
                <>
                  {' '}
                  · <i>
                    ⚠ {clashCount} conflict{clashCount === 1 ? '' : 's'}
                  </i>
                </>
              ) : null}
            </>
          )}
        </span>
        <button type="button" className="sb-btn sb-ghost" onClick={handleClear}>
          Clear
        </button>
        <button
          type="button"
          className="sb-btn sb-go"
          disabled={schedules.sets.length === 0}
          onClick={() => setResultsOpen(true)}
        >
          Build my route
        </button>
      </div>

      {toast && <div className="toast show">{toast}</div>}
    </div>
  );
}
