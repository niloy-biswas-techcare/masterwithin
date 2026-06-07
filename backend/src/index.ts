import { env } from './env';
import { createInMemoryPorts } from './adapters/inmemory';
import { SupabaseArticleRepository } from './adapters/supabase/ArticleRepository.supabase';
import { SupabaseBookRepository } from './adapters/supabase/BookRepository.supabase';
import { SupabaseEbookRepository } from './adapters/supabase/EbookRepository.supabase';
import { SupabaseCourseRepository } from './adapters/supabase/CourseRepository.supabase';
import { SupabaseFreebieRepository } from './adapters/supabase/FreebieRepository.supabase';
import { SupabaseOrderRepository } from './adapters/supabase/OrderRepository.supabase';
import { SupabaseContactRepository } from './adapters/supabase/ContactRepository.supabase';
import { SupabaseSiteConfigRepository } from './adapters/supabase/SiteConfigRepository.supabase';
import { SupabaseStartHereRepository } from './adapters/supabase/StartHereRepository.supabase';
import { SupabaseAuditLogRepository } from './adapters/supabase/AuditLogRepository.supabase';
import { SupabaseAuthGateway } from './adapters/supabase/auth.supabase';
import { SupabaseStorageGateway } from './adapters/supabase/storage';
import { SupabaseVideoRepository } from './adapters/supabase/VideoRepository.supabase';
import { SupabasePlaylistRepository } from './adapters/supabase/PlaylistRepository.supabase';
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
  makeDeleteBook,
  makeListEbooks,
  makeUpsertEbook,
  makeDeleteEbook,
  makeListFreebies,
  makeUpsertFreebie,
  makeDeleteFreebie,
  makeListCourses,
  makeUpsertCourse,
  makePlaceOrder,
  makeGetSiteConfig,
  makeUpdateSiteConfig,
  makeGetStartHere,
  makeUpdateStartHere,
  makeSubmitContact,
  makeListContacts,
  makeUpdateContactStatus,
  makeDeleteContact,
  makeDeleteArticle,
  makeRequireOperator,
  makeWriteAuditLog,
  makeListVideos,
  makeGetVideo,
  makeListPlaylists,
  makeGetPlaylist,
  makeSyncYoutube,
  makeFeatureVideo,
  makeHideVideo,
  makeOverrideVideoCategory,
  makeFeaturePlaylist,
  makeHidePlaylist,
} from './application';

// Composition Root (§9, §3.4) ⛔
// Reads BACKEND_DRIVER and wires the ports to concrete use-cases.
// Use-cases are exported as the only public boundary for frontends.

let ports: Ports;

if (env.BACKEND_DRIVER === 'supabase') {
  ports = {
    articles: new SupabaseArticleRepository(),
    books: new SupabaseBookRepository(),
    ebooks: new SupabaseEbookRepository(),
    courses: new SupabaseCourseRepository(),
    freebies: new SupabaseFreebieRepository(),
    orders: new SupabaseOrderRepository(),
    contacts: new SupabaseContactRepository(),
    siteConfig: new SupabaseSiteConfigRepository(),
    startHere: new SupabaseStartHereRepository(),
    auditLogs: new SupabaseAuditLogRepository(),
    auth: new SupabaseAuthGateway(),
    storage: new SupabaseStorageGateway(),
    videos: new SupabaseVideoRepository(),
    playlists: new SupabasePlaylistRepository(),
  };
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
export const deleteArticle = makeDeleteArticle(ports.articles, ports.auditLogs);
export const syncSubstack = makeSyncSubstack(ports, ports.auditLogs);
export const importBySubstackUrl = makeImportBySubstackUrl(ports, ports.auditLogs);

export const listBooks = makeListBooks(ports.books);
export const upsertBook = makeUpsertBook(ports.books, ports.auditLogs);
export const deleteBook = makeDeleteBook(ports.books, ports.auditLogs);

export const listEbooks = makeListEbooks(ports.ebooks);
export const upsertEbook = makeUpsertEbook(ports.ebooks, ports.auditLogs);
export const deleteEbook = makeDeleteEbook(ports.ebooks, ports.auditLogs);

export const listFreebies = makeListFreebies(ports.freebies);
export const upsertFreebie = makeUpsertFreebie(ports.freebies, ports.auditLogs);
export const deleteFreebie = makeDeleteFreebie(ports.freebies, ports.auditLogs);

export const listCourses = makeListCourses(ports.courses);
export const upsertCourse = makeUpsertCourse(ports.courses, ports.auditLogs);

export const placeOrder = makePlaceOrder(ports.books, ports.orders);

export const getSiteConfig = makeGetSiteConfig(ports.siteConfig);
export const updateSiteConfig = makeUpdateSiteConfig(ports.siteConfig, ports.auditLogs);

export const getStartHere = makeGetStartHere(ports.startHere);
export const updateStartHere = makeUpdateStartHere(ports.startHere, ports.auditLogs);

export const submitContact = makeSubmitContact(ports.contacts);
export const listContacts = makeListContacts(ports.contacts);
export const updateContactStatus = makeUpdateContactStatus(ports.contacts);
export const deleteContact = makeDeleteContact(ports.contacts);

export const requireOperator = makeRequireOperator(ports.auth);
export const writeAuditLog = makeWriteAuditLog(ports.auditLogs);

// YouTube Media Library use-cases
export const listVideos = makeListVideos(ports.videos);
export const getVideo = makeGetVideo(ports.videos);
export const listPlaylists = makeListPlaylists(ports.playlists);
export const getPlaylist = makeGetPlaylist(ports.playlists);
export const syncYoutube = makeSyncYoutube(ports, ports.auditLogs);
export const featureVideo = makeFeatureVideo(ports.videos, ports.auditLogs);
export const hideVideo = makeHideVideo(ports.videos, ports.auditLogs);
export const overrideVideoCategory = makeOverrideVideoCategory(ports.videos, ports.auditLogs);
export const featurePlaylist = makeFeaturePlaylist(ports.playlists, ports.auditLogs);
export const hidePlaylist = makeHidePlaylist(ports.playlists, ports.auditLogs);

// Re-export domain models & errors for frontend type safety
export * from './domain';
export * from './application/errors';
export type { SyncResult } from './application/articles/syncSubstack';
export type { SyncYoutubeResult } from './application/youtube/syncYoutube';
export type { RequireOperator } from './application/auth/requireOperator';
export type { WriteAuditLog } from './application/audit/writeAuditLog';
export type { EmailSender } from './application/contacts/submitContact';
