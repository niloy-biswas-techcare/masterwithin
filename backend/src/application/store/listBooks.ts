import type { BookRepository, Book } from '../../domain';

export type ListBooks = () => Promise<Book[]>;

export function makeListBooks(books: BookRepository): ListBooks {
  return async () => {
    return books.list();
  };
}
