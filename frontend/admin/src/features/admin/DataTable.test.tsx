import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from './DataTable';

type BookRow = { id: string; title: string; price: number; available: boolean };

const columnHelper = createColumnHelper<BookRow>();

const columns = [
  columnHelper.accessor('title', { header: 'Title' }),
  columnHelper.accessor('price', { header: 'Price' }),
  columnHelper.accessor('available', {
    header: 'Available',
    cell: (info) => (info.getValue() ? 'Yes' : 'No'),
  }),
];

const data: BookRow[] = [
  { id: '1', title: 'Mastering Life', price: 350, available: true },
  { id: '2', title: 'Conscious Living', price: 299, available: true },
  { id: '3', title: 'The Source Code', price: 450, available: false },
];

describe('DataTable', () => {
  it('renders all column headers', () => {
    render(<DataTable data={data} columns={columns} />);
    expect(screen.getByRole('columnheader', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Price' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Available' })).toBeInTheDocument();
  });

  it('renders a row for every item in the data set', () => {
    render(<DataTable data={data} columns={columns} />);
    expect(screen.getByText('Mastering Life')).toBeInTheDocument();
    expect(screen.getByText('Conscious Living')).toBeInTheDocument();
    expect(screen.getByText('The Source Code')).toBeInTheDocument();
  });

  it('renders a search input', () => {
    render(<DataTable data={data} columns={columns} searchPlaceholder="Search books…" />);
    expect(screen.getByRole('searchbox', { name: /search books/i })).toBeInTheDocument();
  });

  it('filters rows by the global search term', () => {
    render(<DataTable data={data} columns={columns} searchPlaceholder="Search…" />);
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'Conscious' } });
    expect(screen.getByText('Conscious Living')).toBeInTheDocument();
    expect(screen.queryByText('Mastering Life')).not.toBeInTheDocument();
    expect(screen.queryByText('The Source Code')).not.toBeInTheDocument();
  });

  it('shows all rows when the search query is cleared', () => {
    render(<DataTable data={data} columns={columns} searchPlaceholder="Search…" />);
    const search = screen.getByRole('searchbox');
    fireEvent.change(search, { target: { value: 'Life' } });
    fireEvent.change(search, { target: { value: '' } });
    expect(screen.getByText('Mastering Life')).toBeInTheDocument();
    expect(screen.getByText('Conscious Living')).toBeInTheDocument();
    expect(screen.getByText('The Source Code')).toBeInTheDocument();
  });

  it('sorts rows ascending by title when header is clicked once', () => {
    render(<DataTable data={data} columns={columns} />);
    const sortBtn = screen.getByRole('button', { name: /sort by title/i });
    fireEvent.click(sortBtn);

    const rows = screen.getAllByRole('row').slice(1); // skip header row
    const firstCell = within(rows[0]).getAllByRole('cell')[0];
    expect(firstCell.textContent).toBe('Conscious Living');
  });

  it('sorts rows descending by title when header is clicked twice', () => {
    render(<DataTable data={data} columns={columns} />);
    const sortBtn = screen.getByRole('button', { name: /sort by title/i });
    fireEvent.click(sortBtn); // ascending
    fireEvent.click(sortBtn); // descending

    const rows = screen.getAllByRole('row').slice(1);
    const firstCell = within(rows[0]).getAllByRole('cell')[0];
    expect(firstCell.textContent).toBe('The Source Code');
  });

  it('respects the pageSize prop — shows only N rows', () => {
    render(<DataTable data={data} columns={columns} pageSize={2} />);
    // 1 header row + 2 data rows (not 3)
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
  });

  it('renders an empty state body when data is empty', () => {
    render(<DataTable data={[]} columns={columns} />);
    expect(screen.getByText('No results found.')).toBeInTheDocument();
    // Only the header row should have data cells
    expect(screen.getAllByRole('row')).toHaveLength(2); // 1 header + 1 empty-state row
  });

  it('renders the table with proper ARIA structure', () => {
    render(<DataTable data={data} columns={columns} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(3);
    // All data rows
    expect(screen.getAllByRole('row').length).toBeGreaterThanOrEqual(4); // 1 header + 3 data
  });
});
