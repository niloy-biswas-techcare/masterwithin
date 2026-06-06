import React from 'react';
import type { Metadata } from 'next';
import { listBooks, listEbooks, listFreebies } from '@mw/backend';
import { StoreClient } from './StoreClient';
import type { Book, Ebook, Freebie } from '@mw/types';
import { generateSiteMetadata, getProductJsonLd } from '@/lib/seo';

export const revalidate = 3600; // Cache store catalog for 1 hour (ISR)

export const metadata: Metadata = generateSiteMetadata({
  title: 'Store — Books, eBooks & Free Resources',
  description:
    'Browse physical books, eBooks, and free downloadable resources from Master Within Foundation. Secure WhatsApp checkout for physical books. Download free guides instantly.',
  path: '/store',
});

export default async function StorePage() {
  let books: Book[] = [];
  let ebooks: Ebook[] = [];
  let freebies: Freebie[] = [];

  try {
    const allBooks = await listBooks();
    books = allBooks.filter((b) => b.available);
  } catch (err) {
    console.error('[store-page] Failed to fetch physical books:', err);
  }

  try {
    const allEbooks = await listEbooks();
    ebooks = allEbooks.filter((eb) => eb.available);
  } catch (err) {
    console.error('[store-page] Failed to fetch eBooks:', err);
  }

  try {
    const allFreebies = await listFreebies();
    freebies = allFreebies.filter((f) => f.published);
  } catch (err) {
    console.error('[store-page] Failed to fetch freebies:', err);
  }

  const productJsonLdItems = books.map((book) => getProductJsonLd(book));

  return (
    <>
      {productJsonLdItems.map((jsonLd, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ))}
      <StoreClient
        books={books}
        ebooks={ebooks}
        freebies={freebies}
      />
    </>
  );
}
