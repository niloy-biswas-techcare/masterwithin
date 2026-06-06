import React from 'react';

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <div className="border-l border-border/40 pl-6 md:pl-8">
        {children}
      </div>
    </div>
  );
}
