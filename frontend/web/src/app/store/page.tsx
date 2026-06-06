import React from 'react';
import { listBooks, listEbooks, listFreebies } from '@mw/backend';
import { StoreClient } from './StoreClient';
import type { Book, Ebook, Freebie } from '@mw/types';

export const revalidate = 3600; // Cache store catalog for 1 hour (ISR)

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

  return (
    <StoreClient
      books={books}
      ebooks={ebooks}
      freebies={freebies}
    />
  );
}
