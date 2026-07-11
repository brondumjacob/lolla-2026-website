'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import AuthStatus from './AuthStatus';
import MyLineupCount from './MyLineupCount';

const LINKS = [
  { href: '/', label: 'LINEUP' },
  { href: '/who-to-see', label: 'GUIDE' },
  { href: '/schedule', label: 'SCHEDULE' },
  { href: '/about', label: 'ABOUT' },
] as const;

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function closeMenu() {
      setOpen(false);
    }
    function handleOutsideClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) closeMenu();
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') closeMenu();
    }

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', closeMenu, { passive: true });

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', closeMenu);
    };
  }, []);

  return (
    <nav className="site-nav" ref={navRef}>
      <Link href="/" className="nav-home">
        LOLLA 2026
      </Link>
      <button
        className="hamburger-btn"
        aria-label="Menu"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={`nav-links${open ? ' open' : ''}`}>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={link.href === pathname ? 'active' : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <Link href="/my-lineup" className="nav-mylineup">
        <span className="star-fill">★</span> My Lineup (<MyLineupCount />)
      </Link>
      <AuthStatus />
    </nav>
  );
}
