/**
 * @mw/types — shared domain types, Zod schemas, and canonical constants.
 *
 * Every external boundary (backend, RSS, env, form input) is validated with a Zod
 * schema here and converted into a typed domain model before it touches the UI (§3).
 */

// Content
export * from './article.schema';
export * from './categories';
export * from './start-here';

// Commerce
export * from './cart';
export * from './order';

// Store entities
export * from './store';

// Config & operations
export * from './contact';
export * from './site-config';
export * from './audit-log';
export * from './operator';
