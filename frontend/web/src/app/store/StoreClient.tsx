'use client';

import React from 'react';
import { BookCard } from '@mw/ui';
import { useCartStore } from '@/store/cartStore';
import { Book, Ebook, Freebie } from '@mw/types';
import { BookOpen, Smartphone, FileDown, ExternalLink, Download } from 'lucide-react';
import { formatPrice } from '@mw/utils';

interface StoreClientProps {
  books: Book[];
  ebooks: Ebook[];
  freebies: Freebie[];
}

export function StoreClient({ books, ebooks, freebies }: StoreClientProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (book: Book) => {
    addItem({
      id: book.id,
      title: book.title,
      price: book.price,
      coverImage: book.coverImage,
    });
  };

  return (
    <div className="mx-auto max-w-content px-6 py-12 flex flex-col gap-16">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Store</span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-text">Bookstore & Resources</h1>
        <p className="mt-2 text-text/70 max-w-2xl font-body">
          Browse core philosophical writings, research works, and download free practical templates to structure your daily practices.
        </p>
      </div>

      {/* Section A: Physical Books */}
      <section className="flex flex-col gap-8">
        <div className="border-b border-border/40 pb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl font-bold text-text">Physical Books</h2>
        </div>

        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onAddToCart={handleAddToCart}
                className="h-full hover:shadow-md transition-all duration-300 border border-border/60 bg-surface/30"
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-text/50 italic py-4">No physical books available at the moment.</p>
        )}
      </section>

      {/* Section B: eBooks */}
      <section className="flex flex-col gap-8">
        <div className="border-b border-border/40 pb-4 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-indigo-500" />
          <h2 className="font-display text-2xl font-bold text-text">eBook Listings</h2>
        </div>

        {ebooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {ebooks.map((ebook) => (
              <div key={ebook.id} className="flex flex-col border border-border/60 rounded-xl bg-surface/30 overflow-hidden hover:shadow-md transition-all duration-300">
                {ebook.coverImage && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={ebook.coverImage}
                    alt={ebook.title}
                    className="aspect-[3/4] w-full object-cover border-b border-border/40"
                  />
                )}
                <div className="flex flex-1 flex-col gap-1.5 p-5">
                  <h3 className="font-display text-lg font-bold leading-tight text-text">{ebook.title}</h3>
                  {ebook.author && <p className="text-sm text-text/70">{ebook.author}</p>}
                  <p className="line-clamp-2 text-xs text-text/85 font-body">{ebook.description}</p>
                  
                  {ebook.price !== undefined && (
                    <span className="font-display text-sm font-semibold text-text mt-2">
                      {formatPrice(ebook.price)}
                    </span>
                  )}
                  
                  <div className="mt-auto pt-4 flex flex-col gap-2">
                    {ebook.playStoreUrl && (
                      <a
                        href={ebook.playStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover px-4 py-2 text-xs font-semibold text-text transition-all"
                      >
                        Google Play Books <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {ebook.kindleUrl && (
                      <a
                        href={ebook.kindleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover px-4 py-2 text-xs font-semibold text-text transition-all"
                      >
                        Amazon Kindle <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text/50 italic py-4">No eBook editions available at the moment.</p>
        )}
      </section>

      {/* Section C: Freebies */}
      <section className="flex flex-col gap-8">
        <div className="border-b border-border/40 pb-4 flex items-center gap-2">
          <FileDown className="h-5 w-5 text-emerald-500" />
          <h2 className="font-display text-2xl font-bold text-text">Free Guides & Templates</h2>
        </div>

        {freebies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {freebies.map((freebie) => (
              <div key={freebie.id} className="flex border border-border/60 rounded-xl bg-surface/30 p-5 gap-4 items-center hover:shadow-md transition-all duration-300">
                {freebie.coverImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={freebie.coverImage}
                    alt=""
                    className="h-20 w-16 rounded object-cover border border-border/40 shrink-0"
                  />
                ) : (
                  <div className="h-20 w-16 rounded bg-primary/10 border border-primary/20 shrink-0 flex items-center justify-center text-primary">
                    <FileDown className="h-8 w-8" />
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <h3 className="font-display font-semibold text-text text-base leading-snug truncate">{freebie.title}</h3>
                  <p className="text-xs text-text/75 line-clamp-2 leading-relaxed font-body">{freebie.description}</p>
                  <div className="mt-2.5">
                    <a
                      href={freebie.fileUrl}
                      download
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-bold transition-all"
                    >
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text/50 italic py-4">No free guides available at the moment.</p>
        )}
      </section>
    </div>
  );
}
