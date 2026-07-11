import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Contact — Lolla Lineup 2026',
  description: 'Get in touch with the team behind Lolla Lineup 2026. Questions, corrections, and feedback welcome.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact — Lolla Lineup 2026',
    description: 'Get in touch with the team behind Lolla Lineup 2026. Questions, corrections, and feedback welcome.',
    url: `${SITE_URL}/contact`,
    siteName: 'Lolla Lineup 2026',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact — Lolla Lineup 2026',
    description: 'Get in touch with the team behind Lolla Lineup 2026.',
  },
};

export default function ContactPage() {
  return (
    <>
      <div className="wrap">
        <h1>Contact</h1>
        <div className="tag">Get in touch</div>

        <h2>Email</h2>
        <p>Questions, corrections, lineup updates, or feedback? We&apos;d love to hear from you.</p>
        <p>
          <a href="mailto:jacob.t.brondum@gmail.com">jacob.t.brondum@gmail.com</a>
        </p>

        <h2>Who Runs This Site</h2>
        <p>
          Lolla Lineup 2026 is an independent fan project built and maintained by Jacob Brondum, a Chicago-based
          music fan. The site has no affiliation with Lollapalooza, C3 Presents, or Live Nation.
        </p>

        <h2>Corrections</h2>
        <p>Spotted an incorrect artist link, missing description, or wrong day assignment? Email us with the artist name and the correction and we&apos;ll update within 48 hours.</p>

        <h2>Press &amp; Partnerships</h2>
        <p>For press inquiries or partnership requests, use the email above with &quot;Press&quot; or &quot;Partnership&quot; in the subject line.</p>
      </div>

      <div className="ad-space">{/* AD SPACE */}</div>
    </>
  );
}
