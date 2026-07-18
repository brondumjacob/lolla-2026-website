'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AuthStatus from './AuthStatus';
import MyLineupCount from './MyLineupCount';
import NavDropdown from './NavDropdown';

// Top-level desktop pills, shown inline in the nav bar.
const TOP_LINKS = [
  { href: '/', label: 'LINEUP' },
  { href: '/this-week', label: 'THIS WEEK' },
  { href: '/schedule', label: 'SCHEDULE' },
] as const;

const GUIDE_LINKS = [
  { href: '/who-to-see', label: 'Who To See' },
  { href: '/first-timers-guide', label: "First Timer's Guide" },
  { href: '/undercard-picks', label: 'Undercard Picks' },
  { href: '/genre-guide', label: 'Genre Guide' },
  { href: '/lolla-history', label: 'Lolla History' },
] as const;

const ABOUT_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
] as const;

// The full route set, grouped, for the mobile hamburger panel — every public
// (and account) route on the site must be reachable from here (see CLAUDE.md
// Prompt 2 redesign notes / web/e2e/menu.spec.ts). Flat list with section
// labels rather than nested dropdowns: simpler and more reliable on touch.
const MOBILE_GROUPS = [
  { title: 'Lineup', links: [{ href: '/', label: 'Lineup' }, { href: '/my-lineup', label: 'My Lineup' }] },
  { title: 'Guides', links: GUIDE_LINKS },
  { title: 'Plan', links: [{ href: '/this-week', label: 'This Week' }, { href: '/schedule', label: 'Schedule Builder' }] },
  { title: 'About', links: [...ABOUT_LINKS, { href: '/account', label: 'Account' }] },
] as const;

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  function closeMenu() {
    setOpen(false);
  }

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) closeMenu();
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        closeMenu();
        hamburgerRef.current?.focus();
      }
    }

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', closeMenu, { passive: true });

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', closeMenu);
    };
  }, [open]);

  // Focus trap for the mobile panel: move focus to the first link on open,
  // cycle Tab/Shift+Tab within the panel while it's open. Only matters when
  // the panel renders as an overlay (mobile widths) — harmless no-op on
  // desktop since `open` never turns true there (no hamburger to click).
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>('a, button');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !panelRef.current) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [open]);

  return (
    <nav className="site-nav" ref={navRef}>
      <Link href="/" className="nav-home">
        LOLLA 2026
      </Link>

      {/* Desktop-only inline links + grouped dropdowns — hidden via CSS below 769px. */}
      <div className="nav-links-desktop">
        {TOP_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={link.href === pathname ? 'active' : undefined}>
            {link.label}
          </Link>
        ))}
        <NavDropdown label="GUIDES" links={GUIDE_LINKS} />
        <NavDropdown label="ABOUT" links={ABOUT_LINKS} />
      </div>

      <button
        ref={hamburgerRef}
        className="hamburger-btn"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile-only dropdown panel — every route on the site, grouped. Hidden
          via CSS at ≥769px (the desktop links above cover that width instead). */}
      <div className={`nav-links-mobile${open ? ' open' : ''}`} id="mobile-nav-panel" ref={panelRef}>
        {MOBILE_GROUPS.map((group) => (
          <div className="nav-mobile-group" key={group.title}>
            <div className="nav-mobile-group-title">{group.title}</div>
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={link.href === pathname ? 'active' : undefined}
                aria-current={link.href === pathname ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <Link href="/my-lineup" className="nav-mylineup">
        <span className="star-fill">★</span> <span className="nav-mylineup-label">My Lineup</span> (
        <MyLineupCount />)
      </Link>
      <AuthStatus />
    </nav>
  );
}
