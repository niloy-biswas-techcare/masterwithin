'use client';

import React from 'react';
import Link from 'next/link';
import { Twitter, Youtube, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-surface text-text/80">
      <div className="mx-auto max-w-280 px-5 sm:px-8 lg:px-10 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="font-display text-[15px] font-bold tracking-tight text-text">
              Master Within<span className="text-primary">.</span>
            </Link>
            <p className="text-sm text-text/60 leading-relaxed font-body max-w-55">
              A contemplative school and digital sanctuary dedicated to self-actualization, systems of peace, and deep human consciousness.
            </p>
            {/* Founder credit (§4a.5) */}
            <p className="text-[13px] text-text/50 font-body mt-1">
              Founded by Souvik Ghosh, PhD — researcher, author, and practitioner.
            </p>
            <div className="flex items-center gap-3 mt-1">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full hover:text-primary transition-colors"
                aria-label="X / Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@masterwithin.org"
                className="p-2 rounded-full hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-sm font-semibold tracking-wider text-text uppercase">Navigation</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/wisdom" className="hover:text-primary transition-colors">Wisdom Library</Link></li>
              <li><Link href="/media" className="hover:text-primary transition-colors">Media Library</Link></li>
              <li><Link href="/courses" className="hover:text-primary transition-colors">Courses</Link></li>
              <li><Link href="/store" className="hover:text-primary transition-colors">Bookstore</Link></li>
              <li><Link href="/start-here" className="text-primary font-medium hover:underline">Guided Entry</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 3: Library */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-sm font-semibold tracking-wider text-text uppercase">Library</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link href="/wisdom/science-of-consciousness" className="hover:text-primary transition-colors">Consciousness</Link></li>
              <li><Link href="/wisdom/optimal-living" className="hover:text-primary transition-colors">Optimal Living</Link></li>
              <li><Link href="/wisdom/conscious-relationships" className="hover:text-primary transition-colors">Relationships</Link></li>
              <li><Link href="/wisdom/self-actualization" className="hover:text-primary transition-colors">Self-Actualization</Link></li>
              <li><Link href="/our-ideal" className="hover:text-primary transition-colors">Our Ideal</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">The Foundation</Link></li>
            </ul>
          </div>

          {/* Column 4: Subscribe */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-sm font-semibold tracking-wider text-text uppercase">Stay in the Stream</h3>
            <p className="text-sm text-text/60 leading-relaxed font-body">
              Receive essays on consciousness, habits, and vital living directly in your inbox.
            </p>
            <a
              href="https://masterwithin.substack.com/subscribe"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text hover:bg-primary/5 hover:border-primary/30 transition-colors"
            >
              Stay in the stream
            </a>
            <a
              href="https://masterwithin.substack.com"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Substack Publication →
            </a>
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-16 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-text/50">
          <p>&copy; {currentYear} Master Within Foundation. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <a href="https://masterwithin.substack.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              Substack
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
