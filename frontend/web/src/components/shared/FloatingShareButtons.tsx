'use client';

import React, { useState, useEffect } from 'react';
import { Twitter, MessageCircle, Copy, Check } from 'lucide-react';

interface FloatingShareButtonsProps {
  title: string;
  url?: string;
}

/**
 * Floating share buttons fixed to the left edge of article pages (§4a.6, §6.3).
 * Desktop-only: fade in after 500px scroll, fade out when footer enters viewport.
 * Vertical stack of 3 icons.
 */
export function FloatingShareButtons({ title, url }: FloatingShareButtonsProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(url ?? window.location.href);
  }, [url]);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      const footerTop = footer ? footer.getBoundingClientRect().top : Infinity;
      setVisible(window.scrollY > 500 && footerTop > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`;

  return (
    <div
      aria-label="Share this article"
      className={`hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X / Twitter"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface text-text/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors shadow-sm"
      >
        <Twitter className="h-4 w-4" />
      </a>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface text-text/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors shadow-sm"
      >
        <MessageCircle className="h-4 w-4" />
      </a>

      <button
        onClick={handleCopy}
        aria-label={copied ? 'Link copied!' : 'Copy link'}
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors shadow-sm ${
          copied
            ? 'border-success/30 bg-success/5 text-success'
            : 'border-border/60 bg-surface text-text/60 hover:text-primary hover:border-primary/30 hover:bg-primary/5'
        }`}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
