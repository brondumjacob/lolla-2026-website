'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface NavDropdownProps {
  label: string;
  links: readonly { href: string; label: string }[];
}

// Desktop-only dropdown pill (e.g. "GUIDES ▾" / "ABOUT ▾") used by Nav.tsx to
// group secondary routes without cluttering the top-level bar. Click-toggle
// (not hover) so it works the same for mouse, touch, and keyboard users.
export default function NavDropdown({ label, links }: NavDropdownProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const isGroupActive = links.some((l) => l.href === pathname);

  return (
    <div className="nav-dropdown" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`nav-dropdown-trigger${isGroupActive ? ' active' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {label} <span className="nav-dropdown-caret" aria-hidden="true">▾</span>
      </button>
      <div className={`nav-dropdown-panel${open ? ' open' : ''}`} role="menu">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            role="menuitem"
            className={link.href === pathname ? 'active' : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
