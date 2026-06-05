import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names, resolving conflicting Tailwind utilities in favour of the last
 * one. The single class-composition helper used by every component in this package.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
