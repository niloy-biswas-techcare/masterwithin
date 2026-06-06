import React from 'react';
import type { Metadata } from 'next';
import { generateSiteMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSiteMetadata({
  title: 'Our Ideal — The Contemplative Core',
  description:
    "The deepest expression of Master Within Foundation's philosophy. A long-form exploration of consciousness, duty, and the ideal of inner mastery as the foundation of all outer contribution.",
  path: '/our-ideal',
});

export default function OurIdealLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <div className="border-l border-border/40 pl-6 md:pl-8">
        {children}
      </div>
    </div>
  );
}
