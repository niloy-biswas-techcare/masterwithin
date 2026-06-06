import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { EntityForm } from './EntityForm';

// Minimal Zod schema for a book-like form
const BookFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  price: z.number().int().nonnegative('Price must be non-negative'),
  description: z.string().optional(),
  available: z.boolean().optional(),
});

type BookForm = z.infer<typeof BookFormSchema>;

const fields = [
  { name: 'title' as const, label: 'Title', required: true },
  { name: 'price' as const, label: 'Price', type: 'number' as const, required: true },
  {
    name: 'description' as const,
    label: 'Description',
    type: 'textarea' as const,
    description: 'Short description of the book',
  },
  { name: 'available' as const, label: 'Published', type: 'checkbox' as const },
];

const defaultValues: BookForm = { title: '', price: 0, description: '', available: true };

describe('EntityForm', () => {
  it('renders all configured fields with their labels', () => {
    render(
      <EntityForm
        schema={BookFormSchema}
        defaultValues={defaultValues}
        fields={fields}
        onSubmit={vi.fn().mockResolvedValue({ ok: true })}
      />,
    );
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/published/i)).toBeInTheDocument();
  });

  it('renders a required field marker for required fields', () => {
    render(
      <EntityForm
        schema={BookFormSchema}
        defaultValues={defaultValues}
        fields={fields}
        onSubmit={vi.fn().mockResolvedValue({ ok: true })}
      />,
    );
    const titleLabel = screen.getByText('Title', { selector: 'label' });
    // The aria-hidden asterisk indicates required
    expect(titleLabel.textContent).toContain('*');
  });

  it('renders helper description text when provided', () => {
    render(
      <EntityForm
        schema={BookFormSchema}
        defaultValues={defaultValues}
        fields={fields}
        onSubmit={vi.fn().mockResolvedValue({ ok: true })}
      />,
    );
    expect(screen.getByText('Short description of the book')).toBeInTheDocument();
  });

  it('shows a submit button with the default "Save" label', () => {
    render(
      <EntityForm
        schema={BookFormSchema}
        defaultValues={defaultValues}
        fields={fields}
        onSubmit={vi.fn().mockResolvedValue({ ok: true })}
      />,
    );
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('uses a custom submitLabel when provided', () => {
    render(
      <EntityForm
        schema={BookFormSchema}
        defaultValues={defaultValues}
        fields={fields}
        onSubmit={vi.fn().mockResolvedValue({ ok: true })}
        submitLabel="Add Book"
      />,
    );
    expect(screen.getByRole('button', { name: /add book/i })).toBeInTheDocument();
  });

  it('calls onSubmit with form data when valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true });
    render(
      <EntityForm
        schema={BookFormSchema}
        defaultValues={defaultValues}
        fields={fields}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.clear(screen.getByLabelText(/title/i));
    await userEvent.type(screen.getByLabelText(/title/i), 'Mastering Life');

    await userEvent.clear(screen.getByLabelText(/price/i));
    await userEvent.type(screen.getByLabelText(/price/i), '350');

    fireEvent.submit(screen.getByRole('button', { name: /save/i }).closest('form')!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Mastering Life', price: 350 }),
      );
    });
  });

  it('shows validation errors and does not call onSubmit for invalid data', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ ok: true });
    render(
      <EntityForm
        schema={BookFormSchema}
        defaultValues={{ ...defaultValues, title: '' }}
        fields={fields}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.submit(screen.getByRole('button', { name: /save/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('error message has aria-live="polite" for screen-reader announcement (§14)', async () => {
    render(
      <EntityForm
        schema={BookFormSchema}
        defaultValues={{ ...defaultValues, title: '' }}
        fields={fields}
        onSubmit={vi.fn().mockResolvedValue({ ok: true })}
      />,
    );

    fireEvent.submit(screen.getByRole('button', { name: /save/i }).closest('form')!);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('renders extraActions alongside the submit button', () => {
    render(
      <EntityForm
        schema={BookFormSchema}
        defaultValues={defaultValues}
        fields={fields}
        onSubmit={vi.fn().mockResolvedValue({ ok: true })}
        extraActions={<button type="button">Cancel</button>}
      />,
    );
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});
