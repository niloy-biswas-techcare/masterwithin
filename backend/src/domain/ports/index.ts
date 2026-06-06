/**
 * Domain ports (§9) — the contract every adapter implements.
 *
 * Use-cases in `application/` depend only on these interfaces; the `supabase` adapter
 * (now) and a future `http`/FastAPI adapter both satisfy them, which is what makes the
 * backend plug-and-play (§2a, §9).
 */
export type { ArticleRepository, ArticleListFilter } from './ArticleRepository';
export type { BookRepository } from './BookRepository';
export type { EbookRepository } from './EbookRepository';
export type { CourseRepository } from './CourseRepository';
export type { FreebieRepository } from './FreebieRepository';
export type { OrderRepository, OrderListFilter } from './OrderRepository';
export type { ContactRepository } from './ContactRepository';
export type { SiteConfigRepository } from './SiteConfigRepository';
export type { StartHereRepository } from './StartHereRepository';
export type { AuditLogRepository } from './AuditLogRepository';
export type { AuthGateway, OperatorSession } from './AuthGateway';
export type {
  StorageGateway,
  SignedImageUpload,
  SignedFileUpload,
} from './StorageGateway';

import type { ArticleRepository } from './ArticleRepository';
import type { BookRepository } from './BookRepository';
import type { EbookRepository } from './EbookRepository';
import type { CourseRepository } from './CourseRepository';
import type { FreebieRepository } from './FreebieRepository';
import type { OrderRepository } from './OrderRepository';
import type { ContactRepository } from './ContactRepository';
import type { SiteConfigRepository } from './SiteConfigRepository';
import type { StartHereRepository } from './StartHereRepository';
import type { AuditLogRepository } from './AuditLogRepository';
import type { AuthGateway } from './AuthGateway';
import type { StorageGateway } from './StorageGateway';

/**
 * The full set of ports an adapter must provide. The composition root (§9) builds one
 * of these from the selected driver and hands it to `createUseCases` (§3.4). This is
 * the single seam the backend swap turns on.
 */
export interface Ports {
  articles: ArticleRepository;
  books: BookRepository;
  ebooks: EbookRepository;
  courses: CourseRepository;
  freebies: FreebieRepository;
  orders: OrderRepository;
  contacts: ContactRepository;
  siteConfig: SiteConfigRepository;
  startHere: StartHereRepository;
  auditLogs: AuditLogRepository;
  auth: AuthGateway;
  storage: StorageGateway;
}
