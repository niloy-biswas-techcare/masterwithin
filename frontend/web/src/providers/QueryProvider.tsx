'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider, Persister } from '@tanstack/react-query-persist-client';
import { get, set, del } from 'idb-keyval';

// 1. Setup IndexedDB persister using idb-keyval for browser environment
const idbPersister: Persister = {
  persistClient: async (client) => {
    try {
      await set('mw-query-cache', client);
    } catch (err) {
      console.error('[query] Failed to persist cache to IndexedDB:', err);
    }
  },
  restoreClient: async () => {
    try {
      return await get('mw-query-cache');
    } catch (err) {
      console.error('[query] Failed to restore cache from IndexedDB:', err);
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      await del('mw-query-cache');
    } catch (err) {
      console.error('[query] Failed to remove cache from IndexedDB:', err);
    }
  },
};

// 2. Define getQueryClient to prevent cache sharing across server requests (SSR memory safety)
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new client per request
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 60 * 24, // 24 hours
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });
  } else {
    // Browser: keep a single client instance
    if (!browserQueryClient) {
      browserQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 60 * 24,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      });
    }
    return browserQueryClient;
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  // If rendering on the server, bypass persistence layer
  if (typeof window === 'undefined') {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  // Client rendering: wrap with IndexedDB persistence
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: idbPersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours cache expiry
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist successful queries
            return query.state.status === 'success';
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
