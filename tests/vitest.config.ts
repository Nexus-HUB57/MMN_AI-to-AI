import { defineConfig } from 'vitest/config';
import path from 'path';

// Vitest config dedicada ao monorepo (raiz). Importante:
// - Não tenta carregar nenhuma vite.config dos workspaces (frontend/backend)
//   para evitar pegar plugins como vite-tsconfig-paths que não estão instalados
//   na raiz e causam "TypeError: __vite_ssr_import_0__ is not a function".
// - Resolve `@/` para frontend/src manualmente.
// - Pool em forks (mais estável para módulos com side effects que esses testes
//   integradores trazem).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
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
      '@': path.resolve(__dirname, '../frontend/src'),
      '@mmn/shared': path.resolve(__dirname, '../shared'),
    },
  },
});
