import type { EbookRepository, Ebook } from '../../domain';

export type ListEbooks = () => Promise<Ebook[]>;

export function makeListEbooks(ebooks: EbookRepository): ListEbooks {
  return async () => {
    return ebooks.list();
  };
}
