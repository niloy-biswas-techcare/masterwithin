import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Badge } from './Badge';
import { Spinner } from './Spinner';

describe('primitives — accessibility (axe)', () => {
  it('Button has no violations', async () => {
    const { container } = render(<Button>Explore the Library</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('IconButton with aria-label has no violations', async () => {
    const { container } = render(
      <IconButton aria-label="Open menu">
        <svg aria-hidden="true" width="16" height="16" />
      </IconButton>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('labelled Input has no violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="email">Email</label>
        <Input id="email" name="email" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('labelled Textarea has no violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="message">Message</label>
        <Textarea id="message" name="message" />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Badge has no violations', async () => {
    const { container } = render(<Badge variant="primary">Featured</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Spinner exposes a status role and label', async () => {
    const { container, getByRole } = render(<Spinner label="Loading articles" />);
    expect(getByRole('status')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('Button — behaviour', () => {
  it('defaults to type="button"', () => {
    const { getByRole } = render(<Button>Save</Button>);
    expect(getByRole('button')).toHaveAttribute('type', 'button');
  });
});
