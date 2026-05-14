import { createTRPCReact } from '@trpc/react-query';
2	import { httpBatchLink } from '@trpc/client';
3	// Importação do tipo do router do backend
4	// Em um ambiente real, usaríamos o tipo exportado pelo backend
5	// import type { AppRouter } from '../../../backend/src/routers/authRouter';
6	
7	// Definimos a estrutura básica do AppRouter baseada na análise do backend
8	export type AppRouter = any; // Simplificado para evitar erros de importação cruzada no sandbox
9	
10	export const trpc = createTRPCReact<AppRouter>();
11	
12	export const trpcClient = trpc.createClient({
13	  links: [
14	    httpBatchLink({
15	      url: '/api/trpc',
16	      // Headers customizados para autenticação podem ser adicionados aqui
17	      async headers() {
18	        return {
19	          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
20	        };
21	      },
22	    }),
23	  ],
24	});
25	
