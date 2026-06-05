import type { Book } from '@mw/types';
import { formatPrice } from '@mw/utils';
import { cn } from '../lib/cn';
import { Card } from './Card';
import { CldImage } from './CldImage';
import { Button } from '../primitives/Button';

export interface BookCardProps {
  book: Book;
  /** Add-to-cart handler (wired by the store feature in the web app). */
  onAddToCart?: (book: Book) => void;
  className?: string;
}

/** Physical book card for the store grid (§7.7, §11). */
export function BookCard({ book, onAddToCart, className }: BookCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CldImage
        src={book.coverImage}
        alt={`Cover of ${book.title}`}
        width={400}
        height={533}
        className="aspect-[3/4] w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="font-display text-lg leading-tight text-text">{book.title}</h3>
        <p className="text-sm text-text/70">{book.author}</p>
        <p className="line-clamp-2 text-base text-text/80">{book.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-xl text-text">{formatPrice(book.price)}</span>
          <Button
            size="sm"
            disabled={!book.available}
            onClick={onAddToCart ? () => onAddToCart(book) : undefined}
          >
            {book.available ? 'Add to cart' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
