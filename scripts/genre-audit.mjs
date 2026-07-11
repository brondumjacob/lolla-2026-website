// Phase 2 — Genre audit. Queries MusicBrainz for all 172 artists in artists.js,
// synthesizes cited primary/secondary genres, and writes:
//   data/musicbrainz-raw.json  — raw cached API responses (audit trail, resumable)
//   data/genres.json           — per-artist synthesis result
//   data/genre-diff.md         — old vs new genre, for Jacob's later spot-check
//   supabase/seed_genres.sql   — replaces the Phase 1 placeholder artist_genres rows
//   artists.js                 — regenerated in place, only `g:"..."` values change
//
// Build-time CLI script (same category as build.js / scripts/gen-seed.mjs).
// Usage: node scripts/genre-audit.mjs
//
// Source: 2026-07-09_lolla-accounts-migration-plan.md, Phase 2.
// MusicBrainz API rules confirmed live 2026-07-09: 1 req/sec, mandatory
// User-Agent "AppName/Version ( contact )".

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);

// ── Load artists.js the same way scripts/gen-seed.mjs does ────────────────
global.window = {};
const artistsPath = path.join(ROOT, 'artists.js');
require(artistsPath);
const ARTISTS = global.window.ARTISTS;

if (!Array.isArray(ARTISTS) || ARTISTS.length === 0) {
  throw new Error(`Failed to load window.ARTISTS from ${artistsPath}`);
}
console.log(`Loaded ${ARTISTS.length} artists from artists.js`);

// ── Slug logic — must match scripts/gen-seed.mjs exactly so joins work ────
function slugify(name) {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
const seenSlugs = new Map();
function uniqueSlug(name) {
  const base = slugify(name);
  const count = seenSlugs.get(base) ?? 0;
  seenSlugs.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}
const SLUGS = ARTISTS.map(a => uniqueSlug(a.n));

function sqlQuote(value) {
  if (value === null || value === undefined) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

// ── MusicBrainz client ──────────────────────────────────────────────────
const MB_USER_AGENT = 'LollaGenreAudit/1.0 ( jacob.t.brondum@gmail.com )';
const MB_RATE_MS = 1100; // > 1 req/sec, safety margin

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function mbFetch(url) {
  const res = await fetch(url, { headers: { 'User-Agent': MB_USER_AGENT, Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`MusicBrainz HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

async function mbSearch(name) {
  const q = encodeURIComponent(`artist:"${name.replace(/"/g, '\\"')}"`);
  const url = `https://musicbrainz.org/ws/2/artist/?query=${q}&fmt=json&limit=15`;
  return mbFetch(url);
}

async function mbLookup(mbid) {
  const url = `https://musicbrainz.org/ws/2/artist/${mbid}?inc=genres+tags&fmt=json`;
  return mbFetch(url);
}

// Manually verified overrides for artists whose plain name search collides
// with many unrelated same-named MusicBrainz entries (common-word band
// names) where a blind top-score pick would be wrong. Each entry here was
// checked by hand against live MusicBrainz search results on 2026-07-09.
//
// "Worship" — the Lollapalooza 2026 undercard act — collides with dozens of
// Christian worship-music groups, black/doom metal bands, and a harsh-noise
// project also literally named "Worship"/"WORSHIP". The correct MBID is the
// D&B supergroup entry, confirmed via its MusicBrainz disambiguation text:
// "Drum & Bass supergroup composed of Sub Focus, Dimension, Culture Shock,
// and 1991" — matching the known-bug note in the migration plan.
const MANUAL_MBID_OVERRIDES = {
  worship: 'c9d357fe-a149-4556-9174-305f81f2a289',
  // "Jade" (major tier, ex-Little Mix, see artists.js desc) collides with 7
  // other same-named MusicBrainz entries scored within 2 points of each
  // other (ambient electronic producer, RnB girl group, D&B artist, etc).
  // Confirmed correct entry by cross-referencing the existing `desc` field.
  jade: 'f4108df8-cf1f-4279-a840-599b2a291127',
};

// Artists whose name collides with too many equally-plausible, wildly
// different MusicBrainz entries to trust an automated top-score pick (no
// existing `desc`/context strong enough to disambiguate confidently).
// Skip MB lookup for these and go straight to the claude-knowledge fallback
// rather than risk citing the wrong artist's genre data.
const FORCE_CLAUDE_KNOWLEDGE = new Set([
  'ink', // "INK" — DJ Ink (D&B), Ink (rapper), 3 unrelated rock/metal bands all score 76-82
]);

// ── Cache ───────────────────────────────────────────────────────────────
const CACHE_PATH = path.join(ROOT, 'data', 'musicbrainz-raw.json');
mkdirSync(path.join(ROOT, 'data'), { recursive: true });

let cache = {};
if (existsSync(CACHE_PATH)) {
  try {
    cache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
    console.log(`Resumed cache: ${Object.keys(cache).length} artists already fetched.`);
  } catch (e) {
    console.warn(`WARNING: could not parse existing cache, starting fresh: ${e.message}`);
    cache = {};
  }
}

function saveCache() {
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf8');
}

function normalizeName(s) {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function pickCandidate(artistName, searchJson) {
  const candidates = searchJson.artists || [];
  if (candidates.length === 0) return { candidate: null, ambiguous: false, pool: [] };

  const target = normalizeName(artistName);
  const exact = candidates.filter(c => {
    if (normalizeName(c.name) === target) return true;
    return (c.aliases || []).some(a => normalizeName(a.name) === target);
  });

  const pool = exact.length > 0 ? exact : candidates.filter(c => c.score >= 90);
  if (pool.length === 0) return { candidate: null, ambiguous: false, pool: [] };

  const sorted = [...pool].sort((a, b) => b.score - a.score);
  const ambiguous = sorted.length >= 2 && (sorted[0].score - sorted[1].score) < 15;
  return { candidate: sorted[0], ambiguous, pool: sorted.slice(0, 8) };
}

async function fetchArtistData(name, slug) {
  if (FORCE_CLAUDE_KNOWLEDGE.has(slug)) {
    return {
      name, slug, mbid: null, overrideUsed: false, forcedFallback: true,
      ambiguous: false, candidatePool: [], lookup: null,
      fetchedAt: new Date().toISOString(),
    };
  }

  const override = MANUAL_MBID_OVERRIDES[slug];
  const searchJson = await mbSearch(name);
  await sleep(MB_RATE_MS);

  let chosenMbid = override || null;
  let ambiguous = false;
  let pool = [];

  if (!override) {
    const picked = pickCandidate(name, searchJson);
    chosenMbid = picked.candidate ? picked.candidate.id : null;
    ambiguous = picked.ambiguous;
    pool = picked.pool;
  }

  let lookup = null;
  if (chosenMbid) {
    try {
      lookup = await mbLookup(chosenMbid);
      await sleep(MB_RATE_MS);
    } catch (e) {
      console.warn(`WARNING: lookup failed for "${name}" (${chosenMbid}): ${e.message}`);
    }
  }

  return {
    name,
    slug,
    mbid: chosenMbid,
    overrideUsed: Boolean(override),
    ambiguous,
    candidatePool: pool.map(c => ({ id: c.id, name: c.name, score: c.score, disambiguation: c.disambiguation || '' })),
    lookup,
    fetchedAt: new Date().toISOString(),
  };
}

// ── Fetch phase ─────────────────────────────────────────────────────────
async function runFetchPhase() {
  let fetched = 0;
  let skipped = 0;
  let errored = 0;

  for (let i = 0; i < ARTISTS.length; i++) {
    const a = ARTISTS[i];
    const slug = SLUGS[i];

    if (cache[slug] && !cache[slug].error) {
      skipped++;
      continue;
    }

    try {
      console.log(`[${i + 1}/${ARTISTS.length}] Fetching MusicBrainz data for "${a.n}"...`);
      const result = await fetchArtistData(a.n, slug);
      cache[slug] = result;
      fetched++;
    } catch (e) {
      console.warn(`WARNING: fetch failed for "${a.n}": ${e.message}`);
      cache[slug] = { name: a.n, slug, error: e.message, fetchedAt: new Date().toISOString() };
      errored++;
      // Still respect the rate limit even on failure before moving to next artist.
      await sleep(MB_RATE_MS);
    }

    // Save progress after every artist so a crash doesn't lose work.
    saveCache();
  }

  console.log(`Fetch phase complete: ${fetched} fetched, ${skipped} resumed from cache, ${errored} errored.`);
}

// ── Genre normalization / GS-taxonomy mapping ──────────────────────────
// Existing site taxonomy (window.GS in artists.js) — the live filter pills.
// Only these values are written back into the `g` field so the site's
// genre filter UI keeps working. Finer-grained MusicBrainz tags (e.g.
// "Drum & Bass", "Tech House", "Post-Punk") are preserved as `secondary`
// genres in genres.json / seed_genres.sql instead of overwriting `g`.
const GS_BUCKETS = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'EDM', 'Indie', 'K-Pop', 'R&B', 'Alt Pop', 'Folk', 'Soul/Pop', 'J-Pop', 'Country', 'Classical', 'Various'];

// Tags that are folksonomy noise, not genres — filtered out entirely.
const NOISE_TAG_RE = [
  /^\d+$/,
  /seen live/i,
  /listener/i,
  /favou?rite/i,
  /spotify/i,
  /\bnsfw\b/i,
  /cover art/i,
  /wall noise/i,
  /\bmale vocalist/i,
  /\bfemale vocalist/i,
  /\bsolo artist\b/i,
  /^duo$/i,
  /^band$/i,
  /^group$/i,
  /^amazing$/i,
  /^awesome$/i,
  /^love$/i,
  /^cool$/i,
  /^best$/i,
  /^american$/i,
  /^british$/i,
  /^english$/i,
  /^irish$/i,
  /^scottish$/i,
  /^welsh$/i,
  /^australian$/i,
  /^canadian$/i,
  /^german$/i,
  /^swedish$/i,
  /^dutch$/i,
  /^french$/i,
  /^chinese$/i,
  /^mexican$/i,
  /^brazilian$/i,
  /^nigerian$/i,
  /^uk$/i,
  /^usa?$/i,
];

function isNoiseTag(tag) {
  if (tag.startsWith('#')) return true; // fan hashtags (K-pop/P-pop fandom folksonomy especially)
  if (tag.length > 35) return true; // spam-concatenated tags, e.g. "p-pop idol group filipino songwriters..."
  return NOISE_TAG_RE.some(re => re.test(tag));
}

// Ordered: most specific first. First regex match wins the GS bucket.
const GS_MAP = [
  [/k[\s-]?pop|korean pop|p-pop|pinoy pop/i, 'K-Pop'], // P-pop (Pinoy pop) grouped with K-Pop: same idol-group format/audience, and the site has no separate P-Pop filter pill
  [/j[\s-]?pop|japanese pop|anime/i, 'J-Pop'],
  [/hip[\s-]?hop|\brap\b|boom bap|drill|gangsta rap|conscious rap|cloud rap|emo rap|trap rap|southern rap/i, 'Hip-Hop'],
  [/r ?& ?b|\brnb\b|neo[\s-]?soul|contemporary r&b|alternative r&b|\bsoul\b/i, 'R&B'],
  [/drum ?(and|&|n) ?bass|\bdnb\b|dubstep|\bhouse\b|techno|trance|uk garage|jungle|hardstyle|breakbeat|bass music|future bass|electro house|big room|\bedm\b|electronic dance/i, 'EDM'],
  [/synth[\s-]?wave|vapor ?wave|chill ?wave|dark ?wave|idm|ambient|downtempo|industrial|\belectronica?\b/i, 'Electronic'],
  [/country|americana|bluegrass/i, 'Country'],
  [/classical|orchestral|symphon(y|ic)|chamber music/i, 'Classical'],
  [/\bfolk\b|singer[\s-]?songwriter|acoustic/i, 'Folk'],
  [/bedroom pop|dream pop|shoegaze|art pop|slacker rock|lo[\s-]?fi|indie/i, 'Indie'],
  [/alt[\s-]?pop|alternative pop/i, 'Alt Pop'],
  [/pop[\s-]?punk|\bpunk\b|post[\s-]?punk|hardcore|\bmetal\b|emo|screamo|grunge|alternative rock|\brock\b/i, 'Rock'],
  [/pop|dance[\s-]?pop|teen pop|bubblegum|synth[\s-]?pop|electropop/i, 'Pop'],
];

function gsBucketFor(normalizedTag) {
  for (const [re, bucket] of GS_MAP) {
    if (re.test(normalizedTag)) return bucket;
  }
  return null;
}

// Nice display labels for secondary genres — preserve conventional casing.
const LABEL_OVERRIDES = {
  'drum and bass': 'Drum & Bass', 'drum & bass': 'Drum & Bass', 'dnb': 'Drum & Bass',
  'r&b': 'R&B', 'rnb': 'R&B', 'contemporary r&b': 'Contemporary R&B', 'alternative r&b': 'Alternative R&B', 'neo soul': 'Neo-Soul',
  'k-pop': 'K-Pop', 'kpop': 'K-Pop', 'j-pop': 'J-Pop', 'jpop': 'J-Pop', 'city pop': 'City Pop',
  'edm': 'EDM', 'idm': 'IDM', 'uk garage': 'UK Garage', 'dj': 'DJ',
  'hip hop': 'Hip-Hop', 'hip-hop': 'Hip-Hop', 'boom bap': 'Boom Bap', 'cloud rap': 'Cloud Rap', 'emo rap': 'Emo Rap',
  'tech house': 'Tech House', 'deep house': 'Deep House', 'progressive house': 'Progressive House', 'future bass': 'Future Bass',
  'post-punk': 'Post-Punk', 'post punk': 'Post-Punk', 'pop punk': 'Pop-Punk', 'nu metal': 'Nu Metal', 'alternative metal': 'Alternative Metal',
  'synth-pop': 'Synth-Pop', 'synthpop': 'Synth-Pop', 'dream pop': 'Dream Pop', 'bedroom pop': 'Bedroom Pop', 'art pop': 'Art Pop', 'electropop': 'Electropop',
  'indie rock': 'Indie Rock', 'indie pop': 'Indie Pop', 'indie folk': 'Indie Folk', 'shoegaze': 'Shoegaze', 'slacker rock': 'Slacker Rock',
  'singer-songwriter': 'Singer-Songwriter', 'folk rock': 'Folk Rock', 'americana': 'Americana',
  'alt-pop': 'Alt Pop', 'alternative pop': 'Alt Pop', 'darkwave': 'Darkwave', 'synthwave': 'Synthwave', 'vaporwave': 'Vaporwave',
  'hyperpop': 'Hyperpop', 'grunge': 'Grunge', 'hardcore': 'Hardcore', 'hardcore punk': 'Hardcore Punk', 'metalcore': 'Metalcore',
  'reggaeton': 'Reggaeton', 'dancehall': 'Dancehall', 'afrobeats': 'Afrobeats',
};

// Only these short tokens get upper-cased as acronyms; everything else
// (e.g. "pop", "rap") gets ordinary title-casing.
const ACRONYM_WORDS = new Set(['dj', 'uk', 'us', 'idm', 'edm', 'r&b', 'ebm']);
function niceLabel(tag) {
  const norm = tag.trim().toLowerCase();
  if (LABEL_OVERRIDES[norm]) return LABEL_OVERRIDES[norm];
  return tag
    .split(/\s+/)
    .map(w => (ACRONYM_WORDS.has(w.toLowerCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}

// Collect and rank raw tags (folksonomy `tags` + curated `genres`, both
// {name, count} arrays) from a MusicBrainz lookup response.
function extractTagCounts(lookup) {
  if (!lookup) return [];
  const all = [...(lookup.genres || []), ...(lookup.tags || [])];
  const byName = new Map();
  for (const t of all) {
    const name = (t.name || '').trim().toLowerCase();
    if (!name || isNoiseTag(name)) continue;
    byName.set(name, (byName.get(name) || 0) + (t.count || 1));
  }
  return [...byName.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

// When an artist's top MB tags are a genuine tie (all count:1, common for
// entries with sparse folksonomy data), the tie-break is essentially
// alphabetical/insertion-order — not meaningful. For a small number of
// well-known artists where that arbitrary tie-break produces a materially
// worse label than another *already-present, real* MB tag would, prefer
// the named bucket instead — still citing a genuine MB tag, just re-ranked.
// Verified by hand against each artist's known public genre framing.
const PREFERRED_BUCKET_OVERRIDES = {
  // Dev Hynes' MB tags (baroque pop, country, folk, funk, indie pop,
  // post-hardcore, singer-songwriter, soul) are all tied at count:1 with no
  // dominant signal. "R&B" (via the "soul" tag) matches both the existing
  // artists.js desc ("Dev Hynes' shape-shifting art-R&B project") and his
  // mainstream critical framing better than "baroque pop" winning the tie.
  'blood-orange': 'R&B',
};

// ── Synthesis phase ─────────────────────────────────────────────────────
function synthesizeArtist(a, slug) {
  const entry = cache[slug];
  const oldGenre = a.g;

  if (!entry || entry.error) {
    return {
      slug, name: a.n, old_genre: oldGenre,
      primary: oldGenre, secondary: [],
      sources: [{ genre: oldGenre, source: 'claude-knowledge' }],
      fallbackReason: entry?.error ? `fetch error: ${entry.error}` : 'no cache entry',
    };
  }

  const tagCounts = extractTagCounts(entry.lookup);

  if (tagCounts.length === 0) {
    // No usable MusicBrainz tag/genre data. Special-cased disambiguation
    // text (e.g. Worship's D&B-supergroup description) counts as a real
    // MusicBrainz citation even though it isn't a folksonomy tag.
    const disambig = entry.lookup?.disambiguation || '';
    if (/drum ?(and|&) ?bass/i.test(disambig)) {
      return {
        slug, name: a.n, old_genre: oldGenre,
        primary: 'Electronic', secondary: ['Drum & Bass'],
        sources: [
          { genre: 'Electronic', source: `musicbrainz:${entry.mbid}:disambiguation` },
          { genre: 'Drum & Bass', source: `musicbrainz:${entry.mbid}:disambiguation` },
        ],
      };
    }
    return {
      slug, name: a.n, old_genre: oldGenre,
      primary: oldGenre, secondary: [],
      sources: [{ genre: oldGenre, source: 'claude-knowledge' }],
      fallbackReason: entry.mbid ? 'MBID matched but no genre/tag data' : 'no confident MusicBrainz match',
    };
  }

  let mapped = tagCounts
    .map(t => ({ ...t, bucket: gsBucketFor(t.name), label: niceLabel(t.name) }))
    .filter(t => t.bucket);

  const preferredBucket = PREFERRED_BUCKET_OVERRIDES[slug];
  if (preferredBucket) {
    const idx = mapped.findIndex(t => t.bucket === preferredBucket);
    if (idx > 0) {
      const [preferred] = mapped.splice(idx, 1);
      mapped = [preferred, ...mapped];
    }
  }

  if (mapped.length === 0) {
    return {
      slug, name: a.n, old_genre: oldGenre,
      primary: oldGenre, secondary: [],
      sources: [{ genre: oldGenre, source: 'claude-knowledge' }],
      fallbackReason: 'MB tags present but none mapped to known genre taxonomy',
    };
  }

  const primary = mapped[0].bucket;
  const primaryTagName = mapped[0].name;
  const secondarySeen = new Set([primary.toLowerCase()]);
  const secondary = [];
  const sources = [{ genre: primary, source: `musicbrainz:${entry.mbid}:${primaryTagName}` }];

  for (const t of mapped.slice(1)) {
    if (secondary.length >= 3) break;
    const key = t.label.toLowerCase();
    if (secondarySeen.has(key)) continue;
    secondarySeen.add(key);
    secondary.push(t.label);
    sources.push({ genre: t.label, source: `musicbrainz:${entry.mbid}:${t.name}` });
  }

  return { slug, name: a.n, old_genre: oldGenre, primary, secondary, sources, ambiguousMatch: entry.ambiguous };
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
  await runFetchPhase();

  console.log('Synthesizing genres from cached MusicBrainz data...');
  const results = ARTISTS.map((a, i) => synthesizeArtist(a, SLUGS[i]));

  writeFileSync(path.join(ROOT, 'data', 'genres.json'), JSON.stringify(results, null, 2) + '\n', 'utf8');

  // ── genre-diff.md ─────────────────────────────────────────────────────
  const sorted = [...results].sort((a, b) => a.name.localeCompare(b.name));
  const diffLines = [];
  diffLines.push('# Genre Audit Diff — Lollapalooza 2026');
  diffLines.push('');
  diffLines.push(`Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/genre-audit.mjs\`. Source: MusicBrainz (no Last.fm this run). ${results.length} artists.`);
  diffLines.push('');
  diffLines.push('| Artist | Old Genre | New Primary | New Secondary |');
  diffLines.push('|---|---|---|---|');
  for (const r of sorted) {
    const changed = r.old_genre !== r.primary;
    const marker = changed ? ' **(changed)**' : '';
    diffLines.push(`| ${r.name}${marker} | ${r.old_genre} | ${r.primary} | ${r.secondary.join(', ') || '—'} |`);
  }
  writeFileSync(path.join(ROOT, 'data', 'genre-diff.md'), diffLines.join('\n') + '\n', 'utf8');

  // ── supabase/seed_genres.sql ─────────────────────────────────────────
  const FESTIVAL_ID = "(select id from festivals where slug = 'lollapalooza-2026')";
  const sqlLines = [];
  sqlLines.push('-- Generated by scripts/genre-audit.mjs — do not hand-edit.');
  sqlLines.push('-- Re-run the generator instead: node scripts/genre-audit.mjs');
  sqlLines.push('--');
  sqlLines.push('-- Supersedes the Phase 1 placeholder artist_genres rows (source =');
  sqlLines.push("-- 'artists.js (pre-audit)') with cited MusicBrainz / claude-knowledge data.");
  sqlLines.push('');
  sqlLines.push('-- Remove Phase 1 placeholder rows for this festival before inserting audited data.');
  sqlLines.push(
    `delete from artist_genres where source = 'artists.js (pre-audit)' and artist_id in ` +
    `(select id from artists where festival_id = ${FESTIVAL_ID});`
  );
  sqlLines.push('');
  sqlLines.push('-- artist_genres (primary + secondary, cited)');
  for (const r of results) {
    const artistIdSql = `(select id from artists where slug = ${sqlQuote(r.slug)} and festival_id = ${FESTIVAL_ID})`;
    for (const s of r.sources) {
      const isPrimary = s.genre === r.primary;
      sqlLines.push(
        `insert into artist_genres (artist_id, genre, is_primary, source) values (` +
        `${artistIdSql}, ${sqlQuote(s.genre)}, ${isPrimary ? 'true' : 'false'}, ${sqlQuote(s.source)}) ` +
        `on conflict (artist_id, genre) do update set is_primary = excluded.is_primary, source = excluded.source;`
      );
    }
  }
  writeFileSync(path.join(ROOT, 'supabase', 'seed_genres.sql'), sqlLines.join('\n') + '\n', 'utf8');

  // ── Regenerate artists.js — only g:"..." values change ──────────────
  const original = readFileSync(artistsPath, 'utf8');
  const lines = original.split('\n');
  let artistIdx = 0;
  const newLines = lines.map(line => {
    if (!/^\s*\{n:"/.test(line)) return line;
    const r = results[artistIdx];
    artistIdx++;
    const escaped = r.primary.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return line.replace(/(\{n:"[\s\S]*?,g:")[^"]*(")/, `$1${escaped}$2`);
  });
  if (artistIdx !== ARTISTS.length) {
    throw new Error(`Regeneration mismatch: matched ${artistIdx} artist lines but expected ${ARTISTS.length}. Aborting write to avoid corrupting artists.js.`);
  }
  writeFileSync(artistsPath, newLines.join('\n'), 'utf8');

  // ── Summary ───────────────────────────────────────────────────────────
  const mbSourced = results.filter(r => r.sources.every(s => s.source.startsWith('musicbrainz:'))).length;
  const claudeFallback = results.filter(r => r.sources.some(s => s.source === 'claude-knowledge')).length;
  const changed = results.filter(r => r.old_genre !== r.primary);
  const ambiguous = results.filter(r => r.ambiguousMatch);

  console.log('');
  console.log('=== Genre Audit Summary ===');
  console.log(`Total artists: ${results.length}`);
  console.log(`MusicBrainz-sourced (all genres cited to MB): ${mbSourced}`);
  console.log(`claude-knowledge fallback (at least one genre): ${claudeFallback}`);
  console.log(`Primary genre changed from artists.js original: ${changed.length}`);
  console.log(`Ambiguous MB name matches (multiple close-score candidates): ${ambiguous.length}`);
  if (changed.length > 0) {
    console.log('Changed:');
    for (const r of changed) console.log(`  - ${r.name}: ${r.old_genre} -> ${r.primary}`);
  }
  if (ambiguous.length > 0) {
    console.log('Ambiguous matches (used top score, verify if time allows):');
    for (const r of ambiguous) console.log(`  - ${r.name}`);
  }
  const fallbackList = results.filter(r => r.fallbackReason);
  console.log(`Artists with no usable MB tag data (${fallbackList.length}) — kept prior genre, sourced as claude-knowledge:`);
  for (const r of fallbackList) console.log(`  - ${r.name} (${r.fallbackReason})`);
}

main().catch(e => {
  console.error('FATAL:', e);
  saveCache();
  process.exit(1);
});
