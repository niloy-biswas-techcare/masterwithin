import React from 'react';
import type { Metadata } from 'next';
import { generateSiteMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSiteMetadata({
  title: 'The Foundation — Our Mission',
  description:
    'Master Within provides easy and scientific methods to master your mind and time, helping you become more happy, productive, and successful in life.',
  path: '/about',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
