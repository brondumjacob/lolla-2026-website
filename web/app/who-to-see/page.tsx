import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Who To See at Lolla 2026 — Your Day-by-Day Guide',
  description: 'Our picks for the must-see acts at Lollapalooza 2026. Day-by-day recommendations across every genre, from headliners to hidden gems.',
  alternates: { canonical: '/who-to-see' },
  openGraph: {
    title: 'Who To See at Lolla 2026',
    description: 'Day-by-day recommendations across every genre, from headliners to hidden gems at Lollapalooza 2026.',
    url: `${SITE_URL}/who-to-see`,
    siteName: 'Lolla Lineup 2026',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Who To See at Lolla 2026',
    description: 'Day-by-day recommendations across every genre at Lollapalooza 2026.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Who To See at Lolla 2026 — Your Day-by-Day Guide',
  description: 'Day-by-day recommendations across every genre, from headliners to hidden gems at Lollapalooza 2026.',
  author: { '@type': 'Person', name: 'Jacob Brondum' },
  datePublished: '2026-03-22',
  dateModified: '2026-04-11',
  publisher: { '@type': 'Organization', name: 'Lolla Lineup 2026', url: 'https://www.lolla2026lineup.com' },
};

export default function WhoToSeePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="article-wrap">
        <div className="article-header">
          <h1 className="article-title">Who To See at Lolla 2026</h1>
          <div className="article-meta">A day-by-day guide to the best of the lineup &middot; March 2026</div>
        </div>

        <p className="article-intro">
          Lollapalooza 2026 drops 172 artists across four days at Grant Park, and it&apos;s one of the most
          genre-diverse bills the festival has ever put together — arena-headlining pop acts sharing a weekend with
          underground electronic producers playing their first major U.S. festival slot. That&apos;s a lot of music
          to sort through. We broke the lineup down day by day, picked our favorites across genres, and flagged the
          schedule conflicts you&apos;ll actually lose sleep over. Whether you&apos;re chasing headliners or hunting
          for your next obsession in the undercard, here&apos;s where to start.
        </p>

        <div className="ad-space">{/* AD SPACE */}</div>

        <div className="article-body">
          <h2>Thursday, July 30 — Opening Day</h2>

          <p>
            Thursday&apos;s lineup is stacked with range. <strong>Lorde</strong> headlines with an Alt Pop catalog
            that spans a decade of critical acclaim, from the brooding minimalism of <em>Pure Heroine</em> to the
            sun-drenched textures of <em>Solar Power</em>. She is one of the rare headliners who commands a stage
            with just her voice and movement — expect an emotional, visually ambitious set.
          </p>

          <p>
            <strong>John Summit</strong> closes out the electronic side of Thursday with a headlining slot that
            reflects his meteoric rise from Chicago&apos;s own house scene. There&apos;s poetic justice in a hometown
            DJ headlining Lolla, and his sets are known for relentless energy. If you&apos;ve been anywhere near a
            festival in the last three years, you know what to expect: deep house grooves that build into peak-time
            euphoria.
          </p>

          <p>
            In the undercard, <strong>Little Simz</strong> is the can&apos;t-miss act of the day. The London rapper
            has earned a Mercury Prize and widespread critical praise for albums that blend introspective lyricism
            with expansive, genre-fluid production. She&apos;s technically listed as undercard, which means
            you&apos;re getting a world-class performer on a smaller stage — take advantage of that.
          </p>

          <p>
            <strong>Wet Leg</strong> brings their dry-witted indie rock to a major slot. Their self-titled debut was
            one of the most talked-about guitar records in years, and tracks like &quot;Chaise Longue&quot; translate
            into rowdy, joyful live energy. Meanwhile, <strong>Empire of the Sun</strong> offers theatrical
            electro-pop that feels tailor-made for a sunset slot.
          </p>

          <div className="tip-box">
            <div className="tip-box-label">Thursday Pick</div>
            <p>
              <strong>Paris Paloma</strong> (Folk, Undercard) — Her viral track &quot;labour&quot; became an anthem
              in 2024 and she&apos;s built a devoted following since. Early-day folk on a small stage is a perfect
              way to ease into the weekend.
            </p>
          </div>

          <div className="conflict-box">
            <div className="conflict-box-label">Schedule Conflict</div>
            <p>
              Lorde and John Summit will almost certainly overlap on Thursday night. If you want both, plan to catch
              the first half of one and sprint to the other. Lorde tends to run tight, emotional sets while Summit
              builds slowly — showing up 20 minutes into Summit&apos;s set won&apos;t hurt.
            </p>
          </div>

          <h2>Friday, July 31 — The Heavyweights</h2>

          <p>
            <strong>Charli XCX</strong> headlines Friday fresh off the cultural phenomenon of <em>brat</em>. She has
            spent a decade pushing pop music forward, and her live shows have evolved from chaotic club sets into
            full-scale production spectacles. Friday night at Grant Park will be one of the defining festival moments
            of 2026.
          </p>

          <p>
            <strong>The Smashing Pumpkins</strong> offer a generational counterpoint on Friday — Billy Corgan&apos;s
            band brings a catalog that spans from <em>Siamese Dream</em> through <em>Mellon Collie</em> and beyond.
            For anyone who grew up on 90s alternative rock, this is a pilgrimage. For everyone else, the
            Pumpkins&apos; wall-of-sound guitar approach still hits harder than most modern rock acts.
          </p>

          <p>
            The major tier on Friday is deep. <strong>Freddie Gibbs</strong> brings street-level hip-hop precision
            refined over years of working with producers like Madlib and The Alchemist. <strong>Suki Waterhouse</strong>{' '}
            has crossed over from indie darling to genuine pop presence with dreamy, lo-fi guitar tracks. And{' '}
            <strong>I-DLE</strong> represents K-Pop&apos;s continued festival takeover — their choreography and
            production values are arena-level.
          </p>

          <div className="tip-box">
            <div className="tip-box-label">Friday Pick</div>
            <p>
              <strong>Horsegirl</strong> (Rock, Undercard) — This Chicago trio plays angular, noisy post-punk that
              feels right at home in Grant Park. Catching a hometown band on a small stage is one of the best things
              about Lolla.
            </p>
          </div>

          <h2>Saturday, August 1 — Peak Festival</h2>

          <p>
            Saturday is arguably the strongest single day of the lineup. <strong>Jennie</strong> headlines
            representing BLACKPINK&apos;s solo era, bringing K-Pop&apos;s biggest production values to the main
            stage. <strong>Olivia Dean</strong> also headlines — her Soul/Pop sound is warm, vocally stunning, and
            positions her as one of the most exciting new headliners in the festival world.
          </p>

          <p>
            The rest of Saturday reads like its own festival. <strong>Ethel Cain</strong> has built one of the most
            devoted fanbases in alternative music with her gothic Americana and cinematic storytelling.{' '}
            <strong>Clipse</strong> reuniting on the major stage means Pusha T and No Malice delivering some of the
            sharpest rap verses of the last two decades. <strong>The Neighbourhood</strong> brings their moody,
            dark-pop anthems.
          </p>

          <p>
            <strong>Geese</strong> is the Saturday act most likely to convert new fans. The Brooklyn band plays
            post-punk with an art-rock ambition that rewards repeated listens. Their live energy is raw and kinetic.
          </p>

          <div className="conflict-box">
            <div className="conflict-box-label">Schedule Conflict</div>
            <p>
              Saturday&apos;s biggest conflict is likely Jennie vs. Olivia Dean in the headlining slots. Both are
              worth seeing in full. If forced to choose: Jennie for spectacle and choreography, Olivia Dean for pure
              vocal power and a more intimate connection with the crowd.
            </p>
          </div>

          <div className="ad-space">{/* AD SPACE */}</div>

          <h2>Sunday, August 2 — The Closer</h2>

          <p>
            <strong>Tate McRae</strong> closes out Sunday and the entire festival. She&apos;s gone from viral dance
            videos to genuine pop stardom, and her catalog is deep enough now to fill a headlining set with hits.{' '}
            <strong>The XX</strong> co-headline Sunday with their signature minimalist indie sound — the space
            between their notes is as important as the notes themselves. An XX set at dusk in Grant Park could be
            transcendent.
          </p>

          <p>
            Sunday&apos;s major tier is packed with variety. <strong>Turnstile</strong> will deliver the most
            physically intense set of the weekend — their hardcore-meets-everything approach has broken the genre
            wide open, and their pit will be legendary. <strong>Beabadoobee</strong> brings indie-pop with a 90s
            guitar crunch. <strong>Hot Mulligan</strong> represents the emo revival with hooks that stick for days.
            And <strong>Yoasobi</strong> brings J-Pop&apos;s biggest crossover act to an American festival stage.
          </p>

          <p>
            Don&apos;t overlook <strong>Muna</strong> on Sunday — their queer indie-pop anthems are made for festival
            singalongs, and they consistently deliver one of the most joyful live shows in indie music.
          </p>

          <div className="tip-box">
            <div className="tip-box-label">Sunday Pick</div>
            <p>
              <strong>Water From Your Eyes</strong> (Indie, Undercard) — Experimental, unpredictable, and utterly
              original. If you want to see something that doesn&apos;t sound like anything else on the lineup, this
              is your act.
            </p>
          </div>

          <h2>Genre Guides</h2>

          <h3>Best for Pop Fans</h3>
          <p>
            The pop lineup runs deep beyond headliners. Charli XCX and Tate McRae anchor the top, but{' '}
            <strong>Zara Larsson</strong> (Fri) and <strong>Jade</strong> (Sun) bring strong pop catalogs at the major
            tier. In the undercard, <strong>Claire Rosinkranz</strong> and <strong>Slayyter</strong> on Friday are
            both worth catching early.
          </p>

          <h3>Best for Rock and Indie</h3>
          <p>
            This might be the strongest rock lineup at Lolla in years. The Smashing Pumpkins headline,{' '}
            <strong>Turnstile</strong> and <strong>Viagra Boys</strong> anchor the majors, and the undercard is
            stacked: <strong>Wolf Alice</strong> (Sat), <strong>Momma</strong> (Sat), <strong>Bad Nerves</strong>{' '}
            (Thu), and <strong>The Story So Far</strong> (Fri) all deliver live.
          </p>

          <h3>Best for Electronic and EDM</h3>
          <p>
            John Summit headlines Thursday, but the electronic depth goes far beyond that.{' '}
            <strong>Boris Brejcha</strong> (Thu) brings his signature high-tech minimal. <strong>Alison Wonderland</strong>{' '}
            (Sat) and <strong>Major Lazer</strong> (Fri) hold down the majors. For deeper cuts, check{' '}
            <strong>Ninajirachi</strong> (Thu) and <strong>Oklou</strong> (Fri) in the undercard.
          </p>

          <h3>Best for Hip-Hop and R&amp;B</h3>
          <p>
            Freddie Gibbs and Clipse deliver lyrical precision. <strong>Lil Uzi Vert</strong> (Fri) and{' '}
            <strong>Mustard</strong> (Fri) bring energy. <strong>Leon Thomas</strong> (Sat) is a rising R&amp;B star.
            In the undercard, <strong>Little Simz</strong> (Thu) is the consensus don&apos;t-miss pick, and{' '}
            <strong>Quadeca</strong> (Sat) has evolved from YouTube rapper into a genuinely boundary-pushing artist.
          </p>

          <h2>The Bottom Line</h2>

          <p>
            This is a four-day lineup with genuine depth at every tier. The headliners are strong, but Lolla
            2026&apos;s real value is in the middle and lower tiers — acts like Little Simz, Geese, Wolf Alice, and
            Ethel Cain who are at a career inflection point where their live shows are electric and their stages are
            still small enough to feel personal. Build your schedule around discovery, not just the names you know,
            and you&apos;ll walk away with stories.
          </p>

          <p>
            Check the <Link href="/">full lineup</Link> to start building your schedule, read our{' '}
            <Link href="/undercard-picks">10 Undercard Acts You Shouldn&apos;t Sleep On</Link> for deeper discovery
            picks, or dig into our <Link href="/genre-guide">genre-by-genre breakdown</Link> of the entire 2026 bill.
          </p>
        </div>
      </div>

      <div className="ad-space">{/* AD SPACE */}</div>
    </>
  );
}
