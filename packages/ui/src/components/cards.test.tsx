import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ArticleCard } from './ArticleCard';
import { BookCard } from './BookCard';
import { CategoryCard } from './CategoryCard';
import { CourseCard } from './CourseCard';
import type { Article, Book, Category, Course } from '@mw/types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleArticle: Article = {
  id: 'art-1',
  title: 'The Science of Mind',
  slug: 'science-of-mind',
  category: 'science-of-consciousness',
  tags: ['meditation', 'neuroscience'],
  excerpt: 'An investigation into consciousness and thought.',
  bodyHtml: '<p>Body text</p>',
  publishedAt: '2026-06-01T00:00:00Z',
  readingTime: 4,
  substackUrl: 'https://substack.com/p/mind',
  featured: false,
  categoryLocked: false,
};

const sampleBook: Book = {
  id: 'book-1',
  title: 'Mastering Life',
  author: 'Souvik Ghosh',
  price: 350,
  coverImage: 'https://res.cloudinary.com/mw/image/upload/v1/book1.jpg',
  description: 'A compelling guide to inner growth.',
  available: true,
  order: 1,
};

const sampleCategory: Category = {
  id: '1',
  slug: 'science-of-consciousness',
  title: 'The Science of Consciousness',
  description: 'Exploring the nature of mind and awareness.',
  icon: 'BrainCircuit',
  keywords: ['consciousness', 'mind'],
};

const sampleCourse: Course = {
  id: 'c-1',
  slug: 'conscious-living',
  title: 'Conscious Living',
  level: 'beginner',
  description: 'A foundational course for those seeking clarity.',
  whoItsFor: 'Anyone curious about inner growth',
  whatYoullGain: 'Tools for conscious decision-making',
  moduleOutline: [],
  enrollmentCtaLabel: 'Enroll Now',
  enrollmentCtaUrl: 'https://platform.com/conscious-living',
  order: 1,
  published: true,
};

// ---------------------------------------------------------------------------
// ArticleCard
// ---------------------------------------------------------------------------

describe('ArticleCard', () => {
  it('renders article title, excerpt, and reading time', () => {
    render(<ArticleCard article={sampleArticle} href="/wisdom/science-of-consciousness/science-of-mind" />);
    expect(screen.getByRole('heading', { name: 'The Science of Mind' })).toBeInTheDocument();
    expect(screen.getByText(/investigation into consciousness/i)).toBeInTheDocument();
    expect(screen.getByText(/4 min/i)).toBeInTheDocument();
  });

  it('renders the category badge', () => {
    render(
      <ArticleCard
        article={sampleArticle}
        href="/wisdom/science-of-consciousness/science-of-mind"
        categoryLabel="Science of Consciousness"
      />,
    );
    expect(screen.getByText('Science of Consciousness')).toBeInTheDocument();
  });

  it('falls back to category slug when no label is provided', () => {
    render(<ArticleCard article={sampleArticle} href="/wisdom/science-of-consciousness/science-of-mind" />);
    expect(screen.getByText('science-of-consciousness')).toBeInTheDocument();
  });

  it('wraps content in an accessible link to the article', () => {
    render(<ArticleCard article={sampleArticle} href="/wisdom/science-of-consciousness/science-of-mind" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/wisdom/science-of-consciousness/science-of-mind');
  });

  it('fires anchorProps event handlers (intent-prefetch)', () => {
    const onMouseEnter = vi.fn();
    render(
      <ArticleCard
        article={sampleArticle}
        href="/wisdom/science-of-consciousness/science-of-mind"
        anchorProps={{ onMouseEnter }}
      />,
    );
    fireEvent.mouseEnter(screen.getByRole('link'));
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <ArticleCard article={sampleArticle} href="/wisdom/science-of-consciousness/science-of-mind" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// BookCard
// ---------------------------------------------------------------------------

describe('BookCard', () => {
  it('renders title, author, price, and description', () => {
    render(<BookCard book={sampleBook} />);
    expect(screen.getByRole('heading', { name: 'Mastering Life' })).toBeInTheDocument();
    expect(screen.getByText('Souvik Ghosh')).toBeInTheDocument();
    expect(screen.getByText('₹350')).toBeInTheDocument();
    expect(screen.getByText(/compelling guide/i)).toBeInTheDocument();
  });

  it('shows "Add to cart" button when book is available', () => {
    render(<BookCard book={sampleBook} />);
    expect(screen.getByRole('button', { name: /add to cart/i })).not.toBeDisabled();
  });

  it('shows disabled "Unavailable" button when book is unavailable', () => {
    render(<BookCard book={{ ...sampleBook, available: false }} />);
    const btn = screen.getByRole('button', { name: /unavailable/i });
    expect(btn).toBeDisabled();
  });

  it('calls onAddToCart with the book when the button is clicked', () => {
    const onAddToCart = vi.fn();
    render(<BookCard book={sampleBook} onAddToCart={onAddToCart} />);
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(onAddToCart).toHaveBeenCalledWith(sampleBook);
  });

  it('has no a11y violations', async () => {
    const { container } = render(<BookCard book={sampleBook} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// CategoryCard
// ---------------------------------------------------------------------------

describe('CategoryCard', () => {
  it('renders title and description', () => {
    render(<CategoryCard category={sampleCategory} href="/wisdom/science-of-consciousness" />);
    expect(screen.getByRole('heading', { name: 'The Science of Consciousness' })).toBeInTheDocument();
    expect(screen.getByText(/nature of mind/i)).toBeInTheDocument();
  });

  it('shows article count in singular form', () => {
    render(
      <CategoryCard category={sampleCategory} href="/wisdom/science-of-consciousness" count={1} />,
    );
    expect(screen.getByText('1 article')).toBeInTheDocument();
  });

  it('shows article count in plural form', () => {
    render(
      <CategoryCard category={sampleCategory} href="/wisdom/science-of-consciousness" count={12} />,
    );
    expect(screen.getByText('12 articles')).toBeInTheDocument();
  });

  it('omits the count when not provided', () => {
    render(<CategoryCard category={sampleCategory} href="/wisdom/science-of-consciousness" />);
    expect(screen.queryByText(/article/)).not.toBeInTheDocument();
  });

  it('navigates to the correct href', () => {
    render(<CategoryCard category={sampleCategory} href="/wisdom/science-of-consciousness" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/wisdom/science-of-consciousness');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <CategoryCard category={sampleCategory} href="/wisdom/science-of-consciousness" count={5} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// CourseCard
// ---------------------------------------------------------------------------

describe('CourseCard', () => {
  it('renders title, level badge, and description', () => {
    render(<CourseCard course={sampleCourse} href="/courses/conscious-living" />);
    expect(screen.getByRole('heading', { name: 'Conscious Living' })).toBeInTheDocument();
    expect(screen.getByText('beginner')).toBeInTheDocument();
    expect(screen.getByText(/foundational course/i)).toBeInTheDocument();
  });

  it('navigates to the correct href', () => {
    render(<CourseCard course={sampleCourse} href="/courses/conscious-living" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/courses/conscious-living');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<CourseCard course={sampleCourse} href="/courses/conscious-living" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
