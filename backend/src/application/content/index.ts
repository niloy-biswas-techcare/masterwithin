/**
 * Backend-agnostic content helpers (§8). Pure functions with no IO except the
 * injected feed fetcher in `substackRss`. Shared by the sync use-case and any adapter.
 */
export * from './stableId';
export * from './sanitize';
export * from './excerpt';
export * from './autoCategorize';
export * from './substackRss';
