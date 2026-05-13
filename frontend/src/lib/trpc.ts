import { createTRPCReact } from '@trpc/react-query';
// Importação do tipo do router do backend (assumindo que existe um AppRouter definido no backend)
// import type { AppRouter } from '../../../backend/src/router';

// Por enquanto, definimos um tipo vazio para evitar erros de compilação até que o backend esteja pronto
export type AppRouter = any;

export const trpc = createTRPCReact<AppRouter>();
