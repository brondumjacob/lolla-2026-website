#!/usr/bin/env node
'use strict';

const fs = require('fs');

// ── Data ───────────────────────────────────────────────────────────────────
const ARTISTS = require('./artists.js');

const DAY_META = {
  1: { short: 'THU 7/30', name: 'Thursday July 30' },
  2: { short: 'FRI 7/31', name: 'Friday July 31' },
  3: { short: 'SAT 8/1',  name: 'Saturday August 1' },
  4: { short: 'SUN 8/2',  name: 'Sunday August 2' },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dayBadge(d) {
  return `<span class="day-badge day-${d}">${DAY_META[d].short}</span>`;
}

function getDesc(a) {
  if (a.desc) return a.desc;
  return `${a.g} artist performing at Lollapalooza 2026 in Grant Park, Chicago on ${DAY_META[a.d].name}.`;
}

const SPOTIFY_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`;

const APPLE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726a10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03a12.5 12.5 0 001.57-.1c.822-.106 1.596-.35 2.295-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.157-1.07.173-.95.045-1.773-.6-1.943-1.536a1.88 1.88 0 011.038-2.022c.323-.16.67-.25 1.018-.324.378-.082.758-.153 1.134-.24.274-.063.457-.23.51-.516a.904.904 0 00.02-.193c0-1.815 0-3.63-.002-5.443a.725.725 0 00-.026-.185c-.04-.15-.15-.243-.304-.234-.16.01-.318.035-.475.066-.76.15-1.52.303-2.28.456l-2.325.47-1.374.278c-.016.003-.032.01-.048.013-.277.077-.377.203-.39.49-.002.042 0 .086 0 .13-.002 2.602 0 5.204-.003 7.805 0 .42-.047.836-.215 1.227-.278.64-.77 1.04-1.434 1.233-.35.1-.71.16-1.075.172-.96.036-1.755-.6-1.92-1.544-.14-.812.23-1.685 1.154-2.075.357-.15.73-.232 1.108-.31.287-.06.575-.116.86-.177.383-.083.583-.323.6-.714v-.15c0-2.96 0-5.922.002-8.882 0-.123.013-.25.042-.37.07-.285.273-.448.546-.518.255-.066.515-.112.774-.165.733-.15 1.466-.296 2.2-.444l2.27-.46c.67-.134 1.34-.27 2.01-.403.22-.043.442-.088.663-.106.31-.025.523.17.554.482.008.073.012.148.012.223.002 1.91.002 3.822 0 5.732z"/></svg>`;

const YOUTUBE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/></svg>`;

function streamingLinks(a) {
  return `<div class="streaming-links" aria-label="Streaming links for ${esc(a.n)}">` +
    `<a href="${esc(a.sp)}" class="stream-btn" target="_blank" rel="noopener noreferrer" aria-label="Listen to ${esc(a.n)} on Spotify" title="Listen on Spotify">${SPOTIFY_SVG}</a>` +
    `<a href="${esc(a.am)}" class="stream-btn" target="_blank" rel="noopener noreferrer" aria-label="Listen to ${esc(a.n)} on Apple Music" title="Listen on Apple Music">${APPLE_SVG}</a>` +
    `<a href="${esc(a.yt)}" class="stream-btn" target="_blank" rel="noopener noreferrer" aria-label="Listen to ${esc(a.n)} on YouTube Music" title="Listen on YouTube Music">${YOUTUBE_SVG}</a>` +
    `</div>`;
}

// ── Card generators ────────────────────────────────────────────────────────
function headlinerCard(a) {
  return `<div class="headliner-row" role="listitem" data-tier="headliner" data-genre="${esc(a.g)}" data-day="${a.d}">
  <div class="headliner-accent" aria-hidden="true"></div>
  <div style="flex:1;min-width:0">
    <div class="headliner-name">${esc(a.n)}</div>
    <div style="font-family:var(--font-body);font-size:0.85rem;color:rgba(0,0,0,0.5);margin-top:0.2rem;line-height:1.4">${esc(getDesc(a))}</div>
  </div>
  <div class="headliner-meta">
    ${dayBadge(a.d)}
    ${streamingLinks(a)}
  </div>
</div>`;
}

function majorCard(a) {
  return `<div class="major-card" role="listitem" data-tier="major" data-genre="${esc(a.g)}" data-day="${a.d}">
  <div class="major-card-top">
    <div>
      <div class="major-name">${esc(a.n)}</div>
      <div class="major-genre">${esc(a.g)}</div>
    </div>
  </div>
  <div style="font-family:var(--font-body);font-size:0.8rem;color:rgba(0,0,0,0.45);line-height:1.4;margin-bottom:0.5rem">${esc(getDesc(a))}</div>
  <div class="major-card-bottom">
    ${dayBadge(a.d)}
    ${streamingLinks(a)}
  </div>
</div>`;
}

function undercardItem(a, idx) {
  return `<li class="undercard-item" data-tier="undercard" data-genre="${esc(a.g)}" data-day="${a.d}">
  <span class="undercard-num">${String(idx).padStart(2, '0')}</span>
  <span class="undercard-name">${esc(a.n)}</span>
  <span class="undercard-genre">${esc(a.g)}</span>
  ${dayBadge(a.d)}
  <div class="undercard-links" aria-label="Streaming links for ${esc(a.n)}">${streamingLinks(a)}</div>
</li>`;
}

// ── Hero image HTML ────────────────────────────────────────────────────────
const heroImgHTML = `<div class="hero-og-img">
  <img src="/lineup.png" alt="Lollapalooza 2026 official lineup poster — 172 artists, Grant Park Chicago, July 30 to August 2" width="600" height="750" loading="eager" style="width:100%;max-width:600px;height:auto;display:block;margin:1.5rem auto 0;border:3px solid #000;box-shadow:6px 6px 0 #000;">
</div>`;

// ── OG Image SVG — Full Lineup Poster ──────────────────────────────────────
function generateOgSvg() {
  const days = [1, 2, 3, 4];
  const dayHeadliners = {};
  const dayOthers = {};

  days.forEach(d => {
    dayHeadliners[d] = ARTISTS
      .filter(a => a.d === d && a.t === 'headliner')
      .sort((a, b) => b.p - a.p)
      .map(a => esc(a.n.toUpperCase()));
    dayOthers[d] = ARTISTS
      .filter(a => a.d === d && a.t !== 'headliner')
      .sort((a, b) => b.p - a.p)
      .map(a => esc(a.n.toUpperCase()));
  });

  function wrapRows(names, maxLen) {
    const rows = [];
    let cur = '';
    for (const n of names) {
      if (!cur) { cur = n; continue; }
      const test = cur + ' · ' + n;
      if (test.length > maxLen) { rows.push(cur); cur = n; }
      else cur = test;
    }
    if (cur) rows.push(cur);
    return rows;
  }

  const W = 1200;
  const DAY_COLORS  = {1:'#8B5CF6', 2:'#E91E8C', 3:'#F97316', 4:'#00BCD4'};
  const DAY_LABELS  = {1:'THURSDAY · JUL 30', 2:'FRIDAY · JUL 31', 3:'SATURDAY · AUG 1', 4:'SUNDAY · AUG 2'};
  const HL_H  = 88;   // height reserved per headliner line
  const HL_FS = 70;   // headliner font-size
  const ROW_H = 28;   // height per artist row
  const PAD   = 16;   // top/bottom padding per day section

  const parts = [];
  let y = 0;

  // Dark header
  parts.push(`<rect width="${W}" height="108" fill="#15151a"/>`);
  parts.push(`<text x="${W/2}" y="66" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-size="54" font-weight="900" fill="#D3E64C" letter-spacing="6">LOLLAPALOOZA 2026</text>`);
  parts.push(`<text x="${W/2}" y="95" text-anchor="middle" font-family="Arial,sans-serif" font-size="19" fill="rgba(255,255,255,0.5)" letter-spacing="3">JULY 30 – AUGUST 2  ·  GRANT PARK, CHICAGO</text>`);
  y = 108;

  for (const d of days) {
    const hls  = dayHeadliners[d];
    const rows = wrapRows(dayOthers[d], 88);
    const secH = PAD + hls.length * HL_H + rows.length * ROW_H + PAD;

    // Day color bar
    parts.push(`<rect x="0" y="${y}" width="${W}" height="44" fill="${DAY_COLORS[d]}"/>`);
    parts.push(`<text x="50" y="${y+30}" font-family="Arial Black,sans-serif" font-size="21" font-weight="900" fill="#fff" letter-spacing="3">${DAY_LABELS[d]}</text>`);
    y += 44;

    // Day section background
    parts.push(`<rect x="0" y="${y}" width="${W}" height="${secH}" fill="#FAFAF2"/>`);
    y += PAD;

    // Headliner names
    for (const hl of hls) {
      y += HL_H - 16;
      parts.push(`<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-size="${HL_FS}" font-weight="900" fill="#15151a" letter-spacing="-1">${hl}</text>`);
      y += 16;
    }
    y += 4;

    // Other artists, row by row
    for (const row of rows) {
      y += ROW_H - 6;
      parts.push(`<text x="${W/2}" y="${y}" text-anchor="middle" font-family="Arial Narrow,Arial,sans-serif" font-size="17" fill="#333" letter-spacing="0.4">${row}</text>`);
      y += 6;
    }
    y += PAD;
  }

  // Lime footer
  parts.push(`<rect x="0" y="${y}" width="${W}" height="54" fill="#D3E64C"/>`);
  parts.push(`<text x="${W/2}" y="${y+37}" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="26" font-weight="900" fill="#15151a" letter-spacing="5">LOLLA2026LINEUP.COM</text>`);
  y += 54;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" viewBox="0 0 ${W} ${y}">
  <rect width="${W}" height="${y}" fill="#F0A6DC"/>
  ${parts.join('\n  ')}
</svg>`;
}

// ── Inject between BUILD markers ───────────────────────────────────────────
function inject(html, tag, content) {
  const start = `<!-- BUILD:${tag} -->`;
  const end   = `<!-- /BUILD:${tag} -->`;
  const re = new RegExp(`${start}[\\s\\S]*?${end}`, 'g');
  if (!re.test(html)) {
    console.warn(`WARNING: BUILD marker "${tag}" not found in index.html`);
    return html;
  }
  re.lastIndex = 0;
  return html.replace(re, `${start}\n${content}\n${end}`);
}

// ── Main ───────────────────────────────────────────────────────────────────
const HEADLINERS = ARTISTS.filter(a => a.t === 'headliner');
const MAJORS     = ARTISTS.filter(a => a.t === 'major');
const UNDERCARDS = ARTISTS.filter(a => a.t === 'undercard');

const headlinersHTML = HEADLINERS.map(headlinerCard).join('\n');
const majorsHTML     = MAJORS.map(majorCard).join('\n');
const undercardsHTML = UNDERCARDS.map((a, i) => undercardItem(a, i + 1)).join('\n');

// Create output directory
fs.mkdirSync('dist', { recursive: true });

// Build and write index.html into dist/
let html = fs.readFileSync('index.html', 'utf8');
html = inject(html, 'headliners', headlinersHTML);
html = inject(html, 'majors',     majorsHTML);
html = inject(html, 'undercards', undercardsHTML);
html = inject(html, 'hero-img',   heroImgHTML);
fs.writeFileSync('dist/index.html', html);

// Write OG image SVG
fs.writeFileSync('dist/og-image.svg', generateOgSvg());

// Write og-image.jpg — copy from root if available, else generate placeholder
if (fs.existsSync('og-image.jpg')) {
  fs.copyFileSync('og-image.jpg', 'dist/og-image.jpg');
} else if (!fs.existsSync('dist/og-image.jpg')) {
  // Minimal valid 1x1 white JPEG — replace with real 1200x630 image
  const minJpeg = Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U' +
    'HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN' +
    'DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
    'MjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB' +
    '/8QAIRAAAQMEAgMAAAAAAAAAAAAAAQIDBAAFEiExQVH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA' +
    '/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AoOg2tLbZq2OtF4ssFiRVx' +
    'RNFRVxS1VNVRDt/9k=',
    'base64'
  );
  fs.writeFileSync('dist/og-image.jpg', minJpeg);
  console.log('Wrote placeholder dist/og-image.jpg — replace with real 1200x630 image');
}

// Copy static assets
const staticAssets = ['styles.css', 'robots.txt', 'sitemap.xml', 'ads.txt', 'artists.js', 'lineup.png'];
for (const f of staticAssets) {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, `dist/${f}`);
  } else {
    console.warn(`WARNING: ${f} not found, skipping`);
  }
}

// Copy static HTML pages
const staticPages = [
  'about.html', 'privacy.html', 'contact.html', 'terms.html',
  'who-to-see.html', 'first-timers-guide.html', 'undercard-picks.html',
  'schedule.html', 'schedule-thursday.html', 'schedule-friday.html',
  'schedule-saturday.html', 'schedule-sunday.html',
];
for (const f of staticPages) {
  if (fs.existsSync(f)) {
    fs.copyFileSync(f, `dist/${f}`);
  } else {
    console.warn(`WARNING: ${f} not found, skipping`);
  }
}

const totalFiles = 1 + 2 + staticAssets.length + staticPages.length; // index + svg + jpg + assets + pages
console.log(`Build complete: ${HEADLINERS.length} headliners, ${MAJORS.length} majors, ${UNDERCARDS.length} undercards pre-rendered.`);
console.log(`Total artists in HTML: ${ARTISTS.length}`);
console.log(`Output: ${totalFiles} files written to dist/`);
