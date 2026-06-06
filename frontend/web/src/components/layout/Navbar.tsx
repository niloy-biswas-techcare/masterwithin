'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { ThemeToggle } from '../shared/ThemeToggle';
import { articlesListKey, fetchArticlesIndex } from '@/lib/queries';


export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isScrolled, setIsScrolled] = useState(false);

  const { isMobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const cartItemsCount = useCartStore((state) => state.totalItems());

  /**
   * Intent-warming for primary nav (§12.2, §12.6 RC 4): on hover/focus, prefetch the
   * destination **route** and warm its **query data** so the page is cache-hot, not
   * just route-hot. Respects Save-Data.
   */
  const warm = useCallback(
    (href: string) => {
      const nav = navigator as unknown as { connection?: { saveData?: boolean } };
      if (nav.connection?.saveData) return;
      router.prefetch(href);
      if (href.startsWith('/wisdom')) {
        queryClient.prefetchQuery({
          queryKey: articlesListKey,
          queryFn: fetchArticlesIndex,
          staleTime: 1000 * 60 * 5,
        });
      }
    },
    [router, queryClient],
  );

  const warmHandlers = (href: string) => ({
    onMouseEnter: () => warm(href),
    onFocus: () => warm(href),
    onTouchStart: () => warm(href),
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 64);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/wisdom', label: 'Wisdom Library' },
    { href: '/courses', label: 'Courses' },
    { href: '/store', label: 'Store' },
    { href: '/about', label: 'The Foundation' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        style={{ transition: 'background-color 0.2s ease-out, box-shadow 0.2s ease-out, height 0.2s ease-out' }}
        className={`sticky top-0 z-50 w-full border-b ${
          isScrolled
            ? 'h-16 bg-surface/90 backdrop-blur-md border-border/40 shadow-sm'
            : 'h-20 bg-transparent border-transparent'
        }`}
      >
        <div className="mx-auto h-full max-w-280 flex items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* Logo — Lora wordmark + dot mark (§4a.5) */}
          <Link
            href="/"
            className="font-display text-[15px] font-bold tracking-tight text-text hover:text-primary transition-colors flex items-center gap-2"
            aria-label="Master Within Foundation — Home"
          >
            {/* Icon mark */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="text-primary">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
            </svg>
            <span>Master Within</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                {...warmHandlers(link.href)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`text-sm font-body font-medium transition-colors relative py-1 hover:text-primary ${
                  isActive(link.href) ? 'text-primary' : 'text-text/80'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-full" aria-hidden="true" />
                )}
              </Link>
            ))}
            <Link
              href="/start-here"
              {...warmHandlers('/start-here')}
              aria-current={pathname === '/start-here' ? 'page' : undefined}
              className={`font-semibold transition-colors px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-[11px] tracking-widest uppercase ${
                pathname === '/start-here' ? 'bg-primary/20 border-primary' : ''
              }`}
            >
              Guided Entry
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/store/cart"
              className="relative rounded-lg p-2 text-text/80 hover:text-primary transition-all duration-200 hover:bg-surface border border-transparent hover:border-border"
              aria-label={cartItemsCount > 0 ? `Shopping Cart — ${cartItemsCount} item${cartItemsCount !== 1 ? 's' : ''}` : 'Shopping Cart'}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {cartItemsCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white leading-none"
                  aria-hidden="true"
                >
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden rounded-lg p-2 text-text/80 hover:text-primary hover:bg-surface border border-transparent hover:border-border transition-all"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu drawer — full-height sheet from right */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        style={{ transition: 'transform 0.3s ease-in-out' }}
        className={`fixed top-0 right-0 bottom-0 z-40 w-[280px] bg-surface border-l border-border px-6 py-20 flex flex-col gap-6 md:hidden shadow-xl ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-5 right-6 rounded-lg p-2 text-text/80 hover:text-primary"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <nav aria-label="Mobile navigation" className="flex flex-col gap-6 font-body text-[18px] font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              {...warmHandlers(link.href)}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`hover:text-primary transition-colors ${
                isActive(link.href) ? 'text-primary' : 'text-text/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/start-here"
            {...warmHandlers('/start-here')}
            aria-current={pathname === '/start-here' ? 'page' : undefined}
            className="text-primary font-semibold border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-full px-4 py-2.5 text-center text-sm tracking-widest uppercase mt-4"
          >
            Guided Entry
          </Link>
        </nav>
      </div>
    </>
  );
}
