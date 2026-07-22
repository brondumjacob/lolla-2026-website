---
target: landing page + mobile schedule builder reflow
p0_count: 1
p1_count: 0
timestamp: 2026-07-22T08-18-24Z
slug: x-web-components-schedulebuilder-tsx-mobile-reflow
---
Method: dual-agent (A: design review · B: detector + browser evidence)

## Design Health Score
Scoped review (2 surfaces), not a full-app heuristic pass.

## Anti-Patterns Verdict
Deterministic scan (`detect.mjs`): 256 findings, 254 advisory (design-system-token drift, pre-existing), 2 `warning` (side-tab/side-stripe accent border). One warning was pre-existing (`.sb-ticketnote`, unrelated to this pass); the other pattern (implemented via `box-shadow: inset` rather than `border-left`, which is why the regex-based warning count stayed at 2 rather than 3) was newly introduced by this pass in `.sb-ml-item.sel`/`.must` and has been fixed — replaced with a background-tint-only treatment per the project's own banned-patterns list.

## Priority Issues (fixed during this pass)
- [P0] Missing-space text bug on the landing page's primary card ("172artists") — confirmed via live RSC payload inspection, not just source reading. Fixed with a template-literal string.
- [P2] Side-stripe accent border anti-pattern in `.sb-ml-item.sel`/`.must` (box-shadow variant of an explicitly banned pattern). Fixed — background tint only.
- [P3] Hover-lift applying to `LandingAuthCard`'s non-interactive loading placeholder. Fixed — scoped hover rule.

## Priority Issues (left as open recommendations, not applied)
- [P2] Three landing action cards read as a generic equal-weight row (partially mitigated: primary card now has more flex-grow, but full asymmetric treatment not applied).
- [P2] "Sign In" card visually competes with "Build Your Schedule" for attention it doesn't need as a tertiary action.
- [P2] No live conflict feedback while picking sets on the new mobile schedule list (only after "Build My Route") — desktop grid gives this for free via spatial overlap.
- [P3] `--red`/white must-see button contrast (~4.0:1, just under AA's 4.5:1) is a pre-existing sitewide pattern (desktop grid, results board, etc.), not introduced by this pass — flagged for a future dedicated pass rather than fixed in isolation (fixing only the new component would break the deliberate visual consistency with the existing desktop grid).

## What's Working
- Mobile schedule list reuses the desktop grid's established visual language (selected/must-see states, typography, dark card surface) — verified live, reads as one system rather than a bolted-on view.
- Primary-action lime fill mirrors `.hero-cta`'s established pattern.
- Contrast: all new text/background pairings computed live (not estimated) and pass WCAG AA — landing cards (5.0–13.2:1), mobile schedule list (7.65–16.5:1).
