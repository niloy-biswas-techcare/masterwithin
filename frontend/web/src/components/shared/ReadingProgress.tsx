'use client';

import React, { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrollPercent = (window.scrollY / scrollHeight) * 100;
        setProgress(Math.min(scrollPercent, 100));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once initially to handle direct anchor navigation page loads
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed left-0 top-14 md:top-16 z-50 h-1 w-full bg-border/20"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-primary transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
