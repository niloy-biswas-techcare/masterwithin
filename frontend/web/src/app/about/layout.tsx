import React from 'react';
import type { Metadata } from 'next';
import { generateSiteMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSiteMetadata({
  title: 'About Souvik Ghosh',
  description:
    'Meet Souvik Ghosh — PhD researcher, author, and founder of Master Within Foundation. A journey from academic inquiry to contemplative philosophy and human inner transformation.',
  path: '/about',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <div className="border-l border-border/40 pl-6 md:pl-8">
        {children}
      </div>
    </div>
  );
}
