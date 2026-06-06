import React from 'react';

export default function Loading() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-medium text-text/60 tracking-wider uppercase">Loading</p>
      </div>
    </div>
  );
}
