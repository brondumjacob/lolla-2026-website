'use client';

import { useState } from 'react';

export default function EditorialToggle({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button className="editorial-toggle" aria-expanded={expanded} onClick={() => setExpanded((v) => !v)}>
        {expanded ? 'READ LESS ▴' : 'READ MORE ▾'}
      </button>
      <div className={`editorial-body${expanded ? ' expanded' : ''}`}>{children}</div>
    </>
  );
}
