import { Lora, DM_Sans, Source_Serif_4 } from 'next/font/google';

/**
 * Self-hosted brand fonts (§4.2), loaded and subset by `next/font` (no layout shift,
 * no third-party request). Each font exposes a CSS variable that maps onto the design
 * tokens (`--font-display`, `--font-body`) consumed by the Tailwind preset and tokens.css.
 *
 * Apps apply both variable classes to the document root, e.g.:
 *
 *   <html className={`${lora.variable} ${dmSans.variable}`}>
 */

/** Display font — headers, hero, pull quotes (§4.2). Maps to `--font-display`. */
export const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

/** Body font — prose and UI (§4.2). Maps to `--font-body`. */
export const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

/** Substack article body font — Source Serif 4 (§8b). Maps to `--font-substack`. */
export const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-substack',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
});

/** Convenience: all font variable class names joined, for the `<html>` element. */
export const fontVariables = `${lora.variable} ${dmSans.variable} ${sourceSerif4.variable}`;
