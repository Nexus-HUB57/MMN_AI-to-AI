import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  ssr: {
    // tsconfig-paths quebra com '__vite_ssr_import_0__ is not a function'
    // quando carregado pelo transformer SSR do Vite. Forçar inline corrige.
    noExternal: ['tsconfig-paths'],
  },
  test: {
    globals: true,
    environment: 'node',
    server: {
      deps: {
        inline: ['tsconfig-paths'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
      ],
    },
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src'),
      '@mmn/shared': path.resolve(__dirname, './shared'),
    },
  },
});