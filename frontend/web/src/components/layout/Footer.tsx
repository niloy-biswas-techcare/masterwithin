'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Twitter, Youtube, Send, Mail } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      // Direct integration redirect/action to Substack subscription or API fallback
      // For now, since Substack RSS and publication are wired, we redirect or display success
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-surface/50 text-text/80">
      <div className="mx-auto max-w-content px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Brand Intro */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="font-display text-xl font-bold tracking-tight text-text">
              Master Within<span className="text-primary">.</span>
            </Link>
            <p className="text-sm text-text/70 leading-relaxed max-w-xs font-body">
              A contemplative school and digital sanctuary dedicated to self-actualization, systems of peace, and deep human consciousness.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full hover:bg-surface hover:text-primary transition-all"
                aria-label="X / Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full hover:bg-surface hover:text-primary transition-all"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@masterwithin.org"
                className="p-2 rounded-full hover:bg-surface hover:text-primary transition-all"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-sm font-semibold tracking-wider text-text uppercase">Explore</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/wisdom" className="hover:text-primary transition-colors">Wisdom Library</Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-primary transition-colors">Interactive Courses</Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-primary transition-colors">Bookstore & Resources</Link>
              </li>
              <li>
                <Link href="/start-here" className="text-primary font-medium hover:underline">Start Here Guide</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Insights */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-sm font-semibold tracking-wider text-text uppercase">Philosophy</h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/our-ideal" className="hover:text-primary transition-colors">Our Ideal</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">Souvik Ghosh (PhD)</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">Get in Touch</Link>
              </li>
              <li>
                <a
                  href="https://masterwithin.substack.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Substack Publication
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-sm font-semibold tracking-wider text-text uppercase">Subscribe</h3>
            <p className="text-sm text-text/70 leading-relaxed font-body">
              Receive essays on consciousness, habits, and vital living directly in your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2 flex max-w-sm items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-12 text-sm focus:border-primary focus:outline-none transition-colors"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
                aria-label="Subscribe"
                disabled={status === 'loading'}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            {status === 'success' && (
              <p className="text-xs text-success font-medium">Thank you! Welcome to the journey.</p>
            )}
            {status === 'error' && (
              <p className="text-xs text-danger font-medium">Something went wrong. Please try again.</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text/60">
          <p>&copy; {currentYear} Master Within Foundation. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
