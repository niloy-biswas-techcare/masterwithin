/**
 * @mw/ui — the design system (§4, §11).
 *
 * Layering (§4.4): tokens → primitives → UI components. A component imports only from
 * layers below it. Tokens live in `./styles/tokens.css`; fonts in `./fonts` (consumed
 * by each Next app's root layout). No hard-coded hex anywhere — colour comes only from
 * the token-backed Tailwind utilities.
 */
export * from './lib/cn';
export * from './primitives';
export * from './components';

export const UI_VERSION = '0.1.0';
