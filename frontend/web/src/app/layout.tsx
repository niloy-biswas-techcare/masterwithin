import type { Metadata } from 'next';
import { fontVariables } from '@mw/ui/fonts';
import { Providers } from '@/providers/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WebVitals } from '@/components/shared/WebVitals';
import { getOrganizationJsonLd } from '@/lib/seo';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://masterwithin.org';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Master Within Foundation',
    template: '%s | Master Within Foundation',
  },
  description:
    'A spiritual–philosophical knowledge hub: the most comprehensive English-language resource for deep life questions — meaning, purpose, dharma, relationships, and inner growth.',
  openGraph: {
    siteName: 'Master Within Foundation',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const orgJsonLd = getOrganizationJsonLd();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="antialiased">
        {/* Site-wide Organization structured data (§13) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Providers>
          <WebVitals />
          <div className="flex min-h-screen flex-col bg-bg text-text transition-colors duration-300">
            <Navbar />
            <main id="main-content" className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
