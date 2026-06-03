import { defineConfig } from 'vitest/config';
import path from 'path';

// Vitest config dedicada ao monorepo (raiz). Importante:
// - Não tenta carregar nenhuma vite.config dos workspaces.
// - Resolve `@/` para frontend/src.
// - Exclui agressivamente node_modules e qualquer pasta `node_modules_root/`
//   gerada pelo workspace cruzado do backend, que multiplica testes do `zod`
//   em infinitas pastas aninhadas e faz o vitest tentar carregar
//   `tsconfig-paths` em cada uma → `__vite_ssr_import_0__ is not a function`.
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
    exclude: [
      '**/node_modules/**',
      '**/node_modules_root/**',
      '**/dist/**',
      '**/.git/**',
      '**/Legado_PHP/**',
      'fase8/**',
      'frontend/**',
      'backend/**',
      'mobile/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../frontend/src'),
      '@mmn/shared': path.resolve(__dirname, '../shared'),
    },
  },
});
