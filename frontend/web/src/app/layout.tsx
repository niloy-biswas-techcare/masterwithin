import type { Metadata } from 'next';
import { fontVariables } from '@mw/ui/fonts';
import { Providers } from '@/providers/Providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Master Within Foundation',
  description: 'A spiritual–philosophical knowledge hub for deep life questions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col bg-bg text-text transition-colors duration-300">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
