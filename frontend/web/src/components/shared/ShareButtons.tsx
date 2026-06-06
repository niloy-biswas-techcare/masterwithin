'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Twitter, MessageCircle, Copy, Check } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setShareUrl(url || window.location.href);
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanShare(true);
    }
  }, [url]);

  const handleWebShare = async () => {
    try {
      await navigator.share({
        title,
        url: shareUrl,
      });
    } catch (err) {
      console.warn('[share] Web share failed or cancelled:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('[share] Copy to clipboard failed:', err);
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(shareUrl)}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${title} - ${shareUrl}`
  )}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text/50 font-medium uppercase tracking-wider mr-2">Share:</span>
      
      {canShare && (
        <button
          onClick={handleWebShare}
          className="p-2 rounded-full border border-border/60 bg-surface hover:bg-primary/5 hover:text-primary transition-colors duration-200"
          title="Share via other apps"
          aria-label="Share"
        >
          <Share2 className="h-4 w-4" />
        </button>
      )}

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full border border-border/60 bg-surface hover:bg-primary/5 hover:text-primary transition-colors duration-200"
        title="Share on X / Twitter"
        aria-label="Share on X / Twitter"
      >
        <Twitter className="h-4 w-4" />
      </a>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full border border-border/60 bg-surface hover:bg-primary/5 hover:text-primary transition-colors duration-200"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </a>

      <button
        onClick={handleCopyLink}
        className={`p-2 rounded-full border transition-colors duration-200 ${
          copied
            ? 'border-success/30 bg-success/5 text-success'
            : 'border-border/60 bg-surface hover:bg-primary/5 hover:text-primary'
        }`}
        title={copied ? 'Link copied!' : 'Copy link to clipboard'}
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
