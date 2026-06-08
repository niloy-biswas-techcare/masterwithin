'use client';

import * as React from 'react';
import { Button, type ButtonProps } from './Button';
import { Spinner } from './Spinner';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

/**
 * Button that shows an inline spinner and disables interaction while loading.
 * Meets §8 button-loading requirements: immediate visual feedback, no double-submit.
 */
export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, disabled, children, ...props }, ref) => (
    <Button
      ref={ref}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-label={loading ? 'Loading' : undefined}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" aria-hidden="true" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  ),
);
LoadingButton.displayName = 'LoadingButton';
