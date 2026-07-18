import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { FavoritesProvider } from '@/components/FavoritesProvider';
import ScrollToTop from '@/components/ScrollToTop';
import { ADSENSE_CLIENT, SITE_URL } from '@/lib/constants';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Lolla Lineup 2026 — Complete Lineup with Streaming Links',
    template: '%s — Lolla Lineup 2026',
  },
  description:
    'The complete Lollapalooza 2026 lineup with direct streaming links. 172 artists, searchable by genre and day. Grant Park, Chicago — July 30 to August 2.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>&#9889;</text></svg>",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  other: {
    'google-adsense-account': ADSENSE_CLIENT,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Righteous&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Plain <script> (not next/script) — this is Google AdSense's documented head
            placement. next/script's runtime injection stamps a data-nscript attribute
            that AdSense's own verifier flags; a static head tag avoids that warning. */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <FavoritesProvider>
          <Nav />
          {children}
          <Footer />
        </FavoritesProvider>
        <ScrollToTop />
      </body>
    </html>
  );
}
