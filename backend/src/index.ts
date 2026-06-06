import { env } from './env';
import { createInMemoryPorts } from './adapters/inmemory';
import type { Ports } from './domain';
import {
  makeListArticles,
  makeGetArticle,
  makeFeatureArticle,
  makeOverrideCategory,
  makeSyncSubstack,
  makeImportBySubstackUrl,
  makeListBooks,
  makeUpsertBook,
  makeListEbooks,
  makeUpsertEbook,
  makeListFreebies,
  makeUpsertFreebie,
  makeListCourses,
  makeUpsertCourse,
  makePlaceOrder,
  makeGetSiteConfig,
  makeUpdateSiteConfig,
  makeGetStartHere,
  makeUpdateStartHere,
  makeSubmitContact,
  makeRequireOperator,
  makeWriteAuditLog,
} from './application';

// Composition Root (§9, §3.4) ⛔
// Reads BACKEND_DRIVER and wires the ports to concrete use-cases.
// Use-cases are exported as the only public boundary for frontends.

let ports: Ports;

if (env.BACKEND_DRIVER === 'supabase') {
  // Fallback to in-memory during Phase 2 before Supabase adapter exists
  ports = createInMemoryPorts();
} else if (env.BACKEND_DRIVER === 'fastapi') {
  // Fallback to in-memory during Phase 2
  ports = createInMemoryPorts();
} else {
  ports = createInMemoryPorts();
}

// Bind ports to Use-Cases
export const listArticles = makeListArticles(ports.articles);
export const getArticle = makeGetArticle(ports.articles);
export const featureArticle = makeFeatureArticle(ports.articles, ports.auditLogs);
export const overrideCategory = makeOverrideCategory(ports.articles, ports.auditLogs);
export const syncSubstack = makeSyncSubstack(ports, ports.auditLogs);
export const importBySubstackUrl = makeImportBySubstackUrl(ports, ports.auditLogs);

export const listBooks = makeListBooks(ports.books);
export const upsertBook = makeUpsertBook(ports.books, ports.auditLogs);

export const listEbooks = makeListEbooks(ports.ebooks);
export const upsertEbook = makeUpsertEbook(ports.ebooks, ports.auditLogs);

export const listFreebies = makeListFreebies(ports.freebies);
export const upsertFreebie = makeUpsertFreebie(ports.freebies, ports.auditLogs);

export const listCourses = makeListCourses(ports.courses);
export const upsertCourse = makeUpsertCourse(ports.courses, ports.auditLogs);

export const placeOrder = makePlaceOrder(ports.books, ports.orders);

export const getSiteConfig = makeGetSiteConfig(ports.siteConfig);
export const updateSiteConfig = makeUpdateSiteConfig(ports.siteConfig, ports.auditLogs);

export const getStartHere = makeGetStartHere(ports.startHere);
export const updateStartHere = makeUpdateStartHere(ports.startHere, ports.auditLogs);

export const submitContact = makeSubmitContact(ports.contacts);

export const requireOperator = makeRequireOperator(ports.auth);
export const writeAuditLog = makeWriteAuditLog(ports.auditLogs);

// Re-export domain models & errors for frontend type safety
export * from './domain';
export * from './application/errors';
export type { SyncResult } from './application/articles/syncSubstack';
export type { RequireOperator } from './application/auth/requireOperator';
export type { WriteAuditLog } from './application/audit/writeAuditLog';
export type { EmailSender } from './application/contacts/submitContact';
