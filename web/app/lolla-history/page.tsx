import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/constants';
import { FESTIVAL } from '@/lib/festival';
import { articleJsonLd, breadcrumbJsonLd, jsonLdScript } from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'The History of Lollapalooza — From Farewell Tour to Grant Park',
  description:
    "How a 1991 farewell tour for Jane's Addiction became the four-day, 172-artist festival returning to Grant Park in 2026. The full history of Lollapalooza.",
  alternates: { canonical: '/lolla-history' },
  openGraph: {
    title: 'The History of Lollapalooza',
    description: "From Perry Farrell's 1991 farewell tour to the 2026 Grant Park lineup — the full history of Lollapalooza.",
    url: `${SITE_URL}/lolla-history`,
    siteName: FESTIVAL.siteName,
    images: [{ url: '/lineup.jpg', width: 1200, height: 1500, alt: `${FESTIVAL.fullName} lineup poster` }],
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The History of Lollapalooza',
    description: 'From a 1991 farewell tour to a global festival brand — how Lollapalooza became what it is today.',
    images: ['/lineup.jpg'],
  },
};

const jsonLd = articleJsonLd({
  headline: 'The History of Lollapalooza — From Farewell Tour to Grant Park',
  description: "From Perry Farrell's 1991 farewell tour to the 2026 Grant Park lineup — the full history of Lollapalooza.",
  datePublished: '2026-07-11',
  dateModified: '2026-07-11',
  url: `${SITE_URL}/lolla-history`,
});

const breadcrumbs = breadcrumbJsonLd([
  { name: 'Home', url: SITE_URL },
  { name: 'Lolla History', url: `${SITE_URL}/lolla-history` },
]);

export default function LollaHistoryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }} />

      <div className="article-wrap">
        <div className="article-header">
          <h1 className="article-title">The History of Lollapalooza</h1>
          <div className="article-meta">How a farewell tour became a festival institution &middot; July 2026</div>
        </div>

        <p className="article-intro">
          Lollapalooza wasn&apos;t supposed to last past the summer of 1991. It was billed as a farewell tour for
          Jane&apos;s Addiction, dreamed up by frontman Perry Farrell as one last run before the band split. Thirty-five
          years later, it&apos;s a four-day, eight-stage festival that plants itself in Grant Park every summer and
          runs sister events on three continents. Here&apos;s how a goodbye tour turned into one of the biggest names
          in music festivals.
        </p>

        <div className="ad-space">{/* AD SPACE */}</div>

        <div className="article-body">
          <h2>A Farewell Tour, Not a Festival (1991)</h2>

          <p>
            Perry Farrell built the original Lollapalooza as a single, multi-city touring bill rather than a festival
            with a fixed home — a format borrowed from a rock tour, not the four-day destination event it is today.
            The 1991 lineup read like a mission statement for what &quot;alternative&quot; meant at the time:
            Jane&apos;s Addiction headlined its own send-off alongside Siouxsie and the Banshees, Nine Inch Nails,
            Living Colour, Ice-T and Body Count, and Butthole Surfers. Farrell has said for years that the name came
            from an old slang term for something outstanding, reportedly borrowed from a line in a Three Stooges
            short — an odd origin for a word that&apos;s now shorthand for one of music&apos;s biggest festival
            brands.
          </p>

          <h2>The Tour That Broke Alternative Rock (1992–1997)</h2>

          <p>
            Once the farewell tour didn&apos;t actually end anything, Lollapalooza kept touring North America every
            summer through 1997, and in the process became one of the most important pipelines underground music had
            into the mainstream. The 1992 edition put Pearl Jam and Soundgarden in front of massive crowds right as
            grunge was breaking nationally. Rage Against the Machine&apos;s 1993 sets turned them from an LA club act
            into a festival-level force in a single summer. By 1994, the bill was big enough to headline{' '}
            <strong>The Smashing Pumpkins</strong> — the same band returning to Grant Park in 2026, three decades
            later, as a Friday night headliner.
          </p>

          <p>
            Not every year landed cleanly. Booking Metallica as the 1996 headliner split the festival&apos;s core
            audience, with longtime fans arguing that a multi-platinum metal act didn&apos;t belong on a bill built to
            platform outsiders. The argument was real, but it also proved exactly what Lollapalooza had become: too
            big, and too genre-agnostic, for any single scene to claim as its own anymore.
          </p>

          <div className="tip-box">
            <div className="tip-box-label">Full Circle</div>
            <p>
              The Smashing Pumpkins played Lollapalooza&apos;s original touring lineup in 1994. In 2026, they headline
              the Friday night bill in Grant Park — one of the few acts on this year&apos;s lineup with a direct link
              back to the festival&apos;s first decade.
            </p>
          </div>

          <h2>The Wilderness Years (1998–2004)</h2>

          <p>
            Lollapalooza didn&apos;t survive its own momentum. After 1997, the festival went dark — a planned 1998
            lineup fell apart before it toured, and a 2003 attempt to revive the touring format, headlined by
            Audioslave and Jane&apos;s Addiction, folded midway through the summer after ticket sales came in soft.
            For a few years, Lollapalooza looked like a nostalgia act that couldn&apos;t find its footing a second
            time.
          </p>

          <h2>Grant Park Changes Everything (2005–Present)</h2>

          <p>
            The relaunch came in 2005, and it came with a completely different model. Instead of touring city to
            city, Lollapalooza planted itself permanently in Grant Park in downtown Chicago — trading the
            unpredictability of a traveling circuit for a single, repeatable location with skyline views most
            festivals can&apos;t match. Produced by C3 Presents, with Farrell still attached as a co-founder, the
            Chicago version started small and grew fast: two days became three, three became four, and a
            single-stage touring bill became an eight-stage production drawing crowds in the hundreds of thousands
            across a single weekend. Chicago also gave Lollapalooza something the touring years never had —
            continuity. The 2020 edition was cancelled outright due to the COVID-19 pandemic, but the festival
            returned to Grant Park the following year and hasn&apos;t missed a summer since.
          </p>

          <div className="ad-space">{/* AD SPACE */}</div>

          <h2>A Global Festival Brand</h2>

          <p>
            Grant Park&apos;s success turned Lollapalooza into an exportable format rather than a one-off American
            event. Sister festivals now run annually in Chile, Brazil, and Argentina, each pairing international
            headliners with strong local lineups under the same Lollapalooza name and branding. It&apos;s a long way
            from a single farewell tour — Perry Farrell&apos;s goodbye party for one band became a festival brand
            operating across multiple countries.
          </p>

          <h2>Lollapalooza in 2026</h2>

          <p>
            The 2026 edition returns to Grant Park July 30 through August 2 with 172 artists across four days — a
            lineup deep enough to headline itself several times over. Lorde and John Summit open the weekend
            Thursday, Charli XCX and The Smashing Pumpkins headline Friday, Jennie and Olivia Dean take Saturday, and
            Tate McRae and The XX close out Sunday. Putting a K-Pop soloist, a 1990s alt-rock institution, and a viral
            pop phenomenon on the same bill in the same weekend is the clearest evidence that Lollapalooza&apos;s
            founding instinct — throw genres together that supposedly don&apos;t belong on the same stage — never
            actually went away. It just found a permanent home.
          </p>

          <h2>The Bottom Line</h2>

          <p>
            Lollapalooza&apos;s history is really two stories: a chaotic, genre-defining touring festival that burned
            out in six years, and a steadier Chicago institution that&apos;s now run twenty times longer than the
            original ever did. Both versions share the same instinct Farrell started with in 1991 — put wildly
            different artists on the same bill and let the whiplash be the point.
          </p>

          <p>
            Explore the <Link href="/lineup">full 2026 lineup</Link> to see who&apos;s playing this year, or read our{' '}
            <Link href="/genre-guide">Genre Guide</Link> for a closer look at what each corner of this year&apos;s
            bill actually sounds like.
          </p>
        </div>
      </div>

      <div className="ad-space">{/* AD SPACE */}</div>
    </>
  );
}
