import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-content flex flex-col items-center justify-center py-24 px-6 text-center">
      <h2 className="font-display text-4xl font-bold">404 - Not Found</h2>
      <p className="mt-4 text-text/80">The requested resource could not be found.</p>
      <Link href="/" className="mt-8 px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-deep transition-colors">
        Return Home
      </Link>
    </div>
  );
}
