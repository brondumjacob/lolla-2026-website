import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Schedule Builder — Lolla Lineup 2026',
  description:
    'Build your Lollapalooza 2026 schedule. Interactive day-by-day builders for Thursday, Friday, Saturday, and Sunday. Pick artists, detect conflicts, and print your route.',
  alternates: { canonical: '/schedule' },
  openGraph: {
    title: 'Schedule Builder — Lolla Lineup 2026',
    description: 'Build your Lollapalooza 2026 schedule. Interactive timetable for all 4 days — pick artists, star must-sees, detect conflicts, and print your route.',
    url: `${SITE_URL}/schedule`,
    siteName: 'Lolla Lineup 2026',
    images: ['/lineup.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schedule Builder — Lolla Lineup 2026',
    description: 'Build your Lollapalooza 2026 day-by-day schedule. Pick artists, detect conflicts, and print your route.',
  },
};

const STAR_POINTS = '50,2 60,38 97,38 67,60 78,96 50,73 22,96 33,60 3,38 40,38';

export default function SchedulePage() {
  return (
    <>
      <div className="sched-hero">
        <div className="sched-stars">
          <svg className="sched-star" style={{ width: 52, height: 52, top: 20, right: 30 }} viewBox="0 0 100 100">
            <polygon points={STAR_POINTS} />
          </svg>
          <svg className="sched-star" style={{ width: 28, height: 28, top: 70, right: 90 }} viewBox="0 0 100 100">
            <polygon points={STAR_POINTS} />
          </svg>
          <svg className="sched-star" style={{ width: 18, height: 18, top: 30, right: 100 }} viewBox="0 0 100 100">
            <polygon points={STAR_POINTS} />
          </svg>
        </div>
        <div className="sched-hero-inner">
          <div className="sched-eyebrow">Lollapalooza 2026 · July 30 – Aug 2 · Grant Park, Chicago</div>
          <div className="sched-title">
            Build your
            <br />
            schedule
          </div>
          <p className="sched-sub">
            Tap artists to add them to your plan, star your must-sees, detect time conflicts, and generate a
            printable walking route — one day at a time.
          </p>
        </div>
      </div>

      <div className="sched-grid-wrap">
        <div className="sched-grid-inner">
          <div className="sched-grid-label">Pick your day</div>
          <div className="sched-day-grid">
            <Link href="/schedule/thursday" className="sched-day-card">
              <div className="sched-day-accent" style={{ background: '#8B5CF6' }}></div>
              <div className="sched-day-body">
                <div className="sched-day-label">THURSDAY</div>
                <div className="sched-day-date">July 30, 2026</div>
                <div className="sched-day-headliner">Lorde · John Summit</div>
                <div className="sched-day-cta">Build →</div>
              </div>
            </Link>
            <Link href="/schedule/friday" className="sched-day-card">
              <div className="sched-day-accent" style={{ background: '#E91E8C' }}></div>
              <div className="sched-day-body">
                <div className="sched-day-label">FRIDAY</div>
                <div className="sched-day-date">July 31, 2026</div>
                <div className="sched-day-headliner">Charli XCX · The Smashing Pumpkins</div>
                <div className="sched-day-cta">Build →</div>
              </div>
            </Link>
            <Link href="/schedule/saturday" className="sched-day-card">
              <div className="sched-day-accent" style={{ background: '#F97316' }}></div>
              <div className="sched-day-body">
                <div className="sched-day-label">SATURDAY</div>
                <div className="sched-day-date">August 1, 2026</div>
                <div className="sched-day-headliner">Olivia Dean · Jennie</div>
                <div className="sched-day-cta">Build →</div>
              </div>
            </Link>
            <Link href="/schedule/sunday" className="sched-day-card">
              <div className="sched-day-accent" style={{ background: '#00BCD4' }}></div>
              <div className="sched-day-body">
                <div className="sched-day-label">SUNDAY</div>
                <div className="sched-day-date">August 2, 2026</div>
                <div className="sched-day-headliner">Tate McRae · The xx</div>
                <div className="sched-day-cta">Build →</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="sched-editorial">
        <div className="sched-editorial-inner">
          <p>
            Each day at Lollapalooza 2026 runs on its own timetable across eight stages in Grant Park, and sets
            overlap constantly — there&apos;s no way to catch every artist you want without a plan. This builder
            lays out the full timetable for whichever day you pick, lets you tap artists onto a personal schedule,
            and flags the conflicts before you&apos;re standing between two stages trying to decide. Pick a day
            below, or use the planner to auto-build a route from a list of names.
          </p>
        </div>
      </div>

      <div className="sched-how">
        <div className="sched-how-inner">
          <div className="sched-how-title">How it works</div>
          <div className="sched-steps">
            <div className="sched-step">
              <div className="sched-step-num">1</div>
              <div className="sched-step-title">Select artists</div>
              <div className="sched-step-desc">Tap any artist on the timetable to add them to your plan. Tap again to remove.</div>
            </div>
            <div className="sched-step">
              <div className="sched-step-num">2</div>
              <div className="sched-step-title">Star must-sees</div>
              <div className="sched-step-desc">Once selected, tap the ★ on an artist to mark them as a non-negotiable must-see.</div>
            </div>
            <div className="sched-step">
              <div className="sched-step-num">3</div>
              <div className="sched-step-title">Build your route</div>
              <div className="sched-step-desc">Hit &quot;Build my route&quot; to see your schedule, detect time conflicts, and get a printable walking plan.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sched-back">
        <Link href="/">← Back to full lineup</Link>
      </div>

      <button className="planner-fab" id="plannerFab">
        ⚡ PLAN MY SCHEDULE
      </button>

      <div className="planner-panel" id="plannerPanel" role="dialog" aria-label="Smart schedule planner">
        <div className="planner-head">
          <span className="planner-head-title">Plan my schedule</span>
          <button className="planner-close" id="plannerClose" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="planner-body">
          <label className="planner-label" htmlFor="plannerInput">
            Which artists do you want to see?
          </label>
          <input className="planner-input" type="text" id="plannerInput" placeholder="Lorde, Charli XCX, Tate McRae…" autoComplete="off" />
          <p className="planner-hint">Separate names with commas or &quot;and&quot;. Partial names work too.</p>
          <button className="planner-go" id="plannerGo">
            PLAN IT →
          </button>
        </div>
        <div className="planner-results" id="plannerResults" style={{ display: 'none' }}></div>
      </div>

      <Script src="/schedule-data.js" strategy="afterInteractive" />
      <Script src="/schedule-planner.js" strategy="afterInteractive" />
    </>
  );
}
