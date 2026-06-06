import { describe, vi, beforeEach } from 'vitest';

// Use vi.hoisted to declare mock states and classes before module imports are evaluated
const hoisted = vi.hoisted(() => {
  const db: Record<string, any[]> = {
    articles: [],
    books: [],
    ebooks: [],
    freebies: [],
    courses: [],
    contacts: [],
    orders: [],
    site_config: [],
    start_here: [],
    audit_logs: [],
  };

  let mockOperators: any[] = [];
  const mockSessions = new Map<string, any>();

  class QueryMock {
    private table: string;
    private action: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
    private payload: any = null;
    private filters: Array<(row: any) => boolean> = [];
    private sorts: Array<(a: any, b: any) => number> = [];
    private rangeStart = 0;
    private rangeEnd = Infinity;
    private limitCount = Infinity;
    private isSingle = false;
    private isMaybeSingle = false;

    constructor(table: string) {
      this.table = table;
    }

    select() {
      return this;
    }

    order(col: string, options?: { ascending?: boolean }) {
      const asc = options?.ascending !== false;
      this.sorts.push((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (typeof valA === 'string') {
          return asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return asc ? valA - valB : valB - valA;
      });
      return this;
    }

    eq(col: string, val: any) {
      this.filters.push((row) => row[col] === val);
      return this;
    }

    neq(col: string, val: any) {
      this.filters.push((row) => row[col] !== val);
      return this;
    }

    contains(col: string, val: any[]) {
      this.filters.push((row) => {
        const arr = row[col] || [];
        return val.every((v) => arr.includes(v));
      });
      return this;
    }

    range(from: number, to: number) {
      this.rangeStart = from;
      this.rangeEnd = to;
      return this;
    }

    limit(n: number) {
      this.limitCount = n;
      return this;
    }

    single() {
      this.isSingle = true;
      return this;
    }

    maybeSingle() {
      this.isMaybeSingle = true;
      return this;
    }

    insert(payload: any) {
      this.action = 'insert';
      this.payload = payload;
      return this;
    }

    update(payload: any) {
      this.action = 'update';
      this.payload = payload;
      return this;
    }

    upsert(payload: any) {
      this.action = 'upsert';
      this.payload = payload;
      return this;
    }

    delete() {
      this.action = 'delete';
      return this;
    }

    private execute() {
      const tableData = db[this.table] || [];
      let count: number | null = null;

      if (this.action === 'select') {
        let data = [...tableData];
        for (const filter of this.filters) {
          data = data.filter(filter);
        }
        count = data.length;
        for (const sort of this.sorts) {
          data.sort(sort);
        }
        data = data.slice(this.rangeStart, this.rangeEnd + 1);
        if (this.limitCount !== Infinity) {
          data = data.slice(0, this.limitCount);
        }
        if (this.isSingle) {
          return { data: data[0] || null, error: data[0] ? null : new Error('No row found'), count };
        }
        if (this.isMaybeSingle) {
          return { data: data[0] || null, error: null, count };
        }
        return { data, error: null, count };
      }

      if (this.action === 'insert') {
        const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
        const inserted: any[] = [];
        for (const r of rows) {
          const row = { ...r };
          if (!row.id) {
            row.id = Math.random().toString(36).substring(2, 11);
          }
          if (!row.created_at) {
            row.created_at = new Date().toISOString();
          }
          if (!row.at) {
            row.at = new Date().toISOString();
          }
          tableData.push(row);
          inserted.push(row);
        }
        db[this.table] = tableData;
        const data = Array.isArray(this.payload) ? inserted : inserted[0];
        return { data, error: null };
      }

      if (this.action === 'update') {
        const updatedRows = [...tableData];
        const affected: any[] = [];
        for (let i = 0; i < updatedRows.length; i++) {
          let matches = true;
          for (const filter of this.filters) {
            if (!filter(updatedRows[i])) matches = false;
          }
          if (matches) {
            updatedRows[i] = { ...updatedRows[i], ...this.payload };
            affected.push(updatedRows[i]);
          }
        }
        db[this.table] = updatedRows;
        const data = this.isSingle || this.isMaybeSingle ? affected[0] || null : affected;
        return { data, error: null };
      }

      if (this.action === 'upsert') {
        const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
        const upserted: any[] = [];
        for (const r of rows) {
          const row = { ...r };
          const idx = tableData.findIndex((x) => x.id === row.id);
          if (idx >= 0) {
            tableData[idx] = { ...tableData[idx], ...row };
            upserted.push(tableData[idx]);
          } else {
            if (!row.id) {
              row.id = Math.random().toString(36).substring(2, 11);
            }
            tableData.push(row);
            upserted.push(row);
          }
        }
        db[this.table] = tableData;
        const data = Array.isArray(this.payload) ? upserted : upserted[0];
        return { data, error: null };
      }

      if (this.action === 'delete') {
        const filteredRows: any[] = [];
        let deletedCount = 0;
        for (const row of tableData) {
          let matches = true;
          for (const filter of this.filters) {
            if (!filter(row)) matches = false;
          }
          if (matches) {
            deletedCount++;
          } else {
            filteredRows.push(row);
          }
        }
        db[this.table] = filteredRows;
        return { data: null, error: null, count: deletedCount };
      }

      return { data: null, error: new Error('Unknown action') };
    }

    then(onfulfilled?: (value: any) => any) {
      const result = this.execute();
      return Promise.resolve(result).then(onfulfilled);
    }
  }

  const authMock = {
    async signInWithPassword({ email, password }: any) {
      const op = mockOperators.find((o) => o.email === email);
      if (!op || (password !== 'password123' && password !== 'admin123')) {
        return { data: { user: null, session: null }, error: new Error('Invalid credentials') };
      }
      const access_token = `mock-access-token-${op.uid}`;
      const session = { access_token };
      mockSessions.set(access_token, op);
      return {
        data: {
          user: {
            id: op.uid,
            email: op.email,
            app_metadata: { role: op.role },
            user_metadata: { display_name: op.displayName },
          },
          session,
        },
        error: null,
      };
    },

    async getUser(accessToken: string) {
      const op = mockSessions.get(accessToken);
      if (!op) {
        return { data: { user: null }, error: new Error('Invalid session') };
      }
      return {
        data: {
          user: {
            id: op.uid,
            email: op.email,
            app_metadata: { role: op.role },
            user_metadata: { display_name: op.displayName },
          },
        },
        error: null,
      };
    },

    admin: {
      async signOut(uid: string) {
        for (const [token, op] of mockSessions.entries()) {
          if (op.uid === uid) {
            mockSessions.delete(token);
          }
        }
        return { error: null };
      },

      async getUserById(uid: string) {
        const op = mockOperators.find((o) => o.uid === uid);
        if (!op) {
          return { data: { user: null }, error: new Error('User not found') };
        }
        return {
          data: {
            user: {
              id: op.uid,
              email: op.email,
              app_metadata: { role: op.role },
              user_metadata: { display_name: op.displayName },
            },
          },
          error: null,
        };
      },
    },
  };

  const storageMock = {
    from(bucket: string) {
      return {
        async createSignedUploadUrl(path: string) {
          return {
            data: {
              signedUrl: `https://storage.supabase.co/mock-upload/${bucket}/${path}?token=mock-token`,
              token: 'mock-supabase-upload-token',
            },
            error: null,
          };
        },
      };
    },
  };

  return { db, mockOperators, mockSessions, QueryMock, authMock, storageMock };
});

// Setup Vitest mock for client.ts using the hoisted variables
vi.mock('./client', () => {
  return {
    supabaseAdmin: {
      from: (table: string) => new hoisted.QueryMock(table),
      storage: hoisted.storageMock,
      auth: hoisted.authMock,
    },
  };
});

import { SupabaseArticleRepository } from './ArticleRepository.supabase';
import { SupabaseBookRepository } from './BookRepository.supabase';
import { SupabaseEbookRepository } from './EbookRepository.supabase';
import { SupabaseCourseRepository } from './CourseRepository.supabase';
import { SupabaseFreebieRepository } from './FreebieRepository.supabase';
import { SupabaseOrderRepository } from './OrderRepository.supabase';
import { SupabaseContactRepository } from './ContactRepository.supabase';
import { SupabaseSiteConfigRepository } from './SiteConfigRepository.supabase';
import { SupabaseStartHereRepository } from './StartHereRepository.supabase';
import { SupabaseAuditLogRepository } from './AuditLogRepository.supabase';
import { SupabaseAuthGateway } from './auth.supabase';
import { SupabaseStorageGateway } from './storage';

import {
  runArticleRepositoryContractTests,
  runBookRepositoryContractTests,
  runEbookRepositoryContractTests,
  runCourseRepositoryContractTests,
  runFreebieRepositoryContractTests,
  runOrderRepositoryContractTests,
  runContactRepositoryContractTests,
  runSiteConfigRepositoryContractTests,
  runStartHereRepositoryContractTests,
  runAuditLogRepositoryContractTests,
  runAuthGatewayContractTests,
  runStorageGatewayContractTests,
} from '../../domain/ports/contracts';

// Setup mock fetch for Cloudinary uploadImage
const globalFetch = global.fetch;
beforeEach(() => {
  // Clear database state
  for (const table of Object.keys(hoisted.db)) {
    hoisted.db[table] = [];
  }
  // Clear auth sessions
  hoisted.mockSessions.clear();
  // Reset mock operators
  hoisted.mockOperators.length = 0;

  // Mock fetch
  global.fetch = vi.fn().mockImplementation((url) => {
    if (url.includes('api.cloudinary.com')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ secure_url: 'https://res.cloudinary.com/mock-cloud/image/upload/articles/image.png' }),
      });
    }
    return globalFetch(url);
  }) as any;
});

describe('Supabase Adapter Contract Verification', () => {
  runArticleRepositoryContractTests(async () => new SupabaseArticleRepository());
  runBookRepositoryContractTests(async () => new SupabaseBookRepository());
  runEbookRepositoryContractTests(async () => new SupabaseEbookRepository());
  runCourseRepositoryContractTests(async () => new SupabaseCourseRepository());
  runFreebieRepositoryContractTests(async () => new SupabaseFreebieRepository());
  runOrderRepositoryContractTests(async () => new SupabaseOrderRepository());
  runContactRepositoryContractTests(async () => new SupabaseContactRepository());
  runSiteConfigRepositoryContractTests(async () => new SupabaseSiteConfigRepository());
  runStartHereRepositoryContractTests(async () => new SupabaseStartHereRepository());
  runAuditLogRepositoryContractTests(async () => new SupabaseAuditLogRepository());

  runAuthGatewayContractTests(async (initialOps) => {
    // Copy elements into the hoisted array
    hoisted.mockOperators.push(...initialOps);
    return new SupabaseAuthGateway();
  });

  runStorageGatewayContractTests(async () => new SupabaseStorageGateway());
});
