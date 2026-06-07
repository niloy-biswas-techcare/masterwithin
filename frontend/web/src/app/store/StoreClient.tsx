'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BookCard, EmptyState, Eyebrow, Container } from '@mw/ui';
import { useCartStore } from '@/store/cartStore';
import { Book, Ebook, Freebie } from '@mw/types';
import {
  BookOpen, Smartphone, FileDown, ExternalLink, Download,
  Search, X, ChevronLeft, ChevronRight, ShoppingBag,
} from 'lucide-react';
import { formatPrice } from '@mw/utils';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import Fuse from 'fuse.js';
import { motionTokens } from '@/lib/motion';

// ─── Page sizes ───────────────────────────────────────────────────────────────

const BOOKS_PAGE_SIZE = 8;
const EBOOKS_PAGE_SIZE = 8;
const FREEBIES_PAGE_SIZE = 9;

// ─── Types & constants ────────────────────────────────────────────────────────

type Tab = 'all' | 'books' | 'ebooks' | 'freebies';

const TABS: { value: Tab; label: string; Icon: React.ElementType }[] = [
  { value: 'all',      label: 'All',          Icon: ShoppingBag },
  { value: 'books',    label: 'Books',         Icon: BookOpen    },
  { value: 'ebooks',   label: 'eBooks',        Icon: Smartphone  },
  { value: 'freebies', label: 'Free Guides',   Icon: FileDown    },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const gridVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: motionTokens.standard, ease: motionTokens.easeOut as [number, number, number, number] },
  },
};

// ─── Page-range helper (with ellipsis) ───────────────────────────────────────

function getPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

// ─── Pagination component ─────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, totalItems, pageSize, itemLabel = 'items', onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const from  = (currentPage - 1) * pageSize + 1;
  const to    = Math.min(currentPage * pageSize, totalItems);
  const pages = getPageRange(currentPage, totalPages);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4 pt-6"
    >
      <p className="text-sm text-text/45 font-body">
        Showing{' '}
        <span className="text-text/65 font-medium">{from}–{to}</span>
        {' '}of{' '}
        <span className="text-text/65 font-medium">{totalItems}</span>
        {' '}{itemLabel}
      </p>

      <nav className="flex items-center gap-1 flex-wrap justify-center">
        {/* Prev */}
        {currentPage > 1 ? (
          <button
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border/60 text-sm font-body text-text/55 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border/30 text-sm font-body text-text/25 cursor-not-allowed select-none">
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </span>
        )}

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1.5 py-2 text-text/30 text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg px-2.5 text-sm font-body border transition-all ${
                p === currentPage
                  ? 'bg-primary text-surface border-primary font-semibold shadow-sm pointer-events-none'
                  : 'border-border/60 text-text/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        {currentPage < totalPages ? (
          <button
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border/60 text-sm font-body text-text/55 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border/30 text-sm font-body text-text/25 cursor-not-allowed select-none">
            Next <ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
      </nav>
    </motion.div>
  );
}

// ─── EbookCard ────────────────────────────────────────────────────────────────

function EbookCard({ ebook }: { ebook: Ebook }) {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-border/60 bg-surface shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="aspect-[3/4] w-full overflow-hidden bg-muted/20 relative">
        {ebook.coverImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={ebook.coverImage}
            alt={ebook.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-indigo-500/8">
            <Smartphone className="h-14 w-14 text-indigo-400/35" />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-indigo-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
          eBook
        </span>
      </div>

      <div className="flex flex-col flex-1 gap-1.5 p-5">
        <h3 className="font-display text-base font-bold leading-tight text-text line-clamp-2 group-hover:text-primary transition-colors">
          {ebook.title}
        </h3>
        {ebook.author && <p className="text-sm text-text/60">{ebook.author}</p>}
        <p className="line-clamp-2 text-sm text-text/70 font-body leading-relaxed flex-1">{ebook.description}</p>

        {ebook.price !== undefined && (
          <span className="font-display text-xl font-semibold text-text mt-1">{formatPrice(ebook.price)}</span>
        )}

        <div className="mt-auto pt-4 flex flex-col gap-2">
          {ebook.playStoreUrl && (
            <a
              href={ebook.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface hover:bg-indigo-500 hover:text-white hover:border-indigo-500 px-4 py-2 text-xs font-semibold text-text transition-all duration-150"
            >
              Google Play Books <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          )}
          {ebook.kindleUrl && (
            <a
              href={ebook.kindleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface hover:bg-indigo-500 hover:text-white hover:border-indigo-500 px-4 py-2 text-xs font-semibold text-text transition-all duration-150"
            >
              Amazon Kindle <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FreebieCard ──────────────────────────────────────────────────────────────

function FreebieCard({ freebie }: { freebie: Freebie }) {
  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-border/60 bg-surface shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="aspect-[3/4] w-full overflow-hidden bg-emerald-500/5 relative">
        {freebie.coverImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={freebie.coverImage}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-emerald-500/35">
            <FileDown className="h-14 w-14" />
            <span className="text-xs font-semibold font-body uppercase tracking-widest">Free Resource</span>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
          Free
        </span>
      </div>

      <div className="flex flex-col flex-1 gap-1.5 p-5">
        <h3 className="font-display text-base font-bold leading-snug text-text line-clamp-2 group-hover:text-primary transition-colors">
          {freebie.title}
        </h3>
        <p className="text-sm text-text/70 line-clamp-3 leading-relaxed font-body flex-1">{freebie.description}</p>
        <div className="mt-auto pt-4">
          <a
            href={freebie.fileUrl}
            download
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-700 dark:text-emerald-400 px-4 py-2.5 text-xs font-bold transition-all duration-150"
          >
            <Download className="h-3.5 w-3.5 shrink-0" /> Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  id, icon: Icon, iconClass, title, count, unit,
}: {
  id: string; icon: React.ElementType; iconClass: string; title: string; count: number; unit: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/40 pb-4 mb-8">
      <Icon className={`h-5 w-5 ${iconClass}`} />
      <h2 id={id} className="font-display text-2xl font-bold text-text">{title}</h2>
      <span className="ml-auto text-sm text-text/40 font-body shrink-0">
        {count} {count === 1 ? unit : `${unit}s`}
      </span>
    </div>
  );
}

// ─── Main StoreClient ─────────────────────────────────────────────────────────

interface StoreClientProps {
  books: Book[];
  ebooks: Ebook[];
  freebies: Freebie[];
}

export function StoreClient({ books, ebooks, freebies }: StoreClientProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [searchQuery, setSearchQuery]       = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab]           = useState<Tab>('all');
  const [booksPage, setBooksPage]           = useState(1);
  const [ebooksPage, setEbooksPage]         = useState(1);
  const [freebiesPage, setFreebiesPage]     = useState(1);

  // Debounce search + reset pagination
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setBooksPage(1);
      setEbooksPage(1);
      setFreebiesPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setBooksPage(1);
    setEbooksPage(1);
    setFreebiesPage(1);
  }, []);

  const handleAddToCart = useCallback((book: Book) => {
    addItem({ id: book.id, title: book.title, price: book.price, coverImage: book.coverImage });
  }, [addItem]);

  // Fuse instances
  const bookFuse    = useMemo(() => new Fuse(books,    { keys: ['title', 'author', 'description'], threshold: 0.35 }), [books]);
  const ebookFuse   = useMemo(() => new Fuse(ebooks,   { keys: ['title', 'author', 'description'], threshold: 0.35 }), [ebooks]);
  const freebieFuse = useMemo(() => new Fuse(freebies, { keys: ['title', 'description'],           threshold: 0.35 }), [freebies]);

  // Filtered lists
  const filteredBooks    = useMemo(() => debouncedQuery.trim() ? bookFuse.search(debouncedQuery).map((r) => r.item)    : books,    [books,    debouncedQuery, bookFuse]);
  const filteredEbooks   = useMemo(() => debouncedQuery.trim() ? ebookFuse.search(debouncedQuery).map((r) => r.item)   : ebooks,   [ebooks,   debouncedQuery, ebookFuse]);
  const filteredFreebies = useMemo(() => debouncedQuery.trim() ? freebieFuse.search(debouncedQuery).map((r) => r.item) : freebies, [freebies, debouncedQuery, freebieFuse]);

  // Paginated slices
  const totalBooksPages    = Math.ceil(filteredBooks.length    / BOOKS_PAGE_SIZE);
  const totalEbooksPages   = Math.ceil(filteredEbooks.length   / EBOOKS_PAGE_SIZE);
  const totalFreebiesPages = Math.ceil(filteredFreebies.length / FREEBIES_PAGE_SIZE);

  const paginatedBooks    = filteredBooks.slice(   (booksPage    - 1) * BOOKS_PAGE_SIZE,    booksPage    * BOOKS_PAGE_SIZE);
  const paginatedEbooks   = filteredEbooks.slice(  (ebooksPage   - 1) * EBOOKS_PAGE_SIZE,   ebooksPage   * EBOOKS_PAGE_SIZE);
  const paginatedFreebies = filteredFreebies.slice((freebiesPage - 1) * FREEBIES_PAGE_SIZE, freebiesPage * FREEBIES_PAGE_SIZE);

  const showBooks    = activeTab === 'all' || activeTab === 'books';
  const showEbooks   = activeTab === 'all' || activeTab === 'ebooks';
  const showFreebies = activeTab === 'all' || activeTab === 'freebies';

  const totalResults =
    (showBooks    ? filteredBooks.length    : 0) +
    (showEbooks   ? filteredEbooks.length   : 0) +
    (showFreebies ? filteredFreebies.length : 0);

  const hasFilters = !!(debouncedQuery.trim() || activeTab !== 'all');

  const tabCounts: Record<Tab, number> = {
    all:      books.length + ebooks.length + freebies.length,
    books:    books.length,
    ebooks:   ebooks.length,
    freebies: freebies.length,
  };

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-10 md:pt-20 md:pb-12 bg-gradient-to-b from-primary/5 to-bg relative overflow-hidden">
        <Container variant="content" className="flex flex-col items-center text-center gap-5">
          <Eyebrow>Store</Eyebrow>

          <motion.h1
            className="font-display font-bold text-[clamp(2.25rem,5vw,3.75rem)] leading-tight text-text tracking-[-0.02em]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.deliberate, ease: motionTokens.easeOut as [number, number, number, number] }}
          >
            Bookstore & Resources
          </motion.h1>

          <motion.p
            className="max-w-xl text-text/70 font-body leading-relaxed text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.deliberate, delay: 0.1, ease: motionTokens.easeOut as [number, number, number, number] }}
          >
            Core philosophical writings, research works, and free practical templates to structure your daily practices.
          </motion.p>

          {/* Search input */}
          <motion.div
            className="mt-2 w-full max-w-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: motionTokens.deliberate, delay: 0.18, ease: motionTokens.easeOut as [number, number, number, number] }}
          >
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text/35 transition-colors group-focus-within:text-primary"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search books, guides, topics…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border/70 bg-surface/90 shadow-sm backdrop-blur-sm pl-11 pr-12 py-3.5 text-sm text-text placeholder:text-text/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                aria-label="Search the store"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    key="clear"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-text/40 hover:bg-muted/50 hover:text-text transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.p
            className="text-sm text-text/50 font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: motionTokens.standard, delay: 0.25 }}
          >
            {books.length} books · {ebooks.length} eBooks · {freebies.length} free guides
          </motion.p>
        </Container>
      </section>

      {/* ── Sticky tab filter bar ────────────────────────────────────────────── */}
      <div className="sticky top-[64px] z-20 bg-bg/95 backdrop-blur-sm border-b border-border/60">
        <Container variant="content" className="py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {TABS.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleTabChange(value)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-colors ${
                  activeTab === value
                    ? 'bg-primary text-surface border-primary shadow-sm ring-1 ring-primary'
                    : 'border-border/60 text-text/70 hover:border-primary/40 hover:text-text'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <span className={`text-[11px] rounded-full px-1.5 py-0.5 leading-none font-semibold ${
                  activeTab === value ? 'bg-surface/25 text-surface' : 'bg-muted text-text/50'
                }`}>
                  {tabCounts[value]}
                </span>
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <Container variant="content" className="pt-8 pb-16 flex flex-col gap-14">

        {/* Active filter / search context header */}
        <AnimatePresence mode="wait">
          {hasFilters && (
            <motion.div
              key="results-header"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border/20"
            >
              <div>
                {debouncedQuery.trim() ? (
                  <>
                    <span className="block text-[11px] font-body font-semibold tracking-widest text-primary uppercase mb-1.5">
                      Search
                    </span>
                    <h2 className="font-display text-2xl font-bold text-text">&ldquo;{debouncedQuery}&rdquo;</h2>
                  </>
                ) : (
                  <span className="block text-[11px] font-body font-semibold tracking-widest text-primary uppercase mb-1.5">
                    Filtered
                  </span>
                )}
                <p className="mt-1.5 text-xs text-text/40 font-body">
                  {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                </p>
              </div>

              <button
                onClick={() => { setSearchQuery(''); handleTabChange('all'); }}
                className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-surface px-3.5 py-2 text-xs font-semibold text-text/55 hover:border-primary/40 hover:text-primary transition-all self-start sm:self-auto shrink-0"
              >
                <X className="h-3 w-3" /> Clear all
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Physical Books */}
        {showBooks && (
          <section aria-labelledby="books-heading">
            <SectionHeader
              id="books-heading"
              icon={BookOpen}
              iconClass="text-primary"
              title="Physical Books"
              count={filteredBooks.length}
              unit="book"
            />

            {filteredBooks.length === 0 ? (
              <EmptyState title="No books found" description="Try a different search term." />
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`books-${debouncedQuery}-${booksPage}`}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={gridVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {paginatedBooks.map((book) => (
                      <motion.div key={book.id} variants={cardVariants} className="h-full">
                        <BookCard
                          book={book}
                          onAddToCart={handleAddToCart}
                          className="h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
                <Pagination
                  currentPage={booksPage}
                  totalPages={totalBooksPages}
                  totalItems={filteredBooks.length}
                  pageSize={BOOKS_PAGE_SIZE}
                  itemLabel="book"
                  onPageChange={setBooksPage}
                />
              </>
            )}
          </section>
        )}

        {/* eBooks */}
        {showEbooks && (
          <section aria-labelledby="ebooks-heading">
            <SectionHeader
              id="ebooks-heading"
              icon={Smartphone}
              iconClass="text-indigo-500"
              title="eBook Listings"
              count={filteredEbooks.length}
              unit="eBook"
            />

            {filteredEbooks.length === 0 ? (
              <EmptyState title="No eBooks found" description="Try a different search term." />
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`ebooks-${debouncedQuery}-${ebooksPage}`}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={gridVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {paginatedEbooks.map((ebook) => (
                      <motion.div key={ebook.id} variants={cardVariants} className="h-full">
                        <EbookCard ebook={ebook} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
                <Pagination
                  currentPage={ebooksPage}
                  totalPages={totalEbooksPages}
                  totalItems={filteredEbooks.length}
                  pageSize={EBOOKS_PAGE_SIZE}
                  itemLabel="eBook"
                  onPageChange={setEbooksPage}
                />
              </>
            )}
          </section>
        )}

        {/* Free Guides */}
        {showFreebies && (
          <section aria-labelledby="freebies-heading">
            <SectionHeader
              id="freebies-heading"
              icon={FileDown}
              iconClass="text-emerald-500"
              title="Free Guides & Templates"
              count={filteredFreebies.length}
              unit="guide"
            />

            {filteredFreebies.length === 0 ? (
              <EmptyState title="No guides found" description="Try a different search term." />
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`freebies-${debouncedQuery}-${freebiesPage}`}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={gridVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {paginatedFreebies.map((freebie) => (
                      <motion.div key={freebie.id} variants={cardVariants} className="h-full">
                        <FreebieCard freebie={freebie} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
                <Pagination
                  currentPage={freebiesPage}
                  totalPages={totalFreebiesPages}
                  totalItems={filteredFreebies.length}
                  pageSize={FREEBIES_PAGE_SIZE}
                  itemLabel="guide"
                  onPageChange={setFreebiesPage}
                />
              </>
            )}
          </section>
        )}

        {/* Global empty state when nothing matches at all */}
        {hasFilters && totalResults === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <EmptyState
              title="The store is quiet here."
              description="Try a different keyword or clear the filters to explore all content."
            />
          </motion.div>
        )}
      </Container>
    </>
  );
}
