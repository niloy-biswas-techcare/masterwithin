'use client';

import React, { useEffect, useState } from 'react';

/**
 * 2px reading progress bar fixed below the navbar (§4a.2, §4a.6).
 * bg-primary, no border-radius, no layout shift.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setProgress(Math.min((window.scrollY / scrollHeight) * 100, 100));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed left-0 top-16 z-50 h-0.5 w-full bg-transparent"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-primary"
        style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
      />
    </div>
  );
}
