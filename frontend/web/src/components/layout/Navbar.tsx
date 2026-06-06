'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { ThemeToggle } from '../shared/ThemeToggle';


export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { isMobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const cartItemsCount = useCartStore((state) => state.totalItems());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/wisdom', label: 'Wisdom Library' },
    { href: '/courses', label: 'Courses' },
    { href: '/store', label: 'Store' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 border-b border-border/40 ${
          isScrolled
            ? 'h-14 bg-surface/90 backdrop-blur-md shadow-sm'
            : 'h-20 bg-bg'
        }`}
      >
        <div className="mx-auto h-full max-w-content flex items-center justify-between px-6">
          {/* Logo */}
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-text hover:text-primary transition-colors flex items-center gap-1.5"
            aria-label="Master Within Foundation — Home"
          >
            <span>Master Within</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          </Link>

          {/* Desktop Nav Links */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`transition-colors relative py-1 hover:text-primary ${
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
              aria-current={pathname === '/start-here' ? 'page' : undefined}
              className={`font-semibold transition-colors px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs tracking-wider uppercase ${
                pathname === '/start-here' ? 'bg-primary/20 border-primary' : ''
              }`}
            >
              Start Here
            </Link>
          </nav>

          {/* Actions: Theme, Cart, Mobile Menu button */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Shopping Cart button */}
            <Link
              href="/store/cart"
              className="relative rounded-lg p-2 text-text/80 hover:text-primary transition-all duration-300 hover:bg-surface border border-transparent hover:border-border"
              aria-label={cartItemsCount > 0 ? `Shopping Cart — ${cartItemsCount} item${cartItemsCount !== 1 ? 's' : ''}` : 'Shopping Cart'}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
              {cartItemsCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white leading-none"
                  aria-hidden="true"
                >
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu trigger */}
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

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer Content */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
        className={`fixed top-0 right-0 bottom-0 z-40 w-[280px] bg-surface border-l border-border px-6 py-20 flex flex-col gap-6 md:hidden transition-transform duration-300 ease-in-out shadow-xl ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-5 right-6 rounded-lg p-2 text-text/80 hover:text-primary hover:bg-surface border border-transparent hover:border-border"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <nav aria-label="Mobile navigation" className="flex flex-col gap-6 font-display text-lg font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
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
            aria-current={pathname === '/start-here' ? 'page' : undefined}
            className="text-primary font-semibold border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-full px-4 py-2.5 text-center text-sm tracking-wider uppercase mt-4"
          >
            Start Here
          </Link>
        </nav>
      </div>
    </>
  );
}
