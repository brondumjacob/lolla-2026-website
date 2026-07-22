import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-links">
        <Link href="/lineup">Lineup</Link>
        <Link href="/this-week">This Week</Link>
        <Link href="/who-to-see">Guide</Link>
        <Link href="/schedule">Schedule Builder</Link>
        <Link href="/first-timers-guide">First Timer&apos;s Guide</Link>
        <Link href="/undercard-picks">Undercard Picks</Link>
        <Link href="/lolla-history">Lolla History</Link>
        <Link href="/genre-guide">Genre Guide</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/terms">Terms</Link>
      </div>
      AN UNOFFICIAL FAN GUIDE &middot; NOT AFFILIATED WITH LOLLAPALOOZA, C3 PRESENTS, OR LIVE NATION
      <br />
      &copy; 2026 LOLLA LINEUP 2026
    </footer>
  );
}
