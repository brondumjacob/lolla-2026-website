import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/constants';
import { FESTIVAL } from '@/lib/festival';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'The Complete Genre Guide to Lollapalooza 2026',
  description:
    'Every genre on the Lollapalooza 2026 bill, from Rock to K-Pop to EDM, with real artist picks across headliners, majors, and the undercard.',
  alternates: { canonical: '/genre-guide' },
  openGraph: {
    title: 'The Complete Genre Guide to Lollapalooza 2026',
    description: 'Fourteen genres, 172 artists, one weekend — a genre-by-genre breakdown of the Lollapalooza 2026 lineup.',
    url: `${SITE_URL}/genre-guide`,
    siteName: FESTIVAL.siteName,
    images: ['/lineup.png'],
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Complete Genre Guide to Lollapalooza 2026',
    description: 'A genre-by-genre breakdown of the Lollapalooza 2026 lineup, from Rock to K-Pop to EDM.',
    images: ['/lineup.png'],
  },
};

const jsonLd = articleJsonLd({
  headline: 'The Complete Genre Guide to Lollapalooza 2026',
  description: 'Fourteen genres, 172 artists, one weekend — a genre-by-genre breakdown of the Lollapalooza 2026 lineup.',
  datePublished: '2026-07-11',
  dateModified: '2026-07-11',
  url: `${SITE_URL}/genre-guide`,
});

const breadcrumbs = breadcrumbJsonLd([
  { name: 'Home', url: SITE_URL },
  { name: 'Genre Guide', url: `${SITE_URL}/genre-guide` },
]);

export default function GenreGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />

      <div className="article-wrap">
        <div className="article-header">
          <h1 className="article-title">The Complete Genre Guide to Lollapalooza 2026</h1>
          <div className="article-meta">Fourteen genres, 172 artists, one weekend &middot; July 2026</div>
        </div>

        <p className="article-intro">
          Lollapalooza&apos;s lineup isn&apos;t one festival, it&apos;s fourteen overlapping ones. Sort the
          172-artist bill by genre and the range gets a lot more specific: 35 indie acts, 26 pop artists, 25 rock
          bands, 20 electronic producers, and pockets of K-Pop, J-Pop, country, and even a youth orchestra.
          Here&apos;s what&apos;s actually on the bill in every corner of the genre map.
        </p>

        <div className="ad-space">{/* AD SPACE */}</div>

        <div className="article-body">
          <h2>Pop &amp; Alt Pop (30 artists)</h2>

          <p>
            Pop is the single largest tier at Lolla 2026, and it splits into two headlining lanes.{' '}
            <strong>Charli XCX</strong> headlines Friday off the back of <em>brat</em>, and{' '}
            <strong>Tate McRae</strong> closes the whole festival Sunday night. Around them, the major tier carries
            real depth — <strong>Muna</strong>, <strong>Jade</strong>, <strong>Audrey Hobert</strong>, and{' '}
            <strong>Zara Larsson</strong> all hold major slots, while Sunday&apos;s undercard alone stacks{' '}
            <strong>Adéla</strong>, <strong>Sunshine</strong>, and <strong>Cruz Beckham and the Breakers</strong>. The
            four-artist Alt Pop pocket is worth a special mention: <strong>Not for Radio</strong> plays a major slot
            Friday, while <strong>Between Friends</strong>, <strong>Ella Red</strong>, and{' '}
            <strong>Pearly Drops</strong> round out the undercard with a moodier, guitar-inflected take on pop
            songwriting.
          </p>

          <h2>Rock (25 artists)</h2>

          <p>
            <strong>The Smashing Pumpkins</strong> headline Friday, giving Lolla&apos;s deepest rock lineup in years a
            genuine flagship. <strong>Yungblud</strong> and <strong>5 Seconds of Summer</strong> anchor the majors
            alongside <strong>Turnstile</strong> and <strong>Viagra Boys</strong>, and the undercard runs from
            hardcore-adjacent acts like <strong>Loathe</strong> and <strong>High Vis</strong> to melodic rock from{' '}
            <strong>Wolf Alice</strong> and <strong>Wunderhorse</strong>. <strong>Hot Mulligan</strong> brings the
            emo revival to a major slot Sunday, closing out a tier that spans several decades of guitar music without
            repeating itself once.
          </p>

          <div className="tip-box">
            <div className="tip-box-label">Deep Cut</div>
            <p>
              <strong>Wolf Alice</strong> (Rock, Undercard, Sat) is one of the most decorated bands on the entire bill
              relative to its billing — a Mercury Prize winner playing a stage well below its actual draw.
            </p>
          </div>

          <h2>Indie (35 artists)</h2>

          <p>
            Indie is the biggest single genre on the bill, carried by two very different headline-adjacent acts:{' '}
            <strong>Ethel Cain&apos;s</strong> gothic Americana on Saturday and <strong>The XX&apos;s</strong>{' '}
            minimalist co-headline Sunday. The major tier is stacked — <strong>Geese</strong>,{' '}
            <strong>The Neighbourhood</strong>, <strong>Beabadoobee</strong>, <strong>Wet Leg</strong>, and{' '}
            <strong>Suki Waterhouse</strong> all play major slots spread across every day of the festival. The
            undercard is where the tier goes deepest: <strong>Horsegirl</strong> and{' '}
            <strong>Water From Your Eyes</strong> chase noisier, more experimental territory, while{' '}
            <strong>Finn Wolfhard</strong> and <strong>CMAT</strong> sit closer to straightforward guitar pop.
          </p>

          <h2>Electronic &amp; EDM (38 artists combined)</h2>

          <p>
            Split across two adjacent genre tags, electronic and EDM together make up the second-largest chunk of the
            lineup. <strong>John Summit</strong> headlines Thursday off a house scene built in Chicago, and the majors
            run deep with <strong>Alison Wonderland</strong>, <strong>Major Lazer</strong>,{' '}
            <strong>Empire of the Sun</strong>, and <strong>Kettama</strong>. <strong>Boris Brejcha&apos;s</strong>{' '}
            high-tech minimal and <strong>Snow Strippers&apos;</strong> hyperpop-leaning sets round out
            Thursday&apos;s major slots. In the undercard, names like <strong>Oklou</strong>,{' '}
            <strong>Ninajirachi</strong>, and <strong>Whethan</strong> are the ones worth catching early if you want
            to say you saw them before the stages got bigger — several of this tier&apos;s producers are playing
            their first major U.S. festival slot this year, which is exactly the kind of bet that pays off if you
            catch it early.
          </p>

          <div className="ad-space">{/* AD SPACE */}</div>

          <h2>Hip-Hop &amp; R&amp;B (26 artists combined)</h2>

          <p>
            <strong>Clipse&apos;s</strong> major-stage reunion and <strong>Freddie Gibbs</strong> anchor the hip-hop
            side of the bill, both playing to rap purists who want technical writing over spectacle.{' '}
            <strong>Lil Uzi Vert</strong> and <strong>Mustard</strong> bring the genre&apos;s more maximalist,
            hit-driven register to Friday&apos;s major slots. R&amp;B centers on <strong>Olivia Dean&apos;s</strong>{' '}
            Saturday headline set, with <strong>Blood Orange</strong> and <strong>Leon Thomas</strong> holding down
            major slots and <strong>Amber Mark</strong>, <strong>Destin Conrad</strong>, and{' '}
            <strong>Justine Skye</strong> carrying the undercard&apos;s vocal-forward end of the tier.
          </p>

          <h2>K-Pop, J-Pop &amp; the Rest of the World (7 artists)</h2>

          <p>
            <strong>Jennie&apos;s</strong> Saturday headline set brings K-Pop to the very top of the bill, and
            she&apos;s joined by <strong>I-DLE</strong> and <strong>Aespa</strong> in the majors — genuine
            arena-level production values on a festival stage. <strong>SB19</strong> and <strong>Cortis</strong>{' '}
            carry the undercard. J-Pop gets its own foothold with <strong>Ado</strong> and{' '}
            <strong>Yoasobi</strong> both playing major slots Sunday, giving the festival&apos;s most
            internationally-minded corner two of its strongest sets of the weekend.
          </p>

          <h2>Folk &amp; Country (9 artists combined)</h2>

          <p>
            Both genres live almost entirely in the undercard this year, which makes them some of the lineup&apos;s
            best discovery bets. <strong>Paris Paloma&apos;s</strong> viral folk anthem &quot;labour&quot; carries
            real festival-crowd energy despite an early Thursday slot, and <strong>Kingfishr</strong> and{' '}
            <strong>Amble</strong> round out a strong folk pocket. Country is thinner but sharp:{' '}
            <strong>Calder Allen</strong>, <strong>Cameron Whitcomb</strong>, <strong>Elizabeth Nichols</strong>, and{' '}
            <strong>Waylon Wyatt</strong> spread country slots across three different days.
          </p>

          <h2>The One-Of-A-Kind Slots</h2>

          <p>
            Two tags on the bill don&apos;t fit anywhere else. The <strong>Chicago Youth Symphony Orchestra</strong>{' '}
            plays Saturday under the Classical tag — a genuinely unusual booking for a festival built on rock and
            electronic music, and a nod to the festival&apos;s hometown. <strong>Chicago Made</strong>, tagged
            Various, plays Friday as a showcase built around the city itself rather than any single genre.
          </p>

          <h2>The Bottom Line</h2>

          <p>
            Sort Lolla 2026 by day, and you get four strong lineups. Sort it by genre, and you get fourteen different
            festivals happening in the same park. That&apos;s the real value of a bill this size — whatever you came
            for, it&apos;s here, and there&apos;s a good chance the artist two stages over is playing something you
            didn&apos;t know you wanted to hear.
          </p>

          <p>
            Check the <Link href="/">full lineup</Link> to filter by genre yourself, or read{' '}
            <Link href="/who-to-see">Who To See at Lolla 2026</Link> for our day-by-day picks.
          </p>
        </div>
      </div>

      <div className="ad-space">{/* AD SPACE */}</div>
    </>
  );
}
