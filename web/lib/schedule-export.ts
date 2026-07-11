'use client';

import { snapdom } from '@zumer/snapdom';

// Client-side only, no server round-trip and no per-export cost — see Phase
// 6's export-library discovery in 2026-07-09_lolla-accounts-migration-plan.md
// for why @zumer/snapdom was chosen over html2canvas/html-to-image.
export async function exportScheduleImage(
  node: HTMLElement,
  filename: string,
  format: 'png' | 'jpg'
): Promise<void> {
  await snapdom.download(node, { format, filename });
}

// Serializes a schedule's rendered markup into a standalone HTML file —
// inlines the page's own stylesheets (so the export doesn't depend on this
// site still being up) and downloads it as a Blob, matching the original
// static builders' "Print / Save PDF" intent but as a portable file instead
// of relying on the browser's print dialog.
export async function exportScheduleHtml(node: HTMLElement, title: string, filename: string): Promise<void> {
  const styleSheets = Array.from(document.styleSheets);
  let css = '';
  for (const sheet of styleSheets) {
    try {
      css += Array.from(sheet.cssRules)
        .map((rule) => rule.cssText)
        .join('\n');
    } catch {
      // Cross-origin stylesheets (e.g. Google Fonts) can't have their rules
      // read directly — fall back to a <link> reference for those below.
    }
  }

  const fontLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis.com"]'))
    .map((link) => link.outerHTML)
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
${fontLinks}
<style>${css}</style>
</head>
<body style="margin:0;background:#fff;">
${node.outerHTML}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
