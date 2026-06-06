import * as React from 'react';
import { cn } from '../lib/cn';

export type ContainerVariant = 'prose' | 'content' | 'wide';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * prose  → max-w 720px  — article body, editorial text
   * content → max-w 1120px — standard page sections
   * wide   → max-w 1320px — hero sections, full-bleed backgrounds
   * (§4a.1)
   */
  variant?: ContainerVariant;
  as?: React.ElementType;
}

const MAX_WIDTHS: Record<ContainerVariant, string> = {
  prose:   'max-w-180',
  content: 'max-w-280',
  wide:    'max-w-330',
};

export function Container({
  variant = 'content',
  as: Tag = 'div',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full',
        'px-5 sm:px-8 lg:px-10 xl:px-12',
        MAX_WIDTHS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
