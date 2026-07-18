import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: "10 Undercard Acts You Shouldn't Sleep On — Lolla 2026",
  description: "The Lolla 2026 undercard is loaded. Here are 10 lesser-known artists worth rearranging your schedule for, with streaming links to start listening now.",
  alternates: { canonical: '/undercard-picks' },
  openGraph: {
    title: "10 Undercard Acts You Shouldn't Sleep On — Lolla 2026",
    description: '10 lesser-known artists at Lollapalooza 2026 worth rearranging your schedule for.',
    url: `${SITE_URL}/undercard-picks`,
    siteName: 'Lolla Lineup 2026',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: "10 Undercard Acts You Shouldn't Sleep On",
    description: 'Hidden gems in the Lolla 2026 lineup.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: "10 Undercard Acts You Shouldn't Sleep On — Lolla 2026",
  description: 'The Lolla 2026 undercard is loaded. Here are 10 lesser-known artists worth rearranging your schedule for.',
  author: { '@type': 'Person', name: 'Jacob Brondum' },
  datePublished: '2026-03-22',
  dateModified: '2026-04-11',
  publisher: { '@type': 'Organization', name: 'Lolla Lineup 2026', url: 'https://www.lolla2026lineup.com' },
};

interface SpotlightProps {
  number: string;
  name: string;
  detail: string;
  spotifyUrl: string;
  appleUrl: string;
  children: React.ReactNode;
}

function ArtistSpotlight({ number, name, detail, spotifyUrl, appleUrl, children }: SpotlightProps) {
  return (
    <>
      <div className="article-number">{number}</div>
      <div className="artist-spotlight">
        <div className="artist-spotlight-name">{name}</div>
        <div className="artist-spotlight-detail">{detail}</div>
        <p>{children}</p>
        <div className="listen-links">
          <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="listen-link-sp">
            Spotify
          </a>
          <a href={appleUrl} target="_blank" rel="noopener noreferrer" className="listen-link-am">
            Apple Music
          </a>
        </div>
      </div>
    </>
  );
}

export default function UndercardPicksPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="article-wrap">
        <div className="article-header">
          <h1 className="article-title">10 Undercard Acts You Shouldn&apos;t Sleep On</h1>
          <div className="article-meta">Hidden gems in the Lolla 2026 lineup &middot; March 2026</div>
        </div>

        <p className="article-intro">
          Headliners sell tickets, but the undercard is where festivals earn their reputation. Lollapalooza 2026 has
          100+ artists below the major tier, and buried in that list are future headliners, critical darlings, and
          genre-bending acts that deserve far bigger stages. It&apos;s the same principle that makes the major tier
          worth digging into too — Freddie Gibbs and Clipse for hip-hop purists, Turnstile for the hardcore-crossover
          crowd, Ethel Cain&apos;s gothic Americana for anyone who wants to feel something. Here are the ten
          undercard artists we think you&apos;ll regret missing.
        </p>

        <div className="ad-space">{/* AD SPACE */}</div>

        <div className="article-body">
          <ArtistSpotlight
            number="01"
            name="Little Simz"
            detail="Hip-Hop · Thursday · Undercard"
            spotifyUrl="https://open.spotify.com/artist/6eXZu6O7nAUA5z6vLV8NKI"
            appleUrl="https://music.apple.com/us/artist/569204972"
          >
            The fact that Little Simz is on the undercard is arguably the biggest scheduling gift of the entire
            festival. The London rapper has a Mercury Prize, near-universal critical acclaim, and albums like{' '}
            <em>Sometimes I Might Be Introvert</em> that rank among the best rap records of the decade. Her live show
            mixes bars, live instrumentation, and theatrical staging. She won&apos;t be on undercard bills much
            longer — catch her while the stage is still small enough to feel intimate.
          </ArtistSpotlight>

          <ArtistSpotlight
            number="02"
            name="Wolf Alice"
            detail="Rock · Saturday · Undercard"
            spotifyUrl="https://open.spotify.com/artist/3btzEQD6sugImIHPMRgkwV"
            appleUrl="https://music.apple.com/us/artist/581576780"
          >
            Wolf Alice has two Brit Awards, a Mercury Prize nomination, and three albums that span shoegaze, grunge,
            folk, and indie rock without ever feeling scattered. <em>Blue Weekend</em> is a masterclass in dynamic
            range — tracks shift from whisper-quiet to stadium-loud in ways that hit harder live. Ellie Rowsell&apos;s
            vocals carry raw emotion, and the band plays with a tightness that comes from years of touring. One of
            the most complete rock bands working today, playing a stage that should be three sizes bigger.
          </ArtistSpotlight>

          <ArtistSpotlight
            number="03"
            name="Paris Paloma"
            detail="Folk · Thursday · Undercard"
            spotifyUrl="https://open.spotify.com/artist/2EXpthNgSeTDeX8nGwxppp"
            appleUrl="https://music.apple.com/us/artist/1530898376"
          >
            Paris Paloma writes folk songs that cut. Her track &quot;labour&quot; went viral for its unflinching take
            on emotional labor in relationships, racking up hundreds of millions of streams. But she&apos;s more than
            one song — her catalog is full of richly arranged, lyrically sharp folk-pop that draws from traditional
            storytelling traditions while feeling entirely contemporary. Her voice is striking, and early-day
            acoustic sets at festivals often produce some of the most memorable moments.
          </ArtistSpotlight>

          <ArtistSpotlight
            number="04"
            name="Momma"
            detail="Rock · Saturday · Undercard"
            spotifyUrl="https://open.spotify.com/artist/5Wj0an60VgRckYV9zlDe1e"
            appleUrl="https://music.apple.com/us/artist/53773435"
          >
            Momma sounds like the best parts of 90s guitar rock filtered through a modern indie lens. Their album{' '}
            <em>Household Name</em> channels Veruca Salt, Liz Phair, and The Breeders with hooks that stick for
            weeks. Dual vocals from Etta Friedman and Allegra Weingarten give their songs a texture that most guitar
            bands can&apos;t replicate. If you&apos;re at Lolla for the rock, this is your Saturday afternoon anchor.
          </ArtistSpotlight>

          <ArtistSpotlight
            number="05"
            name="CMAT"
            detail="Folk · Thursday · Undercard"
            spotifyUrl="https://open.spotify.com/artist/3VBNIRx1LxVdRqOiPgkLwv"
            appleUrl="https://music.apple.com/us/artist/1506697965"
          >
            CMAT (Ciara Mary-Alice Thompson) is an Irish singer-songwriter who blends country, pop, and folk with a
            wit and charisma that&apos;s impossible to ignore. Her debut album <em>If My Wife New I&apos;d Be Dead</em>{' '}
            is one of the most entertaining records to come out of Ireland in years — funny, heartfelt, and
            musically unpredictable. Live, she&apos;s a force: all energy, audience banter, and genuine joy. One of
            those artists where even people who don&apos;t like the genre walk away as fans.
          </ArtistSpotlight>

          <div className="ad-space">{/* AD SPACE */}</div>

          <ArtistSpotlight
            number="06"
            name="Quadeca"
            detail="Hip-Hop · Saturday · Undercard"
            spotifyUrl="https://open.spotify.com/artist/3zz52ViyCBcplK0ftEVPSS"
            appleUrl="https://music.apple.com/us/artist/993872780"
          >
            Quadeca started as a YouTube rapper and has evolved into one of the most boundary-pushing young artists
            in hip-hop. His album <em>I Didn&apos;t Mean to Haunt You</em> is a genre-defying project that blends
            glitchy electronics, ambient textures, hip-hop, and singer-songwriter vulnerability into something
            genuinely new. He&apos;s an artist in constant evolution, and his festival sets reflect that ambition —
            expect the unexpected.
          </ArtistSpotlight>

          <ArtistSpotlight
            number="07"
            name="Mother Mother"
            detail="Indie · Friday · Undercard"
            spotifyUrl="https://open.spotify.com/artist/0e86yPdC41PGRkLp2Q1Bph"
            appleUrl="https://music.apple.com/us/artist/269814858"
          >
            Mother Mother has been making music for nearly two decades, but a TikTok-driven resurgence brought tracks
            like &quot;Hayloft&quot; and &quot;Burning Pile&quot; to a massive new audience. The Canadian band&apos;s
            catalog is deep and consistently strong — theatrical indie rock with vocal harmonies, off-kilter
            arrangements, and lyrics that balance darkness with playfulness. Their live show has the energy of a band
            experiencing a second act and loving every minute of it.
          </ArtistSpotlight>

          <ArtistSpotlight
            number="08"
            name="Oklou"
            detail="Electronic · Friday · Undercard"
            spotifyUrl="https://open.spotify.com/artist/6fFcUOFcbjeIuEomuUthkw"
            appleUrl="https://music.apple.com/us/artist/1156489245"
          >
            Oklou (Marylou Mayniel) makes electronic music that feels like stepping into a dream. Her production
            blends delicate vocals with glitchy, atmospheric beats that draw from PC Music, ambient, and French pop
            traditions. She&apos;s been a collaborator and presence in the experimental electronic world for years,
            and her live sets create immersive sonic environments. If you want something genuinely different from
            the main-stage EDM sound, Oklou delivers.
          </ArtistSpotlight>

          <ArtistSpotlight
            number="09"
            name="Water From Your Eyes"
            detail="Indie · Sunday · Undercard"
            spotifyUrl="https://open.spotify.com/artist/6hYlNLoZJg74dVhA8FHIc0"
            appleUrl="https://music.apple.com/us/artist/1211796145"
          >
            Water From Your Eyes makes music that resists easy categorization. Their album <em>Everyone&apos;s Crushed</em>{' '}
            careens between noise-rock, post-punk, electronic experimentation, and pop hooks, sometimes within the
            same song. Nate Amos&apos;s production is restless and inventive while Rachel Brown&apos;s vocals ground
            the chaos with an almost deadpan cool. They&apos;re the kind of act that divides a crowd and rewards the
            curious. If you want to see something you can&apos;t see anywhere else on the lineup, this is it.
          </ArtistSpotlight>

          <ArtistSpotlight
            number="10"
            name="Spacey Jane"
            detail="Indie · Saturday · Undercard"
            spotifyUrl="https://open.spotify.com/artist/6V70yeZQCoSR2M3fyW8qiA"
            appleUrl="https://music.apple.com/us/artist/1274804750"
          >
            Spacey Jane is one of the biggest indie bands in Australia, and they&apos;re overdue for a breakout in
            the U.S. festival circuit. Their sound is sun-drenched indie rock with soaring choruses and guitar tones
            that shimmer — think early Tame Impala energy crossed with The War on Drugs&apos; sense of scale. Tracks
            like &quot;Booster Seat&quot; and &quot;Lots of Nothing&quot; are the kind of songs that sound like they
            were written to be screamed back at a stage by thousands of people. An afternoon set from Spacey Jane
            could be one of the highlights of your Saturday.
          </ArtistSpotlight>

          <h2>The Bigger Picture</h2>

          <p>
            These ten acts represent a fraction of the undercard&apos;s depth. We could have easily highlighted{' '}
            <strong>Horsegirl</strong> (Chicago post-punk), <strong>Ninajirachi</strong> (Australian electronic
            producer), <strong>Bad Nerves</strong> (garage rock energy), <strong>Slayyter</strong> (hyperpop
            maximalism), or <strong>SB19</strong> (Filipino P-Pop pioneers). The point isn&apos;t to see all of them
            — it&apos;s to make room for at least a few of them.
          </p>

          <p>
            The best festival experiences come from the acts you didn&apos;t plan to see. Leave gaps in your
            schedule, wander toward unfamiliar stages, and let the undercard surprise you. That&apos;s how you walk
            away from Lolla with stories, not just photos.
          </p>

          <p>
            Ready to plan your full schedule? Browse the <Link href="/">complete searchable lineup</Link> or read our{' '}
            <Link href="/who-to-see">day-by-day guide</Link> for recommendations across every tier.
          </p>
        </div>
      </div>

      <div className="ad-space">{/* AD SPACE */}</div>
    </>
  );
}
