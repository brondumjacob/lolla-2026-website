'use client';

import { useEffect, useState } from 'react';

// Extracted from LineupExplorer.tsx (was previously only rendered inside the
// homepage sidebar) so it can be reused standalone on /this-week — see
// CLAUDE.md's "Content Depth Initiative" / Prompt 2 redesign notes.
export default function Countdown() {
  const [remaining, setRemaining] = useState<{ days: string; hours: string; mins: string; secs: string }>({
    days: '--',
    hours: '--',
    mins: '--',
    secs: '--',
  });

  useEffect(() => {
    function update() {
      const target = new Date('2026-07-30T12:00:00-05:00').getTime();
      const diff = target - Date.now();
      if (diff <= 0) {
        setRemaining({ days: '00', hours: '00', mins: '00', secs: '00' });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setRemaining({
        days: String(days).padStart(3, '0'),
        hours: String(hours).padStart(2, '0'),
        mins: String(mins).padStart(2, '0'),
        secs: String(secs).padStart(2, '0'),
      });
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="countdown-block" aria-label="Countdown to Lollapalooza 2026">
      <div className="countdown-label">Countdown to Lolla 2026</div>
      <div className="countdown-grid">
        <div className="cd-unit">
          <span className="cd-num">{remaining.days}</span>
          <span className="cd-label">Days</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{remaining.hours}</span>
          <span className="cd-label">Hours</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{remaining.mins}</span>
          <span className="cd-label">Mins</span>
        </div>
        <div className="cd-unit">
          <span className="cd-num">{remaining.secs}</span>
          <span className="cd-label">Secs</span>
        </div>
      </div>
    </div>
  );
}
