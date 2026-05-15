import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
// Importação do tipo do router do backend
import type { AppRouter } from '../../../backend/src/routers/authRouter';

export type { AppRouter };

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      // Headers customizados para autenticação podem ser adicionados aqui
      async headers() {
        return {
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        };
      },
    }),
  ],
});
