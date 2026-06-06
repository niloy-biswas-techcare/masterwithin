import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
    env: {
      BACKEND_DRIVER: 'supabase',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      SUBSTACK_FEED_URL: 'https://souvik.substack.com/feed',
      WHATSAPP_NUMBER: '919876543210',
      REVALIDATE_SECRET: 'mock-revalidate-secret',
      CRON_SECRET: 'mock-cron-secret',
      ADMIN_ALLOWLIST: 'admin@test.com,editor@test.com',
      ADMIN_BOOTSTRAP_EMAIL: 'admin@test.com',
    },
  },
});
