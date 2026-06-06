import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  // Override PostCSS config — Tailwind v4 plugin is incompatible with vitest's bundler.
  css: { postcss: { plugins: [] } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    alias: {
      '@/': new URL('./src/', import.meta.url).pathname,
    },
  },
});
