import type { Metadata } from 'next';
import { Suspense } from 'react';
import { fontVariables } from '@mw/ui/fonts';
import { RouteProgressBar } from '@mw/ui';
import { Toaster } from 'sonner';
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
  icons: {
    icon: [
      { url: '/icon-light.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark.png', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/favicon.ico',
  },
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
      <body className="antialiased" suppressHydrationWarning>
        {/* Site-wide Organization structured data (§13) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <Suspense>
          <RouteProgressBar />
        </Suspense>
        <Providers>
          <WebVitals />
          <div className="flex min-h-screen flex-col bg-bg text-text transition-colors duration-300">
            <Navbar />
            <main id="main-content" className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </Providers>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
