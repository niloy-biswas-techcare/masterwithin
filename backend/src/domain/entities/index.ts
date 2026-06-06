/**
 * Domain entities (§9).
 *
 * The pure domain vocabulary the backend speaks. The canonical *shapes* (with their
 * Zod schemas) live in `@mw/types` so that frontends and the backend share one typed
 * contract; this module re-exports them as the domain layer's stable surface so that
 * `application/` and `adapters/` depend on `domain/entities`, never on `@mw/types`
 * directly. There is **no** framework or IO dependency here.
 */
export type {
  Article,
  Book,
  Ebook,
  Course,
  CourseLevel,
  Freebie,
  CartItem,
  CustomerDetails,
  Order,
  OrderResult,
  OrderProvider,
  ContactInput,
  Contact,
  SiteConfig,
  StartHerePath,
  StartHereConfig,
  AuditAction,
  AuditLog,
  Operator,
  OperatorRole,
  Category,
} from '@mw/types';
