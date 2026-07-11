interface StarToggleProps {
  artistName: string;
}

// Deliberately dumb — favorites.js (loaded globally in the root layout) wires
// up every `.star-toggle` button site-wide via event delegation and persists
// to localStorage. Real React state for this arrives in Phase 5 when
// favorites move to Supabase; porting it early here would be wasted work.
export default function StarToggle({ artistName }: StarToggleProps) {
  return (
    <button
      className="star-toggle"
      data-name={artistName}
      aria-label={`Save ${artistName} to your lineup`}
      title="Save to My Lineup"
    >
      ★
    </button>
  );
}
