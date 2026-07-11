import type { Metadata } from 'next';
import Script from 'next/script';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
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
      </head>
      <body>
        <Nav />
        {children}
        <Footer />
        <Script src="/favorites.js" strategy="afterInteractive" />
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
