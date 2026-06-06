import type { Metadata } from 'next';
import { generateSiteMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSiteMetadata({
  title: 'Contact Us',
  description:
    'Get in touch with Souvik Ghosh and the Master Within Foundation. Ask questions about courses, books, research, or the philosophy of inner mastery.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
